const { DataTypes } = require('sequelize')
const db = require('../config/database.js')

const barangModel = db.define('barang', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    nama: {
        type: DataTypes.STRING
    },
    kodeBarang: {
        type: DataTypes.STRING
    },
    jenisBarang: {
        type: DataTypes.STRING
    },
    satuan: {
        type: DataTypes.STRING
    },
    jumlah: {
        type: DataTypes.INTEGER
    },
    hargaBeli: {
        type: DataTypes.INTEGER
    },
    hargaJual: {
        type: DataTypes.INTEGER
    },
    idSupplier: {
        type: DataTypes.INTEGER
    }
}, {
    freezeTableName: true,
    indexes: [
        {
            fields: ['idSupplier']
        }
    ]
})

module.exports = barangModel