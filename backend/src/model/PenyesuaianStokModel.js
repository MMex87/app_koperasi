const { DataTypes } = require("sequelize");
const db = require("../config/database.js");

// Collation tabel-tabel lama di database koperasi
const KOLASI_TABEL = "utf8mb4_general_ci";

// Log penyesuaian stok manual (stock opname / koreksi) beserta alasannya.
// Kolomnya mengikuti log_penjualan/log_pembelian agar bisa digabung di riwayat stok barang.
// barangId tanpa relasi/foreign key: penghapusan barang membersihkan baris ini secara manual.
const penyesuaianStokModel = db.define(
  "penyesuaian_stok",
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
    alasan: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    barangId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    freezeTableName: true,
    // Samakan dengan tabel lama (log_penjualan dll.) agar bisa di-UNION di riwayat stok
    charset: "utf8mb4",
    collate: KOLASI_TABEL,
  }
);

module.exports = penyesuaianStokModel;
module.exports.KOLASI_TABEL = KOLASI_TABEL;
