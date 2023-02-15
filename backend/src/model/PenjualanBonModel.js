const { DataTypes } = require('sequelize')
const db = require('../config/database')


const PenjualanBonModel = db.define('penjualanbon', {
    totalBayar: {
        type: DataTypes.INTEGER
    },
    idPenjualan: {
        type: DataTypes.INTEGER
    },
    idAnggota: {
        type: DataTypes.INTEGER
    },
    idBarang: {
        type: DataTypes.INTEGER
    }
}, {
    indexes: [
        {
            fields: ['idPenjualan']
        },
        {
            fields: ['idAnggota']
        },
        {
            fields: ['idBarang']
        }
    ],
    freezeTableName: true
})

module.exports = PenjualanBonModel