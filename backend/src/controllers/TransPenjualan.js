const { Op, Sequelize } = require("sequelize");
const anggotaModel = require("../model/AnggotaModel.js");
const barangModel = require("../model/BarangModel.js");
const supplierModel = require("../model/SupplierModel.js");
const transPenjualanModel = require("../model/TransPenjualanModel.js");
const moment = require("moment");

const getPenjualan = async (req, res) => {
  try {
    const penjualan = await transPenjualanModel.findAll({
      include: [
        {
          model: barangModel,
          as: "Barang",
          include: supplierModel,
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
          include: supplierModel,
          as: "supplier",
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

const getJoinPenAnBarangId = async (req, res) => {
  try {
    const penjualan = await transPenjualanModel.findAll({
      include: [
        {
          model: barangModel,
          as: "barang",
          include: {
            model: supplierModel,
            as: "suppplier",
          },
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
      order: [[Sequelize.literal("DATE_TRUNC('week', \"createdAt\")"), "DESC"]],
    });

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
          typePembayaran: pembayaran,
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
          typePembayaran: pembayaran,
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
          typePembayaran: pembayaran,
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
    const currentYear = new Date().getFullYear();

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
              supplierid: IdSupplier,
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
              supplierid: IdSupplier,
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
              supplierid: IdSupplier,
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
              id: { [Op.ne]: "354" }, // Nama anggota bukan "customer"
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
              id: { [Op.ne]: "354" }, // Nama anggota bukan "customer"
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
              id: { [Op.ne]: "354" }, // Nama anggota bukan "customer"
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
              id: "354",
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
              id: "354",
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
              id: "354",
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
      totalRows = await transPenjualanModel.count({
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
      });

      totalPage = Math.ceil(totalRows / limit);
      result = await transPenjualanModel.findAll({
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
    let total = 0;
    for (let val of transaksi) {
      if (val.faktur == faktur) {
        let temp = parseInt(val.barang.hargaJual) * parseInt(val.jumlah);
        total = total + temp;
      }
    }

    res.status(200).json({ total });
  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: "Gagal Mengambil Data: " + error });
  }
};

const tambahPenjualan = async (req, res) => {
  try {
    const { jumlah, faktur, harga, typePembayaran, anggotaId, barangId, statusPenjualan } = req.body;
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

const hapusPenjualan = async (req, res) => {
  try {
    await transPenjualanModel.destroy({
      where: {
        id: req.params.id,
      },
    });
    res.status(200).json({ msg: "Data Berhasil diHapus!" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: "Gagal Menghapus Data: " + error });
  }
};

module.exports = {
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
  hapusPenjualan,
};
