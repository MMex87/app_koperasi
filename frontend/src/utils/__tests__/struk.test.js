// Struk 48mm: lebar kertas tetap dan isi tidak mepet ke sisi kanan kertas.
import { buatStruk, TATA_LETAK } from "../struk";

const contoh = () =>
  buatStruk({
    jenis: "Penjualan",
    info: [
      { label: "Faktur", value: "FKJ-1" },
      { label: "Tanggal", value: "27 Okt 2026" },
    ],
    items: [{ nama: "Potabee Spicy Sangat Panjang Sekali Namanya", qty: 2, harga: 9000, subtotal: 18000 }],
    totals: [{ label: "TOTAL", value: "Rp 18.000", bold: true }],
  });

test("lebar kertas tetap 48mm dan tinggi mengikuti isi", () => {
  const { width, height } = contoh().internal.pageSize;

  expect(width).toBeCloseTo(48, 1);
  expect(height).toBeGreaterThanOrEqual(40);
});

test("area isi berada di kiri: sisi kanan kertas menyisakan ruang kosong", () => {
  const { LEBAR, MARGIN, KANAN, TENGAH } = TATA_LETAK;

  expect(MARGIN).toBeGreaterThanOrEqual(0);
  expect(LEBAR - KANAN).toBeGreaterThanOrEqual(3);
  expect(TENGAH).toBeCloseTo((MARGIN + KANAN) / 2, 5);
});
