const { Op, Sequelize } = require("sequelize");
const LogPenjualan = require("../model/LogPenjualanModel.js");
const barang = require("../model/BarangModel.js");

const create = async (req, res) => {
  try {
    const { qty, qty_awal, qty_baru, keterangan, barangId, faktur } = req.body;

    if (!Number.isInteger(parseInt(qty)) || parseInt(qty) <= 0 || !barangId) {
      return res.status(400).json({ msg: "qty harus lebih dari 0 dan barangId wajib diisi" });
    }

    await LogPenjualan.create({
      qty,
      qty_awal,
      qty_baru,
      keterangan,
      barangId,
      faktur,
    });

    res.status(200).json({ msg: "Data Berhasil Ditambahakan" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: "Gagal Menambah Data! " + error });
  }
};

const getLog = async (req, res) => {
  try {
    const logPenjualan = await LogPenjualan.findAll({});
    res.status(200).json(logPenjualan);
  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: "Gagal Mengambil Data: " + error });
  }
};

const search = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const offset = limit * page;
    const totalRows = await LogPenjualan.count({
      include: [
        {
          model: barang,
          as: "barang",
        },
      ],
      where: {
        [Op.or]: [
          {
            "$barang.nama$": {
              [Op.like]: "%" + search + "%",
            },
          },
        ],
      },
    });
    const totalPage = Math.ceil(totalRows / limit);
    const result = await LogPenjualan.findAll({
      include: [
        {
          model: barang,
          as: "barang",
        },
      ],
      where: {
        [Op.or]: [
          {
            "$barang.nama$": {
              [Op.like]: "%" + search + "%",
            },
          },
        ],
      },
      offset,
      limit,
      order: [["createdAt", "DESC"]],
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

const destroy = async (req, res) => {
  try {
    await LogPenjualan.destroy({
      where: {
        barangId: req.params.barangId,
        faktur: req.params.faktur,
      },
    });
    res.status(200).json({ msg: "Data Berhasil diHapus" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: "Gagal Menghapus Data: " + error });
  }
};

module.exports = {
  create,
  getLog,
  search,
  destroy,
};
