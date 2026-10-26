const crypto = require("crypto");
const jejakAdminModel = require("../model/JejakAdminModel.js");

// Aplikasi tanpa login: aksi sensitif dilindungi satu PIN admin (ADMIN_PIN di .env) yang dicek di backend.
// Frontend mengirim PIN & nama operator lewat header X-Admin-Pin dan X-Admin-Operator.

const BATAS_GAGAL = 5;
const LAMA_KUNCI_MS = 5 * 60 * 1000;
const gagalPerIp = new Map(); // ip -> { jumlah, terkunciSampai }

const ipDari = (req) => (req.ip || req.socket?.remoteAddress || "").replace(/^::ffff:/, "");

// Bandingkan lewat hash agar panjang sama dan waktu perbandingan konstan
const pinCocok = (pin) => {
  const benar = crypto.createHash("sha256").update(String(process.env.ADMIN_PIN)).digest();
  const dicoba = crypto.createHash("sha256").update(String(pin)).digest();
  return crypto.timingSafeEqual(benar, dicoba);
};

const terkunci = (ip) => {
  const s = gagalPerIp.get(ip);
  return s && s.terkunciSampai > Date.now() ? Math.ceil((s.terkunciSampai - Date.now()) / 60000) : 0;
};

const catatGagal = (ip) => {
  const s = gagalPerIp.get(ip) || { jumlah: 0, terkunciSampai: 0 };
  s.jumlah += 1;
  if (s.jumlah >= BATAS_GAGAL) {
    s.jumlah = 0;
    s.terkunciSampai = Date.now() + LAMA_KUNCI_MS;
  }
  gagalPerIp.set(ip, s);
};

// Mengembalikan pesan error (string) atau null jika lolos; mengisi req.admin bila lolos
const periksa = (req) => {
  if (!process.env.ADMIN_PIN) {
    return { status: 503, msg: "PIN admin belum diatur di server (ADMIN_PIN pada file .env backend)" };
  }
  const ip = ipDari(req);
  const menit = terkunci(ip);
  if (menit) {
    return { status: 429, msg: `Terlalu banyak PIN salah. Coba lagi dalam ${menit} menit.` };
  }

  const pin = req.get("X-Admin-Pin") || "";
  let operator = "";
  try {
    operator = decodeURIComponent(req.get("X-Admin-Operator") || "").trim();
  } catch {
    operator = "";
  }

  if (!pin || !pinCocok(pin)) {
    catatGagal(ip);
    return { status: 401, msg: "PIN admin salah" };
  }
  if (operator.length < 2) {
    return { status: 400, msg: "Nama operator wajib diisi" };
  }

  gagalPerIp.delete(ip);
  req.admin = { operator: operator.slice(0, 100), ip, perangkat: (req.get("User-Agent") || "").slice(0, 500) };
  return null;
};

const wajibAdmin = (req, res, next) => {
  const gagal = periksa(req);
  if (gagal) return res.status(gagal.status).json({ msg: gagal.msg });
  next();
};

// Dipakai dialog PIN di frontend sebelum menyimpan sesi admin
const verifikasiAdmin = (req, res) => {
  const gagal = periksa(req);
  if (gagal) return res.status(gagal.status).json({ msg: gagal.msg });
  res.status(200).json({ msg: "PIN benar", operator: req.admin.operator });
};

// Simpan jejak aksi sensitif (ikut DB transaction pemanggil bila ada)
const catatJejak = (req, { aksi, referensi, alasan, detail }, transaction) =>
  jejakAdminModel.create(
    {
      aksi,
      referensi: referensi !== undefined && referensi !== null ? String(referensi) : null,
      operator: req.admin?.operator || "-",
      ip: req.admin?.ip || ipDari(req),
      perangkat: req.admin?.perangkat || null,
      alasan: alasan || null,
      detail: detail ? JSON.stringify(detail) : null,
    },
    transaction ? { transaction } : undefined
  );

module.exports = { wajibAdmin, verifikasiAdmin, catatJejak };
