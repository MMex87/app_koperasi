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

const tambahPembelian = async (req, res) => {
    try {
        const { jumlah, faktur, harga, typePembayaran, supplierId, barangId } = req.body
        await transPembelianModel.create({
            jumlah, faktur, harga, typePembayaran, supplierId, barangId
        })
        res.status(200).json({ msg: 'Data Berhasil diTambahkan!' })
    } catch (error) {
        console.error(error)
        res.status(400).json({ msg: 'Gagal Menambah Data: ' + error })
    }
}

const editPembelian = async (req, res) => {
    try {
        const { jumlah, faktur, harga, typePembayaran, supplierId, barangId } = req.body
        await transPembelianModel.update({
            jumlah, faktur, harga, typePembayaran, supplierId, barangId
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
    tambahPembelian,
    editPembelian,
    hapusPembelian
}