const express = require('express')
const dotenv = require('dotenv')
const bodyParser = require('body-parser')
const path = require('path')
const fs = require('fs')

const config = require('./src/config/config.js')
const router = require('./src/routes')
const corsOption = require('./src/config/cors.js')
const { ipIzin } = require('./src/middleware/ipIzin.js')
const anggotaModel = require('./src/model/AnggotaModel.js')
const supplierModel = require('./src/model/SupplierModel.js')
const barangModel = require('./src/model/BarangModel.js')
const transPenjualanModel = require('./src/model/TransPenjualanModel.js')
const transPembelianModel = require('./src/model/TransPembelianModel.js')
const returnPembelianModel = require('./src/model/ReturnPembelianModel.js')
const returnPenjualanModel = require('./src/model/ReturnPenjualanModel.js')
const pembatalanModel = require('./src/model/PembatalanModel.js')
const penyesuaianStokModel = require('./src/model/PenyesuaianStokModel.js')
const jejakAdminModel = require('./src/model/JejakAdminModel.js')
const barangArsipModel = require('./src/model/BarangArsipModel.js')


const app = express()

//Base URl
const url = config.baseUrl().url
const port = config.baseUrl().port

// Dotenv Load
dotenv.config()


// anggotaModel.sync({ force: true })
// barangModel.sync()
// barangModel.drop()
// transPembelianModel.sync({ alter: true })
// transPenjualanModel.sync({ alter: true })
// returnPembelianModel.sync()
// returnPenjualanModel.drop()

// Tabel baru: sync() tanpa opsi hanya membuat tabel jika belum ada, tidak mengubah tabel lain
pembatalanModel.sync().catch((error) => console.error('Gagal membuat tabel pembatalan_transaksi:', error))
penyesuaianStokModel.sync().catch((error) => console.error('Gagal membuat tabel penyesuaian_stok:', error))
jejakAdminModel.sync().catch((error) => console.error('Gagal membuat tabel jejak_admin:', error))
barangArsipModel.sync().catch((error) => console.error('Gagal membuat tabel barang_arsip:', error))

if (!process.env.ADMIN_PIN) {
    console.warn('ADMIN_PIN belum diatur di .env: aksi admin (penyesuaian stok, hapus barang, batal faktur) akan ditolak')
}


// Pembatasan IP: dipasang paling awal agar UI, file statis, dan API sama-sama terlindungi
app.use(ipIzin)

// Body Parser
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Frontend (hasil build React) disajikan dari backend: UI dan API cukup satu port
const frontendBuild = path.join(__dirname, '..', 'frontend', 'build')
if (fs.existsSync(frontendBuild)) {
    app.use(express.static(frontendBuild))
    // Buka/refresh halaman di browser (mis. /barang) -> index.html, bukan JSON API dengan path yang sama.
    // Request axios tidak mengirim Accept text/html, jadi tetap diteruskan ke API.
    // Vary + no-cache: browser tidak boleh memakai cache HTML untuk request API di URL yang sama (dan sebaliknya)
    app.get('*', (req, res, next) => {
        res.vary('Accept')
        if (!(req.headers.accept || '').includes('text/html')) return next()
        res.set('Cache-Control', 'no-cache')
        res.sendFile(path.join(frontendBuild, 'index.html'))
    })
} else {
    console.warn(`Folder build frontend tidak ditemukan (${frontendBuild}): jalankan "npm run build" di folder frontend`)
}

// Routes
app.use(corsOption, router)

// Cegah server mati karena error async yang lolos dari try/catch di handler
process.on('unhandledRejection', (reason) => {
    console.error('Unhandled rejection:', reason)
})

// listen on port
app.listen(port, () => console.log(`Server Running at ${url}`))
