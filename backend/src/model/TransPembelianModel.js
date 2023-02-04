const { DataTypes } = require('sequelize')
const db = require('../config/database.js')

const transPembelianModel = db.define('transPembelian', {
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
    harga: {
        type: DataTypes.INTEGER
    },
    typePembayaran: {
        type: DataTypes.STRING
    },
    idSupplier: {
        type: DataTypes.INTEGER
    },
    idBarang: {
        type: DataTypes.INTEGER
    }
}, {
    freezeTableName: true,
    indexes: [
        {
            fields: ['idSupplier']
        },
        {
            fields: ['idBarang']
        }
    ]
})

module.exports = transPembelianModel