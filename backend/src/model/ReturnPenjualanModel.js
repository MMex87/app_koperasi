const { DataTypes } = require('sequelize')
const db = require('../config/database.js')

const returnPenjualanModel = db.define('returnPenjualan', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    jumlah: {
        type: DataTypes.INTEGER
    },
    faktur: {
        type: DataTypes.STRING
    },
    idTransPenjualan: {
        type: DataTypes.INTEGER
    },
    idAnggota: {
        type: DataTypes.INTEGER
    },
    idBarang: {
        type: DataTypes.INTEGER
    }
}, {
    freezeTableName: true,
    indexes: [
        {
            fields: ['idTransPenjualan']
        },
        {
            fields: ['idBarang']
        },
        {
            fields: ['idAnggota']
        }
    ]
})

module.exports = returnPenjualanModel