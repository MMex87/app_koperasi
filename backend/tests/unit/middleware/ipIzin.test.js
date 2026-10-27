// Pengaman IP: hanya IP terdaftar di IP_IZIN yang boleh masuk.
const muatMiddleware = (izin) => {
  const sebelumnya = process.env.IP_IZIN;
  if (izin === undefined) delete process.env.IP_IZIN;
  else process.env.IP_IZIN = izin;
  let modul;
  jest.isolateModules(() => {
    modul = require("../../../src/middleware/ipIzin.js");
  });
  process.env.IP_IZIN = sebelumnya;
  if (sebelumnya === undefined) delete process.env.IP_IZIN;
  return modul;
};

const jalankan = (middleware, ip, accept = "application/json") => {
  const req = { socket: { remoteAddress: ip }, headers: { accept } };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), type: jest.fn().mockReturnThis(), send: jest.fn().mockReturnThis() };
  const next = jest.fn();
  middleware(req, res, next);
  return { next, res };
};

beforeEach(() => {
  jest.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("cocok", () => {
  const { cocok, normalisasi } = muatMiddleware("192.168.1.10");

  test("IP tunggal harus sama persis", () => {
    expect(cocok("192.168.1.10", "192.168.1.10")).toBe(true);
    expect(cocok("192.168.1.11", "192.168.1.10")).toBe(false);
  });

  test("CIDR mencocokkan seluruh blok", () => {
    expect(cocok("192.168.1.200", "192.168.1.0/24")).toBe(true);
    expect(cocok("192.168.2.1", "192.168.1.0/24")).toBe(false);
    expect(cocok("10.5.5.5", "10.0.0.0/8")).toBe(true);
    expect(cocok("11.0.0.1", "10.0.0.0/8")).toBe(false);
  });

  test("IPv6 dan input rusak tidak pernah cocok dengan CIDR IPv4", () => {
    expect(cocok("::1", "192.168.1.0/24")).toBe(false);
    expect(cocok("abc", "192.168.1.0/24")).toBe(false);
    expect(cocok("192.168.1.5", "192.168.1.0/33")).toBe(false);
  });

  test("prefix IPv4-mapped IPv6 dibuang", () => {
    expect(normalisasi("::ffff:192.168.1.10")).toBe("192.168.1.10");
    expect(normalisasi(undefined)).toBe("");
  });
});

describe("ipIzin (middleware)", () => {
  test("IP terdaftar diteruskan ke handler berikutnya", () => {
    const { ipIzin } = muatMiddleware("192.168.1.10,10.0.0.0/8");
    const { next, res } = jalankan(ipIzin, "::ffff:192.168.1.10");

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  test("IP di luar daftar ditolak dengan 403", () => {
    const { ipIzin } = muatMiddleware("192.168.1.10");
    const { next, res } = jalankan(ipIzin, "192.168.1.99");

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ msg: "Akses ditolak: IP 192.168.1.99 tidak terdaftar" });
  });

  test("browser yang ditolak mendapat halaman HTML dengan IP-nya", () => {
    const { ipIzin } = muatMiddleware("192.168.1.10");
    const { next, res } = jalankan(ipIzin, "192.168.1.99", "text/html,application/xhtml+xml,*/*");

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.type).toHaveBeenCalledWith("html");
    const html = res.send.mock.calls[0][0];
    expect(html).toContain("Akses Ditolak");
    expect(html).toContain("192.168.1.99");
  });

  test("IP di halaman HTML di-escape agar aman", () => {
    const { escapeHtml } = require("../../../src/middleware/halamanIpDitolak.js");

    expect(escapeHtml('<script>"x"&</script>')).toBe("&lt;script&gt;&quot;x&quot;&amp;&lt;/script&gt;");
  });

  test("IP_IZIN kosong: hanya localhost yang diizinkan", () => {
    const { ipIzin } = muatMiddleware(undefined);

    expect(jalankan(ipIzin, "127.0.0.1").next).toHaveBeenCalledTimes(1);
    expect(jalankan(ipIzin, "::1").next).toHaveBeenCalledTimes(1);
    expect(jalankan(ipIzin, "192.168.1.10").res.status).toHaveBeenCalledWith(403);
  });

  test("spasi di sekitar daftar IP diabaikan", () => {
    const { ipIzin } = muatMiddleware(" 192.168.1.10 , 192.168.2.0/24 ");

    expect(jalankan(ipIzin, "192.168.2.50").next).toHaveBeenCalledTimes(1);
  });
});
