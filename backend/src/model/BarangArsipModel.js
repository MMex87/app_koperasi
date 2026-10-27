const { DataTypes, Op, Sequelize } = require("sequelize");
const db = require("../config/database.js");

// Barang yang diarsipkan: disembunyikan dari kasir & daftar barang, tetapi data dan riwayatnya tetap ada.
// Aturan: barang arsip selalu stok 0. Setiap jalur yang menambah stok mengaktifkan barang kembali
// (lihat aktifkanJikaDiarsip), sehingga barang yang masih punya stok tidak pernah tersembunyi dari kasir.
const barangArsipModel = db.define(
  "barang_arsip",
  {
    barangId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    alasan: {
      type: DataTypes.TEXT,
    },
    operator: {
      type: DataTypes.STRING,
    },
  },
  {
    freezeTableName: true,
    // Samakan dengan collation tabel lama agar aman digabung/dibandingkan
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
  }
);

const SQL_ID_ARSIP = "(SELECT barangId FROM barang_arsip)";

// Kondisi where untuk barangModel: "aktif" (default) menyembunyikan arsip, "arsip" hanya arsip, "semua" tanpa filter
const filterArsip = (mode = "aktif") => {
  if (mode === "semua") return {};
  return { id: { [mode === "arsip" ? Op.in : Op.notIn]: Sequelize.literal(SQL_ID_ARSIP) } };
};

// Dipanggil di dalam DB transaction setiap kali stok barang bertambah
const aktifkanJikaDiarsip = (barangId, transaction) => barangArsipModel.destroy({ where: { barangId }, transaction });

module.exports = barangArsipModel;
module.exports.filterArsip = filterArsip;
module.exports.aktifkanJikaDiarsip = aktifkanJikaDiarsip;
module.exports.SQL_ID_ARSIP = SQL_ID_ARSIP;
