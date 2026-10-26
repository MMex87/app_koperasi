const { DataTypes } = require("sequelize");
const db = require("../config/database.js");
const barangModel = require("./BarangModel.js");
const transPenjualanModel = require("./TransPenjualanModel.js");

const logPenjualanModel = db.define(
  "log_penjualan",
  {
    qty: {
      type: DataTypes.INTEGER,
    },
    qty_awal: {
      type: DataTypes.INTEGER,
    },
    qty_baru: {
      type: DataTypes.INTEGER,
    },
    keterangan: {
      type: DataTypes.TEXT,
    },
    barangId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    faktur: {
      type: DataTypes.STRING,
    },
  },
  {
    timestamps: true,
    freezeTableName: true,
  }
);

// 🔗 Relasi ke Barang
barangModel.hasMany(logPenjualanModel, {
  foreignKey: "barangId",
});
logPenjualanModel.belongsTo(barangModel, {
  foreignKey: "barangId",
});

module.exports = logPenjualanModel;
