import { useEffect, useState } from "react";
import axios from "../../../api/axios";
import convertRupiah from "rupiah-format";
import ReportShell, { BULAN, daftarTahun, FilterField } from "./ReportShell";
import { exportPdf, exportExcel } from "./exportLaporan";
import GrafikBatang from "../../../components/GrafikBatang";

const rupiah = (v) => convertRupiah.convert(v || 0);
const warnaNilai = (v) => (v < 0 ? "text-danger" : "");

// Kolom tabel/PDF/Excel. Retur & pembatalan ditampilkan sebagai informasi (penjualan sudah bersih dari retur & batal).
const COLUMNS = [
  { label: "Bulan", type: "text", get: (r) => BULAN[Number(r.bulan.slice(5)) - 1], bold: true },
  { label: "Penjualan", type: "rupiah", get: (r) => r.penjualan },
  { label: "HPP (Modal)", type: "rupiah", get: (r) => r.hpp },
  { label: "Laba Kotor", type: "rupiah", get: (r) => r.labaKotor, render: (r) => <span className={`fw-semibold ${warnaNilai(r.labaKotor)}`}>{rupiah(r.labaKotor)}</span> },
  { label: "Margin (%)", type: "number", get: (r) => r.margin },
  { label: "Rugi Penyesuaian", type: "rupiah", get: (r) => r.kerugianPenyesuaian },
  { label: "Laba Bersih", type: "rupiah", get: (r) => r.labaBersih, bold: true, render: (r) => <span className={`fw-bold ${warnaNilai(r.labaBersih)}`}>{rupiah(r.labaBersih)}</span> },
  { label: "Pembelian", type: "rupiah", get: (r) => r.pembelian },
  { label: "Retur Penjualan", type: "rupiah", get: (r) => r.returPenjualan },
  { label: "Retur Pembelian", type: "rupiah", get: (r) => r.returPembelian },
  { label: "Batal Penjualan", type: "rupiah", get: (r) => r.batalPenjualan },
];

// Laporan laba rugi bulanan (estimasi: HPP memakai harga beli barang saat ini)
const LaporanLabaRugi = () => {
  const [tahun, setTahun] = useState(new Date().getFullYear());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    axios
      .get("/laporan/labaRugi", { params: { tahun } })
      .then((res) => setData(res.data))
      .catch((err) => {
        console.error(err);
        setData(null);
        setError(err.response?.data?.msg || "Gagal memuat laporan laba rugi");
      })
      .finally(() => setLoading(false));
  }, [tahun]);

  const rows = data?.bulan || [];
  const t = data?.total || {};
  // Bulan yang belum terjadi tidak ditampilkan di tabel tahun berjalan
  const sekarang = new Date();
  const rowsTampil = tahun === sekarang.getFullYear() ? rows.slice(0, sekarang.getMonth() + 1) : rows;

  const summary = [
    { label: "Penjualan", value: rupiah(t.penjualan), icon: "bi-cash-stack", color: "primary" },
    { label: `Laba Kotor (${(t.margin || 0).toLocaleString("id-ID")}%)`, value: rupiah(t.labaKotor), icon: "bi-graph-up-arrow", color: (t.labaKotor || 0) < 0 ? "danger" : "success" },
    { label: "Rugi Penyesuaian Stok", value: rupiah(t.kerugianPenyesuaian), icon: "bi-sliders", color: "warning" },
    { label: "Laba Bersih (Estimasi)", value: rupiah(t.labaBersih), icon: "bi-piggy-bank", color: (t.labaBersih || 0) < 0 ? "danger" : "info" },
  ];

  const meta = () => ({
    judul: `Laporan Laba Rugi ${tahun}`,
    info: [
      { label: "Tahun", value: tahun },
      { label: "Catatan", value: "HPP memakai harga beli barang saat ini (estimasi)" },
    ],
    ringkasan: summary.map((s) => ({ label: s.label, value: s.value })),
    columns: COLUMNS,
    rows: rowsTampil,
    namaFile: `Laporan Laba Rugi ${tahun}`,
  });

  return (
    <ReportShell
      title="Laporan Laba Rugi"
      subtitle={`Ringkasan bulanan tahun ${tahun} · angka laba adalah estimasi`}
      filters={
        <>
          <FilterField label="Tahun" width={120}>
            <select className="form-select" value={tahun} onChange={(e) => setTahun(Number(e.target.value))}>
              {daftarTahun().map((th) => (
                <option key={th} value={th}>
                  {th}
                </option>
              ))}
            </select>
          </FilterField>
          <div className="text-muted small ms-auto" style={{ maxWidth: 420 }}>
            <i className="bi bi-info-circle me-1" />
            HPP dihitung dari harga beli barang <b>saat ini</b> (riwayat harga beli tidak tersimpan). Penjualan sudah bersih dari retur & faktur batal.
          </div>
        </>
      }
      summary={summary}
      extra={
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-4">
            <h6 className="fw-bold mb-0">Laba Bersih per Bulan</h6>
            <small className="text-muted d-block mb-3">Batang merah = bulan rugi. Arahkan kursor ke batang untuk detail.</small>
            {loading ? (
              <div className="placeholder-glow">
                <span className="placeholder col-12 rounded" style={{ height: 220 }} />
              </div>
            ) : (
              <GrafikBatang
                data={rows.map((r, i) => ({
                  label: BULAN[i].slice(0, 3),
                  labelPanjang: `${BULAN[i]} ${tahun}`,
                  nilai: r.labaBersih,
                  info: `Penjualan ${rupiah(r.penjualan)} · margin ${r.margin.toLocaleString("id-ID")}%`,
                }))}
                format={rupiah}
                kosong="Belum ada transaksi pada tahun ini"
              />
            )}
          </div>
        </div>
      }
      columns={COLUMNS}
      rows={rowsTampil}
      loading={loading}
      error={error}
      pageSize={12}
      emptyText="Belum ada data pada tahun ini"
      onPdf={() => exportPdf(meta())}
      onExcel={() => exportExcel(meta())}
    />
  );
};

export default LaporanLabaRugi;
