/**
 * Unit Test: edit faktur penjualan (ubah jumlah, hapus, tambah item) - stok, log, dan status baris.
 */

const mockT = { LOCK: { UPDATE: "UPDATE" } };
jest.mock("../../../src/config/database.js", () => ({ transaction: jest.fn((cb) => cb(mockT)) }));
jest.mock("../../../src/config/config.js", () => ({ idAnggotaCustomer: "354", idSupplierLaporan: "1" }));
jest.mock("../../../src/model/AnggotaModel.js", () => ({}));
jest.mock("../../../src/model/SupplierModel.js", () => ({}));
jest.mock("../../../src/model/BarangModel.js", () => ({ findByPk: jest.fn() }));
jest.mock("../../../src/model/TransPenjualanModel.js", () => ({ findAll: jest.fn(), create: jest.fn() }));
jest.mock("../../../src/model/LogPenjualanModel.js", () => ({ create: jest.fn() }));
jest.mock("../../../src/model/BarangArsipModel.js", () => ({ findOne: jest.fn(), destroy: jest.fn(), filterArsip: jest.fn(() => ({})), aktifkanJikaDiarsip: jest.fn(), SQL_ID_ARSIP: "(SELECT barangId FROM barang_arsip)" }));
jest.mock("../../../src/model/JejakAdminModel.js", () => ({ create: jest.fn() }));
jest.mock("../../../src/model/PembatalanModel.js", () => ({ create: jest.fn() }));

const barangModel = require("../../../src/model/BarangModel.js");
const transPenjualanModel = require("../../../src/model/TransPenjualanModel.js");
const logPenjualanModel = require("../../../src/model/LogPenjualanModel.js");
const jejakAdminModel = require("../../../src/model/JejakAdminModel.js");
const { editFakturPenjualan } = require("../../../src/controllers/TransPenjualan");

const baris = (data) => ({ anggotaId: 7, typePembayaran: "Tunai", createdAt: new Date(), statusPenjualan: "Selesai", ...data, update: jest.fn() });
const barang = (id, jumlah, hargaJual = 3000) => ({ id, nama: `Barang ${id}`, jumlah, hargaJual, update: jest.fn() });
const req = (body) => ({ body, admin: { operator: "Admin Uji", ip: "127.0.0.1" } });

const barangPerId = (daftar) => (id) => Promise.resolve(daftar.find((b) => b.id === id) || null);

describe("editFakturPenjualan", () => {
  let res;

  beforeEach(() => {
    jest.clearAllMocks();
    res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
  });

  it("❌ alasan minimal 5 karakter", async () => {
    await editFakturPenjualan(req({ faktur: "F1", alasan: "x", items: [{ barangId: 1, jumlah: 1 }] }), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("❌ item tidak boleh kosong", async () => {
    await editFakturPenjualan(req({ faktur: "F1", alasan: "Salah input", items: [] }), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("❌ barang tidak boleh ganda dalam satu faktur", async () => {
    await editFakturPenjualan(req({ faktur: "F1", alasan: "Salah input", items: [{ barangId: 1, jumlah: 1 }, { barangId: 1, jumlah: 2 }] }), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("✅ jumlah dinaikkan: stok berkurang, harga baris sebanding, log Koreksi (-)", async () => {
    const r1 = baris({ id: 1, barangId: 1, jumlah: 2, harga: 6000 });
    const b1 = barang(1, 10);
    transPenjualanModel.findAll.mockResolvedValue([r1]);
    barangModel.findByPk.mockImplementation(barangPerId([b1]));

    await editFakturPenjualan(req({ faktur: "F1", alasan: "Qty salah input", items: [{ id: 1, barangId: 1, jumlah: 3 }] }), res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(b1.update).toHaveBeenCalledWith({ jumlah: 9 }, expect.anything());
    expect(r1.update).toHaveBeenCalledWith({ jumlah: 3, harga: 9000 }, expect.anything());
    expect(logPenjualanModel.create).toHaveBeenCalledWith(
      expect.objectContaining({ qty: 1, qty_awal: 10, qty_baru: 9, keterangan: "Koreksi Penjualan (-)", faktur: "F1" }),
      expect.anything(),
    );
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ totalBaru: 9000 }));
  });

  it("✅ jumlah diturunkan: stok kembali, log Koreksi (+)", async () => {
    const r1 = baris({ id: 1, barangId: 1, jumlah: 3, harga: 9000 });
    const b1 = barang(1, 10);
    transPenjualanModel.findAll.mockResolvedValue([r1]);
    barangModel.findByPk.mockImplementation(barangPerId([b1]));

    await editFakturPenjualan(req({ faktur: "F1", alasan: "Qty salah input", items: [{ id: 1, barangId: 1, jumlah: 1 }] }), res);

    expect(b1.update).toHaveBeenCalledWith({ jumlah: 12 }, expect.anything());
    expect(r1.update).toHaveBeenCalledWith({ jumlah: 1, harga: 3000 }, expect.anything());
    expect(logPenjualanModel.create).toHaveBeenCalledWith(expect.objectContaining({ qty: 2, keterangan: "Koreksi Penjualan (+)" }), expect.anything());
  });

  it("✅ item yang tidak dikirim diubah ke Batal dan stoknya kembali", async () => {
    const r1 = baris({ id: 1, barangId: 1, jumlah: 1, harga: 3000 });
    const r2 = baris({ id: 2, barangId: 2, jumlah: 2, harga: 6000 });
    const b1 = barang(1, 9);
    const b2 = barang(2, 8);
    transPenjualanModel.findAll.mockResolvedValue([r1, r2]);
    barangModel.findByPk.mockImplementation(barangPerId([b1, b2]));

    await editFakturPenjualan(req({ faktur: "F1", alasan: "Barang salah masuk", items: [{ id: 1, barangId: 1, jumlah: 1 }] }), res);

    expect(r2.update).toHaveBeenCalledWith({ statusPenjualan: "Batal" }, expect.anything());
    expect(b2.update).toHaveBeenCalledWith({ jumlah: 10 }, expect.anything());
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("✅ item baru: dibuat dengan harga jual saat ini, anggota & pembayaran dari faktur", async () => {
    const r1 = baris({ id: 1, barangId: 1, jumlah: 1, harga: 3000 });
    const b1 = barang(1, 9);
    const b2 = barang(2, 5, 5000);
    transPenjualanModel.findAll.mockResolvedValue([r1]);
    barangModel.findByPk.mockImplementation(barangPerId([b1, b2]));

    await editFakturPenjualan(req({ faktur: "F1", alasan: "Barang lupa ditambah", items: [{ id: 1, barangId: 1, jumlah: 1 }, { barangId: 2, jumlah: 2 }] }), res);

    expect(transPenjualanModel.create).toHaveBeenCalledWith(
      expect.objectContaining({ faktur: "F1", barangId: 2, jumlah: 2, harga: 10000, statusPenjualan: "Selesai", anggotaId: 7, typePembayaran: "Tunai" }),
      expect.anything(),
    );
    expect(b2.update).toHaveBeenCalledWith({ jumlah: 3 }, expect.anything());
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("❌ stok tidak cukup untuk tambahan: 409, tidak ada perubahan", async () => {
    const r1 = baris({ id: 1, barangId: 1, jumlah: 1, harga: 3000 });
    const b1 = barang(1, 1);
    transPenjualanModel.findAll.mockResolvedValue([r1]);
    barangModel.findByPk.mockImplementation(barangPerId([b1]));

    await editFakturPenjualan(req({ faktur: "F1", alasan: "Qty salah input", items: [{ id: 1, barangId: 1, jumlah: 5 }] }), res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(b1.update).not.toHaveBeenCalled();
  });

  it("❌ faktur yang pernah diretur tidak bisa diedit: 409", async () => {
    transPenjualanModel.findAll.mockResolvedValue([baris({ id: 1, barangId: 1, jumlah: 1, harga: 3000, statusPenjualan: "Retur" })]);

    await editFakturPenjualan(req({ faktur: "F1", alasan: "Qty salah input", items: [{ id: 1, barangId: 1, jumlah: 1 }] }), res);

    expect(res.status).toHaveBeenCalledWith(409);
  });

  it("❌ faktur bukan hari ini tidak bisa diedit: 409", async () => {
    const kemarin = new Date(Date.now() - 24 * 60 * 60 * 1000);
    transPenjualanModel.findAll.mockResolvedValue([baris({ id: 1, barangId: 1, jumlah: 1, harga: 3000, createdAt: kemarin })]);

    await editFakturPenjualan(req({ faktur: "F1", alasan: "Qty salah input", items: [{ id: 1, barangId: 1, jumlah: 1 }] }), res);

    expect(res.status).toHaveBeenCalledWith(409);
  });

  it("❌ id yang bukan bagian faktur ini ditolak: 400", async () => {
    transPenjualanModel.findAll.mockResolvedValue([baris({ id: 1, barangId: 1, jumlah: 1, harga: 3000 })]);

    await editFakturPenjualan(req({ faktur: "F1", alasan: "Qty salah input", items: [{ id: 99, barangId: 1, jumlah: 1 }] }), res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("❌ barang yang baris lamanya dipertahankan tidak boleh ditambahkan lagi sebagai item baru", async () => {
    const r1 = baris({ id: 1, barangId: 1, jumlah: 2, harga: 6000 });
    transPenjualanModel.findAll.mockResolvedValue([r1]);
    barangModel.findByPk.mockImplementation(barangPerId([barang(1, 10)]));

    await editFakturPenjualan(req({ faktur: "F1", alasan: "Qty salah input", items: [{ id: 1, barangId: 1, jumlah: 2 }, { barangId: 1, jumlah: 1 }] }), res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("✅ barang yang dihapus lalu ditambahkan lagi di sesi yang sama diterima (baris lama jadi Batal)", async () => {
    const r1 = baris({ id: 1, barangId: 1, jumlah: 2, harga: 6000 });
    const b1 = barang(1, 10);
    transPenjualanModel.findAll.mockResolvedValue([r1]);
    barangModel.findByPk.mockImplementation(barangPerId([b1]));

    await editFakturPenjualan(req({ faktur: "F1", alasan: "Hapus lalu tambah lagi", items: [{ barangId: 1, jumlah: 2 }] }), res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(r1.update).toHaveBeenCalledWith({ statusPenjualan: "Batal" }, expect.anything());
    expect(transPenjualanModel.create).toHaveBeenCalledWith(expect.objectContaining({ barangId: 1, jumlah: 2 }), expect.anything());
    // Jumlah total barang sama sebelum & sesudah: stok tidak berubah
    expect(b1.update).not.toHaveBeenCalled();
  });

  it("✅ jejak admin dicatat dalam transaksi yang sama", async () => {
    const r1 = baris({ id: 1, barangId: 1, jumlah: 2, harga: 6000 });
    const b1 = barang(1, 10);
    transPenjualanModel.findAll.mockResolvedValue([r1]);
    barangModel.findByPk.mockImplementation(barangPerId([b1]));

    await editFakturPenjualan(req({ faktur: "F1", alasan: "Qty salah input", items: [{ id: 1, barangId: 1, jumlah: 3 }] }), res);

    expect(jejakAdminModel.create).toHaveBeenCalledWith(
      expect.objectContaining({ aksi: "edit_penjualan", referensi: "F1", alasan: "Qty salah input" }),
      expect.anything(),
    );
  });
});
