const { DataTypes } = require("sequelize");
const db = require("../config/database.js");

// Jejak aksi sensitif yang memakai PIN admin: siapa (nama operator), dari mana (IP & perangkat),
// kapan, aksi apa, dan alasannya. Aplikasi tanpa login, jadi ini pengganti catatan "user".
const jejakAdminModel = db.define(
  "jejak_admin",
  {
    aksi: {
      type: DataTypes.STRING, // mis. "penyesuaian_stok", "hapus_barang", "batal_penjualan"
      allowNull: false,
    },
    referensi: {
      type: DataTypes.STRING, // id barang atau nomor faktur
    },
    operator: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ip: {
      type: DataTypes.STRING,
    },
    perangkat: {
      type: DataTypes.TEXT, // user-agent browser
    },
    alasan: {
      type: DataTypes.TEXT,
    },
    detail: {
      type: DataTypes.TEXT, // ringkasan perubahan (JSON)
    },
  },
  {
    freezeTableName: true,
    // Samakan dengan collation tabel lama agar aman digabung/dibandingkan
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
  }
);

module.exports = jejakAdminModel;
