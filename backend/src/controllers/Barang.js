const { Op, Sequelize } = require("sequelize");
const barangModel = require("../model/BarangModel.js");
const supplierModel = require("../model/SupplierModel.js");

const getBarang = async (req, res) => {
  try {
    const barang = await barangModel.findAll({
      order: [["jumlah", "DESC"]],
    });

    const count = await barangModel.count({
      where: {
        [Sequelize.Op.or]: [
          { nama: { [Sequelize.Op.not]: null } },
          { kodeBarang: { [Sequelize.Op.not]: null } },
        ],
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
        supplierId: "1",
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
      const harga_jual_string = result.hargaJual.toString();
      const jumlah_string = result.jumlah.toString();
      const totalString = (
        parseInt(harga_jual_string) * parseInt(jumlah_string)
      ).toString();

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
  const page = parseInt(req.query.page) || 0;
  const limit = parseInt(req.query.limit) || 10;
  const offset = limit * page;

  const totalRows = await barangModel.count({
    where: {
      supplierId: "1",
      jumlah: {
        [Op.gt]: 0,
      },
      nama: {
        [Op.ne]: null,
      },
    },
  });
  const totalPage = Math.ceil(totalRows / limit);

  const results = await barangModel.findAll({
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
      limit: 100,
      attributes: [
        "id",
        "nama",
        "kodeBarang",
        "jenisBarang",
        "satuan",
        "jumlah",
        "hargaBeli",
        "hargaJual",
        "supplierId",
      ],
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
        attributes: [
          "id",
          "nama",
          "kodeBarang",
          "jenisBarang",
          "satuan",
          "jumlah",
          "hargaBeli",
          "hargaJual",
          "supplierId",
        ],
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
        attributes: [
          "id",
          "nama",
          "kodeBarang",
          "jenisBarang",
          "satuan",
          "jumlah",
          "hargaBeli",
          "hargaJual",
          "supplierId",
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
  const { kodeBarang, supplierId } = req.query
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
          supplierId
        }
      }
    })
    res.status(200).json(barang);
  } catch (error) {
    res.status(400).json({ msg: "Gagal Mengambil Data: " + error });
  }
}

const barangTerjual = async (req, res) => {
  const { jumlah } = req.body;
  try {
    await barangModel.increment("jumlah", {
      by: -parseInt(jumlah),
      where: {
        id: req.params.id,
      },
    });
    res.status(200).json({ msg: "Data Berhasil Diubah" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: "Gagal Mengubah Data! " + error });
  }
};

const barangTerbeli = async (req, res) => {
  const { jumlah } = req.body;
  try {
    await barangModel.increment("jumlah", {
      by: parseInt(jumlah),
      where: {
        id: req.params.id,
      },
    });
    res.status(200).json({ msg: "Data Berhasil Diubah" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: "Gagal Mengubah Data! " + error });
  }
};

const tambahBarang = async (req, res) => {
  try {
    const {
      nama,
      kodeBarang,
      jenisBarang,
      satuan,
      jumlah,
      hargaBeli,
      hargaJual,
      supplierId,
    } = req.body;

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

    res
      .status(200)
      .json({ msg: "Data Berhasil Ditambahakan", barangId: barang.id });
  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: "Gagal Menambah Data! " + error });
  }
};

const editBarang = async (req, res) => {
  try {
    const {
      nama,
      kodeBarang,
      jenisBarang,
      satuan,
      jumlah,
      hargaBeli,
      hargaJual,
      supplierId,
    } = req.body;

    await barangModel.update(
      {
        nama,
        kodeBarang,
        jenisBarang,
        satuan,
        jumlah,
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

const hapusBarang = async (req, res) => {
  try {
    await barangModel.destroy({
      where: {
        id: req.params.id,
      },
    });

    res.status(200).json({ msg: "Data Berhasil Dihapus" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: "Gagal Menghapus Data! " + error });
  }
};

module.exports = {
  getBarang,
  getBarangJoin,
  barangTerjual,
  barangTerbeli,
  getSearchBarang,
  getBarangId,
  tambahBarang,
  editBarang,
  hapusBarang,
  lapBarang,
  getLapBarang,
  findBarang,
  getBarangJoinAutoComplate,
};
