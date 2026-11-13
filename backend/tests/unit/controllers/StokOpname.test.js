/**
 * Unit Test untuk StokOpname Controller
 *
 * Test Coverage:
 * - Mulai / lanjutkan / tolak bila bulan ini sudah final
 * - Buat ulang mengosongkan hitungan
 * - Simpan item (set & tambah via scan), tolak sesi non-draft / bulan lalu
 * - Template tanpa stok sistem
 * - Import Excel: baris kosong dilewati, galat dilaporkan
 * - Finalisasi memakai stok terkini, selisih 0 tidak dicatat
 */

const mockT = { LOCK: { UPDATE: "UPDATE" } };
jest.mock("../../../src/config/database.js", () => ({ query: jest.fn(), transaction: jest.fn((cb) => cb(mockT)) }));
jest.mock("../../../src/model/BarangModel.js", () => ({ findByPk: jest.fn(), findAll: jest.fn() }));
jest.mock("../../../src/model/StokOpnameModel.js", () => ({ findByPk: jest.fn(), findOne: jest.fn(), create: jest.fn() }));
jest.mock("../../../src/model/StokOpnameDetailModel.js", () => ({ findOne: jest.fn(), findAll: jest.fn(), create: jest.fn(), destroy: jest.fn() }));
jest.mock("../../../src/model/BarangArsipModel.js", () => ({ filterArsip: jest.fn(() => ({ arsip: "aktif" })) }));
jest.mock("../../../src/controllers/Barang.js", () => ({ terapkanPenyesuaian: jest.fn() }));
jest.mock("../../../src/middleware/adminPin.js", () => ({ catatJejak: jest.fn() }));

const barangModel = require("../../../src/model/BarangModel.js");
const stokOpnameModel = require("../../../src/model/StokOpnameModel.js");
const detailModel = require("../../../src/model/StokOpnameDetailModel.js");
const { terapkanPenyesuaian } = require("../../../src/controllers/Barang.js");
const { catatJejak } = require("../../../src/middleware/adminPin.js");
const ctrl = require("../../../src/controllers/StokOpname.js");

const PERIODE = ctrl.periodeSekarang();

const buatRes = () => ({ status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() });
const sesi = (data = {}) => ({
  id: 1,
  periode: PERIODE,
  nomor: `SO-${PERIODE.replace("-", "")}`,
  status: "draft",
  update: jest.fn(),
  save: jest.fn(),
  changed: jest.fn(),
  ...data,
});

beforeEach(() => jest.clearAllMocks());

describe("periodeSekarang", () => {
  it("✅ memakai zona +07:00", () => {
    // 31 Jan 2026 18:00 UTC = 1 Feb 2026 01:00 WIB
    expect(ctrl.periodeSekarang(Date.UTC(2026, 0, 31, 18))).toBe("2026-02");
  });
});

describe("mulai", () => {
  it("❌ nama petugas wajib", async () => {
    const res = buatRes();
    await ctrl.mulai({ body: { petugas: " " } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("✅ membuat draft baru bila belum ada", async () => {
    stokOpnameModel.findOne.mockResolvedValue(null);
    stokOpnameModel.create.mockResolvedValue(sesi());
    const res = buatRes();
    await ctrl.mulai({ body: { petugas: "Budi" } }, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(stokOpnameModel.create).toHaveBeenCalledWith(expect.objectContaining({ periode: PERIODE, status: "draft", petugas: "Budi" }));
  });

  it("✅ melanjutkan draft yang sudah ada", async () => {
    stokOpnameModel.findOne.mockResolvedValue(sesi());
    const res = buatRes();
    await ctrl.mulai({ body: { petugas: "Budi" } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json.mock.calls[0][0].baru).toBe(false);
    expect(stokOpnameModel.create).not.toHaveBeenCalled();
  });

  it("❌ menolak bila bulan ini sudah final", async () => {
    stokOpnameModel.findOne.mockResolvedValue(sesi({ status: "final" }));
    const res = buatRes();
    await ctrl.mulai({ body: { petugas: "Budi" } }, res);
    expect(res.status).toHaveBeenCalledWith(409);
  });
});

describe("buatUlang", () => {
  it("✅ menghapus semua hitungan draft", async () => {
    const op = sesi();
    stokOpnameModel.findByPk.mockResolvedValue(op);
    detailModel.destroy.mockResolvedValue(4);
    const res = buatRes();
    await ctrl.buatUlang({ params: { id: "1" }, body: {} }, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(detailModel.destroy).toHaveBeenCalledWith(expect.objectContaining({ where: { opnameId: 1 } }));
  });

  it("❌ menolak sesi final", async () => {
    stokOpnameModel.findByPk.mockResolvedValue(sesi({ status: "final" }));
    const res = buatRes();
    await ctrl.buatUlang({ params: { id: "1" }, body: {} }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(detailModel.destroy).not.toHaveBeenCalled();
  });
});

describe("simpanItem", () => {
  const barang = { id: 5, nama: "Kopi", kodeBarang: "899" };

  it("✅ scan menambah hitungan yang ada", async () => {
    stokOpnameModel.findByPk.mockResolvedValue(sesi());
    barangModel.findByPk.mockResolvedValue(barang);
    const ada = { stokFisik: 3, update: jest.fn() };
    detailModel.findOne.mockResolvedValue(ada);
    const res = buatRes();
    await ctrl.simpanItem({ params: { id: "1" }, body: { barangId: 5, tambah: true } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(ada.update).toHaveBeenCalledWith(expect.objectContaining({ stokFisik: 4 }), expect.anything());
  });

  it("✅ set stok fisik membuat baris baru", async () => {
    stokOpnameModel.findByPk.mockResolvedValue(sesi());
    barangModel.findByPk.mockResolvedValue(barang);
    detailModel.findOne.mockResolvedValue(null);
    detailModel.create.mockResolvedValue({ id: 9 });
    const res = buatRes();
    await ctrl.simpanItem({ params: { id: "1" }, body: { barangId: 5, stokFisik: "12" } }, res);
    expect(detailModel.create).toHaveBeenCalledWith(expect.objectContaining({ opnameId: 1, barangId: 5, stokFisik: 12, namaBarang: "Kopi" }), expect.anything());
  });

  it("❌ stok fisik negatif ditolak", async () => {
    const res = buatRes();
    await ctrl.simpanItem({ params: { id: "1" }, body: { barangId: 5, stokFisik: -2 } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("❌ draft bulan lalu tidak bisa diubah", async () => {
    stokOpnameModel.findByPk.mockResolvedValue(sesi({ periode: "2000-01" }));
    const res = buatRes();
    await ctrl.simpanItem({ params: { id: "1" }, body: { barangId: 5, stokFisik: 1 } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});

describe("template", () => {
  it("✅ hanya barang aktif dan tanpa kolom jumlah", async () => {
    barangModel.findAll.mockResolvedValue([]);
    const res = buatRes();
    await ctrl.template({ query: { jenisBarang: "Minuman" } }, res);
    const opsi = barangModel.findAll.mock.calls[0][0];
    expect(opsi.attributes).not.toContain("jumlah");
    expect(opsi.where).toMatchObject({ arsip: "aktif", jenisBarang: "Minuman" });
  });
});

describe("importItem", () => {
  it("✅ melewati baris kosong, melaporkan galat, menyimpan sisanya", async () => {
    stokOpnameModel.findByPk.mockResolvedValue(sesi());
    barangModel.findAll.mockResolvedValue([{ id: 1, nama: "A", kodeBarang: "1" }]);
    detailModel.findOne.mockResolvedValue(null);
    const res = buatRes();
    await ctrl.importItem(
      {
        params: { id: "1" },
        body: {
          items: [
            { baris: 3, barangId: 1, stokFisik: 7 },
            { baris: 4, barangId: 2, stokFisik: "" },
            { baris: 5, barangId: 3, stokFisik: -1 },
            { baris: 6, barangId: 4, stokFisik: 2 },
          ],
        },
      },
      res,
    );
    const data = res.json.mock.calls[0][0];
    expect(res.status).toHaveBeenCalledWith(200);
    expect(data.disimpan).toBe(1);
    expect(data.dilewati).toBe(1);
    expect(data.galat.map((g) => g.baris)).toEqual([5, 6]);
    expect(detailModel.create).toHaveBeenCalledTimes(1);
  });
});

describe("finalkan", () => {
  it("❌ nama petugas wajib", async () => {
    const res = buatRes();
    await ctrl.finalkan({ params: { id: "1" }, body: {} }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("❌ belum ada barang yang dihitung", async () => {
    stokOpnameModel.findByPk.mockResolvedValue(sesi());
    detailModel.findAll.mockResolvedValue([]);
    const res = buatRes();
    await ctrl.finalkan({ params: { id: "1" }, body: { petugas: "Budi" } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("✅ menerapkan selisih dari stok terkini dan mengunci sesi", async () => {
    const op = sesi();
    stokOpnameModel.findByPk.mockResolvedValue(op);
    const d1 = { barangId: 1, stokFisik: 8, update: jest.fn() };
    const d2 = { barangId: 2, stokFisik: 5, update: jest.fn() };
    const d3 = { barangId: 3, stokFisik: 2, update: jest.fn() };
    detailModel.findAll.mockResolvedValue([d1, d2, d3]);
    barangModel.findByPk.mockImplementation(async (id) => (id === 3 ? null : { id, nama: `B${id}`, kodeBarang: `${id}` }));
    terapkanPenyesuaian
      .mockResolvedValueOnce({ stokAwal: 10, stokBaru: 8, selisih: -2 })
      .mockResolvedValueOnce({ stokAwal: 5, stokBaru: 5, selisih: 0 });

    const res = buatRes();
    await ctrl.finalkan({ params: { id: "1" }, body: { petugas: "Budi" } }, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(barangModel.findByPk).toHaveBeenCalledWith(1, { transaction: mockT, lock: "UPDATE" });
    expect(terapkanPenyesuaian).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }), 8, `Stok Opname ${op.nomor}`, mockT);
    expect(d1.update).toHaveBeenCalledWith(expect.objectContaining({ stokSistem: 10, selisih: -2 }), expect.anything());
    expect(d3.update).toHaveBeenCalledWith(expect.objectContaining({ selisih: 0 }), expect.anything());
    expect(op.update).toHaveBeenCalledWith(expect.objectContaining({ status: "final", petugas: "Budi" }), expect.anything());
    expect(res.json.mock.calls[0][0].ringkasan).toMatchObject({ jumlahItem: 3, disesuaikan: 1, totalMinus: -2, dilewati: 1 });
    expect(catatJejak).toHaveBeenCalledWith(expect.objectContaining({ admin: expect.objectContaining({ operator: "Budi" }) }), expect.objectContaining({ aksi: "stok_opname" }), mockT);
  });
});
