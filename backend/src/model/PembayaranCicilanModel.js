const { DataTypes } = require('sequelize')
const db = require('../config/database')
const anggotaModel = require('./AnggotaModel')
const PenjualanBonModel = require('./PenjualanBonModel')

const PembayaranCicilanModel = db.define('pembayarancicilan', {
    jumlahBayar: {
        type: DataTypes.INTEGER
    }
}, {
    freezeTableName: true,
})

anggotaModel.hasMany(PembayaranCicilanModel, {
    foreignKey: 'anggotaId'
})
PembayaranCicilanModel.belongsTo(anggotaModel, {
    as: 'anggota',
    foreignKey: 'anggotaId'
})

PenjualanBonModel.hasMany(PembayaranCicilanModel)
PembayaranCicilanModel.belongsTo(PenjualanBonModel)

module.exports = PembayaranCicilanModel