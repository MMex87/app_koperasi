const supplierModel = require("../model/SupplierModel.js");



const getSupplier = async (req, res) => {
    try {
        const supplier = await supplierModel.findAll({
            order: [
                ['nama', 'ASC']
            ]
        })
        res.status(200).json(supplier)
    } catch (error) {
        console.error(error);
        res.status(400).json({ msg: "Gagal Mengambil Data: " + error })
    }
}

const tambahSupplier = async (req, res) => {
    try {
        const { nama, noHp, alamat } = req.body
        await supplierModel.create({
            nama, noHp, alamat
        })
        res.status(200).json('Data Berhasil diTambahkan!')
    } catch (error) {
        console.error(error);
        res.status(400).json({ msg: "Gagal Mengambil Data: " + error })
    }
}

const editSupplier = async (req, res) => {
    try {
        await supplierModel.update({
            nama, noHp, alamat
        }, {
            where: {
                id: req.params.id
            }
        })
        res.status(200).json('Data Berhasil diUbah!')
    } catch (error) {
        console.error(error);
        res.status(400).json({ msg: "Gagal Mengubah Data: " + error })
    }
}

const hapusSupplier = async (req, res) => {
    try {
        await supplierModel.destroy({
            where: {
                id: req.params.id
            }
        })
        res.status(200).json('Data Berhasil diHapus!')
    } catch (error) {
        console.error(error);
        res.status(400).json({ msg: "Gagal Menghapus Data: " + error })
    }
}

module.exports = {
    getSupplier,
    tambahSupplier,
    editSupplier,
    hapusSupplier
}