import { useEffect, useMemo, useState } from "react";
import convertRupiah from "rupiah-format";
import getReturLaporan from "../../../utils/laporan/getReturLaporan";
import getSupplier from "../../../utils/supplier/getSupplier";
import ReportShell, { BULAN, daftarTahun, hariIni, FilterField } from "./ReportShell";
import { exportPdf, exportExcel, formatNilai } from "./exportLaporan";

// Harga beli diambil dari transaksi pembelian asal; jika tidak ada, pakai harga beli barang saat ini
const hargaBeli = (r) => parseInt(r.transPembelian?.harga ?? r.barang?.hargaBeli) || 0;

const COLUMNS = [
  { label: "Waktu Retur", type: "datetime", get: (r) => r.waktuBeli },
  { label: "Faktur", type: "text", get: (r) => r.faktur, bold: true },
  { label: "Supplier", type: "text", get: (r) => r.supplier?.nama },
  { label: "Barang", type: "text", get: (r) => r.barang?.nama },
  { label: "Jumlah Retur", type: "number", get: (r) => r.jumlah },
  { label: "Harga Beli", type: "rupiah", get: hargaBeli },
  { label: "Nilai Retur", type: "rupiah", get: (r) => hargaBeli(r) * (parseInt(r.jumlah) || 0), bold: true },
];

const pad = (n) => String(n).padStart(2, "0");
const kunciTanggal = (v) => {
  const d = new Date(v);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const tSupplier = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [suppliers, setSuppliers] = useState([]);

  const [periodeMode, setPeriodeMode] = useState("bulanan");
  const [tanggal, setTanggal] = useState(hariIni());
  const [bulan, setBulan] = useState(new Date().getMonth() + 1);
  const [tahun, setTahun] = useState(new Date().getFullYear());
  const [supplier, setSupplier] = useState("");

  useEffect(() => {
    getSupplier().then((d) => setSuppliers(d || []));
  }, []);

  useEffect(() => {
    // Endpoint memfilter berdasarkan nama supplier (LIKE), kosong = semua
    setLoading(true);
    setError("");
    getReturLaporan(encodeURIComponent(supplier))
      .then((d) => setData(d || []))
      .catch((err) => {
        console.error(err);
        setData([]);
        setError(err.response?.data?.msg || "Gagal memuat laporan");
      })
      .finally(() => setLoading(false));
  }, [supplier]);

  const rows = useMemo(
    () =>
      data
        .filter((r) => {
          if (periodeMode === "harian") return kunciTanggal(r.waktuBeli) === tanggal;
          const d = new Date(r.waktuBeli);
          return d.getFullYear() === tahun && d.getMonth() + 1 === bulan;
        })
        .sort((a, b) => new Date(b.waktuBeli) - new Date(a.waktuBeli)),
    [data, periodeMode, tanggal, bulan, tahun]
  );

  const total = rows.reduce((s, r) => s + hargaBeli(r) * (parseInt(r.jumlah) || 0), 0);
  const item = rows.reduce((s, r) => s + (parseInt(r.jumlah) || 0), 0);
  const supplierUnik = new Set(rows.map((r) => r.supplierId)).size;

  const periode = periodeMode === "harian" ? formatNilai("date", tanggal) : `${BULAN[bulan - 1]} ${tahun}`;
  const summary = [
    { label: "Total Nilai Retur", value: convertRupiah.convert(total), icon: "bi-cash-stack", color: "danger" },
    { label: "Jumlah Retur", value: `${rows.length} kali`, icon: "bi-arrow-return-right", color: "info" },
    { label: "Item Diretur", value: item.toLocaleString("id-ID"), icon: "bi-box-seam", color: "warning" },
    { label: "Supplier Terlibat", value: `${supplierUnik} supplier`, icon: "bi-shop", color: "primary" },
  ];

  const meta = () => ({
    judul: "Laporan Retur Pembelian ke Supplier",
    info: [
      { label: "Periode", value: periode },
      { label: "Supplier", value: supplier || "Semua" },
    ],
    ringkasan: summary.map((s) => ({ label: s.label, value: s.value })),
    columns: COLUMNS,
    rows,
    namaFile: `Laporan Retur Supplier ${periode}`,
  });

  return (
    <ReportShell
      title="Laporan Retur ke Supplier"
      subtitle={`Barang yang dikembalikan ke supplier · ${periode}`}
      filters={
        <>
          <FilterField label="Periode" width={150}>
            <div className="btn-group w-100">
              <button type="button" className={`btn ${periodeMode === "harian" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setPeriodeMode("harian")}>
                Harian
              </button>
              <button type="button" className={`btn ${periodeMode === "bulanan" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setPeriodeMode("bulanan")}>
                Bulanan
              </button>
            </div>
          </FilterField>
          {periodeMode === "harian" ? (
            <FilterField label="Tanggal">
              <input type="date" className="form-control" value={tanggal} max={hariIni()} onChange={(e) => setTanggal(e.target.value)} />
            </FilterField>
          ) : (
            <>
              <FilterField label="Bulan" width={150}>
                <select className="form-select" value={bulan} onChange={(e) => setBulan(Number(e.target.value))}>
                  {BULAN.map((b, i) => (
                    <option key={b} value={i + 1}>
                      {b}
                    </option>
                  ))}
                </select>
              </FilterField>
              <FilterField label="Tahun" width={110}>
                <select className="form-select" value={tahun} onChange={(e) => setTahun(Number(e.target.value))}>
                  {daftarTahun().map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </FilterField>
            </>
          )}
          <FilterField label="Supplier">
            <select className="form-select" value={supplier} onChange={(e) => setSupplier(e.target.value)}>
              <option value="">Semua supplier</option>
              {suppliers
                .filter((s) => s.nama)
                .map((s) => (
                  <option key={s.id} value={s.nama}>
                    {s.nama}
                  </option>
                ))}
            </select>
          </FilterField>
        </>
      }
      summary={summary}
      columns={COLUMNS}
      rows={rows}
      loading={loading}
      error={error}
      cari={(r, q) => [r.faktur, r.barang?.nama, r.supplier?.nama].some((v) => (v || "").toLowerCase().includes(q))}
      emptyText="Tidak ada retur pada periode ini"
      onPdf={() => exportPdf(meta())}
      onExcel={() => exportExcel(meta())}
    />
  );
};

export default tSupplier;
