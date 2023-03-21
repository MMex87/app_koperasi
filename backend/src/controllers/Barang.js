const { Op } = require('sequelize');
const barangModel = require('../model/BarangModel.js');
const supplierModel = require('../model/SupplierModel.js');


const getBarang = async (req, res) => {
    try {
        const barang = await barangModel.findAll({
            order: [
                ['id', 'DESC']
            ]
        })
        res.status(200).json(barang)
    } catch (error) {
        console.error(error);
        res.status(400).json({ msg: "Gagal Mengambil Data! " + error })
    }
}
const getBarangId = async (req, res) => {
    try {
        const barang = await barangModel.findOne({
            order: [
                ['id', 'DESC']
            ],
            where: {
                id: req.params.id
            }
        })
        res.status(200).json(barang)
    } catch (error) {
        console.error(error);
        res.status(400).json({ msg: "Gagal Mengambil Data! " + error })
    }
}

const getSearchBarang = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 0
        const limit = parseInt(req.query.limit) || 10
        const search = req.query.search || ''
        const offset = limit * page
        const totalRows = await barangModel.count({
            include: [
                {
                    model: supplierModel
                }
            ],
            where: {
                [Op.or]: [{
                    nama: {
                        [Op.like]: '%' + search + '%'
                    },
                }, {
                    kodeBarang: {
                        [Op.like]: '%' + search + '%'
                    },
                }, {
                    jenisBarang: {
                        [Op.like]: '%' + search + '%'
                    }
                }, {
                    '$supplier.nama$': {
                        [Op.like]: '%' + search + '%'
                    }
                }]
            }
        })
        const totalPage = Math.ceil(totalRows / limit)
        const result = await barangModel.findAll({
            include: [
                {
                    model: supplierModel
                }
            ],
            where: {
                [Op.or]: [{
                    nama: {
                        [Op.like]: '%' + search + '%'
                    },
                }, {
                    kodeBarang: {
                        [Op.like]: '%' + search + '%'
                    },
                }, {
                    jenisBarang: {
                        [Op.like]: '%' + search + '%'
                    }
                }, {
                    '$supplier.nama$': {
                        [Op.like]: '%' + search + '%'
                    }
                }]
            },
            offset,
            limit,
            order: [
                ['id', 'DESC']
            ]
        })
        res.status(200).json({
            page,
            result,
            totalPage,
            totalRows,
            limit
        })
        // console.log(result)
    } catch (error) {
        console.error(error);
        res.status(400).json({ msg: "Gagal Mengambil Data! " + error })
    }
}

const getBarangJoin = async (req, res) => {
    try {
        const barang = await barangModel.findAll({
            include: [
                {
                    model: supplierModel,
                    as: 'supplier'
                }
            ],
            order: [
                ['id', 'DESC']
            ]
            ,
            attributes: ['id', 'nama', 'kodeBarang', 'jenisBarang', 'satuan', 'jumlah', 'hargaBeli', 'hargaJual', 'supplierId']
        })
        res.status(200).json(barang)
    } catch (error) {
        console.error(error)
        res.status(400).json({ msg: 'Gagal Mengambil Data: ' + error })
    }
}

const barangTerjual = async (req, res) => {
    const { jumlah } = req.body
    try {
        await barangModel.increment('jumlah', {
            by: -parseInt(jumlah),
            where: {
                id: req.params.id
            }
        })
        res.status(200).json({ msg: 'Data Berhasil Diubah' })
    } catch (error) {
        console.error(error);
        res.status(400).json({ msg: "Gagal Mengubah Data! " + error })
    }
}

const barangTerbeli = async (req, res) => {
    const { jumlah } = req.body
    try {
        await barangModel.increment('jumlah', {
            by: parseInt(jumlah),
            where: {
                id: req.params.id
            }
        })
        res.status(200).json({ msg: 'Data Berhasil Diubah' })
    } catch (error) {
        console.error(error);
        res.status(400).json({ msg: "Gagal Mengubah Data! " + error })
    }
}

const tambahBarang = async (req, res) => {
    try {
        const { nama, kodeBarang, jenisBarang, satuan, jumlah, hargaBeli, hargaJual, supplierId } = req.body

        const barang = await barangModel.create({
            nama, kodeBarang, jenisBarang, satuan, jumlah, hargaBeli, hargaJual, supplierId
        })

        res.status(200).json({ msg: 'Data Berhasil Ditambahakan', barangId: barang.id })
    } catch (error) {
        console.error(error);
        res.status(400).json({ msg: "Gagal Menambah Data! " + error })
    }
}

const editBarang = async (req, res) => {
    try {
        const { nama, kodeBarang, jenisBarang, satuan, jumlah, hargaBeli, hargaJual, supplierId } = req.body

        await barangModel.update({
            nama, kodeBarang, jenisBarang, satuan, jumlah, hargaBeli, hargaJual, supplierId
        }, {
            where: {
                id: req.params.id
            }
        })

        res.status(200).json({ msg: 'Data Berhasil Diubah' })
    } catch (error) {
        console.error(error);
        res.status(400).json({ msg: "Gagal Mengedit Data! " + error })
    }
}

const hapusBarang = async (req, res) => {
    try {

        await barangModel.destroy({
            where: {
                id: req.params.id
            }
        })

        res.status(200).json({ msg: 'Data Berhasil Dihapus' })
    } catch (error) {
        console.error(error);
        res.status(400).json({ msg: "Gagal Menghapus Data! " + error })
    }
}

module.exports = {
    getBarang,
    getBarangJoin,
    barangTerjual,
    barangTerbeli,
    getSearchBarang,
    getBarangId,
    tambahBarang,
    editBarang,
    hapusBarang
}