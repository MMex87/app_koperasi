const { Op } = require("sequelize");
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
const getSupplierId = async (req, res) => {
    try {
        const supplier = await supplierModel.findOne({
            order: [
                ['nama', 'ASC']
            ],
            where: {
                id: req.params.id
            }
        })
        res.status(200).json(supplier)
    } catch (error) {
        console.error(error);
        res.status(400).json({ msg: "Gagal Mengambil Data: " + error })
    }
}

const getSearchSupplier = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 0
        const limit = parseInt(req.query.limit) || 10
        const search = req.query.search || ''
        const offset = page * limit
        const totalRows = await supplierModel.count({
            where: {
                [Op.or]: [{
                    nama: {
                        [Op.like]: '%' + search + '%'
                    }
                }, {
                    noHP: {
                        [Op.like]: '%' + search + '%'
                    }
                }, {
                    alamat: {
                        [Op.like]: '%' + search + '%'
                    }
                }]
            }
        })
        const totalPage = Math.ceil(totalRows / limit)
        const result = await supplierModel.findAll({
            where: {
                [Op.or]: [{
                    nama: {
                        [Op.like]: '%' + search + '%'
                    }
                }, {
                    noHP: {
                        [Op.like]: '%' + search + '%'
                    }
                }, {
                    alamat: {
                        [Op.like]: '%' + search + '%'
                    }
                }]
            },
            limit,
            offset,
            order: [
                ['id', 'DESC']
            ]
        })

        res.status(200).json({
            result,
            page,
            totalPage,
            totalRows,
            limit
        })
    } catch (error) {
        console.error(error);
        res.status(400).json({ msg: "Gagal Mengambil Data: " + error })
    }
}

const tambahSupplier = async (req, res) => {
    try {
        const { nama, noHP, alamat } = req.body
        await supplierModel.create({
            nama, noHP, alamat
        })
        res.status(200).json('Data Berhasil diTambahkan!')
    } catch (error) {
        console.error(error);
        res.status(400).json({ msg: "Gagal Mengambil Data: " + error })
    }
}

const editSupplier = async (req, res) => {
    try {
        const { nama, noHP, alamat } = req.body
        await supplierModel.update({
            nama, noHP, alamat
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
    getSupplierId,
    getSearchSupplier,
    tambahSupplier,
    editSupplier,
    hapusSupplier
}