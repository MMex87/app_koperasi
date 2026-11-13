import { jsPDF } from "jspdf";
import "jspdf-autotable";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { NAMA_KOPERASI } from "../laporan/exportLaporan";
import { namaPeriode } from "../../../utils/stokOpname/api";

/*
 * Lembar hitung stok opname (template) dalam PDF / Excel.
 * Hitung buta: stok sistem sengaja tidak dicantumkan.
 * Template Excel bisa diisi lalu di-upload kembali; barang dicocokkan lewat kolom ID (tersembunyi),
 * cadangannya Kode Barang.
 */

const JUDUL_KOLOM = {
  no: "No",
  id: "ID",
  kode: "Kode Barang",
  nama: "Nama Barang",
  jenis: "Jenis",
  satuan: "Satuan",
  fisik: "Stok Fisik",
  ket: "Keterangan",
};
const URUTAN = ["no", "id", "kode", "nama", "jenis", "satuan", "fisik", "ket"];

const namaFileTemplate = (periode, ext) => `Template_Stok_Opname_${String(periode).replace("-", "_")}.${ext}`;

export const unduhTemplateExcel = async ({ barang, periode, keteranganFilter }) => {
  const wb = new ExcelJS.Workbook();
  const sheet = wb.addWorksheet("Stok Opname");
  const akhir = String.fromCharCode(64 + URUTAN.length); // H

  sheet.mergeCells(`A1:${akhir}1`);
  sheet.getCell("A1").value = NAMA_KOPERASI;
  sheet.getCell("A1").font = { size: 14, bold: true };
  sheet.getCell("A1").alignment = { horizontal: "center" };
  sheet.mergeCells(`A2:${akhir}2`);
  sheet.getCell("A2").value = `Lembar Stok Opname — ${namaPeriode(periode)}`;
  sheet.getCell("A2").font = { size: 12, bold: true };
  sheet.getCell("A2").alignment = { horizontal: "center" };
  sheet.getCell("A3").value = `Periode: ${periode}${keteranganFilter ? `   ·   Filter: ${keteranganFilter}` : ""}   ·   Jumlah barang: ${barang.length}`;
  sheet.getCell("A4").value = "Isi kolom Stok Fisik (angka bulat ≥ 0). Kosongkan untuk barang yang tidak dihitung. Jangan mengubah kolom ID / Kode Barang.";
  sheet.getCell("A4").font = { italic: true, color: { argb: "FF6C757D" } };

  const barisHeader = 6;
  const header = sheet.getRow(barisHeader);
  header.values = URUTAN.map((k) => JUDUL_KOLOM[k]);
  header.font = { bold: true, color: { argb: "FFFFFFFF" } };
  header.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0D6EFD" } };
    cell.border = { bottom: { style: "thin" } };
  });

  barang.forEach((b, i) => {
    const row = sheet.addRow([i + 1, b.id, b.kodeBarang || "", b.nama || "", b.jenisBarang || "", b.satuan || "", null, null]);
    const fisik = row.getCell(7);
    const ket = row.getCell(8);
    [fisik, ket].forEach((c) => {
      c.protection = { locked: false };
      c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFF8E1" } };
      c.border = { top: { style: "hair" }, bottom: { style: "hair" }, left: { style: "hair" }, right: { style: "hair" } };
    });
    fisik.dataValidation = {
      type: "whole",
      operator: "greaterThanOrEqual",
      formulae: [0],
      allowBlank: true,
      showErrorMessage: true,
      errorTitle: "Stok fisik tidak valid",
      error: "Isi dengan bilangan bulat 0 atau lebih, atau kosongkan.",
    };
  });

  const lebar = { no: 6, id: 8, kode: 20, nama: 40, jenis: 16, satuan: 10, fisik: 12, ket: 28 };
  URUTAN.forEach((k, i) => {
    sheet.getColumn(i + 1).width = lebar[k];
  });
  sheet.getColumn(2).hidden = true; // ID: dipakai saat upload, tidak perlu dilihat petugas
  sheet.getColumn(3).numFmt = "@";
  sheet.views = [{ state: "frozen", ySplit: barisHeader }];

  // Kunci sel selain Stok Fisik & Keterangan (tanpa password) agar ID/kode tidak teredit tak sengaja
  await sheet.protect("", { selectLockedCells: true, selectUnlockedCells: true, formatColumns: true, sort: true, autoFilter: true });

  const buffer = await wb.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), namaFileTemplate(periode, "xlsx"));
};

export const unduhTemplatePdf = ({ barang, periode, keteranganFilter }) => {
  const doc = new jsPDF("p", "pt", "a4");
  const lebar = doc.internal.pageSize.getWidth();
  const tinggi = doc.internal.pageSize.getHeight();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(NAMA_KOPERASI, lebar / 2, 34, { align: "center" });
  doc.setFontSize(12);
  doc.text(`Lembar Stok Opname — ${namaPeriode(periode)}`, lebar / 2, 52, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Petugas: ______________________`, 30, 76);
  doc.text(`Tanggal hitung: ____ / ____ / ________`, lebar - 30, 76, { align: "right" });
  doc.text(`Jumlah barang: ${barang.length}${keteranganFilter ? `   ·   Filter: ${keteranganFilter}` : ""}`, 30, 90);

  doc.autoTable({
    head: [["No", "Kode Barang", "Nama Barang", "Jenis", "Satuan", "Stok Fisik", "Keterangan"]],
    body: barang.map((b, i) => [i + 1, b.kodeBarang || "", b.nama || "", b.jenisBarang || "", b.satuan || "", "", ""]),
    startY: 100,
    styles: { fontSize: 8, cellPadding: 4, minCellHeight: 20, valign: "middle", lineColor: [180, 180, 180], lineWidth: 0.5 },
    headStyles: { fillColor: [13, 110, 253], textColor: 255 },
    theme: "grid",
    columnStyles: {
      0: { cellWidth: 26, halign: "center" },
      1: { cellWidth: 80 },
      3: { cellWidth: 60 },
      4: { cellWidth: 42 },
      5: { cellWidth: 56 },
      6: { cellWidth: 90 },
    },
    margin: { left: 30, right: 30, bottom: 30 },
    didDrawPage: () => {
      doc.setFontSize(8);
      doc.setTextColor(120);
      doc.text(`Dicetak ${new Date().toLocaleString("id-ID")}`, 30, tinggi - 14);
      doc.text(`Halaman ${doc.internal.getNumberOfPages()}`, lebar - 30, tinggi - 14, { align: "right" });
      doc.setTextColor(0);
    },
  });

  // Kolom tanda tangan
  let y = doc.lastAutoTable.finalY + 40;
  if (y + 80 > tinggi - 30) {
    doc.addPage();
    y = 60;
  }
  doc.setFontSize(10);
  const kolomTtd = [
    { x: 90, label: "Petugas Hitung" },
    { x: lebar - 90, label: "Pemeriksa" },
  ];
  kolomTtd.forEach(({ x, label }) => {
    doc.text(label, x, y, { align: "center" });
    doc.text("( ______________________ )", x, y + 60, { align: "center" });
  });

  doc.save(namaFileTemplate(periode, "pdf"));
};

// Nilai sel ExcelJS bisa berupa objek (rumus, rich text, hyperlink)
const nilaiSel = (v) => {
  if (v === null || v === undefined) return "";
  if (typeof v === "object") {
    if (v.result !== undefined) return nilaiSel(v.result);
    if (Array.isArray(v.richText)) return v.richText.map((r) => r.text).join("");
    if (v.text !== undefined) return String(v.text);
    if (v instanceof Date) return v.toISOString();
    return "";
  }
  return v;
};

const normal = (s) => String(s ?? "").trim().toLowerCase();

/*
 * Baca file template Excel yang sudah diisi. Mengembalikan baris yang punya isian Stok Fisik atau Keterangan:
 *   [{ baris, barangId, kodeBarang, nama, stokFisik, keterangan }]
 * Kolom dicari lewat judul header, jadi urutan kolom yang digeser tetap terbaca.
 */
export const bacaTemplateExcel = async (file) => {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(await file.arrayBuffer());
  const sheet = wb.worksheets[0];
  if (!sheet) throw new Error("File Excel kosong");

  let barisHeader = 0;
  const posisi = {};
  sheet.eachRow((row, nomor) => {
    if (barisHeader) return;
    const judul = {};
    row.eachCell((cell, col) => {
      judul[normal(nilaiSel(cell.value))] = col;
    });
    if (judul[normal(JUDUL_KOLOM.fisik)] && (judul[normal(JUDUL_KOLOM.id)] || judul[normal(JUDUL_KOLOM.kode)])) {
      barisHeader = nomor;
      posisi.id = judul[normal(JUDUL_KOLOM.id)];
      posisi.kode = judul[normal(JUDUL_KOLOM.kode)];
      posisi.nama = judul[normal(JUDUL_KOLOM.nama)];
      posisi.fisik = judul[normal(JUDUL_KOLOM.fisik)];
      posisi.ket = judul[normal(JUDUL_KOLOM.ket)];
    }
  });
  if (!barisHeader) throw new Error('Kolom "Stok Fisik" dan "ID"/"Kode Barang" tidak ditemukan. Gunakan template stok opname dari aplikasi.');

  const hasil = [];
  sheet.eachRow((row, nomor) => {
    if (nomor <= barisHeader) return;
    const ambil = (k) => (posisi[k] ? nilaiSel(row.getCell(posisi[k]).value) : "");
    const stokFisik = String(ambil("fisik")).trim();
    const keterangan = String(ambil("ket")).trim();
    const id = String(ambil("id")).trim();
    const kode = String(ambil("kode")).trim();
    if (!id && !kode) return;
    hasil.push({
      baris: nomor,
      barangId: id ? Number(id) : null,
      kodeBarang: kode,
      nama: String(ambil("nama")).trim(),
      stokFisik,
      keterangan,
    });
  });
  return hasil;
};
