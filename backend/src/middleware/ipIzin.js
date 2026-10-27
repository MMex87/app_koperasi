// Pembatasan akses berdasarkan IP: hanya IP yang terdaftar di IP_IZIN yang boleh mengakses aplikasi.
// IP_IZIN berisi daftar dipisah koma, mis. "192.168.1.10,192.168.1.0/24,127.0.0.1".
// Jika IP_IZIN kosong, hanya localhost yang diizinkan (agar tidak terkunci total).
// Memakai IP koneksi langsung (bukan X-Forwarded-For), sehingga header dari klien tidak bisa dipalsukan.
const dotenv = require("dotenv");
const { halamanIpDitolak } = require("./halamanIpDitolak.js");
dotenv.config();

const LOCALHOST = ["127.0.0.1", "::1"];

const normalisasi = (ip) => String(ip || "").replace(/^::ffff:/, "");

// IPv4 -> angka 32-bit; null jika bukan IPv4 yang valid
const ipKeAngka = (ip) => {
  const bagian = String(ip).split(".").map(Number);
  if (bagian.length !== 4 || bagian.some((b) => !Number.isInteger(b) || b < 0 || b > 255)) return null;
  return bagian.reduce((acc, b) => acc * 256 + b, 0);
};

const cocok = (ip, aturan) => {
  if (aturan.includes("/")) {
    const [dasar, panjangTeks] = aturan.split("/");
    const panjang = Number(panjangTeks);
    const angkaIp = ipKeAngka(ip);
    const angkaDasar = ipKeAngka(dasar);
    if (angkaIp === null || angkaDasar === null || !Number.isInteger(panjang) || panjang < 0 || panjang > 32) return false;
    const ukuranBlok = 2 ** (32 - panjang);
    return Math.floor(angkaIp / ukuranBlok) === Math.floor(angkaDasar / ukuranBlok);
  }
  return ip === aturan;
};

const daftarIzin = () => {
  const daftar = (process.env.IP_IZIN || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return daftar.length ? daftar : LOCALHOST;
};

const izin = daftarIzin();

const ipIzin = (req, res, next) => {
  const ip = normalisasi(req.socket.remoteAddress);
  if (izin.some((aturan) => cocok(ip, aturan))) return next();

  console.warn(`Akses ditolak dari IP ${ip}`);
  // Browser (minta HTML) dapat halaman penjelasan; API tetap dapat JSON agar frontend bisa menampilkan pesan
  if ((req.headers.accept || "").includes("text/html")) {
    return res.status(403).type("html").send(halamanIpDitolak(ip));
  }
  res.status(403).json({ msg: `Akses ditolak: IP ${ip} tidak terdaftar` });
};

module.exports = { ipIzin, cocok, normalisasi };
