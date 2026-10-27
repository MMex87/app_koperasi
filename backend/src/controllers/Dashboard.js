const { Op } = require("sequelize");
const anggotaModel = require("../model/AnggotaModel.js");
const barangModel = require("../model/BarangModel.js");
const supplierModel = require("../model/SupplierModel.js");
const transPenjualanModel = require("../model/TransPenjualanModel.js");
const transPembelianModel = require("../model/TransPembelianModel.js");
const { filterArsip } = require("../model/BarangArsipModel.js");
const { idSupplierLaporan } = require("../config/config.js");
const moment = require("moment");

// Status penjualan yang sudah checkout (onProcess = masih di keranjang)
// Bon & Lunas hanya dari data lama (fitur bon sudah dihapus); tetap dihitung sebagai penjualan
const STATUS_TERJUAL = ["Selesai", "Bon", "Lunas", "Retur"];
const STATUS_TERBELI = ["Done", "Retur"];

const toInt = (v) => parseInt(v) || 0;

// Ringkas baris transaksi menjadi total nominal & jumlah faktur unik
const ringkas = (rows) => ({
  total: rows.reduce((sum, r) => sum + toInt(r.harga), 0),
  transaksi: new Set(rows.map((r) => r.faktur)).size,
});

const getDashboard = async (req, res) => {
  try {
    const batasStok = parseInt(req.query.batasStok) || 10;
    const now = moment();
    const awalHariIni = now.clone().startOf("day");
    const awalKemarin = awalHariIni.clone().subtract(1, "day");
    const awalBulanIni = now.clone().startOf("month");
    const awalBulanLalu = awalBulanIni.clone().subtract(1, "month");
    const awalGrafikBulanan = awalBulanIni.clone().subtract(11, "month");
    const awalGrafikHarian = awalHariIni.clone().subtract(6, "day");
    const awalData = moment.min(awalGrafikBulanan, awalGrafikHarian, awalBulanLalu);

    const [penjualan, terbaru, pembelianBulanIni, totalBarang, stokHabis, stokMenipis, listStokMenipis, barangLaporan, totalAnggota, totalSupplier] = await Promise.all([
      transPenjualanModel.findAll({
        attributes: ["id", "jumlah", "faktur", "harga", "typePembayaran", "statusPenjualan", "barangId", "anggotaId", "createdAt"],
        where: {
          statusPenjualan: { [Op.in]: STATUS_TERJUAL },
          // Retur penuh lama menyisakan harga walau jumlah 0, jadi dikecualikan (sama dengan laporan)
          jumlah: { [Op.gt]: 0 },
          createdAt: { [Op.gte]: awalData.toDate() },
        },
        include: [
          { model: barangModel, as: "barang", attributes: ["id", "nama", "hargaBeli"] },
          { model: anggotaModel, as: "anggota", attributes: ["id", "nama"] },
        ],
        order: [["createdAt", "DESC"]],
      }),
      // Transaksi terakhir tanpa batas tanggal; 50 baris cukup untuk 5 faktur pada umumnya
      transPenjualanModel.findAll({
        attributes: ["faktur", "harga", "typePembayaran", "statusPenjualan", "createdAt"],
        where: { statusPenjualan: { [Op.in]: STATUS_TERJUAL } },
        include: [{ model: anggotaModel, as: "anggota", attributes: ["id", "nama"] }],
        order: [["createdAt", "DESC"]],
        limit: 50,
      }),
      transPembelianModel.findAll({
        attributes: ["jumlah", "harga"],
        where: {
          statusPembelian: { [Op.in]: STATUS_TERBELI },
          createdAt: { [Op.gte]: awalBulanIni.toDate() },
        },
      }),
      // Barang arsip tidak dihitung (barang lama yang sudah tidak dijual)
      barangModel.count({ where: { nama: { [Op.ne]: null }, ...filterArsip() } }),
      barangModel.count({ where: { nama: { [Op.ne]: null }, jumlah: { [Op.lte]: 0 }, ...filterArsip() } }),
      barangModel.count({ where: { nama: { [Op.ne]: null }, jumlah: { [Op.gt]: 0, [Op.lte]: batasStok }, ...filterArsip() } }),
      barangModel.findAll({
        attributes: ["id", "nama", "jumlah", "satuan"],
        where: { nama: { [Op.ne]: null }, jumlah: { [Op.lte]: batasStok }, ...filterArsip() },
        order: [["jumlah", "ASC"]],
        limit: 6,
      }),
      // Sama dengan filter Laporan Barang agar nilai stok konsisten dengan laporan
      barangModel.findAll({
        attributes: ["jumlah", "hargaJual"],
        where: { supplierId: idSupplierLaporan, nama: { [Op.ne]: null }, jumlah: { [Op.gt]: 0 } },
      }),
      anggotaModel.count(),
      supplierModel.count(),
    ]);

    const rows = penjualan.map((r) => r.get({ plain: true }));
    const antara = (awal, akhir) => rows.filter((r) => moment(r.createdAt).isSameOrAfter(awal) && (!akhir || moment(r.createdAt).isBefore(akhir)));

    const rowsHariIni = antara(awalHariIni);
    const rowsBulanIni = antara(awalBulanIni);

    // Estimasi laba memakai harga beli barang saat ini (riwayat harga beli tidak disimpan)
    const labaBulanIni = rowsBulanIni.reduce((sum, r) => sum + toInt(r.harga) - toInt(r.barang?.hargaBeli) * toInt(r.jumlah), 0);

    const grafikHarian = [];
    for (let i = 0; i < 7; i++) {
      const awal = awalGrafikHarian.clone().add(i, "day");
      grafikHarian.push({ tanggal: awal.format("YYYY-MM-DD"), ...ringkas(antara(awal, awal.clone().add(1, "day"))) });
    }

    const grafikBulanan = [];
    for (let i = 0; i < 12; i++) {
      const awal = awalGrafikBulanan.clone().add(i, "month");
      grafikBulanan.push({ bulan: awal.format("YYYY-MM"), ...ringkas(antara(awal, awal.clone().add(1, "month"))) });
    }

    const metodeMap = {};
    rowsBulanIni.forEach((r) => {
      const key = r.typePembayaran || "Lainnya";
      metodeMap[key] = metodeMap[key] || [];
      metodeMap[key].push(r);
    });
    const metodePembayaran = Object.entries(metodeMap)
      .map(([metode, list]) => ({ metode, ...ringkas(list) }))
      .sort((a, b) => b.total - a.total);

    const terlarisMap = {};
    rowsBulanIni.forEach((r) => {
      if (!r.barang) return;
      const item = terlarisMap[r.barangId] || { id: r.barangId, nama: r.barang.nama, terjual: 0, total: 0 };
      item.terjual += toInt(r.jumlah);
      item.total += toInt(r.harga);
      terlarisMap[r.barangId] = item;
    });
    const barangTerlaris = Object.values(terlarisMap)
      .filter((b) => b.terjual > 0)
      .sort((a, b) => b.terjual - a.terjual)
      .slice(0, 5);

    // terbaru sudah urut, jadi faktur pertama yang ditemui = transaksi terbaru
    const fakturMap = new Map();
    for (const r of terbaru.map((t) => t.get({ plain: true }))) {
      if (!fakturMap.has(r.faktur)) {
        if (fakturMap.size === 5) break;
        fakturMap.set(r.faktur, { faktur: r.faktur, anggota: r.anggota?.nama || "-", typePembayaran: r.typePembayaran, status: r.statusPenjualan, waktu: r.createdAt, item: 0, total: 0 });
      }
      const trx = fakturMap.get(r.faktur);
      trx.item += 1;
      trx.total += toInt(r.harga);
    }

    res.status(200).json({
      penjualan: {
        hariIni: ringkas(rowsHariIni),
        kemarin: ringkas(antara(awalKemarin, awalHariIni)),
        bulanIni: ringkas(rowsBulanIni),
        bulanLalu: ringkas(antara(awalBulanLalu, awalBulanIni)),
        labaBulanIni,
      },
      pembelianBulanIni: {
        total: pembelianBulanIni.reduce((sum, r) => sum + toInt(r.harga) * toInt(r.jumlah), 0),
        transaksi: pembelianBulanIni.length,
      },
      stok: {
        totalBarang,
        stokHabis,
        stokMenipis,
        batasStok,
        nilaiStok: barangLaporan.reduce((sum, r) => sum + toInt(r.hargaJual) * toInt(r.jumlah), 0),
        listStokMenipis,
      },
      totalAnggota,
      totalSupplier,
      grafikHarian,
      grafikBulanan,
      metodePembayaran,
      barangTerlaris,
      transaksiTerakhir: [...fakturMap.values()],
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: "Gagal Mengambil Data Dashboard! " + error });
  }
};

module.exports = {
  getDashboard,
};
