const barangModel = require("../model/BarangModel.js")
const supplierModel = require("../model/SupplierModel.js")
const transPembelianModel = require("../model/TransPembelianModel.js")


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
            ],
            where: {
                id: req.params.id
            }
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
    getJoinPemBarang,
    tambahPembelian,
    editPembelian,
    hapusPembelian
}