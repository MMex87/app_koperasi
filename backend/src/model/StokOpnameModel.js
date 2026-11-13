const { DataTypes } = require("sequelize");
const db = require("../config/database.js");

// Sesi stok opname: satu per bulan (periode YYYY-MM unik).
// draft = sedang dihitung (bisa dilanjutkan / dibuat ulang), final = selisih sudah diterapkan ke stok.
const stokOpnameModel = db.define(
  "stok_opname",
  {
    periode: {
      type: DataTypes.CHAR(7),
      allowNull: false,
      unique: true,
    },
    nomor: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: "draft",
    },
    petugas: {
      type: DataTypes.STRING(100),
    },
    catatan: {
      type: DataTypes.TEXT,
    },
    finalAt: {
      type: DataTypes.DATE,
    },
  },
  {
    freezeTableName: true,
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
  }
);

module.exports = stokOpnameModel;
