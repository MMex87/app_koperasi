/**
 * Unit Test untuk Dashboard Controller
 *
 * Test Coverage:
 * - Agregasi penjualan (hari ini, bulan ini, laba, metode, terlaris)
 * - Ringkasan stok, bon, dan transaksi terakhir
 * - Error handling
 */

// Factory mock agar model Sequelize asli (dan koneksi DB) tidak ikut dimuat
jest.mock("../../../src/config/config.js", () => ({ idSupplierLaporan: "1" }));
jest.mock("../../../src/model/AnggotaModel", () => ({ count: jest.fn() }));
jest.mock("../../../src/model/BarangModel", () => ({ count: jest.fn(), findAll: jest.fn() }));
jest.mock("../../../src/model/SupplierModel", () => ({ count: jest.fn() }));
jest.mock("../../../src/model/TransPenjualanModel", () => ({ findAll: jest.fn() }));
jest.mock("../../../src/model/TransPembelianModel", () => ({ findAll: jest.fn() }));

const moment = require("moment");
const anggotaModel = require("../../../src/model/AnggotaModel");
const barangModel = require("../../../src/model/BarangModel");
const supplierModel = require("../../../src/model/SupplierModel");
const transPenjualanModel = require("../../../src/model/TransPenjualanModel");
const transPembelianModel = require("../../../src/model/TransPembelianModel");
const { getDashboard } = require("../../../src/controllers/Dashboard");

const row = (data) => ({ ...data, get: () => data });

describe("Dashboard Controller - Unit Tests", () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = { query: {} };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  it("✅ harus mengembalikan ringkasan dashboard", async () => {
    const hariIni = moment().startOf("day").add(1, "minute").toDate();
    const kemarin = moment().startOf("day").subtract(12, "hour").toDate();
    const barangKopi = { id: 1, nama: "Kopi", hargaBeli: 1000 };
    const barangTeh = { id: 2, nama: "Teh", hargaBeli: 500 };

    const penjualan = [
      row({ id: 3, faktur: "F2", jumlah: 2, harga: 3000, typePembayaran: "Tunai", statusPenjualan: "Selesai", barangId: 1, barang: barangKopi, anggota: { nama: "Budi" }, createdAt: hariIni }),
      row({ id: 2, faktur: "F2", jumlah: 4, harga: 4000, typePembayaran: "Tunai", statusPenjualan: "Selesai", barangId: 2, barang: barangTeh, anggota: { nama: "Budi" }, createdAt: hariIni }),
      row({ id: 1, faktur: "F1", jumlah: 1, harga: 1500, typePembayaran: "Bon", statusPenjualan: "Bon", barangId: 1, barang: barangKopi, anggota: { nama: "Sari" }, createdAt: kemarin }),
    ];
    transPenjualanModel.findAll
      .mockResolvedValueOnce(penjualan)
      .mockResolvedValueOnce(penjualan);
    transPembelianModel.findAll.mockResolvedValue([{ jumlah: 10, harga: 1000 }]);
    barangModel.count.mockResolvedValueOnce(20).mockResolvedValueOnce(2).mockResolvedValueOnce(3);
    barangModel.findAll.mockResolvedValueOnce([{ id: 5, nama: "Gula", jumlah: 0 }]).mockResolvedValueOnce([{ jumlah: 10, hargaJual: 1500 }]);
    anggotaModel.count.mockResolvedValue(50);
    supplierModel.count.mockResolvedValue(4);

    await getDashboard(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    const data = mockRes.json.mock.calls[0][0];

    expect(data.penjualan.hariIni).toEqual({ total: 7000, transaksi: 1 });
    expect(data.penjualan.kemarin).toEqual({ total: 1500, transaksi: 1 });
    expect(data.pembelianBulanIni.total).toBe(10000);
    expect(data.stok).toMatchObject({ totalBarang: 20, stokHabis: 2, stokMenipis: 3, nilaiStok: 15000 });
    expect(data.grafikHarian).toHaveLength(7);
    expect(data.grafikBulanan).toHaveLength(12);
    expect(data.grafikHarian[6].total).toBe(7000);
    expect(data.barangTerlaris[0]).toMatchObject({ nama: "Teh", terjual: 4 });
    expect(data.transaksiTerakhir[0]).toMatchObject({ faktur: "F2", item: 2, total: 7000, anggota: "Budi" });
  });

  it("❌ harus mengembalikan error 400 jika query gagal", async () => {
    transPenjualanModel.findAll.mockRejectedValue(new Error("DB Error"));

    await getDashboard(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
  });
});
