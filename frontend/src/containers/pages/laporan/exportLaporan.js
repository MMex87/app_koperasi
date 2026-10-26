import { jsPDF } from "jspdf";
import "jspdf-autotable";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import convertRupiah from "rupiah-format";
import axios from "../../../api/axios";
import Swal from "sweetalert2";
import { mintaSesiAdmin, jalankanAdmin } from "../../../utils/adminSession";
import { buatStruk, cetakStruk, formatTanggalStruk, rupiahStruk } from "../../../utils/struk";

export const NAMA_KOPERASI = "Koperasi Karyawan Harta Wijaya";

/*
 * Kolom laporan dipakai bersama oleh tabel, PDF, dan Excel:
 *   { label, get: (row) => nilaiMentah, type: "text" | "number" | "rupiah" | "datetime" | "date", align }
 * Tabel/PDF memakai nilai terformat, Excel memakai nilai mentah (angka/tanggal) agar bisa dihitung.
 */
export const formatNilai = (type, v) => {
  if (v === null || v === undefined || v === "") return "-";
  switch (type) {
    case "rupiah":
      return convertRupiah.convert(v);
    case "number":
      return Number(v).toLocaleString("id-ID");
    case "datetime":
      return new Date(v).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
    case "date":
      return new Date(v).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
    default:
      return String(v);
  }
};

const rataKanan = (c) => c.type === "rupiah" || c.type === "number" || c.align === "end";

export const exportPdf = ({ judul, info = [], ringkasan = [], columns, rows, namaFile }) => {
  const doc = new jsPDF("l", "pt", "a4");
  const lebar = doc.internal.pageSize.getWidth();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text(NAMA_KOPERASI, lebar / 2, 32, { align: "center" });
  doc.setFontSize(12);
  doc.text(judul, lebar / 2, 50, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  info.forEach((i, idx) => doc.text(`${i.label}: ${i.value}`, 30, 75 + idx * 14));
  ringkasan.forEach((r, idx) => doc.text(`${r.label}: ${r.value}`, lebar - 30, 75 + idx * 14, { align: "right" }));

  const startY = 85 + Math.max(info.length, ringkasan.length, 1) * 14;
  const columnStyles = {};
  columns.forEach((c, i) => {
    if (rataKanan(c)) columnStyles[i + 1] = { halign: "right" };
  });

  doc.autoTable({
    head: [["No", ...columns.map((c) => c.label)]],
    body: rows.map((row, i) => [i + 1, ...columns.map((c) => formatNilai(c.type, c.get(row)))]),
    startY,
    styles: { fontSize: 9, cellPadding: 4 },
    headStyles: { fillColor: [13, 110, 253] },
    columnStyles,
    margin: { left: 30, right: 30 },
    didDrawPage: () => {
      const tinggi = doc.internal.pageSize.getHeight();
      doc.setFontSize(8);
      doc.setTextColor(120);
      doc.text(`Dicetak ${new Date().toLocaleString("id-ID")}`, 30, tinggi - 15);
      doc.text(`Halaman ${doc.internal.getNumberOfPages()}`, lebar - 30, tinggi - 15, { align: "right" });
      doc.setTextColor(0);
    },
  });

  doc.save(`${namaFile}.pdf`);
};

export const exportExcel = async ({ judul, info = [], ringkasan = [], columns, rows, namaFile }) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Laporan");
  const jumlahKolom = columns.length + 1;
  const kolomAkhir = String.fromCharCode(64 + jumlahKolom);

  sheet.mergeCells(`A1:${kolomAkhir}1`);
  sheet.getCell("A1").value = NAMA_KOPERASI;
  sheet.getCell("A1").font = { size: 14, bold: true };
  sheet.getCell("A1").alignment = { horizontal: "center" };
  sheet.mergeCells(`A2:${kolomAkhir}2`);
  sheet.getCell("A2").value = judul;
  sheet.getCell("A2").font = { size: 12, bold: true };
  sheet.getCell("A2").alignment = { horizontal: "center" };

  [...info, ...ringkasan].forEach((i) => sheet.addRow([`${i.label}:`, i.value]));
  sheet.addRow([]);

  const header = sheet.addRow(["No", ...columns.map((c) => c.label)]);
  header.font = { bold: true, color: { argb: "FFFFFFFF" } };
  header.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0D6EFD" } };
  });

  rows.forEach((row, i) => {
    sheet.addRow([
      i + 1,
      ...columns.map((c) => {
        const v = c.get(row);
        if (c.type === "datetime" || c.type === "date") return v ? new Date(v) : null;
        if (c.type === "rupiah" || c.type === "number") return Number(v) || 0;
        return v ?? "";
      }),
    ]);
  });

  columns.forEach((c, i) => {
    const kolom = sheet.getColumn(i + 2);
    kolom.width = c.type === "text" ? 26 : 18;
    if (c.type === "rupiah") kolom.numFmt = '"Rp" #,##0';
    if (c.type === "datetime") kolom.numFmt = "dd/mm/yyyy hh:mm";
    if (c.type === "date") kolom.numFmt = "dd/mm/yyyy";
  });
  sheet.getColumn(1).width = 6;

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `${namaFile}.xlsx`);
};

// Cetak ulang struk/nota dari laporan memakai tampilan struk yang sama dengan kasir
export const cetakStrukPenjualan = async (faktur) => {
  const { data: transaksi } = await axios.get(`/getTransPenjualanByFaktur/${faktur}`);
  const header = transaksi[0] || {};
  const total = transaksi.reduce((s, v) => s + (parseInt(v.harga) || 0), 0);

  // harga penjualan = total baris
  const doc = buatStruk({
    jenis: "Salinan Struk",
    info: [
      { label: "Faktur", value: faktur },
      { label: "Tanggal", value: formatTanggalStruk(header.waktuJual || header.createdAt) },
      { label: "Pembayaran", value: header.typePembayaran || "-" },
      { label: "Anggota", value: header.anggota?.nama?.trim() || "-" },
    ],
    items: transaksi.map((v) => ({ nama: v.barang?.nama, qty: v.jumlah, harga: Math.round((parseInt(v.harga) || 0) / (v.jumlah || 1)), subtotal: v.harga })),
    totals: [{ label: "TOTAL", value: rupiahStruk(total), bold: true }],
  });
  cetakStruk(doc);
};

export const cetakStrukPembelian = async (faktur) => {
  const { data: transaksi } = await axios.get(`/getTransPembelianByFaktur/${faktur}`);
  const header = transaksi[0] || {};
  const total = transaksi.reduce((s, v) => s + (v.harga || 0) * (v.jumlah || 0), 0);

  // harga pembelian = harga satuan
  const doc = buatStruk({
    jenis: "Nota Pembelian",
    info: [
      { label: "Faktur", value: faktur },
      { label: "Tanggal", value: formatTanggalStruk(header.waktuBeli || header.createdAt) },
      { label: "Supplier", value: header.supplier?.nama || header.barang?.supplier?.nama || "-" },
    ],
    items: transaksi.map((v) => ({ nama: v.barang?.nama, qty: v.jumlah, harga: v.harga, subtotal: (v.harga || 0) * (v.jumlah || 0) })),
    totals: [{ label: "TOTAL", value: rupiahStruk(total), bold: true }],
    penutup: "Barang diterima dengan baik",
  });
  cetakStruk(doc);
};

// Faktur boleh dibatalkan hanya pada hari yang sama (aturan yang sama dicek ulang di backend)
export const bisaDibatalkan = (waktu) => new Date(waktu).toDateString() === new Date().toDateString();

// Dialog pembatalan faktur dengan alasan wajib. Mengembalikan true jika berhasil.
export const batalkanFaktur = async (jenis, faktur) => {
  const pembelian = jenis === "pembelian";
  // PIN diminta dulu agar operator tidak mengisi alasan lalu ditolak
  if (!(await mintaSesiAdmin({ keterangan: "Pembatalan faktur memerlukan PIN admin." }))) return false;
  const { value: alasan, isConfirmed } = await Swal.fire({
    icon: "warning",
    title: `Batalkan faktur ${faktur}?`,
    html:
      '<div class="text-start small">' +
      (pembelian
        ? "Semua barang di faktur ini akan <b>dikurangi dari stok</b> dan pembelian ditandai <b>Batal</b>."
        : "Semua barang di faktur ini akan <b>dikembalikan ke stok</b> dan penjualan ditandai <b>Batal</b>.") +
      "<br/>Data transaksi tetap tersimpan sebagai jejak dan tidak bisa dikembalikan.</div>",
    input: "textarea",
    inputLabel: "Alasan pembatalan",
    inputPlaceholder: "Contoh: salah input jumlah barang",
    showCancelButton: true,
    confirmButtonText: "Batalkan Faktur",
    cancelButtonText: "Tutup",
    confirmButtonColor: "#d33",
    reverseButtons: true,
    inputValidator: (v) => ((v || "").trim().length < 5 ? "Alasan wajib diisi (minimal 5 karakter)" : undefined),
  });
  if (!isConfirmed) return false;

  try {
    const res = await jalankanAdmin((headers) => axios.post(pembelian ? "/batalPembelian" : "/batalPenjualan", { faktur, alasan: alasan.trim() }, { headers }));
    if (!res) return false;
    Swal.fire("Dibatalkan", res.data.msg, "success");
    return true;
  } catch (err) {
    console.error(err);
    Swal.fire("Gagal", err.response?.data?.msg || "Faktur gagal dibatalkan", "error");
    return false;
  }
};
