const { DataTypes } = require("sequelize");
const db = require("../config/database.js");

// Hasil hitung per barang dalam satu sesi stok opname.
// barangId tanpa foreign key (seperti penyesuaian_stok) agar hapus barang tidak terblokir;
// nama & kode disimpan sebagai snapshot supaya hasil opname lama tetap terbaca.
// stokSistem & selisih baru diisi saat finalisasi (diambil dari stok terkini di dalam transaksi).
const stokOpnameDetailModel = db.define(
  "stok_opname_detail",
  {
    opnameId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    barangId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    namaBarang: {
      type: DataTypes.STRING,
    },
    kodeBarang: {
      type: DataTypes.STRING,
    },
    stokFisik: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    stokSistem: {
      type: DataTypes.INTEGER,
    },
    selisih: {
      type: DataTypes.INTEGER,
    },
    keterangan: {
      type: DataTypes.STRING,
    },
  },
  {
    freezeTableName: true,
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
    indexes: [{ unique: true, fields: ["opnameId", "barangId"] }],
  }
);

module.exports = stokOpnameDetailModel;
