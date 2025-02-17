const { Op } = require("sequelize")
const barangModel = require("../model/BarangModel.js")
const supplierModel = require("../model/SupplierModel.js")
const transPembelianModel = require("../model/TransPembelianModel.js")
const moment = require('moment');


const getPembelian = async (req, res) => {
    try {
        const pembelian = await transPembelianModel.findAll({
            order: [
                ['id', 'ASC']
            ]
        })
        res.status(200).json(pembelian)
    } catch (error) {
        console.error(error)
        res.status(400).json({ msg: 'Gagal Mengambil Data: ' + error })
    }
}
const getPembelianId = async (req, res) => {
    try {
        const pembelian = await transPembelianModel.findOne({
            order: [
                ['id', 'ASC']
            ]
        })
        res.status(200).json(pembelian)
    } catch (error) {
        console.error(error)
        res.status(400).json({ msg: 'Gagal Mengambil Data: ' + error })
    }
}

const getJoinPemBarang = async (req, res) => {
    try {
        const pembelian = await transPembelianModel.findAll({
            include: [
                {
                    model: barangModel
                },
                {
                    model: supplierModel,
                    as: 'supplier'
                }
            ],
            attributes: ['id', 'jumlah', 'faktur', 'harga', 'hargaJual', 'supplierId', 'barangId', ['createdAt', 'waktuBeli'], 'statusPembelian']
        })
        res.status(200).json(pembelian)
    } catch (error) {
        console.error(error)
        res.status(400).json({ msg: 'Gagal Mengambil Data: ' + error })
    }
}

const getJoinPemBarangLapor = async (req, res) => {
    try {
        const supplier = req.query.supplier || ''
        const pembelian = await transPembelianModel.findAll({
            include: [
                {
                    model: barangModel
                },
                {
                    model: supplierModel,
                    as: 'supplier'
                }
            ],
            where: {
                [Op.or]: [{
                    '$supplier.nama$': {
                        [Op.like]: '%' + supplier + '%'
                    }
                }
                ]
            },
            attributes: ['id', 'jumlah', 'faktur', 'harga', 'hargaJual', 'supplierId', 'barangId', ['createdAt', 'waktuBeli'], 'statusPembelian']
        })
        res.status(200).json(pembelian)
    } catch (error) {
        console.error(error)
        res.status(400).json({ msg: 'Gagal Mengambil Data: ' + error })
    }
}

const getJoinPemAnBarangSarch = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 0
        const limit = parseInt(req.query.limit)
        const search = req.query.date
        const IdSupplier = req.query.supplier
        const offset = page * limit

        const startOfDay = moment(search).startOf('day').toDate(); // Mulai hari pada tanggal tertentu
        const endOfDay = moment(search).endOf('day').toDate(); // Akhir hari pada tanggal tertentu

        let totalPage = 0;
        let result = [];
        let totalRows = 0;

        if (limit == 0) {
            result = await transPembelianModel.findAll({
                include: [
                    {
                        model: barangModel
                    },
                    {
                        model: supplierModel,
                        as: 'supplier'
                    }
                ],
                where: {
                    createdAt: {
                        [Op.gte]: startOfDay,
                        [Op.lte]: endOfDay
                    },
                    supplierId : IdSupplier
                },
                attributes: ['id', 'jumlah', 'faktur', 'harga', 'hargaJual', 'supplierId', 'barangId', ['createdAt', 'waktuBeli'], 'statusPembelian'],
                order: [
                    ['waktuBeli', 'DESC']
                ]
            })
        } else {
            totalRows = await transPembelianModel.count({
                include: [
                    {
                        model: barangModel,
                    },
                    {
                        model: supplierModel,
                        as: 'supplier'
                    }
                ],
                where: {
                    createdAt: {
                        [Op.gte]: startOfDay,
                        [Op.lte]: endOfDay
                    },
                    supplierId : IdSupplier
                }
            })

            totalPage = Math.ceil(totalRows / limit)
            result = await transPembelianModel.findAll({
                include: [
                    {
                        model: barangModel
                    },
                    {
                        model: supplierModel,
                        as: 'supplier'
                    }
                ],
                where: {
                    createdAt: {
                        [Op.gte]: startOfDay,
                        [Op.lte]: endOfDay
                    },
                    supplierId : IdSupplier
                },
                attributes: ['id', 'jumlah', 'faktur', 'harga', 'hargaJual', 'supplierId', 'barangId', ['createdAt', 'waktuBeli'], 'statusPembelian'],
                offset,
                limit,
                order: [
                    ['waktuBeli', 'DESC']
                ]
            })
        }

        res.status(200).json({
            page,
            result,
            totalPage,
            totalRows,
            limit
        })
    } catch (error) {
        console.error(error)
        res.status(400).json({ msg: 'Gagal Mengambil Data: ' + error })
    }
}

const getJoinPemBulan = async (req, res) => {
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
        const startOfMonth = moment(monthYearFormat, 'YYYY-MM').startOf('month').toDate(); // Awal bulan
        const endOfMonth = moment(monthYearFormat, 'YYYY-MM').endOf('month').toDate(); // Akhir bulan

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
                        as: 'supplier',
                    },
                ],
                where: {
                    createdAt: {
                        [Op.gte]: startOfMonth,
                        [Op.lte]: endOfMonth,
                    },
                    supplierId: IdSupplier,
                },
                attributes: [
                    'id',
                    'jumlah',
                    'faktur',
                    'harga',
                    'hargaJual',
                    'supplierId',
                    'barangId',
                    ['createdAt', 'waktuBeli'],
                    'statusPembelian',
                ],
                order: [['waktuBeli', 'DESC']],
            });
        } else {
            totalRows = await transPembelianModel.count({
                include: [
                    {
                        model: barangModel,
                    },
                    {
                        model: supplierModel,
                        as: 'supplier',
                    },
                ],
                where: {
                    createdAt: {
                        [Op.gte]: startOfMonth,
                        [Op.lte]: endOfMonth,
                    },
                    supplierId: IdSupplier,
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
                        as: 'supplier',
                    },
                ],
                where: {
                    createdAt: {
                        [Op.gte]: startOfMonth,
                        [Op.lte]: endOfMonth,
                    },
                    supplierId: IdSupplier,
                },
                attributes: [
                    'id',
                    'jumlah',
                    'faktur',
                    'harga',
                    'hargaJual',
                    'supplierId',
                    'barangId',
                    ['createdAt', 'waktuBeli'],
                    'statusPembelian',
                ],
                offset,
                limit,
                order: [['waktuBeli', 'DESC']],
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
        res.status(400).json({ msg: 'Gagal Mengambil Data: ' + error });
    }
};
const getJoinPenAnBarangRetur = async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 0
      const limit = parseInt(req.query.limit) || 10
      const offset = page * limit
      const nama_barang = req.query.namaBarang || ""

  
      let totalPage = 0;
      let result = [];
      let totalRows = 0;
  
      if (limit == 0) {
          result = await transPembelianModel.findAll({
              include: [
                  {
                      model: barangModel,
                      where: {
                        nama : {
                            [Op.like] : `%${nama_barang}%`
                        }
                      },
                      include : [{
                        model : supplierModel
                      }]
                  },
              ],
              order: [
                  ['createdAt', 'DESC']
              ]
          })
      } else {
          totalRows = await transPembelianModel.count({
              include: [
                {
                  model: barangModel,
                  where: {
                    nama : {
                        [Op.like] : `%${nama_barang}%`
                    }
                  },
                  include : [{
                    model : supplierModel
                  }]
              },
              ],
          })
  
          totalPage = Math.ceil(totalRows / limit)
          result = await transPembelianModel.findAll({
              include: [
                {
                  model: barangModel,
                  where: {
                    nama : {
                        [Op.like] : `%${nama_barang}%`
                    }
                  },
                  include : [{
                    model : supplierModel
                  }]
              },
              ],
              offset,
              limit,
              order: [
                  ['createdAt', 'DESC']
              ]
          })
      }
  
      res.status(200).json({
          page,
          result,
          totalPage,
          totalRows,
          limit
      })
    } catch (error) {
        console.error(error)
        res.status(400).json({ msg: 'Gagal Mengambil Data: ' + error })
    }
  }

const findTransaksi = async (req, res) => {
    let { faktur, barangId } = req.query;

    console.log("ini Faktur cok:" + faktur)
    console.log("ini barang id cok:" + barangId)

    try {
        let trans = await transPembelianModel.findOne({
            include: [
                {
                    model: barangModel,
                }
            ],
            where: {
                [Op.and]: {
                    faktur, barangId
                }
            }
        })
        res.status(200).json(trans)
    } catch (error) {
        res.status(400).json({ msg: 'Gagal Mengambil Data: ' + error })
    }
}
const getPembelianById = async (req, res) => {
    try {
      const pembelian = await transPembelianModel.findOne({
        where:{
          id: req.params.id
      },
        include: [
          {
            model: barangModel, as : "barang",
            include : [{
              model: supplierModel, as : "supplier"
            }],
          },
        ]
      });
      res.status(200).json(pembelian);
    } catch (error) {
      console.error(error);
      res.status(400).json({ msg: "Gagal Mengambil Data: " + error });
    }
  };

const tambahPembelian = async (req, res) => {
    try {
        const { jumlah, faktur, harga, hargaJual, supplierId, barangId, statusPembelian } = req.body
        const pembelian = await transPembelianModel.create({
            jumlah, faktur, harga, hargaJual, supplierId, barangId, statusPembelian
        })
        res.status(200).json({ msg: 'Data Berhasil diTambahkan!', id: pembelian.id })
    } catch (error) {
        console.error(error)
        res.status(400).json({ msg: 'Gagal Menambah Data: ' + error })
    }
}

const editPembelian = async (req, res) => {
    try {
        const { jumlah, faktur, harga, hargaJual, supplierId, barangId, statusPembelian } = req.body
        await transPembelianModel.update({
            jumlah, faktur, harga, hargaJual, supplierId, barangId, statusPembelian
        }, {
            where: {
                id: req.params.id
            }
        })
        res.status(200).json({ msg: 'Data Berhasil diUbah!' })
    } catch (error) {
        console.error(error)
        res.status(400).json({ msg: 'Gagal Mengubah Data: ' + error })
    }
}

const hapusPembelian = async (req, res) => {
    try {
        await transPembelianModel.destroy({
            where: {
                id: req.params.id
            }
        })
        res.status(200).json({ msg: 'Data Berhasil diHapus!' })
    } catch (error) {
        console.error(error)
        res.status(400).json({ msg: 'Gagal Menghapus Data: ' + error })
    }
}

module.exports = {
    getPembelian,
    getPembelianId,
    getPembelianById,
    getJoinPemBarang,
    getJoinPemBarangLapor,
    getJoinPemAnBarangSarch,
    getJoinPemBulan,
    getJoinPenAnBarangRetur,
    tambahPembelian,
    editPembelian,
    hapusPembelian,
    findTransaksi
}