import Swal from "sweetalert2";
import axios from "../../api/axios";
import { mintaSesiAdmin, jalankanAdmin } from "../adminSession";

const ALASAN_CEPAT = ["Tidak dijual lagi", "Stok habis lama", "Barang duplikat", "Data salah input"];

// Arsipkan beberapa barang sekaligus (PIN admin + alasan). Hanya barang stok 0 yang bisa diarsip;
// backend menolak jika ada yang masih punya stok. Mengembalikan true jika berhasil.
export const arsipkanBarang = async (daftar) => {
  if (!daftar.length) return false;
  if (!(await mintaSesiAdmin({ keterangan: "Mengarsipkan barang memerlukan PIN admin." }))) return false;

  const contoh = daftar
    .slice(0, 5)
    .map((b) => `<li>${String(b.nama || "(tanpa nama)").replace(/[<>&]/g, "")}</li>`)
    .join("");
  const { value: alasan, isConfirmed } = await Swal.fire({
    icon: "question",
    title: `Arsipkan ${daftar.length} barang?`,
    html: `
      <div class="text-start small">
        <ul class="mb-2">${contoh}${daftar.length > 5 ? `<li>dan ${daftar.length - 5} lainnya</li>` : ""}</ul>
        Barang arsip tidak muncul di kasir & daftar barang, tetapi riwayat dan laporannya tetap ada.
        Barang otomatis aktif lagi jika stoknya bertambah (pembelian, penyesuaian, retur).
        <div class="d-flex flex-wrap gap-1 mt-3">
          ${ALASAN_CEPAT.map((a) => `<button type="button" class="btn btn-sm btn-outline-secondary ar-alasan">${a}</button>`).join("")}
        </div>
      </div>`,
    input: "text",
    inputPlaceholder: "Alasan arsip",
    showCancelButton: true,
    confirmButtonText: "Arsipkan",
    cancelButtonText: "Batal",
    reverseButtons: true,
    didOpen: (popup) => {
      popup.querySelectorAll(".ar-alasan").forEach((b) => b.addEventListener("click", () => (Swal.getInput().value = b.textContent)));
    },
    inputValidator: (v) => ((v || "").trim().length < 5 ? "Alasan wajib diisi (minimal 5 karakter)" : undefined),
  });
  if (!isConfirmed) return false;

  try {
    const res = await jalankanAdmin((headers) => axios.post("/barang-arsip", { ids: daftar.map((b) => b.id), alasan: alasan.trim() }, { headers }));
    if (!res) return false;
    Swal.fire({ toast: true, position: "top-end", icon: "success", title: res.data.msg, showConfirmButton: false, timer: 3000 });
    return true;
  } catch (err) {
    console.error(err);
    Swal.fire("Gagal", err.response?.data?.msg || "Barang gagal diarsipkan", "error");
    return false;
  }
};

// Keluarkan barang dari arsip (PIN admin). Mengembalikan true jika berhasil.
export const aktifkanBarang = async (barang) => {
  try {
    const res = await jalankanAdmin((headers) => axios.post(`/barang/${barang.id}/aktifkan`, {}, { headers }), { keterangan: "Mengaktifkan barang memerlukan PIN admin." });
    if (!res) return false;
    Swal.fire({ toast: true, position: "top-end", icon: "success", title: res.data.msg, showConfirmButton: false, timer: 3000 });
    return true;
  } catch (err) {
    console.error(err);
    Swal.fire("Gagal", err.response?.data?.msg || "Barang gagal diaktifkan", "error");
    return false;
  }
};
