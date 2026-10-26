const { Op } = require("sequelize");
const barangModel = require("../model/BarangModel.js");
const supplierModel = require("../model/SupplierModel.js");
const transPembelianModel = require("../model/TransPembelianModel.js");
const logPembelianModel = require("../model/LogPembelianModel.js");
const pembatalanModel = require("../model/PembatalanModel.js");
const { catatJejak } = require("../middleware/adminPin.js");
const db = require("../config/database.js");
const moment = require("moment");

const STATUS_PEMBELIAN = ["onProcess", "Done", "Retur"];

const isBilanganBulat = (v) => v !== null && v !== "" && Number.isInteger(Number(v));

const httpError = (status, msg) => Object.assign(new Error(msg), { status });

const getPembelian = async (req, res) => {
  try {
    const pembelian = await transPembelianModel.findAll({
      where: [
        {
          statusPembelian: "onProcess",
        },
      ],
      order: [["id", "ASC"]],
    });
    res.status(200).json(pembelian);
  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: "Gagal Mengambil Data: " + error });
  }
};
const getPembelianId = async (req, res) => {
  try {
    const pembelian = await transPembelianModel.findOne({
      where: [
        {
          id: req.params.id,
        },
      ],
      include: [
        {
          model: barangModel,
          as: "barang",
        },
      ],

      order: [["id", "ASC"]],
    });
    res.status(200).json(pembelian);
  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: "Gagal Mengambil Data: " + error });
  }
};

const getTransPembelianByFaktur = async (req, res) => {
  try {
    const penjualan = await transPembelianModel.findAll({
      where: {
        faktur: req.params.faktur,
        barangId: {
          [Op.not]: null,
        },
      },
      include: [
        {
          model: barangModel,
          as: "barang",
          include: {
            model: supplierModel,
            as: "supplier",
          },
        },
      ],
      order: [["id", "DESC"]],
    });
    res.status(200).json(penjualan);
  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: "Gagal Mengambil Data: " + error });
  }
};

const getJoinPemBarang = async (req, res) => {
  try {
    const pembelian = await transPembelianModel.findAll({
      where: [
        {
          statusPembelian: "onProcess",
        },
      ],
      include: [
        {
          model: barangModel,
        },
        {
          model: supplierModel,
          as: "supplier",
        },
      ],
      attributes: ["id", "jumlah", "faktur", "harga", "hargaJual", "supplierId", "barangId", ["createdAt", "waktuBeli"], "statusPembelian"],
    });
    res.status(200).json(pembelian);
  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: "Gagal Mengambil Data: " + error });
  }
};

const getJoinPemBarangLapor = async (req, res) => {
  try {
    const supplier = req.query.supplier || "";
    const pembelian = await transPembelianModel.findAll({
      include: [
        {
          model: barangModel,
        },
        {
          model: supplierModel,
          as: "supplier",
        },
      ],
      where: {
        [Op.or]: [
          {
            "$supplier.nama$": {
              [Op.like]: "%" + supplier + "%",
            },
          },
        ],
      },
      attributes: ["id", "jumlah", "faktur", "harga", "hargaJual", "supplierId", "barangId", ["createdAt", "waktuBeli"], "statusPembelian"],
    });
    res.status(200).json(pembelian);
  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: "Gagal Mengambil Data: " + error });
  }
};

const getJoinPemAnBarangSarch = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit);
    const search = req.query.date;
    const IdSupplier = req.query.supplier;
    const offset = page * limit;

    const startOfDay = moment(search).startOf("day").toDate(); // Mulai hari pada tanggal tertentu
    const endOfDay = moment(search).endOf("day").toDate(); // Akhir hari pada tanggal tertentu

    let totalPage = 0;
    let result = [];
    let totalRows = 0;

    if (limit == 0) {
      result = await transPembelianModel.findAll({
        include: [
          {
            model: barangModel,
          },
          {
            model: supplierModel,
            as: "supplier",
          },
        ],
        where: {
          createdAt: {
            [Op.gte]: startOfDay,
            [Op.lte]: endOfDay,
          },
          ...(IdSupplier ? { supplierId: IdSupplier } : {}), // kosong = semua supplier
          barangId: {
            [Op.not]: null,
          },
        },
        attributes: ["id", "jumlah", "faktur", "harga", "hargaJual", "supplierId", "barangId", ["createdAt", "waktuBeli"], "statusPembelian"],
        order: [["waktuBeli", "DESC"]],
      });
    } else {
      totalRows = await transPembelianModel.count({
        include: [
          {
            model: barangModel,
          },
          {
            model: supplierModel,
            as: "supplier",
          },
        ],
        where: {
          createdAt: {
            [Op.gte]: startOfDay,
            [Op.lte]: endOfDay,
          },
          ...(IdSupplier ? { supplierId: IdSupplier } : {}), // kosong = semua supplier
          barangId: {
            [Op.not]: null,
          },
        },
      });

      totalPage = Math.ceil(totalRows / limit);
      result = await transPembelianModel.findAll({
        include: [
          {
            model: barangModel,
          },
          {
            model: supplierModel,
            as: "supplier",
          },
        ],
        where: {
          createdAt: {
            [Op.gte]: startOfDay,
            [Op.lte]: endOfDay,
          },
          ...(IdSupplier ? { supplierId: IdSupplier } : {}), // kosong = semua supplier
          barangId: {
            [Op.not]: null,
          },
        },
        attributes: ["id", "jumlah", "faktur", "harga", "hargaJual", "supplierId", "barangId", ["createdAt", "waktuBeli"], "statusPembelian"],
        offset,
        limit,
        order: [["waktuBeli", "DESC"]],
      });
    }

    res.status(200).json({
      page,
      result,
      totalPage,
      totalRows,
      limit,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: "Gagal Mengambil Data: " + error });
  }
};

const getJoinPemBulan = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit);
    const search = req.query.bulan; // Input hanya berupa bulan, misalnya "01"
    const IdSupplier = req.query.supplier;
    const offset = page * limit;

    // Ambil tahun saat ini jika tidak dikirim dari frontend
    const currentYear = parseInt(req.query.tahun) || new Date().getFullYear();

    // Gabungkan tahun saat ini dengan bulan dari frontend untuk membuat format YYYY-MM
    const monthYearFormat = `${currentYear}-${search}`;

    // Konversi ke rentang tanggal awal dan akhir bulan
    const startOfMonth = moment(monthYearFormat, "YYYY-MM").startOf("month").toDate(); // Awal bulan
    const endOfMonth = moment(monthYearFormat, "YYYY-MM").endOf("month").toDate(); // Akhir bulan

    let totalPage = 0;
    let result = [];
    let totalRows = 0;

    if (limit == 0) {
      result = await transPembelianModel.findAll({
        include: [
          {
            model: barangModel,
          },
          {
            model: supplierModel,
            as: "supplier",
          },
        ],
        where: {
          createdAt: {
            [Op.gte]: startOfMonth,
            [Op.lte]: endOfMonth,
          },
          ...(IdSupplier ? { supplierId: IdSupplier } : {}), // kosong = semua supplier
        },
        attributes: ["id", "jumlah", "faktur", "harga", "hargaJual", "supplierId", "barangId", ["createdAt", "waktuBeli"], "statusPembelian"],
        order: [["waktuBeli", "DESC"]],
      });
    } else {
      totalRows = await transPembelianModel.count({
        include: [
          {
            model: barangModel,
          },
          {
            model: supplierModel,
            as: "supplier",
          },
        ],
        where: {
          createdAt: {
            [Op.gte]: startOfMonth,
            [Op.lte]: endOfMonth,
          },
          ...(IdSupplier ? { supplierId: IdSupplier } : {}), // kosong = semua supplier
        },
      });

      totalPage = Math.ceil(totalRows / limit);
      result = await transPembelianModel.findAll({
        include: [
          {
            model: barangModel,
          },
          {
            model: supplierModel,
            as: "supplier",
          },
        ],
        where: {
          createdAt: {
            [Op.gte]: startOfMonth,
            [Op.lte]: endOfMonth,
          },
          ...(IdSupplier ? { supplierId: IdSupplier } : {}), // kosong = semua supplier
        },
        attributes: ["id", "jumlah", "faktur", "harga", "hargaJual", "supplierId", "barangId", ["createdAt", "waktuBeli"], "statusPembelian"],
        offset,
        limit,
        order: [["waktuBeli", "DESC"]],
      });
    }

    res.status(200).json({
      page,
      result,
      totalPage,
      totalRows,
      limit,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: "Gagal Mengambil Data: " + error });
  }
};

const getJoinPenAnBarangRetur = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 10;
    const offset = page * limit;
    const nama_barang = req.query.namaBarang || "";

    let totalPage = 0;
    let result = [];
    let totalRows = 0;

    if (limit == 0) {
      result = await transPembelianModel.findAll({
        include: [
          {
            model: barangModel,
            as: "barang",
            where: {
              nama: {
                [Op.like]: `%${nama_barang}%`,
              },
            },
            include: [
              {
                model: supplierModel,
                as: "supplier",
              },
            ],
          },
        ],
        order: [["createdAt", "DESC"]],
      });
    } else {
      // Hanya transaksi yang sudah checkout & masih ada sisa jumlah yang bisa diretur; cari per nama barang atau faktur
      const where = {
        statusPembelian: { [Op.notIn]: ["onProcess", "Batal"] },
        jumlah: { [Op.gt]: 0 },
        // Retur hanya untuk transaksi tahun berjalan
        createdAt: { [Op.gte]: moment().startOf("year").toDate() },
        [Op.or]: [{ "$barang.nama$": { [Op.like]: `%${nama_barang}%` } }, { faktur: { [Op.like]: `%${nama_barang}%` } }],
      };
      const include = [
        {
          model: barangModel,
          as: "barang",
          required: true,
          include: [{ model: supplierModel, as: "supplier" }],
        },
      ];

      totalRows = await transPembelianModel.count({ where, include });
      totalPage = Math.ceil(totalRows / limit);
      result = await transPembelianModel.findAll({
        where,
        include,
        offset,
        limit,
        order: [["createdAt", "DESC"]],
      });
    }

    res.status(200).json({
      page,
      result,
      totalPage,
      totalRows,
      limit,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: "Gagal Mengambil Data: " + error });
  }
};

const findTransaksi = async (req, res) => {
  let { faktur, barangId } = req.query;

  try {
    let trans = await transPembelianModel.findOne({
      include: [
        {
          model: barangModel,
        },
      ],
      where: {
        [Op.and]: {
          faktur,
          barangId,
        },
      },
    });
    res.status(200).json(trans);
  } catch (error) {
    res.status(400).json({ msg: "Gagal Mengambil Data: " + error });
  }
};

const getPembelianById = async (req, res) => {
  try {
    const pembelian = await transPembelianModel.findOne({
      where: {
        id: req.params.id,
      },
      include: [
        {
          model: barangModel,
          as: "barang",
          include: [
            {
              model: supplierModel,
              as: "supplier",
            },
          ],
        },
      ],
    });
    res.status(200).json(pembelian);
  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: "Gagal Mengambil Data: " + error });
  }
};

const tambahPembelian = async (req, res) => {
  try {
    const { jumlah, faktur, harga, hargaJual, supplierId, barangId, statusPembelian } = req.body;

    /* ================= VALIDASI FIELD WAJIB ================= */
    if (!jumlah || !faktur || !harga || !hargaJual || !supplierId || !barangId) {
      return res.status(400).json({
        msg: "Data tidak lengkap",
      });
    }
    if (!isBilanganBulat(jumlah) || Number(jumlah) <= 0) {
      return res.status(400).json({ msg: "Jumlah harus lebih dari 0" });
    }
    if (!isBilanganBulat(harga) || Number(harga) <= 0 || !isBilanganBulat(hargaJual) || Number(hargaJual) <= 0) {
      return res.status(400).json({ msg: "Harga beli dan harga jual harus lebih dari 0" });
    }
    if (Number(hargaJual) < Number(harga)) {
      return res.status(400).json({ msg: "Harga jual tidak boleh lebih kecil dari harga beli" });
    }
    if (statusPembelian && !STATUS_PEMBELIAN.includes(statusPembelian)) {
      return res.status(400).json({ msg: "statusPembelian tidak valid" });
    }

    /* ================= CEK BARANG ================= */
    const barang = await barangModel.findByPk(barangId, {
      include: [{ model: supplierModel, as: "supplier" }],
    });

    if (!barang) {
      return res.status(404).json({
        msg: "Barang tidak ditemukan",
      });
    }

    /* ================= 1 BARANG = 1 SUPPLIER ================= */
    if (barang.supplierId !== supplierId) {
      return res.status(400).json({
        msg: "Barang ini terdaftar pada supplier lain",
      });
    }

    /* ================= KODE BARANG HARUS INT (BARANG BARU) ================= */
    // Jika kodeBarang angka -> ok
    // Jika kodeBarang lama non-int -> skip
    if (!isNaN(barang.kodeBarang)) {
      if (!Number.isInteger(Number(barang.kodeBarang))) {
        return res.status(400).json({
          msg: "Kode barang tidak valid",
        });
      }
    }

    /* ================= CEK TRANSAKSI DUPLIKAT ================= */
    const transExist = await transPembelianModel.findOne({
      where: {
        faktur,
        barangId,
        statusPembelian: "onProcess",
      },
    });

    /* ================= INSERT / UPDATE ================= */
    if (!transExist) {
      const pembelian = await transPembelianModel.create({
        jumlah,
        faktur,
        harga,
        hargaJual,
        supplierId,
        barangId,
        statusPembelian,
      });

      return res.status(200).json({
        msg: "Data Berhasil diTambahkan!",
        id: pembelian.id,
      });
    }

    // jika transaksi sudah ada → update jumlah
    await transExist.update({
      jumlah: parseInt(transExist.jumlah) + parseInt(jumlah),
    });

    res.status(200).json({
      msg: "Jumlah pembelian berhasil diperbarui",
      id: transExist.id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: "Gagal Menambah Data",
      error: error.message,
    });
  }
};

const editPembelian = async (req, res) => {
  try {
    const { jumlah, faktur, harga, hargaJual, supplierId, barangId, statusPembelian } = req.body;

    // Body boleh parsial (mis. hanya statusPembelian), jadi field hanya dicek jika dikirim
    if (jumlah !== undefined) {
      if (!isBilanganBulat(jumlah) || Number(jumlah) < 0) {
        return res.status(400).json({ msg: "Jumlah tidak valid" });
      }
      // Jumlah 0 hanya boleh untuk retur penuh
      if (Number(jumlah) === 0 && statusPembelian !== "Retur") {
        return res.status(400).json({ msg: "Jumlah harus lebih dari 0" });
      }
    }
    if (harga !== undefined && (!isBilanganBulat(harga) || Number(harga) <= 0)) {
      return res.status(400).json({ msg: "Harga beli harus lebih dari 0" });
    }
    if (hargaJual !== undefined && (!isBilanganBulat(hargaJual) || Number(hargaJual) <= 0)) {
      return res.status(400).json({ msg: "Harga jual harus lebih dari 0" });
    }
    if (statusPembelian !== undefined && !STATUS_PEMBELIAN.includes(statusPembelian)) {
      return res.status(400).json({ msg: "statusPembelian tidak valid" });
    }

    // Pembelian yang sudah disimpan sudah menambah stok: isinya dikunci (koreksi lewat retur/pembatalan).
    // Status keranjang hanya berubah lewat checkout agar stok & log ikut diproses.
    const trans = await transPembelianModel.findByPk(req.params.id);
    if (!trans) {
      return res.status(404).json({ msg: "Transaksi tidak ditemukan" });
    }
    if (trans.statusPembelian !== "onProcess") {
      return res.status(409).json({ msg: "Pembelian yang sudah disimpan tidak bisa diubah. Gunakan retur atau pembatalan faktur." });
    }
    if (statusPembelian !== undefined && statusPembelian !== "onProcess") {
      return res.status(400).json({ msg: "Status keranjang hanya bisa diubah melalui simpan pembelian" });
    }

    if (harga !== undefined && hargaJual !== undefined) {
      if (Number(hargaJual) < Number(harga)) {
        return res.status(400).json({ msg: "Harga jual tidak boleh lebih kecil dari harga beli" });
      }
    } else if (harga !== undefined || hargaJual !== undefined) {
      // Hanya salah satu harga yang dikirim: bandingkan dengan nilai yang tersimpan
      const hargaBeliAkhir = Number(harga ?? trans.harga);
      const hargaJualAkhir = Number(hargaJual ?? trans.hargaJual);
      if (hargaJualAkhir < hargaBeliAkhir) {
        return res.status(400).json({ msg: "Harga jual tidak boleh lebih kecil dari harga beli" });
      }
    }

    await transPembelianModel.update(
      {
        jumlah,
        faktur,
        harga,
        hargaJual,
        supplierId,
        barangId,
        statusPembelian,
      },
      {
        where: {
          id: req.params.id,
        },
      }
    );
    res.status(200).json({ msg: "Data Berhasil diUbah!" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: "Gagal Mengubah Data: " + error });
  }
};

// Simpan (checkout) satu faktur pembelian dalam satu DB transaction:
// tambah stok, simpan log, dan ubah status ke Done. Jika satu item gagal, semua dibatalkan.
const checkoutPembelian = async (req, res) => {
  const { faktur } = req.body;

  if (!faktur) {
    return res.status(400).json({ msg: "faktur wajib diisi" });
  }

  try {
    await db.transaction(async (t) => {
      const items = await transPembelianModel.findAll({
        where: { faktur, statusPembelian: "onProcess" },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (items.length === 0) {
        throw httpError(400, "Tidak ada transaksi onProcess untuk faktur ini");
      }

      for (const item of items) {
        const jumlah = parseInt(item.jumlah);
        if (!jumlah || jumlah <= 0) {
          throw httpError(400, `Jumlah transaksi id ${item.id} tidak valid`);
        }

        const barang = await barangModel.findByPk(item.barangId, {
          transaction: t,
          lock: t.LOCK.UPDATE,
        });
        if (!barang) {
          throw httpError(404, `Barang id ${item.barangId} tidak ditemukan`);
        }

        const stokAwal = parseInt(barang.jumlah) || 0;
        const stokAkhir = stokAwal + jumlah;
        // Harga barang baru berlaku saat pembelian disimpan (bukan saat masih di keranjang)
        const hargaBaru = parseInt(item.harga) > 0 && parseInt(item.hargaJual) > 0 ? { hargaBeli: item.harga, hargaJual: item.hargaJual } : {};
        await barang.update({ jumlah: stokAkhir, ...hargaBaru }, { transaction: t });

        await logPembelianModel.create(
          {
            qty: jumlah,
            qty_awal: stokAwal,
            qty_baru: stokAkhir,
            keterangan: "Pembelian (+)",
            barangId: barang.id,
            faktur,
          },
          { transaction: t },
        );

        await item.update({ statusPembelian: "Done" }, { transaction: t });
      }
    });

    res.status(200).json({ msg: "Pembelian Berhasil Disimpan" });
  } catch (error) {
    console.error(error);
    res.status(error.status || 400).json({ msg: error.status ? error.message : "Gagal Menyimpan Pembelian: " + error });
  }
};

const hapusPembelian = async (req, res) => {
  try {
    // Hanya item keranjang (onProcess) yang boleh dihapus; pembelian Done sudah menambah stok
    const deleted = await transPembelianModel.destroy({
      where: {
        id: req.params.id,
        statusPembelian: "onProcess",
      },
    });
    if (deleted === 0) {
      return res.status(400).json({ msg: "Hanya transaksi di keranjang (onProcess) yang bisa dihapus" });
    }
    res.status(200).json({ msg: "Data Berhasil diHapus!" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: "Gagal Menghapus Data: " + error });
  }
};

// Pembatalan (void) satu faktur pembelian dalam satu DB transaction:
// stok dikurangi kembali, log dicatat, status jadi "Batal", dan alasan disimpan.
// Hanya untuk faktur hari ini dan jika stok barang masih mencukupi.
const batalPembelian = async (req, res) => {
  const { faktur } = req.body;
  const alasan = (req.body.alasan || "").trim();

  if (!faktur) {
    return res.status(400).json({ msg: "faktur wajib diisi" });
  }
  if (alasan.length < 5) {
    return res.status(400).json({ msg: "Alasan pembatalan wajib diisi (minimal 5 karakter)" });
  }

  try {
    await db.transaction(async (t) => {
      const items = await transPembelianModel.findAll({ where: { faktur }, transaction: t, lock: t.LOCK.UPDATE });

      if (items.length === 0) {
        throw httpError(404, "Faktur tidak ditemukan");
      }
      if (items.some((i) => i.statusPembelian === "onProcess")) {
        throw httpError(400, "Pembelian belum disimpan, hapus item dari daftar pembelian saja");
      }
      if (items.every((i) => i.statusPembelian === "Batal")) {
        throw httpError(409, "Faktur ini sudah dibatalkan");
      }
      if (!items.every((i) => moment(i.createdAt).isSame(moment(), "day"))) {
        throw httpError(409, "Hanya faktur hari ini yang bisa dibatalkan. Gunakan retur pembelian untuk transaksi sebelumnya.");
      }

      let jumlahItem = 0;
      let totalNilai = 0;
      for (const item of items) {
        if (item.statusPembelian === "Batal") continue;
        // Jumlah tersisa (setelah retur) yang ditarik kembali dari stok
        const jumlah = parseInt(item.jumlah) || 0;
        if (jumlah > 0) {
          const barang = await barangModel.findByPk(item.barangId, { transaction: t, lock: t.LOCK.UPDATE });
          if (!barang) {
            throw httpError(404, `Barang id ${item.barangId} tidak ditemukan`);
          }
          const stokAwal = parseInt(barang.jumlah) || 0;
          if (stokAwal < jumlah) {
            throw httpError(409, `Stok "${barang.nama}" tinggal ${stokAwal}, tidak cukup untuk membatalkan ${jumlah}. Gunakan retur pembelian sebagian.`);
          }
          const stokAkhir = stokAwal - jumlah;
          await barang.update({ jumlah: stokAkhir }, { transaction: t });
          await logPembelianModel.create(
            { qty: jumlah, qty_awal: stokAwal, qty_baru: stokAkhir, keterangan: "Pembatalan Pembelian (-)", barangId: barang.id, faktur },
            { transaction: t },
          );
        }
        jumlahItem += jumlah;
        totalNilai += (parseInt(item.harga) || 0) * jumlah;
        await item.update({ statusPembelian: "Batal" }, { transaction: t });
      }

      await pembatalanModel.create({ jenis: "pembelian", faktur, alasan, jumlahItem, totalNilai }, { transaction: t });
      await catatJejak(req, { aksi: "batal_pembelian", referensi: faktur, alasan, detail: { jumlahItem, totalNilai } }, t);
    });

    res.status(200).json({ msg: "Faktur pembelian berhasil dibatalkan, stok sudah disesuaikan" });
  } catch (error) {
    console.error(error);
    res.status(error.status || 400).json({ msg: error.status ? error.message : "Gagal Membatalkan Faktur: " + error });
  }
};

module.exports = {
  batalPembelian,
  getPembelian,
  getPembelianId,
  getPembelianById,
  getJoinPemBarang,
  getTransPembelianByFaktur,
  getJoinPemBarangLapor,
  getJoinPemAnBarangSarch,
  getJoinPemBulan,
  getJoinPenAnBarangRetur,
  tambahPembelian,
  editPembelian,
  checkoutPembelian,
  hapusPembelian,
  findTransaksi,
};
