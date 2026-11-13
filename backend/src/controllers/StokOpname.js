const { Op, QueryTypes } = require("sequelize");
const db = require("../config/database.js");
const barangModel = require("../model/BarangModel.js");
const stokOpnameModel = require("../model/StokOpnameModel.js");
const stokOpnameDetailModel = require("../model/StokOpnameDetailModel.js");
const { filterArsip } = require("../model/BarangArsipModel.js");
const { terapkanPenyesuaian } = require("./Barang.js");
const { catatJejak } = require("../middleware/adminPin.js");

// Stok opname bulanan, terbuka untuk semua user (tanpa PIN admin).
// Satu sesi per periode (YYYY-MM). Selama draft, hitungan tersimpan per barang dan bisa dilanjutkan
// atau dibuat ulang; saat final, selisih dihitung dari stok terkini dan dicatat di penyesuaian_stok.

const httpError = (status, msg) => Object.assign(new Error(msg), { status });

const kirimError = (res, error, pesanUmum) => {
  if (!error.status) console.error(error);
  res.status(error.status || 400).json({ msg: error.status ? error.message : `${pesanUmum}! ${error}` });
};

// Periode berjalan menurut waktu Indonesia Barat (+07:00), sama dengan zona waktu database
const periodeSekarang = (sekarang = Date.now()) => {
  const d = new Date(sekarang + 7 * 3600 * 1000);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
};

const nomorDari = (periode) => `SO-${periode.replace("-", "")}`;

const bersihkanPetugas = (petugas) => String(petugas ?? "").trim().slice(0, 100);

const bilanganStok = (nilai) => {
  if (nilai === "" || nilai === null || nilai === undefined) return NaN;
  const n = Number(nilai);
  return Number.isInteger(n) && n >= 0 ? n : NaN;
};

// Ambil sesi yang masih boleh diubah: draft & periode berjalan
const ambilDraftAktif = async (id, t) => {
  const opname = await stokOpnameModel.findByPk(id, t ? { transaction: t, lock: t.LOCK.UPDATE } : undefined);
  if (!opname) throw httpError(404, "Data stok opname tidak ditemukan");
  if (opname.status !== "draft") throw httpError(400, "Stok opname sudah selesai dan tidak bisa diubah");
  if (opname.periode !== periodeSekarang()) {
    throw httpError(400, `Stok opname periode ${opname.periode} sudah lewat dan tidak bisa diubah. Hapus lalu mulai opname bulan ini.`);
  }
  return opname;
};

const SQL_RINGKASAN = `
  SELECT o.id, o.periode, o.nomor, o.status, o.petugas, o.catatan, o.finalAt, o.createdAt, o.updatedAt,
    COUNT(d.id) AS jumlahItem,
    COALESCE(SUM(CASE WHEN d.selisih > 0 THEN d.selisih ELSE 0 END), 0) AS totalPlus,
    COALESCE(SUM(CASE WHEN d.selisih < 0 THEN d.selisih ELSE 0 END), 0) AS totalMinus
  FROM stok_opname o
  LEFT JOIN stok_opname_detail d ON d.opnameId = o.id`;

const angkaRingkasan = (r) => ({
  ...r,
  jumlahItem: Number(r.jumlahItem) || 0,
  totalPlus: Number(r.totalPlus) || 0,
  totalMinus: Number(r.totalMinus) || 0,
});

// GET /stokOpname — riwayat opname per bulan
const list = async (req, res) => {
  try {
    const rows = await db.query(`${SQL_RINGKASAN} GROUP BY o.id ORDER BY o.periode DESC`, { type: QueryTypes.SELECT });
    res.status(200).json({ periodeSekarang: periodeSekarang(), data: rows.map(angkaRingkasan) });
  } catch (error) {
    kirimError(res, error, "Gagal mengambil data stok opname");
  }
};

// GET /stokOpname/bulanIni — status opname periode berjalan: belum / draft / final
const bulanIni = async (req, res) => {
  try {
    const periode = periodeSekarang();
    const rows = await db.query(`${SQL_RINGKASAN} WHERE o.periode = :periode GROUP BY o.id`, {
      replacements: { periode },
      type: QueryTypes.SELECT,
    });
    if (!rows.length) return res.status(200).json({ periode, status: "belum" });
    res.status(200).json(angkaRingkasan(rows[0]));
  } catch (error) {
    kirimError(res, error, "Gagal mengambil status stok opname");
  }
};

// GET /stokOpname/:id — header + detail. Untuk draft, stok sistem diambil live dari tabel barang.
const detail = async (req, res) => {
  try {
    const opname = await stokOpnameModel.findByPk(req.params.id);
    if (!opname) throw httpError(404, "Data stok opname tidak ditemukan");

    const rows = await db.query(
      `SELECT d.id, d.barangId, d.namaBarang, d.kodeBarang, d.stokFisik, d.stokSistem, d.selisih, d.keterangan, d.updatedAt,
         b.id AS barangAda, b.nama AS namaLive, b.kodeBarang AS kodeLive, b.satuan, b.jenisBarang, b.jumlah AS stokLive, b.hargaBeli
       FROM stok_opname_detail d
       LEFT JOIN barang b ON b.id = d.barangId
       WHERE d.opnameId = :id
       ORDER BY d.updatedAt DESC, d.id DESC`,
      { replacements: { id: opname.id }, type: QueryTypes.SELECT },
    );

    const final = opname.status === "final";
    const items = rows.map((r) => {
      const stokSistem = final ? r.stokSistem : r.barangAda ? Number(r.stokLive) || 0 : null;
      const selisih = final ? r.selisih : stokSistem === null ? null : r.stokFisik - stokSistem;
      return {
        id: r.id,
        barangId: r.barangId,
        namaBarang: r.namaLive || r.namaBarang,
        kodeBarang: r.kodeLive || r.kodeBarang,
        satuan: r.satuan || "",
        jenisBarang: r.jenisBarang || "",
        hargaBeli: Number(r.hargaBeli) || 0,
        barangDihapus: !r.barangAda,
        stokFisik: r.stokFisik,
        stokSistem,
        selisih,
        keterangan: r.keterangan || "",
        updatedAt: r.updatedAt,
      };
    });

    res.status(200).json({
      opname: { ...opname.toJSON(), bisaDiubah: !final && opname.periode === periodeSekarang() },
      items,
    });
  } catch (error) {
    kirimError(res, error, "Gagal mengambil detail stok opname");
  }
};

// POST /stokOpname/mulai {petugas} — buat draft bulan ini, atau kembalikan draft yang sudah ada (lanjutkan)
const mulai = async (req, res) => {
  const petugas = bersihkanPetugas(req.body.petugas);
  if (petugas.length < 2) return res.status(400).json({ msg: "Nama petugas wajib diisi" });

  const periode = periodeSekarang();
  try {
    let opname = await stokOpnameModel.findOne({ where: { periode } });
    if (opname?.status === "final") throw httpError(409, "Stok opname bulan ini sudah selesai");
    if (opname) return res.status(200).json({ msg: "Melanjutkan stok opname bulan ini", opname, baru: false });

    try {
      opname = await stokOpnameModel.create({ periode, nomor: nomorDari(periode), status: "draft", petugas });
    } catch (error) {
      // Dua perangkat menekan "Mulai" bersamaan: pakai sesi yang dibuat lebih dulu
      if (error.name !== "SequelizeUniqueConstraintError") throw error;
      opname = await stokOpnameModel.findOne({ where: { periode } });
      return res.status(200).json({ msg: "Melanjutkan stok opname bulan ini", opname, baru: false });
    }
    res.status(201).json({ msg: "Stok opname dimulai", opname, baru: true });
  } catch (error) {
    kirimError(res, error, "Gagal memulai stok opname");
  }
};

// POST /stokOpname/:id/ulang {petugas?} — kosongkan semua hitungan draft bulan ini
const buatUlang = async (req, res) => {
  const petugas = bersihkanPetugas(req.body.petugas);
  try {
    const hasil = await db.transaction(async (t) => {
      const opname = await ambilDraftAktif(req.params.id, t);
      const dihapus = await stokOpnameDetailModel.destroy({ where: { opnameId: opname.id }, transaction: t });
      await opname.update({ catatan: null, ...(petugas.length >= 2 ? { petugas } : {}) }, { transaction: t });
      return { opname, dihapus };
    });
    res.status(200).json({ msg: "Stok opname dibuat ulang, semua hitungan dikosongkan", ...hasil });
  } catch (error) {
    kirimError(res, error, "Gagal membuat ulang stok opname");
  }
};

// DELETE /stokOpname/:id — hapus sesi draft (mis. draft bulan lalu yang tidak pernah diselesaikan)
const hapus = async (req, res) => {
  try {
    await db.transaction(async (t) => {
      const opname = await stokOpnameModel.findByPk(req.params.id, { transaction: t, lock: t.LOCK.UPDATE });
      if (!opname) throw httpError(404, "Data stok opname tidak ditemukan");
      if (opname.status !== "draft") throw httpError(400, "Stok opname yang sudah selesai tidak bisa dihapus");
      await stokOpnameDetailModel.destroy({ where: { opnameId: opname.id }, transaction: t });
      await opname.destroy({ transaction: t });
    });
    res.status(200).json({ msg: "Draft stok opname dihapus" });
  } catch (error) {
    kirimError(res, error, "Gagal menghapus stok opname");
  }
};

// Upsert satu baris hitungan (di dalam transaction)
const simpanBaris = async (opnameId, barang, stokFisik, keterangan, t) => {
  const ada = await stokOpnameDetailModel.findOne({ where: { opnameId, barangId: barang.id }, transaction: t });
  const data = {
    stokFisik,
    namaBarang: barang.nama,
    kodeBarang: barang.kodeBarang,
    ...(keterangan !== undefined ? { keterangan: String(keterangan ?? "").trim().slice(0, 255) || null } : {}),
  };
  if (ada) {
    await ada.update(data, { transaction: t });
    return { item: ada, baru: false };
  }
  return { item: await stokOpnameDetailModel.create({ opnameId, barangId: barang.id, ...data }, { transaction: t }), baru: true };
};

// POST /stokOpname/:id/item {barangId, stokFisik, keterangan?, tambah?}
// tambah = true (scan): stokFisik ditambahkan ke hitungan yang ada (default +1); selain itu stokFisik disetel.
const simpanItem = async (req, res) => {
  const { barangId, keterangan } = req.body;
  const tambah = req.body.tambah === true || req.body.tambah === "true";
  const nilai = tambah && (req.body.stokFisik === undefined || req.body.stokFisik === "") ? 1 : bilanganStok(req.body.stokFisik);

  if (!barangId) return res.status(400).json({ msg: "Barang wajib dipilih" });
  if (Number.isNaN(nilai)) return res.status(400).json({ msg: "Stok fisik harus bilangan bulat 0 atau lebih" });

  try {
    const hasil = await db.transaction(async (t) => {
      const opname = await ambilDraftAktif(req.params.id, t);
      const barang = await barangModel.findByPk(barangId, { transaction: t });
      if (!barang) throw httpError(404, "Barang tidak ditemukan");

      let stokFisik = nilai;
      if (tambah) {
        const ada = await stokOpnameDetailModel.findOne({ where: { opnameId: opname.id, barangId: barang.id }, transaction: t });
        stokFisik = (ada ? ada.stokFisik : 0) + nilai;
      }
      const { item, baru } = await simpanBaris(opname.id, barang, stokFisik, keterangan, t);
      // Sentuh header agar "terakhir diubah" sesi ikut bergerak
      opname.changed("updatedAt", true);
      await opname.save({ transaction: t });
      return { item, baru };
    });
    res.status(200).json({ msg: "Hitungan tersimpan", ...hasil });
  } catch (error) {
    kirimError(res, error, "Gagal menyimpan hitungan");
  }
};

// DELETE /stokOpname/:id/item/:itemId
const hapusItem = async (req, res) => {
  try {
    await db.transaction(async (t) => {
      const opname = await ambilDraftAktif(req.params.id, t);
      const jumlah = await stokOpnameDetailModel.destroy({ where: { id: req.params.itemId, opnameId: opname.id }, transaction: t });
      if (!jumlah) throw httpError(404, "Baris hitungan tidak ditemukan");
    });
    res.status(200).json({ msg: "Baris hitungan dihapus" });
  } catch (error) {
    kirimError(res, error, "Gagal menghapus baris hitungan");
  }
};

// GET /stokOpname/template?supplierId=&jenisBarang= — daftar barang aktif untuk lembar hitung.
// Sengaja tanpa jumlah stok (hitung buta) agar petugas tidak terpengaruh angka sistem.
const template = async (req, res) => {
  try {
    const where = { ...filterArsip("aktif") };
    if (req.query.supplierId) where.supplierId = req.query.supplierId;
    if (req.query.jenisBarang) where.jenisBarang = req.query.jenisBarang;

    const barang = await barangModel.findAll({
      where,
      attributes: ["id", "kodeBarang", "nama", "jenisBarang", "satuan"],
      order: [
        ["jenisBarang", "ASC"],
        ["nama", "ASC"],
      ],
      raw: true,
    });
    res.status(200).json({ periode: periodeSekarang(), barang });
  } catch (error) {
    kirimError(res, error, "Gagal mengambil daftar barang");
  }
};

// POST /stokOpname/:id/import {items:[{baris, barangId, stokFisik, keterangan}]} — hasil upload template Excel.
// Baris dengan stok fisik kosong dilewati; baris tidak valid dilaporkan dan tidak disimpan.
const importItem = async (req, res) => {
  const items = Array.isArray(req.body.items) ? req.body.items : null;
  if (!items) return res.status(400).json({ msg: "Data import tidak valid" });
  if (items.length > 10000) return res.status(400).json({ msg: "Data import terlalu banyak (maksimal 10.000 baris)" });

  const galat = [];
  const valid = new Map(); // barangId -> { stokFisik, keterangan } (baris terakhir menang)
  let dilewati = 0;

  items.forEach((it, i) => {
    const baris = it?.baris ?? i + 1;
    const kosong = it?.stokFisik === "" || it?.stokFisik === null || it?.stokFisik === undefined;
    if (kosong) {
      dilewati += 1;
      return;
    }
    const stokFisik = bilanganStok(it.stokFisik);
    const barangId = Number(it.barangId);
    if (!Number.isInteger(barangId) || barangId <= 0) return galat.push({ baris, pesan: "Barang tidak dikenali" });
    if (Number.isNaN(stokFisik)) return galat.push({ baris, pesan: `Stok fisik "${it.stokFisik}" harus bilangan bulat 0 atau lebih` });
    valid.set(barangId, { baris, stokFisik, keterangan: it.keterangan });
  });

  try {
    const hasil = await db.transaction(async (t) => {
      const opname = await ambilDraftAktif(req.params.id, t);
      const ids = [...valid.keys()];
      const daftar = ids.length ? await barangModel.findAll({ where: { id: { [Op.in]: ids } }, transaction: t }) : [];
      const barangPerId = new Map(daftar.map((b) => [b.id, b]));

      let disimpan = 0;
      for (const [barangId, it] of valid) {
        const barang = barangPerId.get(barangId);
        if (!barang) {
          galat.push({ baris: it.baris, pesan: "Barang tidak ditemukan (mungkin sudah dihapus)" });
          continue;
        }
        await simpanBaris(opname.id, barang, it.stokFisik, it.keterangan, t);
        disimpan += 1;
      }
      opname.changed("updatedAt", true);
      await opname.save({ transaction: t });
      return { disimpan };
    });
    galat.sort((a, b) => a.baris - b.baris);
    res.status(200).json({ msg: `${hasil.disimpan} barang tersimpan dari file`, disimpan: hasil.disimpan, dilewati, galat });
  } catch (error) {
    kirimError(res, error, "Gagal mengimpor hitungan");
  }
};

// POST /stokOpname/:id/final {petugas, catatan?} — terapkan selisih ke stok dalam satu transaction.
// Stok sistem diambil saat ini (setelah di-lock), jadi transaksi yang terjadi selama draft ikut terhitung.
const finalkan = async (req, res) => {
  const petugas = bersihkanPetugas(req.body.petugas);
  const catatan = String(req.body.catatan ?? "").trim() || null;
  if (petugas.length < 2) return res.status(400).json({ msg: "Nama petugas wajib diisi" });

  try {
    const hasil = await db.transaction(async (t) => {
      const opname = await ambilDraftAktif(req.params.id, t);
      // Urut barangId agar urutan lock konsisten dengan transaksi lain (hindari deadlock)
      const details = await stokOpnameDetailModel.findAll({ where: { opnameId: opname.id }, order: [["barangId", "ASC"]], transaction: t });
      if (!details.length) throw httpError(400, "Belum ada barang yang dihitung");

      const alasan = `Stok Opname ${opname.nomor}`;
      const ringkasan = { jumlahItem: details.length, disesuaikan: 0, totalPlus: 0, totalMinus: 0, dilewati: 0 };

      for (const d of details) {
        const barang = await barangModel.findByPk(d.barangId, { transaction: t, lock: t.LOCK.UPDATE });
        if (!barang) {
          ringkasan.dilewati += 1;
          await d.update({ stokSistem: null, selisih: 0, keterangan: [d.keterangan, "Barang sudah dihapus"].filter(Boolean).join(" · ") }, { transaction: t });
          continue;
        }
        const { stokAwal, selisih } = await terapkanPenyesuaian(barang, d.stokFisik, alasan, t);
        await d.update({ stokSistem: stokAwal, selisih, namaBarang: barang.nama, kodeBarang: barang.kodeBarang }, { transaction: t });
        if (selisih !== 0) ringkasan.disesuaikan += 1;
        if (selisih > 0) ringkasan.totalPlus += selisih;
        if (selisih < 0) ringkasan.totalMinus += selisih;
      }

      await opname.update({ status: "final", petugas, catatan, finalAt: new Date() }, { transaction: t });
      // Jejak memakai tabel jejak_admin; operatornya petugas opname (tanpa PIN)
      req.admin = { operator: petugas, perangkat: (req.get?.("User-Agent") || "").slice(0, 500) || null };
      await catatJejak(req, { aksi: "stok_opname", referensi: opname.nomor, alasan: catatan, detail: ringkasan }, t);
      return { opname, ringkasan };
    });
    res.status(200).json({ msg: "Stok opname selesai, stok barang sudah disesuaikan", ...hasil });
  } catch (error) {
    kirimError(res, error, "Gagal menyelesaikan stok opname");
  }
};

module.exports = {
  list,
  bulanIni,
  detail,
  mulai,
  buatUlang,
  hapus,
  simpanItem,
  hapusItem,
  template,
  importItem,
  finalkan,
  periodeSekarang,
};
