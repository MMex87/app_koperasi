const { DataTypes } = require('sequelize')
const db = require('../config/database.js')


const anggotaModel = db.define('anggota', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nama: {
        type: DataTypes.STRING
    },
    nik: {
        type: DataTypes.INTEGER
    },
    noHP: {
        type: DataTypes.INTEGER(15)
    }
}, {

    freezeTableName: true
})


module.exports = anggotaModel