const { Op } = require("sequelize")
const barangModel = require("../model/BarangModel.js")
const returnPembelianModel = require("../model/ReturnPembelianModel.js")
const supplierModel = require("../model/SupplierModel.js")
const transPembelianModel = require("../model/TransPembelianModel.js")
const logPembelianModel = require("../model/LogPembelianModel.js")
const db = require("../config/database.js")

const httpError = (status, msg) => Object.assign(new Error(msg), { status })


const getReturnPembelian = async (req, res) => {
    try {
        const pembelian = await returnPembelianModel.findAll({
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

const getReturnPembelianLaporan = async (req, res) => {
    try {
        const supplier = req.query.supplier || ''
        console.log(supplier)
        const pembelian = await returnPembelianModel.findAll({
            include: [
                {
                    model: barangModel,
                    as: 'barang'
                },
                {
                    model: supplierModel,
                    as: 'supplier'
                },
                {
                    model: transPembelianModel,
                    as: 'transPembelian'
                }
            ],
            where: {
                [Op.or]: [{
                    '$supplier.nama$': {
                        [Op.like]: '%' + supplier + '%'
                    }
                }]
            },
            attributes: ['id', 'jumlah', 'faktur', ['createdAt', 'waktuBeli'], 'barangId', 'supplierId', 'transPembelianId'],
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

const tambahReturnPembelian = async (req, res) => {
    try {
        const { jumlah, faktur, transPembelianId, supplierId, barangId } = req.body
        await returnPembelianModel.create({
            jumlah, faktur, transPembelianId, supplierId, barangId
        })
        res.status(200).json({ msg: 'Data Berhasil diTambahkan!' })
    } catch (error) {
        console.error(error)
        res.status(400).json({ msg: 'Gagal Menambah Data: ' + error })
    }
}

const editReturnPembelian = async (req, res) => {
    try {
        const { jumlah, faktur, transPembelianId, supplierId, barangId } = req.body
        await returnPembelianModel.update({
            jumlah, faktur, transPembelianId, supplierId, barangId
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

const hapusReturnPembelian = async (req, res) => {
    try {
        await returnPembelianModel.destroy({
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

// Proses retur pembelian dalam satu DB transaction:
// catat retur, kurangi jumlah transaksi, kurangi stok, dan simpan log. Jika satu langkah gagal, semua dibatalkan.
const prosesReturPembelian = async (req, res) => {
    const { transPembelianId } = req.body
    const retur = parseInt(req.body.jumlah)

    if (!transPembelianId) {
        return res.status(400).json({ msg: 'transPembelianId wajib diisi' })
    }
    if (!Number.isInteger(retur) || retur <= 0) {
        return res.status(400).json({ msg: 'Jumlah retur harus lebih dari 0' })
    }

    try {
        await db.transaction(async (t) => {
            const trans = await transPembelianModel.findByPk(transPembelianId, { transaction: t, lock: t.LOCK.UPDATE })
            if (!trans) {
                throw httpError(404, 'Transaksi pembelian tidak ditemukan')
            }
            // Pembelian onProcess belum menambah stok, jadi belum bisa diretur
            if (trans.statusPembelian === 'onProcess') {
                throw httpError(400, 'Pembelian belum disimpan, tidak bisa diretur')
            }
            // Faktur yang dibatalkan stoknya sudah ditarik kembali
            if (trans.statusPembelian === 'Batal') {
                throw httpError(400, 'Pembelian sudah dibatalkan, tidak bisa diretur')
            }

            const jumlahTrans = parseInt(trans.jumlah)
            if (retur > jumlahTrans) {
                throw httpError(400, `Jumlah retur (${retur}) melebihi jumlah pembelian (${jumlahTrans})`)
            }

            const barang = await barangModel.findByPk(trans.barangId, { transaction: t, lock: t.LOCK.UPDATE })
            if (!barang) {
                throw httpError(404, 'Data barang tidak ditemukan')
            }

            const stokAwal = parseInt(barang.jumlah) || 0
            if (retur > stokAwal) {
                throw httpError(409, `Stok "${barang.nama}" kurang: sisa ${stokAwal}, retur ${retur}`)
            }
            const stokAkhir = stokAwal - retur

            await returnPembelianModel.create({
                jumlah: retur,
                faktur: trans.faktur,
                transPembelianId: trans.id,
                supplierId: trans.supplierId,
                barangId: barang.id
            }, { transaction: t })

            await trans.update({ statusPembelian: 'Retur', jumlah: jumlahTrans - retur }, { transaction: t })

            await barang.update({ jumlah: stokAkhir }, { transaction: t })

            await logPembelianModel.create({
                qty: retur,
                qty_awal: stokAwal,
                qty_baru: stokAkhir,
                keterangan: 'Retur Pembelian (-)',
                barangId: barang.id,
                faktur: trans.faktur
            }, { transaction: t })
        })

        res.status(200).json({ msg: 'Retur Berhasil' })
    } catch (error) {
        console.error(error)
        res.status(error.status || 400).json({ msg: error.status ? error.message : 'Gagal Memproses Retur: ' + error })
    }
}

module.exports = {
    getReturnPembelian,
    getReturnPembelianLaporan,
    tambahReturnPembelian,
    editReturnPembelian,
    prosesReturPembelian,
    hapusReturnPembelian
}