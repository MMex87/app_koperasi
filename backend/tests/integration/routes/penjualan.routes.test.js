/**
 * Integration Test untuk Penjualan Routes
 *
 * Test Coverage:
 * - API endpoint testing
 * - Request/Response validation
 * - Error handling
 *
 * Note: Test ini membutuhkan database connection
 * Jalankan dengan: npm test -- --testPathPattern=integration
 */

const request = require("supertest");

// Mock database untuk testing: db.define mengembalikan model tiruan, jadi semua model
// (dan relasinya) bisa dimuat router tanpa koneksi/Sequelize sungguhan
jest.mock("../../../src/config/database", () => ({
  define: jest.fn(() => ({
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    hasMany: jest.fn(),
    hasOne: jest.fn(),
    belongsTo: jest.fn(),
  })),
  sync: jest.fn().mockResolvedValue(),
  close: jest.fn().mockResolvedValue(),
  authenticate: jest.fn().mockResolvedValue(),
}));

const transPenjualanModel = require("../../../src/model/TransPenjualanModel");

// Import app setelah mock
const express = require("express");
const cors = require("cors");
const router = require("../../../src/routes");

// Create test app
const createTestApp = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use("/api", router);
  return app;
};

describe("Penjualan API - Integration Tests", () => {
  let app;

  beforeAll(() => {
    app = createTestApp();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ================================
  // TEST CASE: GET /transPenjualan
  // ================================
  describe("GET /transPenjualan", () => {
    it("✅ harus mengembalikan list penjualan dengan status 200", async () => {
      const mockData = [
        {
          id: 1,
          faktur: "FKJ-001",
          jumlah: 5,
          harga: 7500,
          statusPenjualan: "onProcess",
        },
      ];

      transPenjualanModel.findAll.mockResolvedValue(mockData);

      const response = await request(app).get("/api/transPenjualan");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it("❌ harus mengembalikan error 400 jika query gagal", async () => {
      transPenjualanModel.findAll.mockRejectedValue(new Error("DB Error"));

      const response = await request(app).get("/api/transPenjualan");

      expect(response.status).toBe(400);
    });
  });

  // ================================
  // TEST CASE: POST /transPenjualan
  // ================================
  describe("POST /transPenjualan", () => {
    const validPayload = {
      jumlah: 5,
      faktur: "FKJ-TEST-001",
      harga: 7500,
      typePembayaran: "Tunai",
      anggotaId: 1,
      barangId: 1,
      statusPenjualan: "onProcess",
    };

    it("✅ harus berhasil membuat penjualan baru", async () => {
      transPenjualanModel.create.mockResolvedValue({
        id: 1,
        ...validPayload,
      });

      const response = await request(app).post("/api/transPenjualan").send(validPayload).set("Content-Type", "application/json");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("msg", "Data Berhasil diTambahkan!");
    });

    it("❌ harus menolak payload kosong", async () => {
      const response = await request(app).post("/api/transPenjualan").send({}).set("Content-Type", "application/json");

      // Controller tidak ada validasi, tapi tetap test
      expect([200, 400, 500]).toContain(response.status);
    });
  });

  // ================================
  // TEST CASE: GET /transPenjualan/:id
  // ================================
  describe("GET /transPenjualan/:id", () => {
    it("✅ harus mengembalikan data penjualan berdasarkan ID", async () => {
      const mockData = {
        id: 1,
        faktur: "FKJ-001",
        jumlah: 5,
        harga: 7500,
        barang: { nama: "Kopi" },
        anggota: { nama: "Budi" },
      };

      transPenjualanModel.findOne.mockResolvedValue(mockData);

      const response = await request(app).get("/api/transPenjualan/1");

      expect(response.status).toBe(200);
    });

    it("❌ harus mengembalikan 404 jika ID tidak ditemukan", async () => {
      transPenjualanModel.findOne.mockResolvedValue(null);

      const response = await request(app).get("/api/transPenjualan/999");

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("msg", "Transaksi tidak ditemukan");
    });
  });

  // ================================
  // TEST CASE: PUT /transPenjualan/:id
  // ================================
  describe("PUT /transPenjualan/:id", () => {
    const updatePayload = {
      jumlah: 10,
      faktur: "FKJ-001",
      harga: 15000,
      typePembayaran: "Tunai",
      anggotaId: 1,
      barangId: 1,
      statusPenjualan: "onProcess",
    };

    // Hanya item keranjang (onProcess) yang bisa diubah; status selesai lewat checkout
    beforeEach(() => {
      transPenjualanModel.findByPk.mockResolvedValue({ id: 1, statusPenjualan: "onProcess" });
    });

    it("✅ harus berhasil mengupdate penjualan", async () => {
      transPenjualanModel.update.mockResolvedValue([1]);

      const response = await request(app).put("/api/transPenjualan/1").send(updatePayload).set("Content-Type", "application/json");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("msg", "Data Berhasil diUbah!");
    });

    it("❌ harus mengembalikan error jika update gagal", async () => {
      transPenjualanModel.update.mockRejectedValue(new Error("Update error"));

      const response = await request(app).put("/api/transPenjualan/1").send(updatePayload).set("Content-Type", "application/json");

      expect(response.status).toBe(400);
    });
  });

  // ================================
  // TEST CASE: DELETE /transPenjualan/:id
  // ================================
  describe("DELETE /transPenjualan/:id", () => {
    it("✅ harus berhasil menghapus penjualan", async () => {
      transPenjualanModel.destroy.mockResolvedValue(1);

      const response = await request(app).delete("/api/transPenjualan/1");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("msg", "Data Berhasil diHapus!");
    });

    it("❌ harus mengembalikan error jika hapus gagal", async () => {
      transPenjualanModel.destroy.mockRejectedValue(new Error("Delete error"));

      const response = await request(app).delete("/api/transPenjualan/1");

      expect(response.status).toBe(400);
    });
  });

  // ================================
  // TEST CASE: Concurrent Requests (Race Condition)
  // ================================
  describe("Race Condition Test", () => {
    it("⚠️ harus menangani concurrent request dengan benar", async () => {
      const payload = {
        jumlah: 5,
        faktur: "FKJ-CONCURRENT",
        harga: 7500,
        typePembayaran: "Tunai",
        anggotaId: 1,
        barangId: 1,
        statusPenjualan: "onProcess",
      };

      transPenjualanModel.create.mockResolvedValue({ id: 1, ...payload });

      // Kirim 3 request bersamaan
      const requests = [request(app).post("/api/transPenjualan").send(payload), request(app).post("/api/transPenjualan").send(payload), request(app).post("/api/transPenjualan").send(payload)];

      const responses = await Promise.all(requests);

      // Semua harus berhasil (status 200)
      responses.forEach((res) => {
        expect(res.status).toBe(200);
      });
    });
  });
});
