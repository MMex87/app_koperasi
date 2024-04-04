const { Op } = require("sequelize")
const anggotaModel = require("../model/AnggotaModel.js")
const barangModel = require("../model/BarangModel.js")
const supplierModel = require("../model/SupplierModel.js")
const transPenjualanModel = require("../model/TransPenjualanModel.js")
const moment = require('moment');


const getPenjualan = async (req, res) => {
    try {
        const penjualan = await transPenjualanModel.findAll({
            order: [
                ['id', 'DESC']
            ]
        })
        res.status(200).json(penjualan)
    } catch (error) {
        console.error(error)
        res.status(400).json({ msg: 'Gagal Mengambil Data: ' + error })
    }
}

const getJoinPenAnBarang = async (req, res) => {
    try {
        const penjualan = await transPenjualanModel.findAll({
            include: [
                {
                    model: barangModel,
                    include: supplierModel
                },
                {
                    model: anggotaModel,
                    as: 'anggota'
                }
            ],
            attributes: ['id', 'jumlah', 'faktur', 'harga', 'typePembayaran', 'anggotaId', 'barangId', ['createdAt', 'waktuJual'], 'statusPenjualan']
        })
        res.status(200).json(penjualan)
    } catch (error) {
        console.error(error)
        res.status(400).json({ msg: 'Gagal Mengambil Data: ' + error })
    }
}

const getJoinPenAnBarangLapor = async (req, res) => {
    try {
        const supplier = req.query.supplier || ''
        const limit = parseInt(req.query.limit) || 2000 // Batasan jumlah data per halaman

        const penjualan = await transPenjualanModel.findAll({
            include: [
                {
                    model: barangModel,
                    include: supplierModel
                },
                {
                    model: anggotaModel,
                    as: 'anggota'
                }
            ],
            where: {
                [Op.or]: [{
                    '$barang.supplier.nama$': {
                        [Op.like]: '%' + supplier + '%'
                    }
                }]
            },
            attributes: ['id', 'jumlah', 'faktur', 'harga', 'typePembayaran', 'anggotaId', 'barangId', ['createdAt', 'waktuJual'], 'statusPenjualan'],
            limit: limit,
            order: [
                ['id', 'DESC']
            ]
        })

        res.status(200).json(penjualan)
    } catch (error) {
        console.error(error)
        res.status(400).json({ msg: 'Gagal Mengambil Data: ' + error })
    }
}


const getJoinPenAnBarangId = async (req, res) => {
    try {
        const penjualan = await transPenjualanModel.findAll({
            include: [
                {
                    model: barangModel,
                    include: supplierModel
                },
                {
                    model: anggotaModel,
                    as: 'anggota'
                }
            ],
            where: {
                [Op.or]: [{
                    '$barang.supplier.nama$': {
                        [Op.like]: '%' + supplier + '%'
                    }
                }]
            },
            attributes: ['id', 'jumlah', 'faktur', 'harga', 'typePembayaran', 'anggotaId', 'barangId', ['createdAt', 'waktuJual'], 'statusPenjualan'],
            order: [
                [sequelize.literal('DATE_TRUNC(\'week\', "createdAt")'), 'DESC']
            ]
        });


        res.status(200).json(penjualan)
    } catch (error) {
        console.error(error)
        res.status(400).json({ msg: 'Gagal Mengambil Data: ' + error })
    }
}

const getJoinPenAnBarangSarch = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 0
        const limit = parseInt(req.query.limit)
        const search = req.query.date
        const offset = page * limit

        const startOfDay = moment(search).startOf('day').toDate(); // Mulai hari pada tanggal tertentu
        const endOfDay = moment(search).endOf('day').toDate(); // Akhir hari pada tanggal tertentu

        let totalPage = 0;
        let result = [];
        let totalRows = 0;

        if(limit == 0){
            result = await transPenjualanModel.findAll({
                include: [
                    {
                        model: barangModel,
                        as : 'barang'
                    },
                    {
                        model: anggotaModel,
                        as: 'anggota'
                    }
                ],
                where: {
                    createdAt: {
                        [Op.gte]: startOfDay,
                        [Op.lte]: endOfDay
                    }
                },
                order: [
                    ['id', 'DESC']
                ]
            })

        }else{
            totalRows = await transPenjualanModel.count({
                include: [
                    {
                        model: barangModel,
                        as: 'barang'
                    },
                    {
                        model: anggotaModel,
                        as: 'anggota'
                    }
                ],
                where: {
                    createdAt: {
                        [Op.gte]: startOfDay,
                        [Op.lte]: endOfDay
                    }
                }
            })
    
            totalPage = Math.ceil(totalRows / limit)
            result = await transPenjualanModel.findAll({
                include: [
                    {
                        model: barangModel,
                        as : 'barang'
                    },
                    {
                        model: anggotaModel,
                        as: 'anggota'
                    }
                ],
                where: {
                    createdAt: {
                        [Op.gte]: startOfDay,
                        [Op.lte]: endOfDay
                    }
                },
                offset,
                limit,
                order: [
                    ['id', 'DESC']
                ]
            })
        }

        res.status(200).json({
            page,
            result,
            totalPage,
            totalRows,
            limit
        })
    } catch (error) {
        console.error(error)
        res.status(400).json({ msg: 'Gagal Mengambil Data: ' + error })
    }
}

const getTotalHarga = async (req, res) => {
    try {
        const faktur = req.params.faktur
        const transaksi = await transPenjualanModel.findAll({
            include: [
                {
                    model: barangModel
                }
            ],
            where: { faktur }
        })
        let total = 0
        for (let val of transaksi) {
            if (val.faktur == faktur) {
                let temp = parseInt(val.barang.hargaJual) * parseInt(val.jumlah)
                total = total + temp
            }
        }


        res.status(200).json({ total })
    } catch (error) {
        console.error(error)
        res.status(400).json({ msg: 'Gagal Mengambil Data: ' + error })
    }
}

const tambahPenjualan = async (req, res) => {
    try {
        const { jumlah, faktur, harga, typePembayaran, anggotaId, barangId, statusPenjualan } = req.body
        await transPenjualanModel.create({
            jumlah, faktur, harga, typePembayaran, anggotaId, barangId, statusPenjualan
        })
        res.status(200).json({ msg: 'Data Berhasil diTambahkan!' })
    } catch (error) {
        console.error(error)
        res.status(400).json({ msg: 'Gagal Menambah Data: ' + error })
    }
}

const editPenjualan = async (req, res) => {
    try {
        const { jumlah, faktur, harga, typePembayaran, anggotaId, barangId, statusPenjualan } = req.body
        await transPenjualanModel.update({
            jumlah, faktur, harga, typePembayaran, anggotaId, barangId, statusPenjualan
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
    getJoinPenAnBarang,
    getJoinPenAnBarangId,
    getJoinPenAnBarangLapor,
    getJoinPenAnBarangSarch,
    getTotalHarga,
    tambahPenjualan,
    editPenjualan,
    hapusPenjualan
}