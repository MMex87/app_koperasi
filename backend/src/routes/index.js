const express = require('express')


const barang = require('../controllers/Barang.js')
const anggota = require('../controllers/Anggota.js')
const supplier = require('../controllers/Supplier.js')
const transPembelian = require('../controllers/TransPembelian.js')
const transPenjualan = require('../controllers/TransPenjualan.js')
const returnTransPembelian = require('../controllers/ReturnPembelian.js')
const returnTransPenjualan = require('../controllers/RetrunPenjualan.js')


const router = express.Router()

// barang
router.get('/barang', barang.getBarang)
router.post('/barang', barang.tambahBarang)
router.put('/barang/:id', barang.editBarang)
router.delete('/barang/:id', barang.hapusBarang)

// supplier
router.get('/supplier', supplier.getSupplier)
router.post('/supplier', supplier.tambahSupplier)
router.put('/supplier/:id', supplier.editSupplier)
router.delete('/supplier/:id', supplier.hapusSupplier)

// anggota
router.get('/anggota', anggota.getAnggota)
router.post('/anggota', anggota.tambahAnggota)
router.put('/anggota/:id', anggota.editAnggota)
router.delete('/anggota/:id', anggota.hapusAnggota)

// Transakasi Pembelian
router.get('/transPembelian', transPembelian.getPembelian)
router.post('/transPembelian', transPembelian.tambahPembelian)
router.put('/transPembelian/:id', transPembelian.editPembelian)
router.delete('/transPembelian/:id', transPembelian.hapusPembelian)

// Transakasi Penjualan
router.get('/transPenjualan', transPenjualan.getPenjualan)
router.post('/transPenjualan', transPenjualan.tambahPenjualan)
router.put('/transPenjualan/:id', transPenjualan.editPenjualan)
router.delete('/transPenjualan/:id', transPenjualan.hapusPenjualan)

// return Pembelian
router.get('/returnPembelian', returnTransPembelian.getReturnPembelian)
router.post('/returnPembelian', returnTransPembelian.tambahReturnPembelian)
router.put('/returnPembelian/:id', returnTransPembelian.editReturnPembelian)
router.delete('/returnPembelian/:id', returnTransPembelian.hapusReturnPembelian)

// return Penjualan
router.get('/returnPenjualan', returnTransPenjualan.getReturnPenjualan)
router.post('/returnPenjualan', returnTransPenjualan.tambahReturnPenjualan)
router.put('/returnPenjualan/:id', returnTransPenjualan.editReturnPenjualan)
router.delete('/returnPenjualan/:id', returnTransPenjualan.hapusReturnPenjualan)

module.exports = router