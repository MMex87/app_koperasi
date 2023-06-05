const { Op } = require("sequelize")
const barangModel = require("../model/BarangModel.js")
const returnPembelianModel = require("../model/ReturnPembelianModel.js")
const supplierModel = require("../model/SupplierModel.js")
const transPembelianModel = require("../model/TransPembelianModel.js")


const getReturnPembelian = async (req, res) => {
    try {
        const pembelian = await returnPembelianModel.findAll({
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

const getReturnPembelianLaporan = async (req, res) => {
    try {
        const supplier = req.query.supplier || ''
        console.log(supplier)
        const pembelian = await returnPembelianModel.findAll({
            include: [
                {
                    model: barangModel,
                    as: 'barang'
                },
                {
                    model: supplierModel,
                    as: 'supplier'
                },
                {
                    model: transPembelianModel,
                    as: 'transPembelian'
                }
            ],
            where: {
                [Op.or]: [{
                    '$supplier.nama$': {
                        [Op.like]: '%' + supplier + '%'
                    }
                }]
            },
            attributes: ['id', 'jumlah', 'faktur', ['createdAt', 'waktuBeli'], 'barangId', 'supplierId', 'transPembelianId'],
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

const tambahReturnPembelian = async (req, res) => {
    try {
        const { jumlah, faktur, transPembelianId, supplierId, barangId } = req.body
        await returnPembelianModel.create({
            jumlah, faktur, transPembelianId, supplierId, barangId
        })
        res.status(200).json({ msg: 'Data Berhasil diTambahkan!' })
    } catch (error) {
        console.error(error)
        res.status(400).json({ msg: 'Gagal Menambah Data: ' + error })
    }
}

const editReturnPembelian = async (req, res) => {
    try {
        const { jumlah, faktur, transPembelianId, supplierId, barangId } = req.body
        await returnPembelianModel.update({
            jumlah, faktur, transPembelianId, supplierId, barangId
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

const hapusReturnPembelian = async (req, res) => {
    try {
        await returnPembelianModel.destroy({
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
    getReturnPembelian,
    getReturnPembelianLaporan,
    tambahReturnPembelian,
    editReturnPembelian,
    hapusReturnPembelian
}