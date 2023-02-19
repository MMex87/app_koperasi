const { DataTypes } = require('sequelize')
const db = require('../config/database.js')
const barangModel = require('./BarangModel.js')
const supplierModel = require('./SupplierModel.js')
const transPembelianModel = require('./TransPembelianModel.js')

const returnPembelianModel = db.define('returnPembelian', {
    jumlah: {
        type: DataTypes.INTEGER
    },
    faktur: {
        type: DataTypes.STRING
    }
}, {
    freezeTableName: true,
})

barangModel.hasMany(returnPembelianModel)
returnPembelianModel.belongsTo(barangModel)

supplierModel.hasMany(returnPembelianModel)
returnPembelianModel.belongsTo(supplierModel)

transPembelianModel.hasMany(returnPembelianModel)
returnPembelianModel.belongsTo(transPembelianModel)

module.exports = returnPembelianModel