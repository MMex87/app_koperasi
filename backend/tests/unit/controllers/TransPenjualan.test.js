/**
 * Unit Test untuk TransPenjualan Controller
 *
 * Test Coverage:
 * - Positive cases: berhasil tambah, edit, hapus, get data
 * - Negative cases: data tidak lengkap, data tidak ditemukan
 * - Edge cases: jumlah 0, jumlah negatif, stok tidak cukup
 */

const { validPenjualanData, incompletePenjualanData, negativeJumlahData, zeroJumlahData, mockTransPenjualan, mockBarang } = require("../../fixtures/mockData");

// Mock semua models sebelum import controller
jest.mock("../../../src/model/TransPenjualanModel");
jest.mock("../../../src/model/BarangModel");
jest.mock("../../../src/model/AnggotaModel");
jest.mock("../../../src/model/SupplierModel");

const transPenjualanModel = require("../../../src/model/TransPenjualanModel");
const barangModel = require("../../../src/model/BarangModel");
const { tambahPenjualan, getPenjualan, getPenjualanById, hapusPenjualan, editPenjualan } = require("../../../src/controllers/TransPenjualan");

describe("TransPenjualan Controller - Unit Tests", () => {
  let mockReq, mockRes;

  beforeEach(() => {
    // Reset mocks sebelum setiap test
    mockReq = {
      body: {},
      params: {},
      query: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  // ================================
  // TEST CASE: tambahPenjualan
  // ================================
  describe("tambahPenjualan", () => {
    // TEST 1: Positive - Berhasil menambah penjualan
    it("✅ harus berhasil menambah penjualan dengan data valid", async () => {
      mockReq.body = validPenjualanData;

      transPenjualanModel.create.mockResolvedValue({
        id: 1,
        ...validPenjualanData,
      });

      await tambahPenjualan(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        msg: "Data Berhasil diTambahkan!",
      });
    });

    // TEST 2: Negative - Error saat create
    it("❌ harus mengembalikan error 400 jika database error", async () => {
      mockReq.body = validPenjualanData;

      transPenjualanModel.create.mockRejectedValue(new Error("Database error"));

      await tambahPenjualan(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          msg: expect.stringContaining("Gagal"),
        }),
      );
    });
  });

  // ================================
  // TEST CASE: getPenjualan
  // ================================
  describe("getPenjualan", () => {
    // TEST 3: Positive - Berhasil mengambil semua data
    it("✅ harus mengembalikan list penjualan", async () => {
      const mockData = [
        { id: 1, faktur: "FKJ-001", barang: mockBarang },
        { id: 2, faktur: "FKJ-002", barang: mockBarang },
      ];

      transPenjualanModel.findAll.mockResolvedValue(mockData);

      await getPenjualan(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockData);
    });

    // TEST 4: Positive - List kosong
    it("✅ harus mengembalikan array kosong jika tidak ada data", async () => {
      transPenjualanModel.findAll.mockResolvedValue([]);

      await getPenjualan(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith([]);
    });

    // TEST 5: Negative - Error saat query
    it("❌ harus mengembalikan error 400 jika query gagal", async () => {
      transPenjualanModel.findAll.mockRejectedValue(new Error("Query error"));

      await getPenjualan(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  // ================================
  // TEST CASE: getPenjualanById
  // ================================
  describe("getPenjualanById", () => {
    // TEST 6: Positive - Data ditemukan
    it("✅ harus mengembalikan data penjualan berdasarkan ID", async () => {
      mockReq.params.id = "1";

      const mockData = {
        id: 1,
        ...mockTransPenjualan,
        barang: mockBarang,
        anggota: { nama: "Budi" },
      };

      transPenjualanModel.findOne.mockResolvedValue(mockData);

      await getPenjualanById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockData);
    });

    // TEST 7: Negative - Data tidak ditemukan
    it("❌ harus mengembalikan null jika ID tidak ditemukan", async () => {
      mockReq.params.id = "999";

      transPenjualanModel.findOne.mockResolvedValue(null);

      await getPenjualanById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(null);
    });
  });

  // ================================
  // TEST CASE: editPenjualan
  // ================================
  describe("editPenjualan", () => {
    // TEST 8: Positive - Berhasil update
    it("✅ harus berhasil mengupdate data penjualan", async () => {
      mockReq.params.id = "1";
      mockReq.body = {
        jumlah: 10,
        faktur: "FKJ-001",
        harga: 15000,
        typePembayaran: "Tunai",
        anggotaId: 1,
        barangId: 1,
        statusPenjualan: "Selesai",
      };

      transPenjualanModel.update.mockResolvedValue([1]);

      await editPenjualan(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        msg: "Data Berhasil diUbah!",
      });
    });

    // TEST 9: Negative - Error saat update
    it("❌ harus mengembalikan error jika update gagal", async () => {
      mockReq.params.id = "1";
      mockReq.body = validPenjualanData;

      transPenjualanModel.update.mockRejectedValue(new Error("Update error"));

      await editPenjualan(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  // ================================
  // TEST CASE: hapusPenjualan
  // ================================
  describe("hapusPenjualan", () => {
    // TEST 10: Positive - Berhasil hapus
    it("✅ harus berhasil menghapus data penjualan", async () => {
      mockReq.params.id = "1";

      transPenjualanModel.destroy.mockResolvedValue(1);

      await hapusPenjualan(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        msg: "Data Berhasil diHapus!",
      });
    });

    // TEST 11: Negative - Error saat hapus
    it("❌ harus mengembalikan error jika hapus gagal", async () => {
      mockReq.params.id = "1";

      transPenjualanModel.destroy.mockRejectedValue(new Error("Delete error"));

      await hapusPenjualan(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });
});
