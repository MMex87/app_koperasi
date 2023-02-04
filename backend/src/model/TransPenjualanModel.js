const { DataTypes } = require('sequelize')
const db = require('../config/database.js')

const transPenjualanModel = db.define('transPenjualan', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
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
            fields: ['idAnggota']
        },
        {
            fields: ['idBarang']
        }
    ],
    freezeTableName: true
})

module.exports = transPenjualanModel