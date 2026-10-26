const { Op, Sequelize } = require("sequelize");
const LogPembelian = require("../model/LogPembelianModel.js");
const barang = require("../model/BarangModel.js");
const transPenjualan = require("../model/TransPenjualanModel.js");

const create = async (req, res) => {
  try {
    const { qty, qty_awal, qty_baru, keterangan, barangId, pembelianId, faktur } = req.body;

    if (!Number.isInteger(parseInt(qty)) || parseInt(qty) <= 0 || !barangId) {
      return res.status(400).json({ msg: "qty harus lebih dari 0 dan barangId wajib diisi" });
    }

    await LogPembelian.create({
      qty,
      qty_awal,
      qty_baru,
      keterangan,
      barangId,
      pembelianId,
      faktur,
    });

    res.status(200).json({ msg: "Data Berhasil Ditambahakan" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: "Gagal Menambah Data! " + error });
  }
};

const search = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const offset = limit * page;
    const totalRows = await LogPembelian.count({
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
    const result = await LogPembelian.findAll({
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

module.exports = {
  create,
  search,
};
