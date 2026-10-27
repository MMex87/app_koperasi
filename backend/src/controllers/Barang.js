const { Op, Sequelize, QueryTypes } = require("sequelize");
const barangModel = require("../model/BarangModel.js");
const supplierModel = require("../model/SupplierModel.js");
const transPenjualanModel = require("../model/TransPenjualanModel.js");
const transPembelianModel = require("../model/TransPembelianModel.js");
const returnPenjualanModel = require("../model/ReturnPenjualanModel.js");
const returnPembelianModel = require("../model/ReturnPembelianModel.js");
const logPenjualanModel = require("../model/LogPenjualanModel.js");
const logPembelianModel = require("../model/LogPembelianModel.js");
const PenjualanBonModel = require("../model/PenjualanBonModel.js");
const penyesuaianStokModel = require("../model/PenyesuaianStokModel.js");
const { KOLASI_TABEL } = require("../model/PenyesuaianStokModel.js");
const db = require("../config/database.js");
const { idSupplierLaporan } = require("../config/config.js");
const { catatJejak } = require("../middleware/adminPin.js");
const barangArsipModel = require("../model/BarangArsipModel.js");
const { filterArsip, aktifkanJikaDiarsip, SQL_ID_ARSIP } = require("../model/BarangArsipModel.js");

// Cek kode barang dipakai barang lain (kode harus unik agar scan barcode tidak salah barang)
const kodeBarangDipakai = async (kodeBarang, kecualiId) => {
  if (kodeBarang === undefined || kodeBarang === null || String(kodeBarang).trim() === "") return null;
  const where = { kodeBarang: String(kodeBarang).trim() };
  if (kecualiId) where.id = { [Op.ne]: kecualiId };
  return barangModel.findOne({ where });
};

const getBarang = async (req, res) => {
  try {
    const barang = await barangModel.findAll({
      order: [["jumlah", "DESC"]],
    });

    const count = await barangModel.count({
      where: {
        [Sequelize.Op.or]: [{ nama: { [Sequelize.Op.not]: null } }, { kodeBarang: { [Sequelize.Op.not]: null } }],
      },
    });

    res.status(200).json({ barang, count });
  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: "Gagal Mengambil Data! " + error });
  }
};

const getLapBarang = async (req, res) => {
  try {
    const barang = await barangModel.findAll({
      where: {
        supplierId: idSupplierLaporan,
        jumlah: {
          [Op.gt]: 0,
        },
        nama: {
          [Op.ne]: null,
        },
      },
      order: [["jumlah", "DESC"]],
    });

    const dataArray = barang.map((result) => result.get({ plain: true }));

    const total = barang.map((result) => {
      // hargaJual/jumlah bisa NULL pada data lama
      const totalString = ((parseInt(result.hargaJual) || 0) * (parseInt(result.jumlah) || 0)).toString();

      return {
        ...result.get({ plain: true }),
        total: totalString,
      };
    });

    res.json({
      dataArray: dataArray,
      total: total,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: "Gagal Mengambil Data! " + error });
  }
};

const lapBarang = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 10;
    const offset = limit * page;

    // Filter yang sama untuk hitung total dan ambil data, agar jumlah halaman sesuai isi
    const where = {
      supplierId: idSupplierLaporan,
      jumlah: {
        [Op.gt]: 0,
      },
      nama: {
        [Op.ne]: null,
      },
    };

    const totalRows = await barangModel.count({ where });
    const totalPage = Math.ceil(totalRows / limit);

    const results = await barangModel.findAll({
      where,
      offset: offset,
      limit: limit,
      order: [["jumlah", "DESC"]],
    });

    const dataArray = results.map((result) => result.get({ plain: true }));

    res.json({
      result: dataArray,
      page: page,
      limit: limit,
      totalRows: totalRows,
      totalPage: totalPage,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: "Gagal Mengambil Data! " + error });
  }
};

const getBarangId = async (req, res) => {
  try {
    const barang = await barangModel.findOne({
      order: [["id", "DESC"]],
      where: {
        id: req.params.id,
      },
    });
    res.status(200).json(barang);
  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: "Gagal Mengambil Data! " + error });
  }
};

// ?arsip=1 menampilkan hanya barang yang diarsipkan; default hanya barang aktif
const getSearchBarang = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const offset = limit * page;
    const cocok = { [Op.like]: "%" + search + "%" };
    const where = {
      [Op.and]: [
        filterArsip(req.query.arsip === "1" ? "arsip" : "aktif"),
        { [Op.or]: [{ nama: cocok }, { kodeBarang: cocok }, { jenisBarang: cocok }, { "$supplier.nama$": cocok }] },
      ],
    };
    const include = [{ model: supplierModel, as: "supplier" }];

    const totalRows = await barangModel.count({ include, where });
    const totalPage = Math.ceil(totalRows / limit);
    const result = await barangModel.findAll({
      include,
      where,
      offset,
      limit,
      order: [["updatedAt", "DESC"]],
    });
    res.status(200).json({
      page,
      result,
      totalPage,
      totalRows,
      limit,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: "Gagal Mengambil Data! " + error });
  }
};

const getBarangJoin = async (req, res) => {
  try {
    const barang = await barangModel.findAll({
      include: [
        {
          model: supplierModel,
          as: "supplier",
        },
      ],
      order: [["id", "DESC"]],
      // Tanpa limit: dipakai scan barcode dan cek duplikat. Kasir hanya barang aktif; pembelian (?termasukArsip=1) semua barang
      where: filterArsip(req.query.termasukArsip === "1" ? "semua" : "aktif"),
      attributes: ["id", "nama", "kodeBarang", "jenisBarang", "satuan", "jumlah", "hargaBeli", "hargaJual", "supplierId"],
    });
    res.status(200).json(barang);
  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: "Gagal Mengambil Data: " + error });
  }
};
const getBarangJoinAutoComplate = async (req, res) => {
  let search = req.query.search;
  let barang = "";
  // Kasir hanya barang aktif; pembelian (?termasukArsip=1) juga barang arsip agar bisa di-restock
  const arsip = filterArsip(req.query.termasukArsip === "1" ? "semua" : "aktif");
  try {
    if (search == "") {
      barang = await barangModel.findAll({
        include: [
          {
            model: supplierModel,
            as: "supplier",
          },
        ],
        order: [["id", "DESC"]],
        limit: 10,
        where: arsip,
        attributes: ["id", "nama", "kodeBarang", "jenisBarang", "satuan", "jumlah", "hargaBeli", "hargaJual", "supplierId"],
      });
    } else {
      barang = await barangModel.findAll({
        include: [
          {
            model: supplierModel,
            as: "supplier",
          },
        ],
        order: [["id", "DESC"]],
        limit: 10,
        attributes: ["id", "nama", "kodeBarang", "jenisBarang", "satuan", "jumlah", "hargaBeli", "hargaJual", "supplierId"],
        where: {
          [Op.and]: [
            arsip,
            {
              [Op.or]: [{ nama: { [Op.like]: "%" + search + "%" } }, { kodeBarang: { [Op.like]: "%" + search + "%" } }],
            },
          ],
        },
      });
    }
    res.status(200).json(barang);
  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: "Gagal Mengambil Data: " + error });
  }
};

const findBarang = async (req, res) => {
  const { kodeBarang, supplierId } = req.query;
  try {
    const barang = await barangModel.findOne({
      include: [
        {
          model: supplierModel,
          as: "supplier",
        },
      ],
      where: {
        [Op.and]: {
          kodeBarang,
          supplierId,
        },
      },
    });
    res.status(200).json(barang);
  } catch (error) {
    res.status(400).json({ msg: "Gagal Mengambil Data: " + error });
  }
};

const tambahBarang = async (req, res) => {
  try {
    const { nama, kodeBarang, jenisBarang, satuan, jumlah, hargaBeli, hargaJual, supplierId } = req.body;

    // Cek apakah nama sudah ada di database
    const existingBarang = await barangModel.findOne({ where: { nama } });
    if (existingBarang) {
      return res.status(400).json({ msg: "Barang sudah terdaftar" });
    }

    const kodeSama = await kodeBarangDipakai(kodeBarang);
    if (kodeSama) {
      return res.status(400).json({ msg: `Kode barang ${kodeBarang} sudah dipakai barang "${kodeSama.nama}"` });
    }

    const barang = await barangModel.create({
      nama,
      kodeBarang,
      jenisBarang,
      satuan,
      jumlah,
      hargaBeli,
      hargaJual,
      supplierId,
    });

    res.status(200).json({ msg: "Data Berhasil Ditambahakan", barangId: barang.id });
  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: "Gagal Menambah Data! " + error });
  }
};

const editBarang = async (req, res) => {
  try {
    const { nama, kodeBarang, jenisBarang, satuan, hargaBeli, hargaJual, supplierId } = req.body;

    // Stok hanya berubah lewat transaksi atau penyesuaian stok, agar selalu tercatat di riwayat
    if (req.body.jumlah !== undefined) {
      return res.status(400).json({ msg: "Stok tidak bisa diubah di sini. Gunakan fitur Penyesuaian Stok." });
    }

    // Harga jual boleh di bawah harga beli (promo / jual rugi), jadi tidak divalidasi terhadap harga beli

    // Cek apakah nama sudah ada di database
    // const existingBarang = await barangModel.findOne({ where: { nama } });
    // if (existingBarang) {
    //   return res.status(400).json({ msg: "Barang sudah terdaftar" });
    // }

    const kodeSama = await kodeBarangDipakai(kodeBarang, req.params.id);
    if (kodeSama) {
      return res.status(400).json({ msg: `Kode barang ${kodeBarang} sudah dipakai barang "${kodeSama.nama}"` });
    }

    await barangModel.update(
      {
        nama,
        kodeBarang,
        jenisBarang,
        satuan,
        hargaBeli,
        hargaJual,
        supplierId,
      },
      {
        where: {
          id: req.params.id,
        },
      }
    );

    res.status(200).json({ msg: "Data Berhasil Diubah" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: "Gagal Mengedit Data! " + error });
  }
};

// Hitung data yang ikut terhapus jika barang dihapus (untuk peringatan sebelum hapus)
const hitungDataTerkaitBarang = async (barangId, transaction) => {
  const opt = { where: { barangId }, transaction };
  const transPenjualanIds = (await transPenjualanModel.findAll({ ...opt, attributes: ["id"] })).map((v) => v.id);
  return {
    transPenjualan: transPenjualanIds.length,
    transPembelian: await transPembelianModel.count(opt),
    returnPenjualan: await returnPenjualanModel.count(opt),
    returnPembelian: await returnPembelianModel.count(opt),
    logPenjualan: await logPenjualanModel.count(opt),
    logPembelian: await logPembelianModel.count(opt),
    penyesuaianStok: await penyesuaianStokModel.count(opt),
    // Bon tidak dihapus, hanya kehilangan tautan ke transaksi
    penjualanBon: transPenjualanIds.length ? await PenjualanBonModel.count({ where: { transPenjualanId: transPenjualanIds }, transaction }) : 0,
  };
};

// Jenis pergerakan stok -> keterangan yang ditulis saat checkout/retur; arah = efek ke stok
const JENIS_RIWAYAT_STOK = {
  penjualan: { keterangan: "Penjualan (-)", arah: -1 },
  returPenjualan: { keterangan: "Retur Penjualan (+)", arah: 1 },
  pembelian: { keterangan: "Pembelian (+)", arah: 1 },
  returPembelian: { keterangan: "Retur Pembelian (-)", arah: -1 },
  batalPenjualan: { keterangan: "Pembatalan Penjualan (+)", arah: 1 },
  batalPembelian: { keterangan: "Pembatalan Pembelian (-)", arah: -1 },
  penyesuaianTambah: { keterangan: "Penyesuaian Stok (+)", arah: 1 },
  penyesuaianKurang: { keterangan: "Penyesuaian Stok (-)", arah: -1 },
};

// Riwayat stok tersebar di log_penjualan, log_pembelian & penyesuaian_stok, digabung agar bisa diurutkan & dipaginasi bersama.
// Kolom teks penyesuaian_stok di-COLLATE eksplisit: tabel ini bisa dibuat dengan collation bawaan server
// yang berbeda dari tabel log lama, dan UNION menolak campuran collation.
const SQL_RIWAYAT_STOK = `
  SELECT id, qty, qty_awal, qty_baru, keterangan, faktur, NULL AS alasan, createdAt FROM log_penjualan WHERE barangId = :barangId
  UNION ALL
  SELECT id, qty, qty_awal, qty_baru, keterangan, faktur, NULL AS alasan, createdAt FROM log_pembelian WHERE barangId = :barangId
  UNION ALL
  SELECT id, qty, qty_awal, qty_baru, keterangan COLLATE ${KOLASI_TABEL} AS keterangan, NULL AS faktur, alasan COLLATE ${KOLASI_TABEL} AS alasan, createdAt
  FROM penyesuaian_stok WHERE barangId = :barangId`;

// Penyesuaian stok manual (stock opname / koreksi): stok diset ke jumlah fisik baru dan selisihnya dicatat
// beserta alasan dalam satu DB transaction, sehingga perubahan stok selalu muncul di riwayat.
const penyesuaianStok = async (req, res) => {
  const stokBaru = Number(req.body.stokBaru);
  const alasan = (req.body.alasan || "").trim();

  if (!Number.isInteger(stokBaru) || stokBaru < 0) {
    return res.status(400).json({ msg: "Stok baru harus bilangan bulat 0 atau lebih" });
  }
  if (alasan.length < 5) {
    return res.status(400).json({ msg: "Alasan penyesuaian wajib diisi (minimal 5 karakter)" });
  }

  try {
    const hasil = await db.transaction(async (t) => {
      const barang = await barangModel.findByPk(req.params.id, { transaction: t, lock: t.LOCK.UPDATE });
      if (!barang) {
        throw Object.assign(new Error("Barang tidak ditemukan"), { status: 404 });
      }

      const stokAwal = parseInt(barang.jumlah) || 0;
      const selisih = stokBaru - stokAwal;
      if (selisih === 0) {
        throw Object.assign(new Error("Stok baru sama dengan stok saat ini, tidak ada perubahan"), { status: 400 });
      }

      await barang.update({ jumlah: stokBaru }, { transaction: t });
      if (stokBaru > 0) await aktifkanJikaDiarsip(barang.id, t);
      await penyesuaianStokModel.create(
        {
          qty: Math.abs(selisih),
          qty_awal: stokAwal,
          qty_baru: stokBaru,
          keterangan: selisih > 0 ? JENIS_RIWAYAT_STOK.penyesuaianTambah.keterangan : JENIS_RIWAYAT_STOK.penyesuaianKurang.keterangan,
          alasan,
          barangId: barang.id,
        },
        { transaction: t },
      );
      await catatJejak(req, { aksi: "penyesuaian_stok", referensi: barang.id, alasan, detail: { nama: barang.nama, stokAwal, stokBaru, selisih } }, t);
      return { stokAwal, stokBaru, selisih };
    });

    res.status(200).json({ msg: "Stok berhasil disesuaikan", ...hasil });
  } catch (error) {
    console.error(error);
    res.status(error.status || 400).json({ msg: error.status ? error.message : "Gagal Menyesuaikan Stok! " + error });
  }
};

const getDetailBarang = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 10;
    const jenis = JENIS_RIWAYAT_STOK[req.query.jenis];

    const barang = await barangModel.findByPk(req.params.id, {
      include: [{ model: supplierModel, as: "supplier", attributes: ["id", "nama"] }],
    });
    if (!barang) {
      return res.status(404).json({ msg: "Barang tidak ditemukan" });
    }

    const replacements = { barangId: barang.id, keterangan: jenis ? jenis.keterangan : null, limit, offset: limit * page };
    const filter = "WHERE (:keterangan IS NULL OR keterangan = :keterangan)";

    const [ringkasanRows, countRows, riwayatRows] = await Promise.all([
      db.query(`SELECT keterangan, COUNT(*) AS transaksi, SUM(qty) AS qty, MAX(createdAt) AS terakhir FROM (${SQL_RIWAYAT_STOK}) r GROUP BY keterangan`, { replacements, type: QueryTypes.SELECT }),
      db.query(`SELECT COUNT(*) AS total FROM (${SQL_RIWAYAT_STOK}) r ${filter}`, { replacements, type: QueryTypes.SELECT }),
      db.query(`SELECT * FROM (${SQL_RIWAYAT_STOK}) r ${filter} ORDER BY createdAt DESC, id DESC LIMIT :limit OFFSET :offset`, { replacements, type: QueryTypes.SELECT }),
    ]);

    const ringkasan = {};
    Object.entries(JENIS_RIWAYAT_STOK).forEach(([key, { keterangan }]) => {
      const row = ringkasanRows.find((r) => r.keterangan === keterangan);
      ringkasan[key] = { transaksi: parseInt(row?.transaksi) || 0, qty: parseInt(row?.qty) || 0, terakhir: row?.terakhir || null };
    });

    const riwayat = riwayatRows.map((r) => {
      const [key, info] = Object.entries(JENIS_RIWAYAT_STOK).find(([, v]) => v.keterangan === r.keterangan) || [null, { arah: Math.sign(r.qty_baru - r.qty_awal) }];
      return { ...r, jenis: key, perubahan: info.arah * (parseInt(r.qty) || 0) };
    });

    const totalRows = parseInt(countRows[0]?.total) || 0;
    const arsip = await barangArsipModel.findOne({ where: { barangId: barang.id } });
    res.status(200).json({
      barang,
      arsip,
      ringkasan,
      riwayat,
      page,
      limit,
      totalRows,
      totalPage: Math.ceil(totalRows / limit),
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: "Gagal Mengambil Data! " + error });
  }
};

// Arsipkan banyak barang sekaligus (PIN admin). Hanya barang stok 0 yang bisa diarsip,
// agar barang yang masih punya stok tidak pernah tersembunyi dari kasir & nilai stok.
const arsipBarang = async (req, res) => {
  const ids = [...new Set((Array.isArray(req.body.ids) ? req.body.ids : []).map(Number).filter(Number.isInteger))];
  const alasan = (req.body.alasan || "").trim();

  if (ids.length === 0) {
    return res.status(400).json({ msg: "Pilih minimal satu barang" });
  }
  if (alasan.length < 5) {
    return res.status(400).json({ msg: "Alasan arsip wajib diisi (minimal 5 karakter)" });
  }

  try {
    const hasil = await db.transaction(async (t) => {
      const barang = await barangModel.findAll({ where: { id: ids }, transaction: t, lock: t.LOCK.UPDATE });
      if (barang.length !== ids.length) {
        throw Object.assign(new Error("Sebagian barang tidak ditemukan"), { status: 404 });
      }
      const masihAdaStok = barang.filter((b) => (parseInt(b.jumlah) || 0) > 0);
      if (masihAdaStok.length) {
        const nama = masihAdaStok.slice(0, 5).map((b) => `${b.nama} (${b.jumlah})`).join(", ");
        throw Object.assign(new Error(`Barang yang masih punya stok tidak bisa diarsip: ${nama}${masihAdaStok.length > 5 ? ", ..." : ""}`), { status: 409 });
      }

      const sudah = (await barangArsipModel.findAll({ where: { barangId: ids }, transaction: t })).map((a) => a.barangId);
      const baru = barang.filter((b) => !sudah.includes(b.id));
      await barangArsipModel.bulkCreate(
        baru.map((b) => ({ barangId: b.id, alasan, operator: req.admin?.operator })),
        { transaction: t }
      );
      await catatJejak(req, { aksi: "arsip_barang", referensi: baru.map((b) => b.id).join(","), alasan, detail: { jumlah: baru.length, barang: baru.map((b) => b.nama) } }, t);
      return { diarsip: baru.length, sudahArsip: sudah.length };
    });

    res.status(200).json({ msg: `${hasil.diarsip} barang diarsipkan`, ...hasil });
  } catch (error) {
    console.error(error);
    res.status(error.status || 400).json({ msg: error.status ? error.message : "Gagal Mengarsipkan Barang! " + error });
  }
};

// Keluarkan barang dari arsip (PIN admin)
const aktifkanBarang = async (req, res) => {
  try {
    const barang = await barangModel.findByPk(req.params.id);
    if (!barang) {
      return res.status(404).json({ msg: "Barang tidak ditemukan" });
    }
    await db.transaction(async (t) => {
      const dihapus = await aktifkanJikaDiarsip(barang.id, t);
      if (!dihapus) {
        throw Object.assign(new Error("Barang ini tidak sedang diarsip"), { status: 400 });
      }
      await catatJejak(req, { aksi: "aktifkan_barang", referensi: barang.id, detail: { nama: barang.nama } }, t);
    });
    res.status(200).json({ msg: `Barang "${barang.nama}" aktif kembali` });
  } catch (error) {
    console.error(error);
    res.status(error.status || 400).json({ msg: error.status ? error.message : "Gagal Mengaktifkan Barang! " + error });
  }
};

// Ringkasan data barang yang perlu dibersihkan (read-only). Kandidat arsip: stok 0, belum diarsip,
// dan tidak ada pergerakan stok selama `hari` terakhir (default 90).
const kesehatanData = async (req, res) => {
  try {
    const hari = parseInt(req.query.hari) || 90;
    const batas = new Date(Date.now() - hari * 24 * 60 * 60 * 1000);
    const q = (sql, replacements = {}) => db.query(sql, { replacements, type: QueryTypes.SELECT });
    const aktif = `b.id NOT IN ${SQL_ID_ARSIP}`;

    const [tanpaNama, tanpaKode, hargaKosong, kodeDuplikat, supplierTanpaNama, kandidatArsip, jumlahArsip] = await Promise.all([
      q(`SELECT b.id, b.nama, b.kodeBarang, b.jumlah FROM barang b WHERE ${aktif} AND (b.nama IS NULL OR TRIM(b.nama) = '') ORDER BY b.id`),
      q(`SELECT b.id, b.nama, b.kodeBarang, b.jumlah FROM barang b WHERE ${aktif} AND (b.kodeBarang IS NULL OR TRIM(b.kodeBarang) = '') ORDER BY b.id`),
      q(`SELECT b.id, b.nama, b.kodeBarang, b.jumlah, b.hargaBeli, b.hargaJual FROM barang b WHERE ${aktif} AND (b.hargaJual IS NULL OR b.hargaJual <= 0) ORDER BY b.id`),
      q(
        `SELECT b.id, b.nama, b.kodeBarang, b.jumlah FROM barang b
         WHERE TRIM(b.kodeBarang) <> '' AND b.kodeBarang IN (SELECT kodeBarang FROM barang WHERE TRIM(kodeBarang) <> '' GROUP BY kodeBarang HAVING COUNT(*) > 1)
         ORDER BY b.kodeBarang, b.id`
      ),
      q(`SELECT s.id, s.nama, s.noHP, s.alamat, (SELECT COUNT(*) FROM barang WHERE supplierId = s.id) AS jumlahBarang FROM supplier s WHERE s.nama IS NULL OR TRIM(s.nama) = '' ORDER BY s.id`),
      q(
        `SELECT b.id, b.nama, b.kodeBarang, b.jumlah, s.nama AS supplier, t.terakhir
         FROM barang b
         LEFT JOIN supplier s ON s.id = b.supplierId
         LEFT JOIN (
           SELECT barangId, MAX(createdAt) AS terakhir FROM (
             SELECT barangId, createdAt FROM log_penjualan
             UNION ALL SELECT barangId, createdAt FROM log_pembelian
             UNION ALL SELECT barangId, createdAt FROM penyesuaian_stok
           ) x GROUP BY barangId
         ) t ON t.barangId = b.id
         WHERE ${aktif} AND b.jumlah <= 0 AND (t.terakhir IS NULL OR t.terakhir < :batas)
         ORDER BY t.terakhir IS NULL DESC, t.terakhir ASC`,
        { batas }
      ),
      q(`SELECT COUNT(*) AS n FROM barang_arsip`),
    ]);

    res.status(200).json({
      hari,
      jumlahArsip: parseInt(jumlahArsip[0]?.n) || 0,
      tanpaNama,
      tanpaKode,
      hargaKosong,
      kodeDuplikat,
      supplierTanpaNama,
      kandidatArsip,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: "Gagal Mengambil Data! " + error });
  }
};

const getHapusInfoBarang = async (req, res) => {
  try {
    const barang = await barangModel.findByPk(req.params.id);
    if (!barang) {
      return res.status(404).json({ msg: "Barang tidak ditemukan" });
    }
    res.status(200).json({ barang: { id: barang.id, nama: barang.nama, kodeBarang: barang.kodeBarang, jumlah: barang.jumlah }, terkait: await hitungDataTerkaitBarang(barang.id) });
  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: "Gagal Mengambil Data! " + error });
  }
};

// Hapus barang beserta seluruh transaksi, retur, dan log-nya dalam satu DB transaction.
// Wajib ?konfirmasi=ya agar tidak terhapus tanpa sengaja (frontend menampilkan peringatan dulu).
const hapusBarang = async (req, res) => {
  if (req.query.konfirmasi !== "ya") {
    return res.status(400).json({ msg: "Penghapusan barang perlu konfirmasi (konfirmasi=ya)" });
  }

  try {
    const terhapus = await db.transaction(async (t) => {
      const barang = await barangModel.findByPk(req.params.id, { transaction: t, lock: t.LOCK.UPDATE });
      if (!barang) {
        throw Object.assign(new Error("Barang tidak ditemukan"), { status: 404 });
      }

      const barangId = barang.id;
      const jumlah = await hitungDataTerkaitBarang(barangId, t);
      const opt = { where: { barangId }, transaction: t };
      const transPenjualanIds = (await transPenjualanModel.findAll({ ...opt, attributes: ["id"] })).map((v) => v.id);
      const transPembelianIds = (await transPembelianModel.findAll({ ...opt, attributes: ["id"] })).map((v) => v.id);

      // Retur dihapus berdasarkan barangId maupun transaksi induknya
      await returnPenjualanModel.destroy({ where: { [Op.or]: [{ barangId }, ...(transPenjualanIds.length ? [{ transPenjualanId: transPenjualanIds }] : [])] }, transaction: t });
      await returnPembelianModel.destroy({ where: { [Op.or]: [{ barangId }, ...(transPembelianIds.length ? [{ transPembelianId: transPembelianIds }] : [])] }, transaction: t });
      await transPenjualanModel.destroy(opt);
      await transPembelianModel.destroy(opt);
      await logPenjualanModel.destroy(opt);
      await logPembelianModel.destroy(opt);
      await penyesuaianStokModel.destroy(opt);
      await barangArsipModel.destroy(opt);
      await barang.destroy({ transaction: t });

      // Barang & riwayatnya hilang, jadi jejak admin menyimpan ringkasan apa yang dihapus
      await catatJejak(
        req,
        { aksi: "hapus_barang", referensi: barangId, alasan: (req.body?.alasan || "").trim() || null, detail: { nama: barang.nama, kodeBarang: barang.kodeBarang, stok: barang.jumlah, terhapus: jumlah } },
        t
      );

      return { nama: barang.nama, ...jumlah };
    });

    res.status(200).json({ msg: `Barang "${terhapus.nama}" beserta transaksinya berhasil dihapus`, terhapus });
  } catch (error) {
    console.error(error);
    res.status(error.status || 400).json({ msg: error.status ? error.message : "Gagal Menghapus Data! " + error });
  }
};

module.exports = {
  getBarang,
  getBarangJoin,
  getSearchBarang,
  getBarangId,
  tambahBarang,
  editBarang,
  getHapusInfoBarang,
  getDetailBarang,
  penyesuaianStok,
  arsipBarang,
  aktifkanBarang,
  kesehatanData,
  hapusBarang,
  lapBarang,
  getLapBarang,
  findBarang,
  getBarangJoinAutoComplate,
};
