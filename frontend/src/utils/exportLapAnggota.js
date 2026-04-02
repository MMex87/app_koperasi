import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

// format tanggal untuk nama file
const formatTanggalFile = (tanggal) => {
  const date = new Date(tanggal);

  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();

  return `${dd}-${mm}-${yyyy}`;
};

export const exportExcelJS = async (dataAnggotaPdf) => {
  if (!dataAnggotaPdf.length) return;

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Laporan Penjualan");

  // ===== JUDUL =====
  sheet.mergeCells("A1:J1");
  sheet.getCell("A1").value = "LAPORAN PENJUALAN";
  sheet.getCell("A1").font = { size: 16, bold: true };
  sheet.getCell("A1").alignment = { horizontal: "center" };

  sheet.addRow([]);

  // ===== HEADER KOLOM =====
  sheet.columns = [
    { header: "No", key: "no", width: 5 },
    { header: "Faktur", key: "faktur", width: 20 },
    { header: "Tanggal", key: "tanggal", width: 20 },
    { header: "Pembeli", key: "pembeli", width: 25 },
    { header: "Barang", key: "barang", width: 25 },
    { header: "Qty", key: "qty", width: 10 },
    { header: "Harga", key: "harga", width: 15 },
    { header: "Subtotal", key: "subtotal", width: 15 },
    { header: "Pembayaran", key: "bayar", width: 15 },
  ];

  // ===== STYLE HEADER =====
  sheet.getRow(3).font = { bold: true };

  let grandTotal = 0;

  // ===== ISI DATA =====
  dataAnggotaPdf.forEach((item, index) => {
    const subtotal = item.jumlah * item.harga;
    grandTotal += subtotal;

    sheet.addRow({
      no: index + 1,
      faktur: item.faktur,
      tanggal: new Date(item.createdAt).toLocaleString("id-ID"),
      pembeli: item.anggota?.nama?.trim() || "-",
      barang: item.barang?.nama,
      qty: item.jumlah,
      harga: item.harga,
      subtotal: subtotal,
      bayar: item.typePembayaran,
    });
  });

  // ===== FORMAT RUPIAH =====
  sheet.getColumn("harga").numFmt = '"Rp"#,##0';
  sheet.getColumn("subtotal").numFmt = '"Rp"#,##0';

  // ===== GRAND TOTAL =====
  sheet.addRow([]);
  const totalRow = sheet.addRow({
    barang: "TOTAL",
    subtotal: grandTotal,
  });

  totalRow.font = { bold: true };

  // ===== NAMA FILE DARI createdAt =====
  const tanggalFile = formatTanggalFile(dataAnggotaPdf[0].createdAt);
  const namaFile = `Laporan Anggota ${tanggalFile}.xlsx`;

  // ===== DOWNLOAD FILE =====
  const buffer = await workbook.xlsx.writeBuffer();

  saveAs(
    new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    namaFile,
  );
};
