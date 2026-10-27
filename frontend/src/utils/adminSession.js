import Swal from "sweetalert2";
import axios from "../api/axios";

// Mode admin tanpa login: nama operator + PIN admin dicek ke backend, lalu diingat selama 30 menit
// di sessionStorage (hanya tab ini; tertutup saat tab/browser ditutup). Backend tetap mengecek PIN
// di setiap aksi sensitif, jadi sesi ini hanya agar PIN tidak diminta berulang-ulang.
const KUNCI_SESI = "koperasi_admin_sesi";
const KUNCI_OPERATOR = "koperasi_admin_operator_terakhir";
const DURASI_MS = 30 * 60 * 1000;

// Komponen lain (mis. header) mendengarkan event ini untuk memperbarui status mode admin
export const EVENT_SESI_ADMIN = "koperasi-admin-sesi";
const umumkan = () => window.dispatchEvent(new Event(EVENT_SESI_ADMIN));

export const ambilSesiAdmin = () => {
  try {
    const sesi = JSON.parse(sessionStorage.getItem(KUNCI_SESI));
    if (sesi && sesi.exp > Date.now()) return sesi;
  } catch {
    // storage tidak tersedia/rusak: anggap belum masuk
  }
  return null;
};

export const keluarAdmin = () => {
  try {
    sessionStorage.removeItem(KUNCI_SESI);
  } catch {
    // abaikan
  }
  umumkan();
};

export const headerAdmin = (sesi) => ({ "X-Admin-Pin": sesi.pin, "X-Admin-Operator": encodeURIComponent(sesi.operator) });

const escapeHtml = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// Kembalikan sesi aktif, atau tampilkan dialog nama operator + PIN. null jika dibatalkan.
export const mintaSesiAdmin = async ({ paksa = false, keterangan = "" } = {}) => {
  if (!paksa) {
    const sesi = ambilSesiAdmin();
    if (sesi) return sesi;
  }

  let operatorTerakhir = "";
  try {
    operatorTerakhir = localStorage.getItem(KUNCI_OPERATOR) || "";
  } catch {
    // abaikan
  }

  const { value, isConfirmed } = await Swal.fire({
    title: "Akses Admin",
    html: `
      <div class="text-start">
        ${keterangan ? `<div class="small text-muted mb-3">${escapeHtml(keterangan)}</div>` : ""}
        <label class="form-label fw-semibold small mb-1">Nama operator</label>
        <input id="adm-operator" class="form-control mb-3" placeholder="Nama Anda" value="${escapeHtml(operatorTerakhir)}" />
        <label class="form-label fw-semibold small mb-1">PIN admin</label>
        <input id="adm-pin" type="password" inputmode="numeric" autocomplete="off" class="form-control" placeholder="••••••" />
        <div class="small text-muted mt-2"><i class="bi bi-shield-lock me-1"></i>Nama operator dicatat pada setiap aksi admin.</div>
      </div>`,
    showCancelButton: true,
    confirmButtonText: "Masuk",
    cancelButtonText: "Batal",
    reverseButtons: true,
    focusConfirm: false,
    showLoaderOnConfirm: true,
    didOpen: (popup) => {
      const target = popup.querySelector(operatorTerakhir ? "#adm-pin" : "#adm-operator");
      target.focus();
      popup.querySelector("#adm-pin").addEventListener("keydown", (e) => e.key === "Enter" && Swal.clickConfirm());
    },
    preConfirm: async () => {
      const operator = document.getElementById("adm-operator").value.trim();
      const pin = document.getElementById("adm-pin").value;
      if (operator.length < 2) return Swal.showValidationMessage("Nama operator wajib diisi");
      if (!pin) return Swal.showValidationMessage("PIN wajib diisi");
      try {
        await axios.post("/admin/verifikasi", {}, { headers: headerAdmin({ pin, operator }) });
        return { operator, pin };
      } catch (err) {
        return Swal.showValidationMessage(err.response?.data?.msg || "Gagal memeriksa PIN");
      }
    },
    allowOutsideClick: () => !Swal.isLoading(),
  });
  if (!isConfirmed || !value) return null;

  const sesi = { ...value, exp: Date.now() + DURASI_MS };
  try {
    sessionStorage.setItem(KUNCI_SESI, JSON.stringify(sesi));
    localStorage.setItem(KUNCI_OPERATOR, value.operator);
  } catch {
    // tanpa storage, sesi tetap dipakai untuk aksi ini saja
  }
  umumkan();
  return sesi;
};

// Jalankan request admin dengan header PIN. Jika PIN ditolak (mis. PIN di server diganti),
// sesi dihapus dan dialog diminta ulang satu kali.
export const jalankanAdmin = async (kirim, opsi) => {
  let sesi = await mintaSesiAdmin(opsi);
  if (!sesi) return null;
  try {
    return await kirim(headerAdmin(sesi));
  } catch (err) {
    if (err.response?.status !== 401) throw err;
    keluarAdmin();
    sesi = await mintaSesiAdmin({ paksa: true, keterangan: "PIN tidak lagi berlaku, silakan masukkan ulang." });
    if (!sesi) return null;
    return kirim(headerAdmin(sesi));
  }
};
