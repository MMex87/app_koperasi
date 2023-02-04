const { DataTypes } = require('sequelize')
const db = require('../config/database.js')

const returnPembelianModel = db.define('returnPembelian', {
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
    idTransPembelian: {
        type: DataTypes.INTEGER
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
            fields: ['idTransPembelian']
        },
        {
            fields: ['idSupplier']
        },
        {
            fields: ['idBarang']
        }
    ]
})

module.exports = returnPembelianModel