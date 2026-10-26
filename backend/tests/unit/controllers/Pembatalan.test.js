/**
 * Unit Test: kunci edit transaksi selesai, pembatalan faktur, dan harga barang saat checkout pembelian
 */

// Factory mock agar model Sequelize asli (dan koneksi DB) tidak ikut dimuat
const mockT = { LOCK: { UPDATE: "UPDATE" } };
jest.mock("../../../src/config/database.js", () => ({ transaction: jest.fn((cb) => cb(mockT)) }));
jest.mock("../../../src/config/config.js", () => ({ idAnggotaCustomer: "354", idSupplierLaporan: "1" }));
jest.mock("../../../src/model/AnggotaModel.js", () => ({}));
jest.mock("../../../src/model/SupplierModel.js", () => ({}));
jest.mock("../../../src/model/BarangModel.js", () => ({ findByPk: jest.fn() }));
jest.mock("../../../src/model/TransPenjualanModel.js", () => ({ findByPk: jest.fn(), findAll: jest.fn(), update: jest.fn() }));
jest.mock("../../../src/model/TransPembelianModel.js", () => ({ findByPk: jest.fn(), findAll: jest.fn(), update: jest.fn() }));
jest.mock("../../../src/model/LogPenjualanModel.js", () => ({ create: jest.fn() }));
jest.mock("../../../src/model/LogPembelianModel.js", () => ({ create: jest.fn() }));
jest.mock("../../../src/model/JejakAdminModel.js", () => ({ create: jest.fn() }));
jest.mock("../../../src/model/PembatalanModel.js", () => ({ create: jest.fn() }));

const barangModel = require("../../../src/model/BarangModel.js");
const transPenjualanModel = require("../../../src/model/TransPenjualanModel.js");
const transPembelianModel = require("../../../src/model/TransPembelianModel.js");
const logPenjualanModel = require("../../../src/model/LogPenjualanModel.js");
const pembatalanModel = require("../../../src/model/PembatalanModel.js");
const { editPenjualan, batalPenjualan } = require("../../../src/controllers/TransPenjualan");
const { editPembelian, batalPembelian, checkoutPembelian } = require("../../../src/controllers/TransPembelian");

const item = (data) => ({ ...data, update: jest.fn() });
const barang = (jumlah) => ({ id: 1, nama: "Kopi", jumlah, update: jest.fn() });
const kemarin = () => new Date(Date.now() - 24 * 60 * 60 * 1000);

describe("Kunci edit & pembatalan faktur", () => {
  let res;

  beforeEach(() => {
    res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
    jest.clearAllMocks();
  });

  describe("editPenjualan", () => {
    it("❌ menolak perubahan jumlah pada transaksi selesai", async () => {
      transPenjualanModel.findByPk.mockResolvedValue({ statusPenjualan: "Selesai" });
      await editPenjualan({ params: { id: 1 }, body: { jumlah: 3 } }, res);
      expect(res.status).toHaveBeenCalledWith(409);
      expect(transPenjualanModel.update).not.toHaveBeenCalled();
    });

    it("✅ mengizinkan pelunasan bon (Bon -> Lunas)", async () => {
      transPenjualanModel.findByPk.mockResolvedValue({ statusPenjualan: "Bon" });
      await editPenjualan({ params: { id: 1 }, body: { statusPenjualan: "Lunas" } }, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("❌ menolak mengubah status keranjang tanpa checkout", async () => {
      transPenjualanModel.findByPk.mockResolvedValue({ statusPenjualan: "onProcess" });
      await editPenjualan({ params: { id: 1 }, body: { statusPenjualan: "Selesai" } }, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("✅ tetap bisa mengubah jumlah item keranjang", async () => {
      transPenjualanModel.findByPk.mockResolvedValue({ statusPenjualan: "onProcess" });
      await editPenjualan({ params: { id: 1 }, body: { jumlah: 2, harga: 5000 } }, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe("editPembelian", () => {
    it("❌ menolak perubahan pada pembelian yang sudah disimpan", async () => {
      transPembelianModel.findByPk.mockResolvedValue({ statusPembelian: "Done" });
      await editPembelian({ params: { id: 1 }, body: { jumlah: 3 } }, res);
      expect(res.status).toHaveBeenCalledWith(409);
    });
  });

  describe("batalPenjualan", () => {
    it("❌ alasan wajib diisi", async () => {
      await batalPenjualan({ body: { faktur: "F1", alasan: "x" } }, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("✅ mengembalikan stok, mencatat log, dan menandai Batal", async () => {
      const i1 = item({ statusPenjualan: "Selesai", jumlah: 2, harga: 6000, barangId: 1, createdAt: new Date() });
      const b = barang(10);
      transPenjualanModel.findAll.mockResolvedValue([i1]);
      barangModel.findByPk.mockResolvedValue(b);

      await batalPenjualan({ body: { faktur: "F1", alasan: "Salah input barang" } }, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(b.update).toHaveBeenCalledWith({ jumlah: 12 }, expect.anything());
      expect(logPenjualanModel.create).toHaveBeenCalledWith(expect.objectContaining({ keterangan: "Pembatalan Penjualan (+)", qty: 2 }), expect.anything());
      expect(i1.update).toHaveBeenCalledWith({ statusPenjualan: "Batal" }, expect.anything());
      expect(pembatalanModel.create).toHaveBeenCalledWith(expect.objectContaining({ jenis: "penjualan", alasan: "Salah input barang", totalNilai: 6000 }), expect.anything());
    });

    it("❌ menolak faktur yang bukan hari ini", async () => {
      transPenjualanModel.findAll.mockResolvedValue([item({ statusPenjualan: "Selesai", jumlah: 1, createdAt: kemarin() })]);
      await batalPenjualan({ body: { faktur: "F1", alasan: "Salah input barang" } }, res);
      expect(res.status).toHaveBeenCalledWith(409);
    });
  });

  describe("batalPembelian", () => {
    it("❌ menolak jika stok sudah tidak cukup ditarik kembali", async () => {
      transPembelianModel.findAll.mockResolvedValue([item({ statusPembelian: "Done", jumlah: 5, harga: 1000, barangId: 1, createdAt: new Date() })]);
      barangModel.findByPk.mockResolvedValue(barang(2));
      await batalPembelian({ body: { faktur: "B1", alasan: "Barang dikembalikan" } }, res);
      expect(res.status).toHaveBeenCalledWith(409);
    });
  });

  describe("checkoutPembelian", () => {
    it("✅ harga barang diperbarui saat pembelian disimpan", async () => {
      const i1 = item({ statusPembelian: "onProcess", jumlah: 4, harga: 1200, hargaJual: 1500, barangId: 1 });
      const b = barang(3);
      transPembelianModel.findAll.mockResolvedValue([i1]);
      barangModel.findByPk.mockResolvedValue(b);

      await checkoutPembelian({ body: { faktur: "B1" } }, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(b.update).toHaveBeenCalledWith({ jumlah: 7, hargaBeli: 1200, hargaJual: 1500 }, expect.anything());
    });
  });
});
