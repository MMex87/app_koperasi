// Edit faktur penjualan terhadap database uji (db_kasir_uji), BUKAN db_kasir.
// Hanya jalan jika DB_UJI=1:  DB_UJI=1 npx jest --coverage=false tests/integration/editFaktur.db.test.js
const jalan = process.env.DB_UJI === "1" ? describe : describe.skip;
const NAMA_DB_UJI = "db_kasir_uji";
const PIN_UJI = "424242";

jalan("Edit faktur penjualan terhadap database uji", () => {
  let request, db, mysql2, app;
  let anggotaModel, supplierModel, barangModel, transPenjualanModel, logPenjualanModel, jejakAdminModel;
  let anggota, supplier, barang, barang2;

  const headerAdmin = { "X-Admin-Pin": PIN_UJI, "X-Admin-Operator": encodeURIComponent("Admin Uji") };

  beforeAll(async () => {
    // Harus sebelum modul database dimuat: dotenv tidak menimpa variabel yang sudah ada
    process.env.DB_NAME = NAMA_DB_UJI;
    require("dotenv").config();
    process.env.DB_NAME = NAMA_DB_UJI;
    process.env.ADMIN_PIN = PIN_UJI;

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
    logPenjualanModel = require("../../src/model/LogPenjualanModel.js");
    jejakAdminModel = require("../../src/model/JejakAdminModel.js");
    await db.sync({ force: true });

    const express = require("express");
    const bodyParser = require("body-parser");
    request = require("supertest");
    app = express();
    app.use(bodyParser.json());
    app.use(router);

    supplier = await supplierModel.create({ nama: "Supplier Uji" });
    anggota = await anggotaModel.create({ nama: "Anggota Uji" });
    barang = await barangModel.create({ nama: "Kopi Uji", kodeBarang: "KOPI001", jenisBarang: "Minuman", satuan: "Pcs", jumlah: 10, hargaBeli: 2000, hargaJual: 3000, supplierId: supplier.id });
    barang2 = await barangModel.create({ nama: "Teh Uji", kodeBarang: "TEH001", jenisBarang: "Minuman", satuan: "Pcs", jumlah: 10, hargaBeli: 1000, hargaJual: 2000, supplierId: supplier.id });
  }, 120000);

  // Faktur Selesai hari ini: 2 kopi terjual (stok sudah berkurang dari 10 ke 8)
  const seedFaktur = async (faktur) => {
    await barangModel.update({ jumlah: 8 }, { where: { id: barang.id } });
    await barangModel.update({ jumlah: 10 }, { where: { id: barang2.id } });
    const baris = await transPenjualanModel.create({
      jumlah: 2,
      faktur,
      harga: 6000,
      typePembayaran: "Tunai",
      anggotaId: anggota.id,
      barangId: barang.id,
      statusPenjualan: "Selesai",
    });
    return baris;
  };

  beforeEach(async () => {
    await transPenjualanModel.destroy({ where: {} });
    await logPenjualanModel.destroy({ where: {} });
    await jejakAdminModel.destroy({ where: {} });
  });

  afterAll(async () => {
    if (db) await db.close();
    if (mysql2) {
      const koneksi = await mysql2.createConnection({ host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASS });
      await koneksi.query(`DROP DATABASE IF EXISTS \`${NAMA_DB_UJI}\``);
      await koneksi.end();
    }
  });

  const stok = async (id) => (await barangModel.findByPk(id)).jumlah;

  test("kurangi jumlah: stok kembali, baris diperbarui, log & jejak admin tersimpan", async () => {
    const baris = await seedFaktur("FKJ-EDIT-1");

    const res = await request(app).post("/editFakturPenjualan").set(headerAdmin).send({
      faktur: "FKJ-EDIT-1",
      alasan: "Qty salah input",
      items: [{ id: baris.id, barangId: barang.id, jumlah: 1 }],
    });

    expect(res.status).toBe(200);
    expect(await stok(barang.id)).toBe(9);
    const hasil = await transPenjualanModel.findByPk(baris.id);
    expect(hasil).toMatchObject({ jumlah: 1, harga: 3000, statusPenjualan: "Selesai" });
    const log = await logPenjualanModel.findAll({ where: { faktur: "FKJ-EDIT-1" } });
    expect(log).toHaveLength(1);
    expect(log[0]).toMatchObject({ qty: 1, qty_awal: 8, qty_baru: 9, keterangan: "Koreksi Penjualan (+)" });
    const jejak = await jejakAdminModel.findOne({ where: { aksi: "edit_penjualan", referensi: "FKJ-EDIT-1" } });
    expect(jejak).not.toBeNull();
    expect(jejak.alasan).toBe("Qty salah input");
  });

  test("hapus item: baris jadi Batal, stoknya kembali", async () => {
    const baris = await seedFaktur("FKJ-EDIT-2");
    // Item kedua: 1 teh terjual (stok teh sudah 9)
    await barangModel.update({ jumlah: 9 }, { where: { id: barang2.id } });
    const baris2 = await transPenjualanModel.create({ jumlah: 1, faktur: "FKJ-EDIT-2", harga: 2000, typePembayaran: "Tunai", anggotaId: anggota.id, barangId: barang2.id, statusPenjualan: "Selesai" });

    // Hanya item kopi yang dipertahankan; teh dihapus dari faktur
    const res = await request(app).post("/editFakturPenjualan").set(headerAdmin).send({
      faktur: "FKJ-EDIT-2",
      alasan: "Barang salah masuk",
      items: [{ id: baris.id, barangId: barang.id, jumlah: 2 }],
    });

    expect(res.status).toBe(200);
    expect((await transPenjualanModel.findByPk(baris2.id)).statusPenjualan).toBe("Batal");
    expect(await stok(barang2.id)).toBe(10);
    expect(await stok(barang.id)).toBe(8);
  });

  test("tambah item: barang baru tercatat dengan harga jual saat ini, stok berkurang", async () => {
    const baris = await seedFaktur("FKJ-EDIT-3");

    const res = await request(app).post("/editFakturPenjualan").set(headerAdmin).send({
      faktur: "FKJ-EDIT-3",
      alasan: "Barang lupa ditambah",
      items: [{ id: baris.id, barangId: barang.id, jumlah: 2 }, { barangId: barang2.id, jumlah: 3 }],
    });

    expect(res.status).toBe(200);
    const semua = await transPenjualanModel.findAll({ where: { faktur: "FKJ-EDIT-3" } });
    const baru = semua.find((s) => s.barangId === barang2.id);
    expect(baru).toMatchObject({ jumlah: 3, harga: 6000, statusPenjualan: "Selesai", anggotaId: anggota.id });
    expect(await stok(barang2.id)).toBe(7);
  });

  test("setelah edit, batal faktur mengembalikan sisa jumlah ke stok", async () => {
    const baris = await seedFaktur("FKJ-EDIT-4");
    await request(app).post("/editFakturPenjualan").set(headerAdmin).send({
      faktur: "FKJ-EDIT-4",
      alasan: "Qty salah input",
      items: [{ id: baris.id, barangId: barang.id, jumlah: 1 }],
    });
    expect(await stok(barang.id)).toBe(9);

    const res = await request(app).post("/batalPenjualan").set(headerAdmin).send({ faktur: "FKJ-EDIT-4", alasan: "Batal setelah edit" });

    expect(res.status).toBe(200);
    expect(await stok(barang.id)).toBe(10);
  });

  test("tanpa PIN admin ditolak dan tidak mengubah apa pun", async () => {
    const baris = await seedFaktur("FKJ-EDIT-5");

    const res = await request(app).post("/editFakturPenjualan").send({
      faktur: "FKJ-EDIT-5",
      alasan: "Qty salah input",
      items: [{ id: baris.id, barangId: barang.id, jumlah: 1 }],
    });

    expect(res.status).toBe(401);
    expect(await stok(barang.id)).toBe(8);
    expect((await transPenjualanModel.findByPk(baris.id)).jumlah).toBe(2);
  });
});
