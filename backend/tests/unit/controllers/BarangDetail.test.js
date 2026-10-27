/**
 * Unit Test untuk Barang Controller - getDetailBarang
 *
 * Test Coverage:
 * - Detail barang + ringkasan per jenis riwayat stok
 * - Arah perubahan stok (penjualan -, pembelian +, retur)
 * - Filter jenis & barang tidak ditemukan
 */

// Factory mock agar model Sequelize asli (dan koneksi DB) tidak ikut dimuat
const mockT = { LOCK: { UPDATE: "UPDATE" } };
jest.mock("../../../src/config/database.js", () => ({ query: jest.fn(), transaction: jest.fn((cb) => cb(mockT)) }));
jest.mock("../../../src/model/BarangArsipModel.js", () => ({ findOne: jest.fn(), destroy: jest.fn(), filterArsip: jest.fn(() => ({})), aktifkanJikaDiarsip: jest.fn(), SQL_ID_ARSIP: "(SELECT barangId FROM barang_arsip)" }));
jest.mock("../../../src/model/JejakAdminModel.js", () => ({ create: jest.fn() }));
jest.mock("../../../src/model/PenyesuaianStokModel.js", () => ({ create: jest.fn(), KOLASI_TABEL: "utf8mb4_general_ci" }));
jest.mock("../../../src/config/config.js", () => ({ idSupplierLaporan: "1" }));
jest.mock("../../../src/model/BarangModel.js", () => ({ findByPk: jest.fn() }));
jest.mock("../../../src/model/SupplierModel.js", () => ({}));
jest.mock("../../../src/model/TransPenjualanModel.js", () => ({}));
jest.mock("../../../src/model/TransPembelianModel.js", () => ({}));
jest.mock("../../../src/model/ReturnPenjualanModel.js", () => ({}));
jest.mock("../../../src/model/ReturnPembelianModel.js", () => ({}));
jest.mock("../../../src/model/LogPenjualanModel.js", () => ({}));
jest.mock("../../../src/model/LogPembelianModel.js", () => ({}));

const db = require("../../../src/config/database.js");
const barangModel = require("../../../src/model/BarangModel.js");
const penyesuaianStokModel = require("../../../src/model/PenyesuaianStokModel.js");
const { getDetailBarang, penyesuaianStok, editBarang } = require("../../../src/controllers/Barang");

describe("Barang Controller - getDetailBarang", () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = { params: { id: "1" }, query: {} };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  it("✅ harus mengembalikan detail, ringkasan, dan riwayat bertanda", async () => {
    barangModel.findByPk.mockResolvedValue({ id: 1, nama: "Kopi" });
    db.query
      .mockResolvedValueOnce([
        { keterangan: "Penjualan (-)", transaksi: "3", qty: "5", terakhir: "2026-02-01" },
        { keterangan: "Retur Pembelian (-)", transaksi: "1", qty: "2", terakhir: "2026-01-01" },
      ])
      .mockResolvedValueOnce([{ total: "4" }])
      .mockResolvedValueOnce([
        { id: 9, qty: 2, qty_awal: 10, qty_baru: 8, keterangan: "Penjualan (-)" },
        { id: 8, qty: 1, qty_awal: 9, qty_baru: 10, keterangan: "Retur Penjualan (+)" },
        { id: 7, qty: 5, qty_awal: 4, qty_baru: 9, keterangan: "Pembelian (+)" },
        { id: 6, qty: 2, qty_awal: 6, qty_baru: 4, keterangan: "Retur Pembelian (-)" },
      ]);

    await getDetailBarang(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    const data = mockRes.json.mock.calls[0][0];
    expect(data.ringkasan.penjualan).toEqual({ transaksi: 3, qty: 5, terakhir: "2026-02-01" });
    expect(data.ringkasan.pembelian).toEqual({ transaksi: 0, qty: 0, terakhir: null });
    expect(data.riwayat.map((r) => [r.jenis, r.perubahan])).toEqual([
      ["penjualan", -2],
      ["returPenjualan", 1],
      ["pembelian", 5],
      ["returPembelian", -2],
    ]);
    expect(data.totalRows).toBe(4);
  });

  it("✅ harus meneruskan filter jenis sebagai keterangan", async () => {
    mockReq.query = { jenis: "returPenjualan", page: "1", limit: "5" };
    barangModel.findByPk.mockResolvedValue({ id: 1 });
    db.query.mockResolvedValue([]);

    await getDetailBarang(mockReq, mockRes);

    expect(db.query.mock.calls[2][1].replacements).toMatchObject({ keterangan: "Retur Penjualan (+)", limit: 5, offset: 5 });
  });

  it("❌ harus mengembalikan 404 jika barang tidak ditemukan", async () => {
    barangModel.findByPk.mockResolvedValue(null);

    await getDetailBarang(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(404);
  });
});

describe("Barang Controller - penyesuaianStok & editBarang", () => {
  let mockRes;

  beforeEach(() => {
    mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
    jest.clearAllMocks();
  });

  it("✅ menyetel stok ke jumlah fisik dan mencatat selisih beserta alasan", async () => {
    const barang = { id: 1, jumlah: 10, update: jest.fn() };
    barangModel.findByPk.mockResolvedValue(barang);

    await penyesuaianStok({ params: { id: "1" }, body: { stokBaru: 7, alasan: "Stock opname bulanan" } }, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(barang.update).toHaveBeenCalledWith({ jumlah: 7 }, expect.anything());
    expect(penyesuaianStokModel.create).toHaveBeenCalledWith(
      expect.objectContaining({ qty: 3, qty_awal: 10, qty_baru: 7, keterangan: "Penyesuaian Stok (-)", alasan: "Stock opname bulanan" }),
      expect.anything()
    );
  });

  it("❌ alasan wajib & stok tidak boleh negatif", async () => {
    await penyesuaianStok({ params: { id: "1" }, body: { stokBaru: 5, alasan: "" } }, mockRes);
    await penyesuaianStok({ params: { id: "1" }, body: { stokBaru: -1, alasan: "Stock opname" } }, mockRes);
    expect(mockRes.status).toHaveBeenNthCalledWith(1, 400);
    expect(mockRes.status).toHaveBeenNthCalledWith(2, 400);
    expect(penyesuaianStokModel.create).not.toHaveBeenCalled();
  });

  it("❌ menolak jika stok baru sama dengan stok saat ini", async () => {
    barangModel.findByPk.mockResolvedValue({ id: 1, jumlah: 5, update: jest.fn() });
    await penyesuaianStok({ params: { id: "1" }, body: { stokBaru: 5, alasan: "Stock opname" } }, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
  });

  it("❌ editBarang menolak perubahan jumlah stok langsung", async () => {
    await editBarang({ params: { id: "1" }, body: { jumlah: 99 } }, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
  });
});
