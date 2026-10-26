const { DataTypes } = require("sequelize");
const db = require("../config/database.js");

// Catatan pembatalan (void) faktur penjualan/pembelian beserta alasannya.
// Baris transaksinya tetap ada dengan status "Batal" agar jejak tidak hilang.
const pembatalanModel = db.define(
  "pembatalan_transaksi",
  {
    jenis: {
      type: DataTypes.STRING, // "penjualan" | "pembelian"
      allowNull: false,
    },
    faktur: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    alasan: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    jumlahItem: {
      type: DataTypes.INTEGER,
    },
    totalNilai: {
      type: DataTypes.INTEGER,
    },
  },
  {
    freezeTableName: true,
    // Samakan dengan collation tabel lama agar aman dibandingkan/digabung dengan tabel lain
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
  }
);

module.exports = pembatalanModel;
