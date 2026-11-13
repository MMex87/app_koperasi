import Swal from "sweetalert2";
import { petugasTerakhir, ingatPetugas } from "../../../utils/stokOpname/api";

// Minta nama petugas (isian awal: nama terakhir di browser ini). Mengembalikan nama atau null bila batal.
export const mintaPetugas = async ({ title, text, html, icon, confirmButtonText, confirmButtonColor }) => {
  const { value, isConfirmed } = await Swal.fire({
    icon,
    title,
    text,
    html,
    input: "text",
    inputLabel: "Nama petugas",
    inputValue: petugasTerakhir(),
    inputPlaceholder: "Nama yang melakukan stok opname",
    showCancelButton: true,
    confirmButtonText,
    confirmButtonColor,
    cancelButtonText: "Batal",
    reverseButtons: true,
    inputValidator: (v) => ((v || "").trim().length < 2 ? "Nama petugas wajib diisi" : undefined),
  });
  if (!isConfirmed) return null;
  const nama = value.trim();
  ingatPetugas(nama);
  return nama;
};
