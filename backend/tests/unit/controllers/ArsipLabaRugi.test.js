/**
 * Unit Test: arsip barang, laporan laba rugi, dan dihapusnya aturan harga jual >= harga beli
 */

// Factory mock agar model Sequelize asli (dan koneksi DB) tidak ikut dimuat
const mockT = { LOCK: { UPDATE: "UPDATE" } };
jest.mock("../../../src/config/database.js", () => ({ query: jest.fn(), transaction: jest.fn((cb) => cb(mockT)) }));
jest.mock("../../../src/config/config.js", () => ({ idSupplierLaporan: "1", idAnggotaCustomer: "354" }));
jest.mock("../../../src/model/BarangModel.js", () => ({ findByPk: jest.fn(), findAll: jest.fn(), findOne: jest.fn(), update: jest.fn() }));
jest.mock("../../../src/model/SupplierModel.js", () => ({}));
jest.mock("../../../src/model/TransPenjualanModel.js", () => ({ findAll: jest.fn() }));
jest.mock("../../../src/model/TransPembelianModel.js", () => ({ findAll: jest.fn(), findByPk: jest.fn(), update: jest.fn() }));
jest.mock("../../../src/model/ReturnPenjualanModel.js", () => ({}));
jest.mock("../../../src/model/ReturnPembelianModel.js", () => ({}));
jest.mock("../../../src/model/LogPenjualanModel.js", () => ({}));
jest.mock("../../../src/model/LogPembelianModel.js", () => ({}));
jest.mock("../../../src/model/PenjualanBonModel.js", () => ({}));
jest.mock("../../../src/model/PembatalanModel.js", () => ({}));
jest.mock("../../../src/model/PenyesuaianStokModel.js", () => ({ KOLASI_TABEL: "utf8mb4_general_ci" }));
jest.mock("../../../src/model/JejakAdminModel.js", () => ({ create: jest.fn() }));
jest.mock("../../../src/model/BarangArsipModel.js", () => ({
  findAll: jest.fn(),
  findOne: jest.fn(),
  bulkCreate: jest.fn(),
  destroy: jest.fn(),
  filterArsip: jest.fn(() => ({})),
  aktifkanJikaDiarsip: jest.fn(),
  SQL_ID_ARSIP: "(SELECT barangId FROM barang_arsip)",
}));

const db = require("../../../src/config/database.js");
const barangModel = require("../../../src/model/BarangModel.js");
const transPenjualanModel = require("../../../src/model/TransPenjualanModel.js");
const transPembelianModel = require("../../../src/model/TransPembelianModel.js");
const jejakAdminModel = require("../../../src/model/JejakAdminModel.js");
const barangArsipModel = require("../../../src/model/BarangArsipModel.js");
const { arsipBarang, aktifkanBarang, editBarang } = require("../../../src/controllers/Barang");
const { editPembelian } = require("../../../src/controllers/TransPembelian");
const { labaRugi } = require("../../../src/controllers/Laporan");

const adminReq = (extra) => ({ admin: { operator: "Budi", ip: "10.0.0.1", perangkat: "Chrome" }, params: {}, body: {}, query: {}, ...extra });

describe("Arsip barang, laba rugi & harga jual", () => {
  let res;

  beforeEach(() => {
    res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
    jest.clearAllMocks();
    db.transaction.mockImplementation((cb) => cb(mockT));
  });

  describe("arsipBarang", () => {
    it("❌ menolak barang yang masih punya stok", async () => {
      barangModel.findAll.mockResolvedValue([{ id: 1, nama: "Kopi", jumlah: 3 }]);
      await arsipBarang(adminReq({ body: { ids: [1], alasan: "Tidak dijual lagi" } }), res);
      expect(res.status).toHaveBeenCalledWith(409);
      expect(barangArsipModel.bulkCreate).not.toHaveBeenCalled();
    });

    it("✅ mengarsipkan barang stok 0 (yang sudah diarsip dilewati) dan mencatat jejak", async () => {
      barangModel.findAll.mockResolvedValue([
        { id: 1, nama: "Kopi", jumlah: 0 },
        { id: 2, nama: "Teh", jumlah: 0 },
      ]);
      barangArsipModel.findAll.mockResolvedValue([{ barangId: 2 }]);

      await arsipBarang(adminReq({ body: { ids: [1, 2], alasan: "Tidak dijual lagi" } }), res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(barangArsipModel.bulkCreate).toHaveBeenCalledWith([{ barangId: 1, alasan: "Tidak dijual lagi", operator: "Budi" }], expect.anything());
      expect(jejakAdminModel.create).toHaveBeenCalledWith(expect.objectContaining({ aksi: "arsip_barang", operator: "Budi" }), expect.anything());
    });

    it("❌ alasan & pilihan barang wajib", async () => {
      await arsipBarang(adminReq({ body: { ids: [], alasan: "Tidak dijual lagi" } }), res);
      await arsipBarang(adminReq({ body: { ids: [1], alasan: "x" } }), res);
      expect(res.status).toHaveBeenNthCalledWith(1, 400);
      expect(res.status).toHaveBeenNthCalledWith(2, 400);
    });
  });

  describe("aktifkanBarang", () => {
    it("❌ gagal jika barang tidak sedang diarsip", async () => {
      barangModel.findByPk.mockResolvedValue({ id: 1, nama: "Kopi" });
      barangArsipModel.aktifkanJikaDiarsip.mockResolvedValue(0);
      await aktifkanBarang(adminReq({ params: { id: "1" } }), res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("✅ mengaktifkan barang arsip", async () => {
      barangModel.findByPk.mockResolvedValue({ id: 1, nama: "Kopi" });
      barangArsipModel.aktifkanJikaDiarsip.mockResolvedValue(1);
      await aktifkanBarang(adminReq({ params: { id: "1" } }), res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe("harga jual di bawah harga beli diizinkan", () => {
    it("✅ editBarang menerima harga jual < harga beli", async () => {
      await editBarang({ params: { id: "1" }, body: { hargaBeli: 5000, hargaJual: 4000 } }, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("✅ editPembelian menerima harga jual < harga beli", async () => {
      transPembelianModel.findByPk.mockResolvedValue({ statusPembelian: "onProcess", harga: 5000, hargaJual: 6000 });
      await editPembelian({ params: { id: "1" }, body: { hargaJual: 4000 } }, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe("labaRugi", () => {
    it("✅ menghitung penjualan, HPP, laba, dan kerugian penyesuaian per bulan", async () => {
      const feb = new Date(2026, 1, 10);
      transPenjualanModel.findAll.mockResolvedValue([
        { jumlah: 2, harga: 10000, createdAt: feb, barang: { hargaBeli: 3000 } },
        { jumlah: 1, harga: 4000, createdAt: feb, barang: { hargaBeli: 5000 } }, // dijual rugi
      ]);
      transPembelianModel.findAll.mockResolvedValue([{ jumlah: 10, harga: 3000, createdAt: feb }]);
      db.query
        .mockResolvedValueOnce([{ jenis: "penjualan", qty: 1, harga: 5000, createdAt: feb }]) // retur
        .mockResolvedValueOnce([{ jenis: "penjualan", totalNilai: 7000, createdAt: feb }]) // pembatalan
        .mockResolvedValueOnce([{ qty_awal: 10, qty_baru: 8, hargaBeli: 3000, createdAt: feb }]); // penyesuaian (-2)

      await labaRugi({ query: { tahun: "2026" } }, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const { bulan, total } = res.json.mock.calls[0][0];
      expect(bulan).toHaveLength(12);
      expect(bulan[1]).toMatchObject({
        penjualan: 14000,
        hpp: 11000,
        labaKotor: 3000,
        pembelian: 30000,
        returPenjualan: 5000,
        batalPenjualan: 7000,
        kerugianPenyesuaian: 6000,
        labaBersih: -3000,
      });
      expect(total.penjualan).toBe(14000);
    });
  });
});
