/**
 * Unit Test untuk Barang Controller
 *
 * Test Coverage:
 * - CRUD operations (Create, Read, Update, Delete)
 * - Validasi input
 * - Pencarian barang
 */

const { mockBarang, mockSupplier } = require("../../fixtures/mockData");

// Mock models
jest.mock("../../../src/model/BarangModel");
jest.mock("../../../src/model/SupplierModel");

const barangModel = require("../../../src/model/BarangModel");
const { getBarang, tambahBarang, editBarang, hapusBarang, getSearchBarang } = require("../../../src/controllers/Barang");

describe("Barang Controller - Unit Tests", () => {
  let mockReq, mockRes;

  beforeEach(() => {
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
  // TEST CASE: getBarang
  // ================================
  describe("getBarang", () => {
    // TEST 1: Positive - Berhasil mengambil semua barang
    it("✅ harus mengembalikan list barang dengan pagination", async () => {
      mockReq.query = { page: "0", limit: "10" };

      const mockData = [mockBarang];
      barangModel.findAll.mockResolvedValue(mockData);
      barangModel.count.mockResolvedValue(1);

      await getBarang(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    // TEST 2: Negative - Error saat query
    it("❌ harus mengembalikan error 400 jika query gagal", async () => {
      barangModel.findAll.mockRejectedValue(new Error("DB Error"));

      await getBarang(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  // ================================
  // TEST CASE: tambahBarang
  // ================================
  describe("tambahBarang", () => {
    const validBarangData = {
      nama: "Kopi Baru",
      kodeBarang: "KB001",
      jenisBarang: "Minuman",
      satuan: "Sachet",
      jumlah: 50,
      hargaBeli: 2000,
      hargaJual: 3000,
      supplierId: 1,
    };

    // TEST 3: Positive - Berhasil menambah barang
    it("✅ harus berhasil menambah barang baru", async () => {
      mockReq.body = validBarangData;

      barangModel.findOne.mockResolvedValue(null); // Belum ada di DB
      barangModel.create.mockResolvedValue({ id: 1, ...validBarangData });

      await tambahBarang(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          msg: "Data Berhasil Ditambahakan",
        }),
      );
    });

    // TEST 4: Negative - Barang sudah terdaftar
    it("❌ harus menolak jika nama barang sudah ada", async () => {
      mockReq.body = validBarangData;

      barangModel.findOne.mockResolvedValue(mockBarang); // Sudah ada di DB

      await tambahBarang(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        msg: "Barang sudah terdaftar",
      });
    });

    // TEST 5: Negative - Error saat create
    it("❌ harus mengembalikan error jika create gagal", async () => {
      mockReq.body = validBarangData;

      barangModel.findOne.mockResolvedValue(null);
      barangModel.create.mockRejectedValue(new Error("Create error"));

      await tambahBarang(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  // ================================
  // TEST CASE: editBarang
  // ================================
  describe("editBarang", () => {
    const updateData = {
      nama: "Kopi Update",
      kodeBarang: "KU001",
      jenisBarang: "Minuman",
      satuan: "Sachet",
      jumlah: 100,
      hargaBeli: 1500,
      hargaJual: 2500,
      supplierId: 1,
    };

    // TEST 6: Positive - Berhasil update
    it("✅ harus berhasil mengupdate data barang", async () => {
      mockReq.params.id = "1";
      mockReq.body = updateData;

      barangModel.update.mockResolvedValue([1]);

      await editBarang(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        msg: "Data Berhasil Diubah!",
      });
    });

    // TEST 7: Negative - Error saat update
    it("❌ harus mengembalikan error jika update gagal", async () => {
      mockReq.params.id = "1";
      mockReq.body = updateData;

      barangModel.update.mockRejectedValue(new Error("Update error"));

      await editBarang(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  // ================================
  // TEST CASE: hapusBarang
  // ================================
  describe("hapusBarang", () => {
    // TEST 8: Positive - Berhasil hapus
    it("✅ harus berhasil menghapus barang", async () => {
      mockReq.params.id = "1";

      barangModel.destroy.mockResolvedValue(1);

      await hapusBarang(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        msg: "Data Berhasil diHapus!",
      });
    });

    // TEST 9: Negative - Error saat hapus
    it("❌ harus mengembalikan error jika hapus gagal", async () => {
      mockReq.params.id = "1";

      barangModel.destroy.mockRejectedValue(new Error("Delete error"));

      await hapusBarang(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  // ================================
  // TEST CASE: getSearchBarang
  // ================================
  describe("getSearchBarang", () => {
    // TEST 10: Positive - Pencarian dengan hasil
    it("✅ harus mengembalikan hasil pencarian", async () => {
      mockReq.query = { page: "0", limit: "10", search: "kopi" };

      const mockResult = [mockBarang];
      barangModel.findAll.mockResolvedValue(mockResult);
      barangModel.count.mockResolvedValue(1);

      await getSearchBarang(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    // TEST 11: Positive - Pencarian tanpa hasil
    it("✅ harus mengembalikan array kosong jika tidak ada hasil", async () => {
      mockReq.query = { page: "0", limit: "10", search: "xyz" };

      barangModel.findAll.mockResolvedValue([]);
      barangModel.count.mockResolvedValue(0);

      await getSearchBarang(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          result: [],
        }),
      );
    });
  });
});
