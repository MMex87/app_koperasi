const { Op, QueryTypes } = require("sequelize");
const barangModel = require("../model/BarangModel.js");
const transPenjualanModel = require("../model/TransPenjualanModel.js");
const transPembelianModel = require("../model/TransPembelianModel.js");
const db = require("../config/database.js");

const toInt = (v) => parseInt(v) || 0;

// Laporan laba rugi bulanan untuk satu tahun. Aturan penjualan sama dengan laporan & dashboard:
// status bukan keranjang/batal dan jumlah > 0 (harga = total baris). HPP & nilai retur/penyesuaian
// memakai harga barang saat ini (riwayat harga beli tidak disimpan), jadi angka laba adalah estimasi.
const labaRugi = async (req, res) => {
  try {
    const tahun = parseInt(req.query.tahun) || new Date().getFullYear();
    const awal = new Date(tahun, 0, 1);
    const akhir = new Date(tahun + 1, 0, 1);
    const rentang = { [Op.gte]: awal, [Op.lt]: akhir };
    const q = (sql) => db.query(sql, { replacements: { awal, akhir }, type: QueryTypes.SELECT });

    const [penjualan, pembelian, retur, pembatalan, penyesuaian] = await Promise.all([
      transPenjualanModel.findAll({
        attributes: ["jumlah", "harga", "createdAt"],
        where: { statusPenjualan: { [Op.notIn]: ["onProcess", "Batal"] }, jumlah: { [Op.gt]: 0 }, createdAt: rentang },
        include: [{ model: barangModel, as: "barang", attributes: ["hargaBeli"] }],
      }),
      transPembelianModel.findAll({
        attributes: ["jumlah", "harga", "createdAt"],
        where: { statusPembelian: { [Op.in]: ["Done", "Retur"] }, jumlah: { [Op.gt]: 0 }, createdAt: rentang },
      }),
      q(
        `SELECT 'penjualan' AS jenis, l.qty, l.createdAt, b.hargaJual AS harga FROM log_penjualan l LEFT JOIN barang b ON b.id = l.barangId
           WHERE l.keterangan = 'Retur Penjualan (+)' AND l.createdAt >= :awal AND l.createdAt < :akhir
         UNION ALL
         SELECT 'pembelian' AS jenis, l.qty, l.createdAt, b.hargaBeli AS harga FROM log_pembelian l LEFT JOIN barang b ON b.id = l.barangId
           WHERE l.keterangan = 'Retur Pembelian (-)' AND l.createdAt >= :awal AND l.createdAt < :akhir`
      ),
      q(`SELECT jenis, totalNilai, createdAt FROM pembatalan_transaksi WHERE createdAt >= :awal AND createdAt < :akhir`),
      q(
        `SELECT p.qty_awal, p.qty_baru, p.createdAt, b.hargaBeli FROM penyesuaian_stok p LEFT JOIN barang b ON b.id = p.barangId
         WHERE p.createdAt >= :awal AND p.createdAt < :akhir`
      ),
    ]);

    const bulan = Array.from({ length: 12 }, (_, i) => ({
      bulan: `${tahun}-${String(i + 1).padStart(2, "0")}`,
      penjualan: 0,
      hpp: 0,
      transaksi: new Set(),
      pembelian: 0,
      returPenjualan: 0,
      returPembelian: 0,
      batalPenjualan: 0,
      batalPembelian: 0,
      kerugianPenyesuaian: 0,
    }));
    const ke = (tgl) => bulan[new Date(tgl).getMonth()];

    penjualan.forEach((r) => {
      const b = ke(r.createdAt);
      b.penjualan += toInt(r.harga);
      b.hpp += toInt(r.barang?.hargaBeli) * toInt(r.jumlah);
    });
    pembelian.forEach((r) => {
      ke(r.createdAt).pembelian += toInt(r.harga) * toInt(r.jumlah);
    });
    retur.forEach((r) => {
      ke(r.createdAt)[r.jenis === "penjualan" ? "returPenjualan" : "returPembelian"] += toInt(r.qty) * toInt(r.harga);
    });
    pembatalan.forEach((r) => {
      ke(r.createdAt)[r.jenis === "pembelian" ? "batalPembelian" : "batalPenjualan"] += toInt(r.totalNilai);
    });
    // Stok berkurang (rusak/hilang) = rugi; stok bertambah (temuan) mengurangi rugi
    penyesuaian.forEach((r) => {
      ke(r.createdAt).kerugianPenyesuaian += (toInt(r.qty_awal) - toInt(r.qty_baru)) * toInt(r.hargaBeli);
    });

    const hasil = bulan.map(({ transaksi, ...b }) => {
      const labaKotor = b.penjualan - b.hpp;
      return {
        ...b,
        labaKotor,
        margin: b.penjualan ? Math.round((labaKotor / b.penjualan) * 1000) / 10 : 0,
        labaBersih: labaKotor - b.kerugianPenyesuaian,
      };
    });

    const jumlahkan = (k) => hasil.reduce((s, b) => s + b[k], 0);
    const total = Object.fromEntries(["penjualan", "hpp", "labaKotor", "pembelian", "returPenjualan", "returPembelian", "batalPenjualan", "batalPembelian", "kerugianPenyesuaian", "labaBersih"].map((k) => [k, jumlahkan(k)]));
    total.margin = total.penjualan ? Math.round((total.labaKotor / total.penjualan) * 1000) / 10 : 0;

    res.status(200).json({ tahun, bulan: hasil, total });
  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: "Gagal Mengambil Laporan Laba Rugi! " + error });
  }
};

module.exports = { labaRugi };
