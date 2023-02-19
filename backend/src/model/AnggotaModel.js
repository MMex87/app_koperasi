const { DataTypes } = require('sequelize')
const db = require('../config/database.js')


const anggotaModel = db.define('anggota', {
    nama: {
        type: DataTypes.STRING
    },
    noHP: {
        type: DataTypes.STRING
    }
}, {
    timestamps: false,
    freezeTableName: true
})


module.exports = anggotaModel