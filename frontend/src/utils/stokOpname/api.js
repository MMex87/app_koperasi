import axios from "../../api/axios";
import { BULAN } from "../../containers/pages/laporan/ReportShell";

// Helper API stok opname (bulanan, tanpa PIN admin)
export const getBulanIni = async () => (await axios.get("/stokOpname/bulanIni")).data;
export const getDaftarOpname = async () => (await axios.get("/stokOpname")).data;
export const getDetailOpname = async (id) => (await axios.get(`/stokOpname/${id}`)).data;
export const getTemplateBarang = async (filter = {}) => (await axios.get("/stokOpname/template", { params: filter })).data;
export const mulaiOpname = async (petugas) => (await axios.post("/stokOpname/mulai", { petugas })).data;
export const buatUlangOpname = async (id, petugas) => (await axios.post(`/stokOpname/${id}/ulang`, { petugas })).data;
export const hapusOpname = async (id) => (await axios.delete(`/stokOpname/${id}`)).data;
export const simpanItemOpname = async (id, data) => (await axios.post(`/stokOpname/${id}/item`, data)).data;
export const hapusItemOpname = async (id, itemId) => (await axios.delete(`/stokOpname/${id}/item/${itemId}`)).data;
export const importItemOpname = async (id, items) => (await axios.post(`/stokOpname/${id}/import`, { items })).data;
export const finalkanOpname = async (id, data) => (await axios.post(`/stokOpname/${id}/final`, data)).data;

export const pesanError = (err, cadangan) => err?.response?.data?.msg || cadangan;

// "2026-11" -> "November 2026"
export const namaPeriode = (periode) => {
  const [tahun, bulan] = String(periode || "").split("-");
  return BULAN[Number(bulan) - 1] ? `${BULAN[Number(bulan) - 1]} ${tahun}` : periode || "-";
};

// Nama petugas terakhir disimpan di browser ini sebagai isian awal (opsional, boleh gagal)
const KUNCI_PETUGAS = "stokOpnamePetugas";
export const petugasTerakhir = () => {
  try {
    return localStorage.getItem(KUNCI_PETUGAS) || "";
  } catch {
    return "";
  }
};
export const ingatPetugas = (nama) => {
  try {
    localStorage.setItem(KUNCI_PETUGAS, nama);
  } catch {
    /* abaikan */
  }
};
