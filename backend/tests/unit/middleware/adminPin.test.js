/**
 * Unit Test untuk middleware PIN admin (pengganti login untuk aksi sensitif)
 */

jest.mock("../../../src/model/JejakAdminModel.js", () => ({ create: jest.fn() }));

const jejakAdminModel = require("../../../src/model/JejakAdminModel.js");
const { wajibAdmin, verifikasiAdmin, catatJejak } = require("../../../src/middleware/adminPin.js");

let ipKe = 0;
const buatReq = (headers = {}, ip) => ({
  ip: ip || `10.0.0.${++ipKe}`,
  get: (h) => headers[h.toLowerCase()],
});
const buatRes = () => ({ status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() });

describe("Middleware adminPin", () => {
  const PIN_ASLI = process.env.ADMIN_PIN;

  beforeEach(() => {
    process.env.ADMIN_PIN = "482913";
    jest.clearAllMocks();
  });

  afterAll(() => {
    process.env.ADMIN_PIN = PIN_ASLI;
  });

  it("✅ meloloskan PIN benar + nama operator, dan mengisi req.admin", () => {
    const req = buatReq({ "x-admin-pin": "482913", "x-admin-operator": encodeURIComponent("Budi Santoso"), "user-agent": "Chrome" });
    const res = buatRes();
    const next = jest.fn();

    wajibAdmin(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.admin).toMatchObject({ operator: "Budi Santoso", perangkat: "Chrome" });
  });

  it("❌ menolak PIN salah (401) dan nama operator kosong (400)", () => {
    const res1 = buatRes();
    wajibAdmin(buatReq({ "x-admin-pin": "000000", "x-admin-operator": "Budi" }), res1, jest.fn());
    expect(res1.status).toHaveBeenCalledWith(401);

    const res2 = buatRes();
    wajibAdmin(buatReq({ "x-admin-pin": "482913" }), res2, jest.fn());
    expect(res2.status).toHaveBeenCalledWith(400);
  });

  it("❌ menolak semua aksi jika ADMIN_PIN belum diatur (503)", () => {
    delete process.env.ADMIN_PIN;
    const res = buatRes();
    const next = jest.fn();
    wajibAdmin(buatReq({ "x-admin-pin": "", "x-admin-operator": "Budi" }), res, next);
    expect(res.status).toHaveBeenCalledWith(503);
    expect(next).not.toHaveBeenCalled();
  });

  it("❌ mengunci IP setelah 5 kali PIN salah, termasuk untuk PIN yang benar (429)", () => {
    const ip = "192.168.1.77";
    for (let i = 0; i < 5; i++) {
      verifikasiAdmin(buatReq({ "x-admin-pin": "salah", "x-admin-operator": "Budi" }, ip), buatRes());
    }
    const res = buatRes();
    verifikasiAdmin(buatReq({ "x-admin-pin": "482913", "x-admin-operator": "Budi" }, ip), res);
    expect(res.status).toHaveBeenCalledWith(429);
  });

  it("✅ catatJejak menyimpan operator, IP, aksi, dan detail", async () => {
    const req = { admin: { operator: "Budi", ip: "10.1.1.1", perangkat: "Chrome" } };
    await catatJejak(req, { aksi: "hapus_barang", referensi: 5, alasan: "Duplikat", detail: { nama: "Kopi" } }, "trx");
    expect(jejakAdminModel.create).toHaveBeenCalledWith(
      expect.objectContaining({ aksi: "hapus_barang", referensi: "5", operator: "Budi", ip: "10.1.1.1", alasan: "Duplikat", detail: JSON.stringify({ nama: "Kopi" }) }),
      { transaction: "trx" }
    );
  });
});
