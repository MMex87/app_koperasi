const { where } = require("../config/database")
const PembayaranCicilanModel = require("../model/PembayaranCicilanModel")


const getCicilan = async (req, res) => {
    try {
        const cicilan = await PembayaranCicilanModel.findAll({
            order: [
                ['id', 'ASC']
            ]
        })
        res.status(200).json(cicilan)
    } catch (error) {
        console.error(error)
        res.status(400).json({ msg: 'gagal mendapatkan data dengan error: ' + error })
    }
}

const tambahCicilan = async (req, res) => {
    const { jumlahBayar, penjualanbonId, anggotaId } = req.body
    try {
        await PembayaranCicilanModel.create({
            jumlahBayar, penjualanbonId, anggotaId
        })
        res.status(200).json({ msg: 'Data Berhasil Ditambahkan!' })
    } catch (error) {
        console.error(error)
        res.status(200).json({ msg: 'gagal mendapatakan data dengan error: ' + error })
    }
}

const editCicilan = async (req, res) => {
    const { jumlahBayar, penjualanbonId, anggotaId } = req.body
    try {
        await PembayaranCicilanModel.update({
            jumlahBayar, penjualanbonId, anggotaId
        }, {
            where: {
                id: req.params.id
            }
        })
        res.status(200).json({ msg: 'Data Berhasil DiUpdate!' })
    } catch (error) {
        console.error(error)
        res.status(400).json({ msg: 'gagal mendapatkan data dengan error: ' + error })
    }
}

const hapusCicilan = async (req, res) => {
    try {
        await PembayaranCicilanModel.destroy({
            where: {
                id: req.params.id
            }
        })
    } catch (error) {
        console.error(error)
        res.status(400).json({ msg: 'gagal hapus data dengan error: ' + error })
    }
}

module.exports = {
    getCicilan,
    editCicilan,
    tambahCicilan,
    hapusCicilan
}