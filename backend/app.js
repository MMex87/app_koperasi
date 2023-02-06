const express = require('express')
const dotenv = require('dotenv')
const bodyParser = require('body-parser')

const config = require('./src/config/config.js')
const router = require('./src/routes')
const corsOption = require('./src/config/cors.js')
const anggotaModel = require('./src/model/AnggotaModel.js')
const supplierModel = require('./src/model/SupplierModel.js')


const app = express()

//Base URl
const url = config.baseUrl().url
const port = config.baseUrl().port

// Dotenv Load
dotenv.config()

anggotaModel.sync({ force: true })
supplierModel.sync({ force: true })

// Body Parser
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Routes
app.use(corsOption, router)

// listen on port
app.listen(port, () => console.log(`Server Running at ${url}`))
