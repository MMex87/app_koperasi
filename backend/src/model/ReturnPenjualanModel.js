const { DataTypes } = require('sequelize')
const db = require('../config/database.js')
const anggota = require('./AnggotaModel.js')
const barangModel = require('./BarangModel.js')
const transPenjualanModel = require('./TransPenjualanModel.js')

const returnPenjualanModel = db.define('returnPenjualan', {
    jumlah: {
        type: DataTypes.INTEGER
    },
    faktur: {
        type: DataTypes.STRING
    }
}, {
    freezeTableName: true,
})

transPenjualanModel.hasMany(returnPenjualanModel)
returnPenjualanModel.belongsTo(transPenjualanModel)

anggota.hasMany(returnPenjualanModel, {
    foreignKey: 'anggotaId',
})
returnPenjualanModel.belongsTo(anggota, {
    foreignKey: 'anggotaId',
    as: "anggota"
})

barangModel.hasMany(returnPenjualanModel)
returnPenjualanModel.belongsTo(barangModel)

module.exports = returnPenjualanModel