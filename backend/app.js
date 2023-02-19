const express = require('express')
const dotenv = require('dotenv')
const bodyParser = require('body-parser')

const config = require('./src/config/config.js')
const router = require('./src/routes')
const corsOption = require('./src/config/cors.js')
const anggotaModel = require('./src/model/AnggotaModel.js')
const supplierModel = require('./src/model/SupplierModel.js')
const barangModel = require('./src/model/BarangModel.js')
const PenjualanBonModel = require('./src/model/PenjualanBonModel.js')
const PembayaranCicilanModel = require('./src/model/PembayaranCicilanModel.js')
const transPenjualanModel = require('./src/model/TransPenjualanModel.js')
const transPembelianModel = require('./src/model/TransPembelianModel.js')
const returnPembelianModel = require('./src/model/ReturnPembelianModel.js')
const returnPenjualanModel = require('./src/model/ReturnPenjualanModel.js')


const app = express()

//Base URl
const url = config.baseUrl().url
const port = config.baseUrl().port

// Dotenv Load
dotenv.config()


// anggotaModel.sync({ force: true })
// PenjualanBonModel.sync()
// PembayaranCicilanModel.sync()
// barangModel.sync()
// barangModel.drop()
// transPembelianModel.sync()
// transPenjualanModel.sync({ alter: true })
// returnPembelianModel.sync()
// returnPenjualanModel.sync({ force: true })
// PenjualanBonModel.sync({ force: true })
// PembayaranCicilanModel.sync({ force: true })


// Body Parser
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Routes
app.use(corsOption, router)

// listen on port
app.listen(port, () => console.log(`Server Running at ${url}`))
