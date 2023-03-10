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
    statusPembelian: {
        type: DataTypes.STRING
    },
    hargaJual: {
        type: DataTypes.INTEGER
    }
}, {
    freezeTableName: true,

})

barangModel.hasMany(transPembelianModel, {
    foreignKey: 'barangId'
})
transPembelianModel.belongsTo(barangModel, {
    foreignKey: 'barangId'
})

supplierModel.hasMany(transPembelianModel, {
    foreignKey: 'supplierId',
    as: 'supplier'
})
transPembelianModel.belongsTo(supplierModel, {
    foreignKey: 'supplierId',
    as: 'supplier'
})

module.exports = transPembelianModel