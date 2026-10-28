// Validasi nama & kode barang: tambah wajib lengkap; ubah parsial (restock pembelian) tetap boleh.
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
  sync: jest.fn(),
  transaction: jest.fn(),
  query: jest.fn(),
  LOCK: { UPDATE: "UPDATE" },
}));

const barangModel = require("../../../src/model/BarangModel");
const { tambahBarang, editBarang } = require("../../../src/controllers/Barang");

const balasan = () => {
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  return res;
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, "error").mockImplementation(() => {});
  barangModel.findOne.mockResolvedValue(null);
  barangModel.update.mockResolvedValue([1]);
  barangModel.create.mockResolvedValue({ id: 7 });
});

afterEach(() => {
  jest.restoreAllMocks();
});

const dataLengkap = { nama: "Teh Uji", kodeBarang: "TEH001", jenisBarang: "Minuman", satuan: "Pcs", hargaBeli: 3000, hargaJual: 4000, supplierId: 1 };

describe("tambahBarang", () => {
  test("data lengkap dan unik diterima", async () => {
    const res = balasan();
    await tambahBarang({ body: dataLengkap }, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(barangModel.create).toHaveBeenCalledWith(expect.objectContaining({ nama: "Teh Uji", kodeBarang: "TEH001" }));
  });

  test("nama kosong ditolak", async () => {
    const res = balasan();
    await tambahBarang({ body: { ...dataLengkap, nama: "   " } }, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ msg: "Nama barang wajib diisi" });
    expect(barangModel.create).not.toHaveBeenCalled();
  });

  test("supplier kosong ditolak", async () => {
    const res = balasan();
    await tambahBarang({ body: { ...dataLengkap, supplierId: "" } }, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ msg: "Supplier wajib diisi" });
  });
});

describe("editBarang", () => {
  test("restock pembelian (hanya jenis & satuan) diterima tanpa mengecek nama", async () => {
    const res = balasan();
    await editBarang({ params: { id: 5 }, body: { jenisBarang: "Makanan", satuan: "Box" } }, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(barangModel.update).toHaveBeenCalled();
  });

  test("nama yang dikirim kosong tetap ditolak", async () => {
    const res = balasan();
    await editBarang({ params: { id: 5 }, body: { nama: "", kodeBarang: "TEH001", supplierId: 1 } }, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ msg: "Nama barang wajib diisi" });
    expect(barangModel.update).not.toHaveBeenCalled();
  });

  test("kode yang sudah dipakai barang lain ditolak", async () => {
    barangModel.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce({ nama: "Barang Lain" });
    const res = balasan();
    await editBarang({ params: { id: 5 }, body: { nama: "Teh Uji", kodeBarang: "DIPAKAI", supplierId: 1 } }, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Kode barang DIPAKAI sudah dipakai barang "Barang Lain"' });
  });
});
