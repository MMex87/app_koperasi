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
    noHp: {
        type: DataTypes.INTEGER(15),
    },
    alamat: {
        type: DataTypes.TEXT,
    }
}, {
    freezeTableName: true
})

module.exports = supplierModel