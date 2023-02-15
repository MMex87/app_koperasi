const PenjualanBonModel = require("../model/PenjualanBonModel")


const getPenBon = async (req, res) => {
    try {
        const bon = await PenjualanBonModel.findAll({
            order: [
                ['id', 'ASC']
            ]
        })
        res.status(200).json(bon)
    } catch (error) {
        console.error(error)
        res.status(400).json({ msg: 'Data gagal di ambil dengan error:' + error })
    }
}

const tambahPenBon = async (req, res) => {
    const { totalBayar, idBarang, idAnggota, idPenjualan } = req.body
    try {
        await PenjualanBonModel.create({
            totalBayar, idAnggota, idPenjualan, idBarang
        })
        res.status(200).json({ msg: 'Data Berhasil diTambahkan!' })
    } catch (error) {
        console.error(error)
        res.status(400).json({ msg: 'Data gagal di tambahakan dengan error: ' + error })
    }
}

const editPenBon = async (req, res) => {
    const { totalBayar, idBarang, idAnggota, idPenjualan } = req.body
    try {
        await PenjualanBonModel.update({
            totalBayar, idAnggota, idPenjualan, idBarang
        }, {
            where: req.params.id
        })
        res.status(200).json({ msg: 'Data Berhasil diUpdate!' })
    } catch (error) {
        console.error(error)
        res.status(400).json({ msg: 'Data Gagal di Update dengan error: ' + error })
    }
}

const hapusPenBon = async (req, res) => {
    try {
        await PenjualanBonModel.destroy({
            where: {
                id: req.params.id
            }
        })
    } catch (error) {
        console.error(error)
        res.status(400).json({ msg: 'Data Gagal di Hapus dengan error: ' + error })
    }
}

module.exports = {
    getPenBon,
    hapusPenBon,
    editPenBon,
    tambahPenBon
}