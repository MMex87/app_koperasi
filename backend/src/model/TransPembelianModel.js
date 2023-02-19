const { DataTypes } = require('sequelize')
const db = require('../config/database.js')
const barangModel = require('./BarangModel.js')
const supplierModel = require('./SupplierModel.js')

const transPembelianModel = db.define('transPembelian', {
    jumlah: {
        type: DataTypes.INTEGER
    },
    faktur: {
        type: DataTypes.STRING
    },
    harga: {
        type: DataTypes.INTEGER
    },
    typePembayaran: {
        type: DataTypes.STRING
    }
}, {
    freezeTableName: true,

})

barangModel.hasMany(transPembelianModel)
transPembelianModel.belongsTo(barangModel)

supplierModel.hasMany(transPembelianModel)
transPembelianModel.belongsTo(supplierModel)

module.exports = transPembelianModel