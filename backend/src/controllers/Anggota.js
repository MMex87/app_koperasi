const anggotaModel = require("../model/AnggotaModel.js");


const getAnggota = async (req, res) => {
    try {
        const anggota = await anggotaModel.findAll({
            order: [
                ['nama', 'ASC']
            ]
        })
        res.status(200).json(anggota)
    } catch (error) {
        console.error(error);
        res.status(400).json({ msg: 'Gagal Mengambil Data: ' + error })
    }
}
const getAnggotaId = async (req, res) => {
    try {
        const anggota = await anggotaModel.findOne({
            order: [
                ['nama', 'ASC']
            ],
            where: {
                id: req.params.id
            }
        })
        res.status(200).json(anggota)
    } catch (error) {
        console.error(error);
        res.status(400).json({ msg: 'Gagal Mengambil Data: ' + error })
    }
}

const tambahAnggota = async (req, res) => {
    try {
        const { nama, noHP } = req.body

        await anggotaModel.create({
            nama, noHP
        })
        res.status(200).json({ msg: 'Data Berhasil diTambahkan' })
    } catch (error) {
        console.error(error)
        res.status(400).json({ msg: 'Gagal Menambah Data: ' + error })
    }
}

const editAnggota = async (req, res) => {
    try {
        const { nama, noHP } = req.body

        await anggotaModel.update({
            nama, noHP
        }, {
            where: {
                id: req.params.id
            }
        })
        res.status(200).json({ msg: 'Data Berhasil diUbah' })
    } catch (error) {
        console.error(error)
        res.status(400).json({ msg: 'Gagal Mengubah Data: ' + error })
    }
}

const hapusAnggota = async (req, res) => {
    try {
        await anggotaModel.destroy({
            where: {
                id: req.params.id
            }
        })
        res.status(200).json({ msg: 'Data Berhasil diHapus' })
    } catch (error) {
        console.error(error)
        res.status(400).json({ msg: 'Gagal Menghapus Data: ' + error })
    }
}

module.exports = {
    getAnggota,
    getAnggotaId,
    tambahAnggota,
    editAnggota,
    hapusAnggota
}