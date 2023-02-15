const { DataTypes } = require('sequelize')
const db = require('../config/database')

const PembayaranCicilanModel = db.define('pembayarancicilan', {
    totalBayar: {
        type: DataTypes.INTEGER
    },
    idTransaksi: {
        type: DataTypes.INTEGER
    },
    idAnggota: {
        type: DataTypes.INTEGER
    }
}, {
    freezeTableName: true,
    indexes: [
        {
            fields: ['idTransaksi']
        },
        {
            fields: ['idAnggota']
        }
    ]
})

module.exports = PembayaranCicilanModel