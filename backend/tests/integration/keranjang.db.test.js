// Uji keranjang penjualan & pembelian terhadap database uji (db_kasir_uji), BUKAN db_kasir.
// Hanya jalan jika DB_UJI=1:  DB_UJI=1 npx jest --coverage=false tests/integration/keranjang.db.test.js
const jalan = process.env.DB_UJI === "1" ? describe : describe.skip;
const NAMA_DB_UJI = "db_kasir_uji";

jalan("Keranjang terhadap database uji", () => {
  let request, db, mysql2, app;
  let anggotaModel, supplierModel, barangModel, transPenjualanModel, transPembelianModel;
  let anggota, supplier, barang, barang2;

  beforeAll(async () => {
    // Harus sebelum modul database dimuat: dotenv tidak menimpa variabel yang sudah ada
    process.env.DB_NAME = NAMA_DB_UJI;
    require("dotenv").config();
    process.env.DB_NAME = NAMA_DB_UJI;

    mysql2 = require("mysql2/promise");
    const koneksi = await mysql2.createConnection({ host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASS });
    await koneksi.query(`CREATE DATABASE IF NOT EXISTS \`${NAMA_DB_UJI}\``);
    await koneksi.end();

    db = require("../../src/config/database.js");
    if (db.config.database !== NAMA_DB_UJI) throw new Error("Tes ini hanya boleh memakai database uji");

    const router = require("../../src/routes");
    anggotaModel = require("../../src/model/AnggotaModel.js");
    supplierModel = require("../../src/model/SupplierModel.js");
    barangModel = require("../../src/model/BarangModel.js");
    transPenjualanModel = require("../../src/model/TransPenjualanModel.js");
    transPembelianModel = require("../../src/model/TransPembelianModel.js");
    await db.sync({ force: true });

    const express = require("express");
    const bodyParser = require("body-parser");
    request = require("supertest");
    app = express();
    app.use(bodyParser.json());
    app.use(router);

    supplier = await supplierModel.create({ nama: "Supplier Uji" });
    anggota = await anggotaModel.create({ nama: "Anggota Uji" });
    barang = await barangModel.create({ nama: "Barang Uji", kodeBarang: "UJI001", jenisBarang: "Makanan", satuan: "Pcs", jumlah: 10, hargaBeli: 3000, hargaJual: 4000, supplierId: supplier.id });
    barang2 = await barangModel.create({ nama: "Barang Uji 2", kodeBarang: "UJI002", jenisBarang: "Minuman", satuan: "Pcs", jumlah: 10, hargaBeli: 2000, hargaJual: 3000, supplierId: supplier.id });
  }, 120000);

  beforeEach(async () => {
    await transPenjualanModel.destroy({ where: {} });
    await transPembelianModel.destroy({ where: {} });
    await barangModel.update({ jumlah: 10 }, { where: { id: [barang.id, barang2.id] } });
  });

  afterAll(async () => {
    if (db) await db.close();
    if (mysql2) {
      const koneksi = await mysql2.createConnection({ host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASS });
      await koneksi.query(`DROP DATABASE IF EXISTS \`${NAMA_DB_UJI}\``);
      await koneksi.end();
    }
  });

  const stokBarang = async (id) => (await barangModel.findByPk(id)).jumlah;

  describe("Penjualan (kasir)", () => {
    const itemPenjualan = (faktur, over = {}) => ({
      jumlah: 2,
      faktur,
      harga: 8000,
      typePembayaran: "Tunai",
      anggotaId: anggota.id,
      barangId: barang.id,
      statusPenjualan: "onProcess",
      ...over,
    });

    test("tambah ke keranjang tersimpan di database dan tidak mengurangi stok", async () => {
      const res = await request(app).post("/transPenjualan").send(itemPenjualan("FKJ-UJI-1"));

      expect(res.status).toBe(200);
      const rows = await transPenjualanModel.findAll({ where: { faktur: "FKJ-UJI-1" } });
      expect(rows).toHaveLength(1);
      expect(rows[0]).toMatchObject({ jumlah: 2, harga: 8000, statusPenjualan: "onProcess", barangId: barang.id });
      expect(await stokBarang(barang.id)).toBe(10);
    });

    test("tambah barang yang sama memperbarui baris yang ada, tidak membuat baris baru", async () => {
      const awal = await request(app).post("/transPenjualan").send(itemPenjualan("FKJ-UJI-2"));
      expect(awal.status).toBe(200);
      const baris = await transPenjualanModel.findOne({ where: { faktur: "FKJ-UJI-2" } });

      const res = await request(app).put(`/transPenjualan/${baris.id}`).send({ jumlah: 3, harga: 12000 });

      expect(res.status).toBe(200);
      const rows = await transPenjualanModel.findAll({ where: { faktur: "FKJ-UJI-2" } });
      expect(rows).toHaveLength(1);
      expect(rows[0]).toMatchObject({ jumlah: 3, harga: 12000 });
    });

    test("hapus satu item dari keranjang menghapusnya dari database", async () => {
      await request(app).post("/transPenjualan").send(itemPenjualan("FKJ-UJI-3"));
      const baris = await transPenjualanModel.findOne({ where: { faktur: "FKJ-UJI-3" } });

      const res = await request(app).delete(`/transPenjualan/${baris.id}`);

      expect(res.status).toBe(200);
      expect(await transPenjualanModel.count({ where: { faktur: "FKJ-UJI-3" } })).toBe(0);
    });

    test("kosongkan keranjang menghapus semua item faktur itu, faktur lain tetap ada", async () => {
      await request(app).post("/transPenjualan").send(itemPenjualan("FKJ-UJI-4"));
      await request(app).post("/transPenjualan").send(itemPenjualan("FKJ-UJI-4", { barangId: barang2.id }));
      await request(app).post("/transPenjualan").send(itemPenjualan("FKJ-UJI-LAIN"));

      // Sama seperti kosongkanKeranjang di frontend: hapus satu per satu
      const items = await transPenjualanModel.findAll({ where: { faktur: "FKJ-UJI-4", statusPenjualan: "onProcess" } });
      for (const item of items) {
        const res = await request(app).delete(`/transPenjualan/${item.id}`);
        expect(res.status).toBe(200);
      }

      expect(await transPenjualanModel.count({ where: { faktur: "FKJ-UJI-4" } })).toBe(0);
      expect(await transPenjualanModel.count({ where: { faktur: "FKJ-UJI-LAIN" } })).toBe(1);
    });

    test("transaksi yang sudah selesai tidak bisa dihapus dari keranjang", async () => {
      await transPenjualanModel.create({ ...itemPenjualan("FKJ-UJI-5"), statusPenjualan: "Selesai" });
      const baris = await transPenjualanModel.findOne({ where: { faktur: "FKJ-UJI-5" } });

      const res = await request(app).delete(`/transPenjualan/${baris.id}`);

      expect(res.status).toBe(400);
      expect(await transPenjualanModel.count({ where: { faktur: "FKJ-UJI-5" } })).toBe(1);
    });
  });

  describe("Pembelian", () => {
    const itemPembelian = (faktur, over = {}) => ({
      jumlah: 5,
      faktur,
      harga: 3000,
      hargaJual: 4000,
      supplierId: supplier.id,
      barangId: barang.id,
      statusPembelian: "onProcess",
      ...over,
    });

    test("tambah ke keranjang tersimpan di database dan tidak menambah stok sebelum simpan", async () => {
      const res = await request(app).post("/transPembelian").send(itemPembelian("FKB-UJI-1"));

      expect(res.status).toBe(200);
      const rows = await transPembelianModel.findAll({ where: { faktur: "FKB-UJI-1" } });
      expect(rows).toHaveLength(1);
      expect(rows[0]).toMatchObject({ jumlah: 5, harga: 3000, hargaJual: 4000, statusPembelian: "onProcess" });
      expect(await stokBarang(barang.id)).toBe(10);
    });

    test("restock barang yang sudah di keranjang memperbarui jumlah DAN harga di database", async () => {
      await request(app).post("/transPembelian").send(itemPembelian("FKB-UJI-2"));
      const baris = await transPembelianModel.findOne({ where: { faktur: "FKB-UJI-2" } });

      // Sama seperti handlecart: jumlah dijumlahkan, harga baru menggantikan
      const res = await request(app).put(`/transPembelian/${baris.id}`).send({ jumlah: 7, harga: 3500, hargaJual: 4500 });

      expect(res.status).toBe(200);
      const rows = await transPembelianModel.findAll({ where: { faktur: "FKB-UJI-2" } });
      expect(rows).toHaveLength(1);
      expect(rows[0]).toMatchObject({ jumlah: 7, harga: 3500, hargaJual: 4500 });
    });

    test("hapus satu item dari keranjang menghapusnya dari database", async () => {
      await request(app).post("/transPembelian").send(itemPembelian("FKB-UJI-3"));
      const baris = await transPembelianModel.findOne({ where: { faktur: "FKB-UJI-3" } });

      const res = await request(app).delete(`/transPembelian/${baris.id}`);

      expect(res.status).toBe(200);
      expect(await transPembelianModel.count({ where: { faktur: "FKB-UJI-3" } })).toBe(0);
      expect(await stokBarang(barang.id)).toBe(10);
    });

    test("kosongkan keranjang menghapus semua item faktur itu, faktur lain tetap ada", async () => {
      await request(app).post("/transPembelian").send(itemPembelian("FKB-UJI-4"));
      await request(app).post("/transPembelian").send(itemPembelian("FKB-UJI-4", { barangId: barang2.id }));
      await request(app).post("/transPembelian").send(itemPembelian("FKB-UJI-LAIN"));

      const items = await transPembelianModel.findAll({ where: { faktur: "FKB-UJI-4", statusPembelian: "onProcess" } });
      for (const item of items) {
        const res = await request(app).delete(`/transPembelian/${item.id}`);
        expect(res.status).toBe(200);
      }

      expect(await transPembelianModel.count({ where: { faktur: "FKB-UJI-4" } })).toBe(0);
      expect(await transPembelianModel.count({ where: { faktur: "FKB-UJI-LAIN" } })).toBe(1);
    });
  });
});
