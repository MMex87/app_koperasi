/**
 * Unit Test untuk Barang Controller
 *
 * Test Coverage:
 * - CRUD operations (Create, Read, Update, Delete)
 * - Validasi input
 * - Pencarian barang
 */

const { mockBarang, mockSupplier } = require("../../fixtures/mockData");

// Mock models (pakai factory: automock tetap menjalankan definisi model + relasi Sequelize)
const mockModel = () => ({
  findAll: jest.fn().mockResolvedValue([]),
  findOne: jest.fn(),
  findByPk: jest.fn(),
  count: jest.fn().mockResolvedValue(0),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
});
const mockT = { LOCK: { UPDATE: "UPDATE" } };
jest.mock("../../../src/config/database.js", () => ({ transaction: jest.fn((cb) => cb(mockT)) }));
jest.mock("../../../src/config/config.js", () => ({ idSupplierLaporan: "1" }));
jest.mock("../../../src/model/BarangModel", () => mockModel());
jest.mock("../../../src/model/SupplierModel", () => ({}));
jest.mock("../../../src/model/TransPenjualanModel.js", () => mockModel());
jest.mock("../../../src/model/TransPembelianModel.js", () => mockModel());
jest.mock("../../../src/model/ReturnPenjualanModel.js", () => mockModel());
jest.mock("../../../src/model/ReturnPembelianModel.js", () => mockModel());
jest.mock("../../../src/model/LogPenjualanModel.js", () => mockModel());
jest.mock("../../../src/model/LogPembelianModel.js", () => mockModel());
jest.mock("../../../src/model/PenjualanBonModel.js", () => mockModel());
jest.mock("../../../src/model/PenyesuaianStokModel.js", () => ({ ...mockModel(), KOLASI_TABEL: "utf8mb4_general_ci" }));
jest.mock("../../../src/model/JejakAdminModel.js", () => ({ create: jest.fn() }));

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
    // Stok (jumlah) tidak ikut: hanya bisa berubah lewat transaksi/penyesuaian stok
    const updateData = {
      nama: "Kopi Update",
      kodeBarang: "KU001",
      jenisBarang: "Minuman",
      satuan: "Sachet",
      hargaBeli: 1500,
      hargaJual: 2500,
      supplierId: 1,
    };

    // TEST 6: Positive - Berhasil update
    it("✅ harus berhasil mengupdate data barang", async () => {
      mockReq.params.id = "1";
      mockReq.body = updateData;

      barangModel.findOne.mockResolvedValue(null); // kode barang belum dipakai barang lain
      barangModel.update.mockResolvedValue([1]);

      await editBarang(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        msg: "Data Berhasil Diubah",
      });
    });

    it("❌ harus menolak perubahan stok lewat edit barang", async () => {
      mockReq.params.id = "1";
      mockReq.body = { ...updateData, jumlah: 100 };

      await editBarang(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(barangModel.update).not.toHaveBeenCalled();
    });

    // TEST 7: Negative - Error saat update
    it("❌ harus mengembalikan error jika update gagal", async () => {
      mockReq.params.id = "1";
      mockReq.body = updateData;

      barangModel.findOne.mockResolvedValue(null);
      barangModel.update.mockRejectedValue(new Error("Update error"));

      await editBarang(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  // ================================
  // TEST CASE: hapusBarang
  // ================================
  describe("hapusBarang", () => {
    // TEST 8: Positive - Berhasil hapus (wajib konfirmasi, berjalan dalam transaksi)
    it("✅ harus berhasil menghapus barang", async () => {
      mockReq.params.id = "1";
      mockReq.query = { konfirmasi: "ya" };

      const barang = { ...mockBarang, destroy: jest.fn().mockResolvedValue() };
      barangModel.findByPk.mockResolvedValue(barang);

      await hapusBarang(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          msg: `Barang "${mockBarang.nama}" beserta transaksinya berhasil dihapus`,
        }),
      );
      expect(barang.destroy).toHaveBeenCalled();
    });

    it("❌ harus menolak hapus tanpa konfirmasi", async () => {
      mockReq.params.id = "1";

      await hapusBarang(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(barangModel.findByPk).not.toHaveBeenCalled();
    });

    // TEST 9: Negative - Error saat hapus
    it("❌ harus mengembalikan error jika hapus gagal", async () => {
      mockReq.params.id = "1";
      mockReq.query = { konfirmasi: "ya" };

      barangModel.findByPk.mockRejectedValue(new Error("Delete error"));

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
