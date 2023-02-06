const { DataTypes } = require('sequelize')
const db = require('../config/database.js')

const supplierModel = db.define('supplier', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nama: {
        type: DataTypes.STRING
    },
    noHP: {
        type: DataTypes.STRING,
    },
    alamat: {
        type: DataTypes.TEXT,
    }
}, {
    timestamps: false,
    freezeTableName: true
})

module.exports = supplierModel