const returnPenjualanModel = require("../model/ReturnPenjualanModel.js")


const getReturnPenjualan = async (req, res) => {
    try {
        const penjualan = await returnPenjualanModel.findAll({
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

const tambahReturnPenjualan = async (req, res) => {
    try {
        const [jumlah, faktur, idTransPenjualan, idAnggota, idBarang] = req.body
        await returnPenjualanModel.create({
            jumlah, faktur, idTransPenjualan, typePembayaran, idAnggota, idBarang
        })
        res.status(200).json({ msg: 'Data Berhasil diTambahkan!' })
    } catch (error) {
        console.error(error)
        res.status(400).json({ msg: 'Gagal Menambah Data: ' + error })
    }
}

const editReturnPenjualan = async (req, res) => {
    try {
        const [jumlah, faktur, idTransPenjualan, idAnggota, idBarang] = req.body
        await returnPenjualanModel.update({
            jumlah, faktur, idTransPenjualan, typePembayaran, idAnggota, idBarang
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

const hapusReturnPenjualan = async (req, res) => {
    try {
        await returnPenjualanModel.destroy({
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
    getReturnPenjualan,
    tambahReturnPenjualan,
    editReturnPenjualan,
    hapusReturnPenjualan
}