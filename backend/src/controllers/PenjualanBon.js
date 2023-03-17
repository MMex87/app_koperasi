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
    const { statusBon, barangId, anggotaId, transPenjualanId } = req.body
    console.log(transPenjualanId)
    try {
        await PenjualanBonModel.create({
            statusBon, anggotaId, barangId, transPenjualanId
        })
        res.status(200).json({ msg: 'Data Berhasil diTambahkan!' })
    } catch (error) {
        console.error(error)
        res.status(400).json({ msg: 'Data gagal di tambahakan dengan error: ' + error })
    }
}

const editPenBon = async (req, res) => {
    const { statusBon, barangId, anggotaId, transPenjualanId } = req.body
    try {
        await PenjualanBonModel.update({
            statusBon, anggotaId, transPenjualanId, barangId
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