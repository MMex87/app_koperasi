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

const tambahPenjualan = async (req, res) => {
    try {
        const [jumlah, faktur, harga, typePembayaran, idAnggota, idBarang] = req.body
        await transPenjualanModel.create({
            jumlah, faktur, harga, typePembayaran, idAnggota, idBarang
        })
        res.status(200).json({ msg: 'Data Berhasil diTambahkan!' })
    } catch (error) {
        console.error(error)
        res.status(400).json({ msg: 'Gagal Menambah Data: ' + error })
    }
}

const editPenjualan = async (req, res) => {
    try {
        const [jumlah, faktur, harga, typePembayaran, idAnggota, idBarang] = req.body
        await transPenjualanModel.update({
            jumlah, faktur, harga, typePembayaran, idAnggota, idBarang
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
    tambahPenjualan,
    editPenjualan,
    hapusPenjualan
}