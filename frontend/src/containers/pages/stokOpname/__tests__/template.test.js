import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { unduhTemplateExcel, bacaTemplateExcel } from "../template";

jest.mock("file-saver", () => ({ saveAs: jest.fn() }));
jest.mock("../../laporan/exportLaporan", () => ({ NAMA_KOPERASI: "Koperasi Uji" }));
jest.mock("../../../../utils/stokOpname/api", () => ({ namaPeriode: (p) => p }));

const barang = [
  { id: 11, kodeBarang: "8991", nama: "Kopi", jenisBarang: "Minuman", satuan: "pcs" },
  { id: 12, kodeBarang: "(90)AB12", nama: "Teh", jenisBarang: "Minuman", satuan: "pcs" },
  { id: 13, kodeBarang: "777", nama: "Roti", jenisBarang: "Makanan", satuan: "bks" },
];

// Ambil buffer yang dikirim ke saveAs lalu bungkus sebagai objek mirip File
const fileDariSaveAs = async () => {
  const blob = saveAs.mock.calls[0][0];
  const buffer = await new Response(blob).arrayBuffer().catch(async () => {
    // jsdom lama: baca Blob lewat FileReader
    return new Promise((resolve) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.readAsArrayBuffer(blob);
    });
  });
  return { arrayBuffer: async () => buffer };
};

describe("template stok opname (Excel)", () => {
  beforeEach(() => saveAs.mockClear());

  it("tidak memuat stok sistem dan bisa dibaca kembali setelah diisi", async () => {
    await unduhTemplateExcel({ barang, periode: "2026-11" });
    const file = await fileDariSaveAs();

    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(await file.arrayBuffer());
    const sheet = wb.worksheets[0];
    const header = sheet.getRow(6).values.filter(Boolean);
    expect(header).toEqual(["No", "ID", "Kode Barang", "Nama Barang", "Jenis", "Satuan", "Stok Fisik", "Keterangan"]);
    expect(sheet.getColumn(2).hidden).toBe(true);

    // Isi: Kopi 5, Teh kosong, Roti "-1" + keterangan
    sheet.getRow(7).getCell(7).value = 5;
    sheet.getRow(9).getCell(7).value = "-1";
    sheet.getRow(9).getCell(8).value = "rusak";
    const terisi = await wb.xlsx.writeBuffer();

    const hasil = await bacaTemplateExcel({ arrayBuffer: async () => terisi });
    expect(hasil).toEqual([
      { baris: 7, barangId: 11, kodeBarang: "8991", nama: "Kopi", stokFisik: "5", keterangan: "" },
      { baris: 8, barangId: 12, kodeBarang: "(90)AB12", nama: "Teh", stokFisik: "", keterangan: "" },
      { baris: 9, barangId: 13, kodeBarang: "777", nama: "Roti", stokFisik: "-1", keterangan: "rusak" },
    ]);
  });

  it("menolak file tanpa kolom Stok Fisik", async () => {
    const wb = new ExcelJS.Workbook();
    wb.addWorksheet("x").addRow(["Nama", "Harga"]);
    const buf = await wb.xlsx.writeBuffer();
    await expect(bacaTemplateExcel({ arrayBuffer: async () => buf })).rejects.toThrow(/Stok Fisik/);
  });
});
