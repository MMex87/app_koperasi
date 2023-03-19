const { DataTypes } = require('sequelize')
const db = require('../config/database')
const anggotaModel = require('./AnggotaModel')
const barangModel = require('./BarangModel')
const transPenjualanModel = require('./TransPenjualanModel')


const PenjualanBonModel = db.define('penjualanbon', {
    statusBon: {
        type: DataTypes.STRING
    },
    totalBayar: {
        type: DataTypes.INTEGER
    }
}, {
    freezeTableName: true
})

anggotaModel.hasMany(PenjualanBonModel, {
    foreignKey: 'anggotaId'
})
PenjualanBonModel.belongsTo(anggotaModel, {
    as: 'anggota',
    foreignKey: 'anggotaId'
})

transPenjualanModel.hasMany(PenjualanBonModel)
PenjualanBonModel.belongsTo(transPenjualanModel)

module.exports = PenjualanBonModel