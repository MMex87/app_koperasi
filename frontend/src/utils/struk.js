import { jsPDF } from "jspdf";

// Struk thermal lebar 48mm. Tinggi kertas mengikuti jumlah baris agar keranjang panjang tidak terpotong.
const LEBAR = 48;
// Area isi dipersempit: nilai di kanan (mis. "Tunai", "Rp 15.000") terpotong oleh area cetak printer
const MARGIN = 2;
const KANAN = LEBAR - 8;
const TENGAH = (MARGIN + KANAN) / 2;
const BARIS = 3.2;

// Batas tata letak (mm), diekspor agar bisa diuji
export const TATA_LETAK = { LEBAR, MARGIN, KANAN, TENGAH };

const angka = (v) => (Number(v) || 0).toLocaleString("id-ID");
const rupiah = (v) => `Rp ${angka(v)}`;

export const formatTanggalStruk = (v) =>
  new Date(v || Date.now()).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

/*
 * items: [{ nama, qty, harga (satuan), subtotal }]
 * info: [{ label, value }] baris identitas transaksi (faktur, tanggal, pembayaran, dll.)
 * totals: [{ label, value, bold }] baris total di bawah daftar barang
 */
export const buatStruk = ({ judul = "Cafe-Wijaya", subjudul = "Koperasi Karyawan Harta Wijaya", jenis, info = [], items = [], totals = [], penutup = "Terima kasih atas kunjungan Anda" }) => {
  // Ukur dulu dengan dokumen sementara untuk menghitung tinggi kertas
  const ukur = new jsPDF("p", "mm", [LEBAR, 100]);
  ukur.setFontSize(6.3);
  const namaBaris = items.map((it) => ukur.splitTextToSize(String(it.nama || "-"), KANAN - MARGIN));
  // Sama persis dengan langkah y di bawah: kop + 4 garis + baris teks + penutup
  const barisTeks = info.length + namaBaris.reduce((s, n) => s + n.length + 1, 0) + totals.length;
  const tinggi = Math.max(40, 5 + 3.4 + 2.8 + (jenis ? 2.8 : 0) + 4 * 2.8 + barisTeks * BARIS + 6);

  const doc = new jsPDF("p", "mm", [LEBAR, tinggi]);
  let y = 5;

  const garis = () => {
    doc.setLineDashPattern([0.8, 0.6], 0);
    doc.setLineWidth(0.15);
    doc.line(MARGIN, y, KANAN, y);
    doc.setLineDashPattern([], 0);
    y += 2.8;
  };
  const kiriKanan = (kiri, kanan, bold = false) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.text(String(kiri), MARGIN, y);
    doc.text(String(kanan), KANAN, y, { align: "right" });
    y += BARIS;
  };

  // Kop
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(judul, TENGAH, y, { align: "center" });
  y += 3.4;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(5.4);
  doc.text(subjudul, TENGAH, y, { align: "center" });
  y += 2.8;
  if (jenis) {
    doc.setFont("helvetica", "bold");
    doc.text(jenis.toUpperCase(), TENGAH, y, { align: "center" });
    y += 3;
  }
  garis();

  // Identitas transaksi
  doc.setFontSize(5.9);
  info.forEach((i) => kiriKanan(i.label, i.value ?? "-"));
  garis();

  // Daftar barang: nama (dibungkus) lalu "qty x harga" ... subtotal
  doc.setFontSize(6.3);
  items.forEach((it, idx) => {
    doc.setFont("helvetica", "bold");
    namaBaris[idx].forEach((b) => {
      doc.text(b, MARGIN, y);
      y += BARIS;
    });
    kiriKanan(`  ${angka(it.qty)} x ${angka(it.harga)}`, angka(it.subtotal));
  });
  garis();

  // Total
  totals.forEach((t) => {
    doc.setFontSize(t.bold ? 7.2 : 6.3);
    kiriKanan(t.label, t.value, t.bold);
  });
  garis();

  doc.setFont("helvetica", "normal");
  doc.setFontSize(5.9);
  doc.text(penutup, TENGAH, y + 0.5, { align: "center" });

  return doc;
};

// Cetak lewat iframe tersembunyi (dialog print browser)
export const cetakStruk = (doc) => {
  doc.autoPrint();
  const iframe = document.createElement("iframe");
  iframe.style.display = "none";
  iframe.src = doc.output("bloburl");
  iframe.onload = () => {
    try {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } catch (error) {
      console.error("Gagal mencetak struk:", error);
    }
  };
  document.body.appendChild(iframe);
};

export { rupiah as rupiahStruk };
