import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../../../api/axios";
import convertRupiah from "rupiah-format";
import ReportShell, { BULAN } from "./ReportShell";
import { exportPdf, exportExcel } from "./exportLaporan";

const COLUMNS = [
  {
    label: "Barang",
    type: "text",
    get: (r) => r.nama,
    render: (r) => (
      <Link to={`/barang/${r.id}`} className="fw-semibold text-decoration-none">
        {r.nama}
      </Link>
    ),
  },
  { label: "Kode", type: "text", get: (r) => r.kodeBarang },
  { label: "Jenis", type: "text", get: (r) => r.jenisBarang },
  { label: "Stok", type: "number", get: (r) => r.jumlah },
  { label: "Harga Beli", type: "rupiah", get: (r) => r.hargaBeli },
  { label: "Harga Jual", type: "rupiah", get: (r) => r.hargaJual },
  { label: "Nilai Stok", type: "rupiah", get: (r) => (parseInt(r.hargaJual) || 0) * (parseInt(r.jumlah) || 0), bold: true },
];

// Laporan stok barang Waserda yang masih tersedia (sama dengan filter lapBarang di backend)
const LaporanStokBarang = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get("/lapBarangDownload")
      .then((res) => setRows(res.data.dataArray || []))
      .catch((err) => {
        console.error(err);
        setError(err.response?.data?.msg || "Gagal memuat laporan");
      })
      .finally(() => setLoading(false));
  }, []);

  const stok = rows.reduce((s, r) => s + (parseInt(r.jumlah) || 0), 0);
  const nilaiJual = rows.reduce((s, r) => s + (parseInt(r.hargaJual) || 0) * (parseInt(r.jumlah) || 0), 0);
  const nilaiBeli = rows.reduce((s, r) => s + (parseInt(r.hargaBeli) || 0) * (parseInt(r.jumlah) || 0), 0);

  const now = new Date();
  const periode = `${now.getDate()} ${BULAN[now.getMonth()]} ${now.getFullYear()}`;

  const summary = [
    { label: "Jenis Barang", value: `${rows.length} barang`, icon: "bi-box-seam", color: "primary" },
    { label: "Total Stok", value: stok.toLocaleString("id-ID"), icon: "bi-stack", color: "info" },
    { label: "Nilai Stok (Harga Jual)", value: convertRupiah.convert(nilaiJual), icon: "bi-tags", color: "success" },
    { label: "Nilai Modal (Harga Beli)", value: convertRupiah.convert(nilaiBeli), icon: "bi-wallet2", color: "warning" },
  ];

  const meta = () => ({
    judul: "Laporan Stok Barang Waserda",
    info: [{ label: "Per tanggal", value: periode }],
    ringkasan: summary.map((s) => ({ label: s.label, value: s.value })),
    columns: COLUMNS,
    rows,
    namaFile: `Laporan Stok Barang ${periode}`,
  });

  return (
    <ReportShell
      title="Laporan Stok Barang"
      subtitle={`Barang Waserda yang masih tersedia per ${periode}`}
      filters={
        <div className="text-muted small">
          <i className="bi bi-info-circle me-1" />
          Menampilkan barang supplier Waserda dengan stok lebih dari 0, diurutkan dari stok terbanyak.
        </div>
      }
      summary={summary}
      columns={COLUMNS}
      rows={rows}
      loading={loading}
      error={error}
      cari={(r, q) => [r.nama, r.kodeBarang].some((v) => (v || "").toLowerCase().includes(q))}
      emptyText="Tidak ada barang dengan stok tersedia"
      onPdf={() => exportPdf(meta())}
      onExcel={() => exportExcel(meta())}
    />
  );
};

export default LaporanStokBarang;
