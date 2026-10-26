const { DataTypes } = require("sequelize");
const db = require("../config/database.js");
const barangModel = require("./BarangModel.js");
const transPembelianModel = require("./TransPembelianModel.js");

const logPembelianModel = db.define(
  "log_pembelian",
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
barangModel.hasMany(logPembelianModel, {
  foreignKey: "barangId",
});
logPembelianModel.belongsTo(barangModel, {
  foreignKey: "barangId",
});

module.exports = logPembelianModel;
