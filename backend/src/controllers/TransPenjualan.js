const { Op, Sequelize } = require("sequelize");
const anggotaModel = require("../model/AnggotaModel.js");
const barangModel = require("../model/BarangModel.js");
const supplierModel = require("../model/SupplierModel.js");
const transPenjualanModel = require("../model/TransPenjualanModel.js");
const logPenjualanModel = require("../model/LogPenjualanModel.js");
const pembatalanModel = require("../model/PembatalanModel.js");
const { aktifkanJikaDiarsip } = require("../model/BarangArsipModel.js");
const { catatJejak } = require("../middleware/adminPin.js");
const db = require("../config/database.js");
const { idAnggotaCustomer } = require("../config/config.js");
const moment = require("moment");

const getPenjualan = async (req, res) => {
  try {
    const penjualan = await transPenjualanModel.findAll({
      include: [
        {
          model: barangModel,
          as: "barang",
          include: { model: supplierModel, as: "supplier" },
        },
        {
          model: anggotaModel,
          as: "anggota",
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

const getOnProcessByBarang = async (req, res) => {
  try {
    const { barangId, faktur } = req.query;

    if (!barangId || !faktur) {
      return res.status(400).json({ msg: "barangId dan faktur wajib" });
    }

    const trans = await transPenjualanModel.findOne({
      where: {
        barangId,
        faktur,
        statusPenjualan: "onProcess",
      },
    });

    // 🔥 hanya lookup, tidak pakai include
    res.status(200).json(trans); // null jika belum ada
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

const getTransPenjualan = async (req, res) => {
  try {
    const penjualan = await transPenjualanModel.findAll({
      where: {
        statusPenjualan: "onProcess",
      },
      attributes: ["id", "jumlah", "faktur", "harga", "typePembayaran", "anggotaId", "barangId", ["createdAt", "waktuJual"], "statusPenjualan"],
      order: [["id", "DESC"]],
    });
    res.status(200).json(penjualan);
  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: "Gagal Mengambil Data: " + error });
  }
};

const getTransPenjualanByFaktur = async (req, res) => {
  try {
    const penjualan = await transPenjualanModel.findAll({
      where: {
        faktur: req.params.faktur,
      },
      include: [
        { model: anggotaModel, as: "anggota" },
        { model: barangModel, as: "barang" },
      ],
      attributes: ["id", "jumlah", "faktur", "harga", "typePembayaran", "anggotaId", "barangId", ["createdAt", "waktuJual"]],
      order: [["id", "DESC"]],
    });
    res.status(200).json(penjualan);
  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: "Gagal Mengambil Data: " + error });
  }
};

const getPenjualanById = async (req, res) => {
  try {
    const penjualan = await transPenjualanModel.findOne({
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
        {
          model: anggotaModel,
          as: "anggota",
        },
      ],
    });
    res.status(200).json(penjualan);
  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: "Gagal Mengambil Data: " + error });
  }
};

const getJoinPenAnBarang = async (req, res) => {
  try {
    const penjualan = await transPenjualanModel.findAll({
      where: {
        statusPenjualan: "onProcess",
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
        {
          model: anggotaModel,
          as: "anggota",
        },
      ],
      attributes: ["id", "jumlah", "faktur", "harga", "typePembayaran", "anggotaId", "barangId", ["createdAt", "waktuJual"], "statusPenjualan"],
    });
    res.status(200).json(penjualan);
  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: "Gagal Mengambil Data: " + error });
  }
};

const getJoinPenAnBarangLapor = async (req, res) => {
  try {
    const supplier = req.query.supplier || "";
    const limit = parseInt(req.query.limit) || 2000; // Batasan jumlah data per halaman

    const penjualan = await transPenjualanModel.findAll({
      include: [
        {
          model: barangModel,
          as: "barang",
          include: { model: supplierModel, as: "supplier" },
        },
        {
          model: anggotaModel,
          as: "anggota",
        },
      ],
      where: {
        [Op.or]: [
          {
            "$barang.supplier.nama$": {
              [Op.like]: "%" + supplier + "%",
            },
          },
        ],
      },
      attributes: ["id", "jumlah", "faktur", "harga", "typePembayaran", "anggotaId", "barangId", ["createdAt", "waktuJual"], "statusPenjualan"],
      limit: limit,
      order: [["id", "DESC"]],
    });

    res.status(200).json(penjualan);
  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: "Gagal Mengambil Data: " + error });
  }
};

// GET /transPenjualan/:id -> satu transaksi beserta barang, supplier, dan anggota
const getJoinPenAnBarangId = async (req, res) => {
  try {
    const penjualan = await transPenjualanModel.findOne({
      include: [
        {
          model: barangModel,
          as: "barang",
          include: {
            model: supplierModel,
            as: "supplier",
          },
        },
        {
          model: anggotaModel,
          as: "anggota",
        },
      ],
      where: {
        id: req.params.id,
      },
      attributes: ["id", "jumlah", "faktur", "harga", "typePembayaran", "anggotaId", "barangId", ["createdAt", "waktuJual"], "statusPenjualan"],
    });

    if (!penjualan) {
      return res.status(404).json({ msg: "Transaksi tidak ditemukan" });
    }
    res.status(200).json(penjualan);
  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: "Gagal Mengambil Data: " + error });
  }
};

const getJoinPenAnBarangSarch = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit);
    const search = req.query.date;
    const IdSupplier = req.query.supplier;
    const pembayaran = req.query.pembayaran;
    const offset = page * limit;

    const startOfDay = moment(search).startOf("day").toDate();
    const endOfDay = moment(search).endOf("day").toDate();

    let totalPage = 0;
    let result = [];
    let totalRows = 0;

    let barangWhere = {};
    if (IdSupplier) {
      barangWhere.supplierId = IdSupplier;
    }

    if (limit == 0) {
      result = await transPenjualanModel.findAll({
        include: [
          {
            model: barangModel,
            as: "barang",
            where: barangWhere,
            include: [
              {
                model: supplierModel,
                as: "supplier",
              },
            ],
          },
          {
            model: anggotaModel,
            as: "anggota",
          },
        ],
        where: {
          createdAt: {
            [Op.gte]: startOfDay,
            [Op.lte]: endOfDay,
          },
          ...(pembayaran ? { typePembayaran: pembayaran } : {}), // kosong = semua jenis pembayaran
        },
        order: [["id", "DESC"]],
      });
    } else {
      totalRows = await transPenjualanModel.count({
        include: [
          {
            model: barangModel,
            as: "barang",
            where: barangWhere,
            include: [
              {
                model: supplierModel,
                as: "supplier",
              },
            ],
          },
          {
            model: anggotaModel,
            as: "anggota",
          },
        ],
        where: {
          createdAt: {
            [Op.gte]: startOfDay,
            [Op.lte]: endOfDay,
          },
          ...(pembayaran ? { typePembayaran: pembayaran } : {}), // kosong = semua jenis pembayaran
        },
      });

      totalPage = Math.ceil(totalRows / limit);
      result = await transPenjualanModel.findAll({
        include: [
          {
            model: barangModel,
            as: "barang",
            where: barangWhere,
            include: [
              {
                model: supplierModel,
                as: "supplier",
              },
            ],
          },
          {
            model: anggotaModel,
            as: "anggota",
          },
        ],
        where: {
          createdAt: {
            [Op.gte]: startOfDay,
            [Op.lte]: endOfDay,
          },
          ...(pembayaran ? { typePembayaran: pembayaran } : {}), // kosong = semua jenis pembayaran
        },
        offset,
        limit,
        order: [["id", "DESC"]],
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

const getJoinPenjualannBulanan = async (req, res) => {
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
      result = await transPenjualanModel.findAll({
        include: [
          {
            model: barangModel,
            as: "barang",
            where: {
              ...(IdSupplier ? { supplierId: IdSupplier } : {}), // kosong = semua supplier
            },
            include: [
              {
                model: supplierModel,
                as: "supplier",
              },
            ],
          },
          {
            model: anggotaModel,
            as: "anggota",
          },
        ],
        where: {
          createdAt: {
            [Op.gte]: startOfMonth,
            [Op.lte]: endOfMonth,
          },
        },
        order: [["createdAt", "DESC"]],
      });
    } else {
      totalRows = await transPenjualanModel.count({
        include: [
          {
            model: barangModel,
            as: "barang",
            where: {
              ...(IdSupplier ? { supplierId: IdSupplier } : {}), // kosong = semua supplier
            },
            include: [
              {
                model: supplierModel,
                as: "supplier",
              },
            ],
          },
          {
            model: anggotaModel,
            as: "anggota",
          },
        ],
        where: {
          createdAt: {
            [Op.gte]: startOfMonth,
            [Op.lte]: endOfMonth,
          },
        },
      });

      totalPage = Math.ceil(totalRows / limit);
      result = await transPenjualanModel.findAll({
        include: [
          {
            model: barangModel,
            as: "barang",
            where: {
              ...(IdSupplier ? { supplierId: IdSupplier } : {}), // kosong = semua supplier
            },
            include: [
              {
                model: supplierModel,
                as: "supplier",
              },
            ],
          },
          {
            model: anggotaModel,
            as: "anggota",
          },
        ],
        where: {
          createdAt: {
            [Op.gte]: startOfMonth,
            [Op.lte]: endOfMonth,
          },
        },
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

const getJoinPembelianAnggota = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit);
    const search = req.query.date; // Input hanya berupa bulan, misalnya "01"
    const offset = page * limit;

    const startOfDay = moment(search).startOf("day").toDate(); // Mulai hari pada tanggal tertentu
    const endOfDay = moment(search).endOf("day").toDate(); // Akhir hari pada tanggal tertentu

    let totalPage = 0;
    let result = [];
    let totalRows = 0;

    if (limit == 0) {
      result = await transPenjualanModel.findAll({
        include: [
          {
            model: barangModel,
            as: "barang",
            include: {
              model: supplierModel,
              as: "supplier",
            },
          },
          {
            model: anggotaModel,
            as: "anggota",
            where: {
              id: { [Op.ne]: idAnggotaCustomer }, // Nama anggota bukan "customer"
            },
          },
        ],
        where: {
          createdAt: {
            [Op.gte]: startOfDay,
            [Op.lte]: endOfDay,
          },
          barangId: {
            [Op.not]: null,
          },
        },
        order: [["createdAt", "DESC"]],
      });
    } else {
      totalRows = await transPenjualanModel.count({
        include: [
          {
            model: barangModel,
            as: "barang",
            include: {
              model: supplierModel,
              as: "supplier",
            },
          },
          {
            model: anggotaModel,
            as: "anggota",
            where: {
              id: { [Op.ne]: idAnggotaCustomer }, // Nama anggota bukan "customer"
            },
          },
        ],
        where: {
          createdAt: {
            [Op.gte]: startOfDay,
            [Op.lte]: endOfDay,
          },
          barangId: {
            [Op.not]: null,
          },
        },
      });

      totalPage = Math.ceil(totalRows / limit);
      result = await transPenjualanModel.findAll({
        include: [
          {
            model: barangModel,
            as: "barang",
            include: {
              model: supplierModel,
              as: "supplier",
            },
          },
          {
            model: anggotaModel,
            as: "anggota",
            where: {
              id: { [Op.ne]: idAnggotaCustomer }, // Nama anggota bukan "customer"
            },
          },
        ],
        where: {
          createdAt: {
            [Op.gte]: startOfDay,
            [Op.lte]: endOfDay,
          },
          barangId: {
            [Op.not]: null,
          },
        },
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
const getJoinPembelianCustomer = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit);
    const search = req.query.date; // Input hanya berupa bulan, misalnya "01"
    const offset = page * limit;

    const startOfDay = moment(search).startOf("day").toDate(); // Mulai hari pada tanggal tertentu
    const endOfDay = moment(search).endOf("day").toDate(); // Akhir hari pada tanggal tertentu

    let totalPage = 0;
    let result = [];
    let totalRows = 0;

    if (limit == 0) {
      result = await transPenjualanModel.findAll({
        include: [
          {
            model: barangModel,
            as: "barang",
            include: {
              model: supplierModel,
              as: "supplier",
            },
          },
          {
            model: anggotaModel,
            as: "anggota",
            where: {
              id: idAnggotaCustomer,
            },
          },
        ],
        where: {
          createdAt: {
            [Op.gte]: startOfDay,
            [Op.lte]: endOfDay,
          },
          barangId: {
            [Op.not]: null,
          },
        },
        order: [["createdAt", "DESC"]],
      });
    } else {
      totalRows = await transPenjualanModel.count({
        include: [
          {
            model: barangModel,
            as: "barang",
            include: {
              model: supplierModel,
              as: "supplier",
            },
          },
          {
            model: anggotaModel,
            as: "anggota",
            where: {
              id: idAnggotaCustomer,
            },
          },
        ],
        where: {
          createdAt: {
            [Op.gte]: startOfDay,
            [Op.lte]: endOfDay,
          },
          barangId: {
            [Op.not]: null,
          },
        },
      });

      totalPage = Math.ceil(totalRows / limit);
      result = await transPenjualanModel.findAll({
        include: [
          {
            model: barangModel,
            as: "barang",
            include: {
              model: supplierModel,
              as: "supplier",
            },
          },
          {
            model: anggotaModel,
            as: "anggota",
            where: {
              id: idAnggotaCustomer,
            },
          },
        ],
        where: {
          createdAt: {
            [Op.gte]: startOfDay,
            [Op.lte]: endOfDay,
          },
          barangId: {
            [Op.not]: null,
          },
        },
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
      result = await transPenjualanModel.findAll({
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
        order: [["createdAt", "DESC"]],
      });
    } else {
      // Hanya transaksi yang sudah checkout & masih ada sisa jumlah yang bisa diretur; cari per nama barang atau faktur
      const where = {
        statusPenjualan: { [Op.notIn]: ["onProcess", "Batal"] },
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
        { model: anggotaModel, as: "anggota", attributes: ["id", "nama"] },
      ];

      totalRows = await transPenjualanModel.count({ where, include });
      totalPage = Math.ceil(totalRows / limit);
      result = await transPenjualanModel.findAll({
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

const getTotalHarga = async (req, res) => {
  try {
    const faktur = req.params.faktur;
    const transaksi = await transPenjualanModel.findAll({
      include: [
        {
          model: barangModel,
          as: "barang",
        },
      ],
      where: { faktur },
    });
    // Pakai harga (total baris) yang tersimpan, sama dengan yang divalidasi saat checkout
    let total = 0;
    for (let val of transaksi) {
      if (val.faktur == faktur) {
        total = total + (parseInt(val.harga) || 0);
      }
    }

    res.status(200).json({ total });
  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: "Gagal Mengambil Data: " + error });
  }
};

const STATUS_PENJUALAN = ["onProcess", "Selesai", "Bon", "Lunas", "Retur"];

const isBilanganBulat = (v) => v !== null && v !== "" && Number.isInteger(Number(v));

const httpError = (status, msg) => Object.assign(new Error(msg), { status });

const tambahPenjualan = async (req, res) => {
  try {
    const { jumlah, faktur, harga, typePembayaran, anggotaId, barangId, statusPenjualan } = req.body;

    if (!faktur || !barangId || !anggotaId || !typePembayaran) {
      return res.status(400).json({ msg: "faktur, barangId, anggotaId, dan typePembayaran wajib diisi" });
    }
    if (!isBilanganBulat(jumlah) || Number(jumlah) <= 0) {
      return res.status(400).json({ msg: "Jumlah harus lebih dari 0" });
    }
    if (!isBilanganBulat(harga) || Number(harga) <= 0) {
      return res.status(400).json({ msg: "Harga harus lebih dari 0" });
    }
    if (statusPenjualan && !STATUS_PENJUALAN.includes(statusPenjualan)) {
      return res.status(400).json({ msg: "statusPenjualan tidak valid" });
    }

    await transPenjualanModel.create({
      jumlah,
      faktur,
      harga,
      typePembayaran,
      anggotaId,
      barangId,
      statusPenjualan,
    });
    res.status(200).json({ msg: "Data Berhasil diTambahkan!" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: "Gagal Menambah Data: " + error });
  }
};

const editPenjualan = async (req, res) => {
  try {
    const { jumlah, faktur, harga, typePembayaran, anggotaId, barangId, statusPenjualan } = req.body;

    // Body boleh parsial (mis. hanya statusPenjualan), jadi field hanya dicek jika dikirim
    if (jumlah !== undefined) {
      if (!isBilanganBulat(jumlah) || Number(jumlah) < 0) {
        return res.status(400).json({ msg: "Jumlah tidak valid" });
      }
      // Jumlah 0 hanya boleh untuk retur penuh
      if (Number(jumlah) === 0 && statusPenjualan !== "Retur") {
        return res.status(400).json({ msg: "Jumlah harus lebih dari 0" });
      }
    }
    if (harga !== undefined && (!isBilanganBulat(harga) || Number(harga) <= 0)) {
      return res.status(400).json({ msg: "Harga harus lebih dari 0" });
    }
    if (statusPenjualan !== undefined && !STATUS_PENJUALAN.includes(statusPenjualan)) {
      return res.status(400).json({ msg: "statusPenjualan tidak valid" });
    }

    const trans = await transPenjualanModel.findByPk(req.params.id);
    if (!trans) {
      return res.status(404).json({ msg: "Transaksi tidak ditemukan" });
    }

    if (trans.statusPenjualan === "onProcess") {
      // Status hanya berubah lewat checkout agar stok & log ikut diproses
      if (statusPenjualan !== undefined && statusPenjualan !== "onProcess") {
        return res.status(400).json({ msg: "Status keranjang hanya bisa diubah melalui checkout" });
      }
    } else {
      // Transaksi selesai sudah mengurangi stok: isinya dikunci. Satu-satunya perubahan yang
      // diizinkan adalah pelunasan bon (Bon -> Lunas). Koreksi lain lewat retur/pembatalan faktur.
      const hanyaLunasi =
        trans.statusPenjualan === "Bon" &&
        statusPenjualan === "Lunas" &&
        [jumlah, faktur, harga, typePembayaran, anggotaId, barangId].every((v) => v === undefined);
      if (!hanyaLunasi) {
        return res.status(409).json({ msg: "Transaksi yang sudah selesai tidak bisa diubah. Gunakan retur atau pembatalan faktur." });
      }
    }

    await transPenjualanModel.update(
      {
        jumlah,
        faktur,
        harga,
        typePembayaran,
        anggotaId,
        barangId,
        statusPenjualan,
      },
      {
        where: {
          id: req.params.id,
        },
      },
    );
    res.status(200).json({ msg: "Data Berhasil diUbah!" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: "Gagal Mengubah Data: " + error });
  }
};

// Checkout satu faktur dalam satu DB transaction:
// kurangi stok, simpan log, dan ubah status. Jika satu item gagal, semua dibatalkan.
const checkoutPenjualan = async (req, res) => {
  const { faktur, typePembayaran } = req.body;

  if (!faktur) {
    return res.status(400).json({ msg: "faktur wajib diisi" });
  }

  try {
    const statusAkhir = typePembayaran === "Bon" ? "Bon" : "Selesai";

    await db.transaction(async (t) => {
      const items = await transPenjualanModel.findAll({
        where: { faktur, statusPenjualan: "onProcess" },
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

        const stokAwal = parseInt(barang.jumlah);
        if (stokAwal < jumlah) {
          throw httpError(409, `Stok "${barang.nama}" tidak cukup: sisa ${stokAwal}, diminta ${jumlah}`);
        }

        const stokAkhir = stokAwal - jumlah;
        await barang.update({ jumlah: stokAkhir }, { transaction: t });

        await logPenjualanModel.create(
          {
            qty: jumlah,
            qty_awal: stokAwal,
            qty_baru: stokAkhir,
            keterangan: "Penjualan (-)",
            barangId: barang.id,
            faktur,
          },
          { transaction: t },
        );

        // Jenis pembayaran disamakan dengan yang dipilih saat bayar (bisa berubah setelah item masuk keranjang)
        await item.update({ statusPenjualan: statusAkhir, ...(typePembayaran ? { typePembayaran } : {}) }, { transaction: t });
      }
    });

    res.status(200).json({ msg: "Checkout Berhasil" });
  } catch (error) {
    console.error(error);
    res.status(error.status || 400).json({ msg: error.status ? error.message : "Gagal Checkout: " + error });
  }
};

const hapusPenjualan = async (req, res) => {
  try {
    // Hanya item keranjang (onProcess) yang boleh dihapus; transaksi selesai sudah mengurangi stok
    const deleted = await transPenjualanModel.destroy({
      where: {
        id: req.params.id,
        statusPenjualan: "onProcess",
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

// Pembatalan (void) satu faktur penjualan dalam satu DB transaction:
// stok dikembalikan, log dicatat, status jadi "Batal", dan alasan disimpan.
// Hanya untuk faktur hari ini; koreksi transaksi lama tetap lewat retur.
const batalPenjualan = async (req, res) => {
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
      const items = await transPenjualanModel.findAll({ where: { faktur }, transaction: t, lock: t.LOCK.UPDATE });

      if (items.length === 0) {
        throw httpError(404, "Faktur tidak ditemukan");
      }
      if (items.some((i) => i.statusPenjualan === "onProcess")) {
        throw httpError(400, "Faktur masih di keranjang, hapus item dari keranjang saja");
      }
      if (items.every((i) => i.statusPenjualan === "Batal")) {
        throw httpError(409, "Faktur ini sudah dibatalkan");
      }
      if (!items.every((i) => moment(i.createdAt).isSame(moment(), "day"))) {
        throw httpError(409, "Hanya faktur hari ini yang bisa dibatalkan. Gunakan retur untuk transaksi sebelumnya.");
      }

      let jumlahItem = 0;
      let totalNilai = 0;
      for (const item of items) {
        if (item.statusPenjualan === "Batal") continue;
        // Jumlah tersisa (setelah retur) yang dikembalikan ke stok
        const jumlah = parseInt(item.jumlah) || 0;
        if (jumlah > 0) {
          const barang = await barangModel.findByPk(item.barangId, { transaction: t, lock: t.LOCK.UPDATE });
          if (!barang) {
            throw httpError(404, `Barang id ${item.barangId} tidak ditemukan`);
          }
          const stokAwal = parseInt(barang.jumlah) || 0;
          const stokAkhir = stokAwal + jumlah;
          await barang.update({ jumlah: stokAkhir }, { transaction: t });
          await aktifkanJikaDiarsip(barang.id, t);
          await logPenjualanModel.create(
            { qty: jumlah, qty_awal: stokAwal, qty_baru: stokAkhir, keterangan: "Pembatalan Penjualan (+)", barangId: barang.id, faktur },
            { transaction: t },
          );
        }
        jumlahItem += jumlah;
        totalNilai += parseInt(item.harga) || 0;
        await item.update({ statusPenjualan: "Batal" }, { transaction: t });
      }

      await pembatalanModel.create({ jenis: "penjualan", faktur, alasan, jumlahItem, totalNilai }, { transaction: t });
      await catatJejak(req, { aksi: "batal_penjualan", referensi: faktur, alasan, detail: { jumlahItem, totalNilai } }, t);
    });

    res.status(200).json({ msg: "Faktur berhasil dibatalkan, stok sudah dikembalikan" });
  } catch (error) {
    console.error(error);
    res.status(error.status || 400).json({ msg: error.status ? error.message : "Gagal Membatalkan Faktur: " + error });
  }
};

module.exports = {
  batalPenjualan,
  getPenjualan,
  getPenjualanById,
  getJoinPenAnBarang,
  getJoinPenAnBarangId,
  getOnProcessByBarang,
  getTransPenjualanByFaktur,
  getJoinPenAnBarangLapor,
  getJoinPenjualannBulanan,
  getJoinPembelianAnggota,
  getJoinPembelianCustomer,
  getJoinPenAnBarangSarch,
  getJoinPenAnBarangRetur,
  getTotalHarga,
  getTransPenjualan,
  tambahPenjualan,
  editPenjualan,
  checkoutPenjualan,
  hapusPenjualan,
};
