const { DataTypes } = require('sequelize')
const db = require('../config/database.js')
const supplierModel = require('./SupplierModel.js')

const barangModel = db.define('barang', {
    nama: {
        type: DataTypes.STRING
    },
    kodeBarang: {
        type: DataTypes.STRING
    },
    jenisBarang: {
        type: DataTypes.STRING
    },
    satuan: {
        type: DataTypes.STRING
    },
    jumlah: {
        type: DataTypes.INTEGER
    },
    hargaBeli: {
        type: DataTypes.INTEGER
    },
    hargaJual: {
        type: DataTypes.INTEGER
    }
}, {
    freezeTableName: true,
})

supplierModel.hasMany(barangModel)
barangModel.belongsTo(supplierModel)

module.exports = barangModel