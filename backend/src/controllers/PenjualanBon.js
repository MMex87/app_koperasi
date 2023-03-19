const anggotaModel = require("../model/AnggotaModel")
const PenjualanBonModel = require("../model/PenjualanBonModel")
const transPenjualanModel = require("../model/TransPenjualanModel")
const barangModel = require("../model/BarangModel")
const { Op } = require("sequelize")


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

const getPenBonJoin = async (req, res) => {
    try {
        const bon = await PenjualanBonModel.findAll({
            include: [
                {
                    model: anggotaModel,
                    as: 'anggota'
                },
                {
                    model: transPenjualanModel
                }
            ],
            attributes: ['id', 'statusBon', 'totalBayar', 'anggotaId', 'transPenjualanId', ['createdAt', 'waktuBon']]
        })
        res.status(200).json(bon)
    } catch (error) {
        console.error(error)
        res.status(400).json({ msg: 'Data gagal di ambil dengan error: ' + error })
    }
}


const getPenBonJoinSearch = async (req, res) => {
    try {
        const search = req.query.search || ''

        const result = await PenjualanBonModel.findAll({
            include: [
                {
                    model: anggotaModel,
                    as: 'anggota'
                },
                {
                    model: transPenjualanModel
                }
            ],
            attributes: ['id', 'statusBon', 'totalBayar', 'anggotaId', 'transPenjualanId', ['createdAt', 'waktuBon']],
            where: {
                [Op.or]: [{
                    '$anggota.nama$': {
                        [Op.like]: '%' + search + '%'
                    }
                }, {
                    '$transPenjualan.faktur$': {
                        [Op.like]: '%' + search + '%'
                    }
                }]
            },
            order: [
                ['id', 'DESC']
            ]
        })

        res.status(200).json(result)
    } catch (error) {
        console.error(error)
        res.status(400).json({ msg: 'Data gagal di ambil dengan error: ' + error })
    }
}

const tambahPenBon = async (req, res) => {
    const { statusBon, totalBayar, anggotaId, transPenjualanId } = req.body
    try {
        await PenjualanBonModel.create({
            statusBon, anggotaId, totalBayar, transPenjualanId
        })
        res.status(200).json({ msg: 'Data Berhasil diTambahkan!' })
    } catch (error) {
        console.error(error)
        res.status(400).json({ msg: 'Data gagal di tambahakan dengan error: ' + error })
    }
}

const editPenBon = async (req, res) => {
    const { statusBon, totalBayar, anggotaId, transPenjualanId } = req.body
    try {
        await PenjualanBonModel.update({
            statusBon, anggotaId, transPenjualanId, totalBayar
        }, {
            where: {
                id: req.params.id
            }
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
    getPenBonJoin,
    getPenBonJoinSearch,
    hapusPenBon,
    editPenBon,
    tambahPenBon
}