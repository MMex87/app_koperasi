const returnPenjualanModel = require("../model/ReturnPenjualanModel.js")
const transPenjualanModel = require("../model/TransPenjualanModel.js")
const barangModel = require("../model/BarangModel.js")
const logPenjualanModel = require("../model/LogPenjualanModel.js")
const db = require("../config/database.js")
const { aktifkanJikaDiarsip } = require('../model/BarangArsipModel.js')

const httpError = (status, msg) => Object.assign(new Error(msg), { status })


const getReturnPenjualan = async (req, res) => {
    try {
        const penjualan = await returnPenjualanModel.findAll({
            order: [
                ['id', 'ASC']
            ]
        })
        res.status(200).json(penjualan)
    } catch (error) {
        console.error(error)
        res.status(400).json({ msg: 'Gagal Mengambil Data: ' + error })
    }
}

// Proses retur penjualan dalam satu DB transaction:
// catat retur, kurangi jumlah transaksi, tambah stok, dan simpan log. Jika satu langkah gagal, semua dibatalkan.
const prosesReturPenjualan = async (req, res) => {
    const { transPenjualanId } = req.body
    const retur = parseInt(req.body.jumlah)

    if (!transPenjualanId) {
        return res.status(400).json({ msg: 'transPenjualanId wajib diisi' })
    }
    if (!Number.isInteger(retur) || retur <= 0) {
        return res.status(400).json({ msg: 'Jumlah retur harus lebih dari 0' })
    }

    try {
        await db.transaction(async (t) => {
            const trans = await transPenjualanModel.findByPk(transPenjualanId, { transaction: t, lock: t.LOCK.UPDATE })
            if (!trans) {
                throw httpError(404, 'Transaksi penjualan tidak ditemukan')
            }
            // Penjualan onProcess belum mengurangi stok, jadi belum bisa diretur
            if (trans.statusPenjualan === 'onProcess') {
                throw httpError(400, 'Penjualan belum checkout, tidak bisa diretur')
            }
            // Faktur yang dibatalkan stoknya sudah dikembalikan
            if (trans.statusPenjualan === 'Batal') {
                throw httpError(400, 'Penjualan sudah dibatalkan, tidak bisa diretur')
            }

            const jumlahTrans = parseInt(trans.jumlah)
            if (retur > jumlahTrans) {
                throw httpError(400, `Jumlah retur (${retur}) melebihi jumlah penjualan (${jumlahTrans})`)
            }

            const barang = await barangModel.findByPk(trans.barangId, { transaction: t, lock: t.LOCK.UPDATE })
            if (!barang) {
                throw httpError(404, 'Data barang tidak ditemukan')
            }

            const stokAwal = parseInt(barang.jumlah) || 0
            const stokAkhir = stokAwal + retur

            await returnPenjualanModel.create({
                jumlah: retur,
                faktur: trans.faktur,
                transPenjualanId: trans.id,
                anggotaId: trans.anggotaId,
                barangId: barang.id
            }, { transaction: t })

            // harga = total baris, jadi dikurangi sebanding jumlah yang diretur (retur penuh -> 0)
            const jumlahSisa = jumlahTrans - retur
            const hargaTotal = parseInt(trans.harga) || 0
            const hargaSisa = jumlahSisa === 0 ? 0 : hargaTotal - Math.round(hargaTotal * retur / jumlahTrans)

            await trans.update({ statusPenjualan: 'Retur', jumlah: jumlahSisa, harga: hargaSisa }, { transaction: t })

            await barang.update({ jumlah: stokAkhir }, { transaction: t })
            await aktifkanJikaDiarsip(barang.id, t)

            await logPenjualanModel.create({
                qty: retur,
                qty_awal: stokAwal,
                qty_baru: stokAkhir,
                keterangan: 'Retur Penjualan (+)',
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
    getReturnPenjualan,
    prosesReturPenjualan
}
