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

const getSearchBarang = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const offset = limit * page;
    const totalRows = await barangModel.count({
      include: [
        {
          model: supplierModel,
          as: "supplier",
        },
      ],
      where: {
        [Op.or]: [
          {
            nama: {
              [Op.like]: "%" + search + "%",
            },
          },
          {
            kodeBarang: {
              [Op.like]: "%" + search + "%",
            },
          },
          {
            jenisBarang: {
              [Op.like]: "%" + search + "%",
            },
          },
          {
            "$supplier.nama$": {
              [Op.like]: "%" + search + "%",
            },
          },
        ],
      },
    });
    const totalPage = Math.ceil(totalRows / limit);
    const result = await barangModel.findAll({
      include: [
        {
          model: supplierModel,
          as: "supplier",
        },
      ],
      where: {
        [Op.or]: [
          {
            nama: {
              [Op.like]: "%" + search + "%",
            },
          },
          {
            kodeBarang: {
              [Op.like]: "%" + search + "%",
            },
          },
          {
            jenisBarang: {
              [Op.like]: "%" + search + "%",
            },
          },
          {
            "$supplier.nama$": {
              [Op.like]: "%" + search + "%",
            },
          },
        ],
      },
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
    // console.log(result)
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
      // Tanpa limit: dipakai scan barcode dan cek duplikat, jadi harus mencakup semua barang
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
          [Op.or]: [
            {
              nama: {
                [Op.like]: "%" + search + "%",
              },
            },
            {
              kodeBarang: {
                [Op.like]: "%" + search + "%",
              },
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

    if (hargaBeli !== undefined && hargaJual !== undefined && Number(hargaJual) < Number(hargaBeli)) {
      return res.status(400).json({ msg: "Harga jual tidak boleh lebih kecil dari harga beli" });
    }

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

    if (hargaBeli !== undefined && hargaJual !== undefined && Number(hargaJual) < Number(hargaBeli)) {
      return res.status(400).json({ msg: "Harga jual tidak boleh lebih kecil dari harga beli" });
    }

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
    res.status(200).json({
      barang,
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
  hapusBarang,
  lapBarang,
  getLapBarang,
  findBarang,
  getBarangJoinAutoComplate,
};
