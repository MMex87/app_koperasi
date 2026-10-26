import Swal from "sweetalert2";
import axios from "../../api/axios";
import { mintaSesiAdmin, jalankanAdmin } from "../adminSession";

const escapeHtml = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const ALASAN_CEPAT = ["Stock opname", "Barang rusak", "Barang kedaluwarsa", "Barang hilang", "Salah input sebelumnya"];

// Dialog penyesuaian stok: stok diset ke jumlah fisik baru, selisih & alasan tercatat di riwayat stok.
// barang: { id, nama, jumlah, satuan }. Mengembalikan true jika stok berhasil disesuaikan.
const sesuaikanStok = async (barang) => {
  // PIN diminta dulu agar operator tidak mengisi form lalu ditolak
  if (!(await mintaSesiAdmin({ keterangan: "Penyesuaian stok memerlukan PIN admin." }))) return false;

  const stokAwal = parseInt(barang.jumlah) || 0;

  const { value, isConfirmed } = await Swal.fire({
    title: "Penyesuaian Stok",
    html: `
      <div class="text-start">
        <div class="bg-light rounded p-2 mb-3 d-flex justify-content-between">
          <span class="fw-semibold">${escapeHtml(barang.nama)}</span>
          <span>Stok sistem: <b>${stokAwal}</b> ${escapeHtml(barang.satuan || "")}</span>
        </div>
        <label class="form-label fw-semibold small mb-1">Stok fisik sebenarnya</label>
        <input id="sw-stok" type="number" min="0" class="form-control mb-1" value="${stokAwal}" />
        <div id="sw-selisih" class="small text-muted mb-3">Belum ada perubahan</div>
        <label class="form-label fw-semibold small mb-1">Alasan penyesuaian</label>
        <div class="d-flex flex-wrap gap-1 mb-2">
          ${ALASAN_CEPAT.map((a) => `<button type="button" class="btn btn-sm btn-outline-secondary sw-alasan">${a}</button>`).join("")}
        </div>
        <textarea id="sw-alasan" class="form-control" rows="2" placeholder="Contoh: stock opname akhir bulan"></textarea>
        <div class="small text-muted mt-2"><i class="bi bi-info-circle me-1"></i>Perubahan tercatat di riwayat stok dan tidak bisa dihapus.</div>
      </div>`,
    showCancelButton: true,
    confirmButtonText: "Simpan Penyesuaian",
    cancelButtonText: "Batal",
    reverseButtons: true,
    focusConfirm: false,
    didOpen: (popup) => {
      const input = popup.querySelector("#sw-stok");
      const info = popup.querySelector("#sw-selisih");
      const alasan = popup.querySelector("#sw-alasan");
      const perbarui = () => {
        const selisih = (parseInt(input.value) || 0) - stokAwal;
        info.className = `small mb-3 ${selisih > 0 ? "text-success" : selisih < 0 ? "text-danger" : "text-muted"}`;
        info.textContent = selisih === 0 ? "Belum ada perubahan" : `Stok ${selisih > 0 ? "bertambah" : "berkurang"} ${Math.abs(selisih)} (${stokAwal} → ${parseInt(input.value) || 0})`;
      };
      input.addEventListener("input", perbarui);
      popup.querySelectorAll(".sw-alasan").forEach((b) =>
        b.addEventListener("click", () => {
          alasan.value = b.textContent;
          alasan.focus();
        })
      );
      input.select();
    },
    preConfirm: () => {
      const stokBaru = Number(document.getElementById("sw-stok").value);
      const alasan = document.getElementById("sw-alasan").value.trim();
      if (!Number.isInteger(stokBaru) || stokBaru < 0) return Swal.showValidationMessage("Stok harus bilangan bulat 0 atau lebih");
      if (stokBaru === stokAwal) return Swal.showValidationMessage("Stok baru sama dengan stok saat ini");
      if (alasan.length < 5) return Swal.showValidationMessage("Alasan wajib diisi (minimal 5 karakter)");
      return { stokBaru, alasan };
    },
  });
  if (!isConfirmed) return false;

  try {
    const res = await jalankanAdmin((headers) => axios.post(`/barang/${barang.id}/penyesuaian`, value, { headers }));
    if (!res) return false;
    Swal.fire({ toast: true, position: "top-end", icon: "success", title: `${res.data.msg}: ${res.data.stokAwal} → ${res.data.stokBaru}`, showConfirmButton: false, timer: 3000 });
    return true;
  } catch (err) {
    console.error(err);
    Swal.fire("Gagal", err.response?.data?.msg || "Stok gagal disesuaikan", "error");
    return false;
  }
};

export default sesuaikanStok;
