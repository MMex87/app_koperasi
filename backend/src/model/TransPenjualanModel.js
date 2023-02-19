const { DataTypes } = require('sequelize')
const db = require('../config/database.js')
const barang = require('../model/BarangModel.js')
const anggota = require('../model/AnggotaModel.js')

const transPenjualanModel = db.define('transPenjualan', {
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
    }
}, {
    freezeTableName: true,

})

barang.hasMany(transPenjualanModel, {
    foreignKey: 'barangId'
});
transPenjualanModel.belongsTo(barang, {
    foreignKey: 'barangId'
});

anggota.hasMany(transPenjualanModel, {
    foreignKey: 'anggotaId',
    as: "anggota"
})
transPenjualanModel.belongsTo(anggota, {
    foreignKey: 'anggotaId',
    as: "anggota"
})

module.exports = transPenjualanModel