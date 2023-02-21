const anggotaModel = require("../model/AnggotaModel.js")
const barangModel = require("../model/BarangModel.js")
const transPenjualanModel = require("../model/TransPenjualanModel.js")


const getPenjualan = async (req, res) => {
    try {
        const penjualan = await transPenjualanModel.findAll({
            order: [
                ['id', 'ASC']
            ]
        })
        res.status(200).json(penjualan)
    } catch (error) {
        console.error(error)
        res.status(400).json({ msg: 'Gagal Mengambil Data: ' + error })
    }
}

const getJoinPenAnBarang = async (req, res) => {
    try {
        const penjualan = await transPenjualanModel.findAll({
            include: [
                {
                    model: barangModel
                },
                {
                    model: anggotaModel,
                    as: 'anggota'
                }
            ],
            attributes: ['jumlah', 'faktur', 'harga', 'typePembayaran', 'anggotaId', 'barangId', ['createdAt', 'waktuBeli']]
        })
        res.status(200).json(penjualan)
    } catch (error) {
        console.error(error)
        res.status(400).json({ msg: 'Gagal Mengambil Data: ' + error })
    }
}

const tambahPenjualan = async (req, res) => {
    try {
        const { jumlah, faktur, harga, typePembayaran, anggotaId, barangId } = req.body
        await transPenjualanModel.create({
            jumlah, faktur, harga, typePembayaran, anggotaId, barangId
        })
        res.status(200).json({ msg: 'Data Berhasil diTambahkan!' })
    } catch (error) {
        console.error(error)
        res.status(400).json({ msg: 'Gagal Menambah Data: ' + error })
    }
}

const editPenjualan = async (req, res) => {
    try {
        const { jumlah, faktur, harga, typePembayaran, anggotaId, barangId } = req.body
        await transPenjualanModel.update({
            jumlah, faktur, harga, typePembayaran, anggotaId, barangId
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

const hapusPenjualan = async (req, res) => {
    try {
        await transPenjualanModel.destroy({
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
    getPenjualan,
    getJoinPenAnBarang,
    tambahPenjualan,
    editPenjualan,
    hapusPenjualan
}