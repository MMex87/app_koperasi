import { useEffect, useMemo, useState } from "react";
import axios from "../../../api/axios";
import convertRupiah from "rupiah-format";
import ReportShell, { hariIni, FilterField } from "./ReportShell";
import { exportPdf, exportExcel, formatNilai } from "./exportLaporan";

const TABS = [
  { to: "/reportAnggota", label: "Anggota" },
  { to: "/reportCustomer", label: "Customer Umum" },
];

// mode "anggota": penjualan ke anggota terdaftar; "customer": penjualan ke pelanggan umum
const LaporanAnggota = ({ mode }) => {
  const customer = mode === "customer";
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tanggal, setTanggal] = useState(hariIni());
  const [pembayaran, setPembayaran] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(customer ? "/transPenjualanJoinSearchCustomer" : "/transPenjualanJoinSearchAnggota", { params: { date: tanggal, limit: 0 } });
        setData(res.data.result || []);
      } catch (err) {
        console.error(err);
        setData([]);
        setError(err.response?.data?.msg || "Gagal memuat laporan");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [customer, tanggal]);

  const rows = useMemo(() => data.filter((r) => !["onProcess", "Batal"].includes(r.statusPenjualan) && r.jumlah > 0 && (!pembayaran || r.typePembayaran === pembayaran)), [data, pembayaran]);

  // harga transaksi penjualan = total baris
  const columns = [
    { label: "Waktu", type: "datetime", get: (r) => r.createdAt },
    { label: "Faktur", type: "text", get: (r) => r.faktur, bold: true },
    ...(customer ? [] : [{ label: "Anggota", type: "text", get: (r) => r.anggota?.nama?.trim() }]),
    { label: "Barang", type: "text", get: (r) => r.barang?.nama },
    { label: "Jumlah", type: "number", get: (r) => r.jumlah },
    { label: "Pembayaran", type: "text", get: (r) => r.typePembayaran },
    { label: "Total", type: "rupiah", get: (r) => r.harga, bold: true },
  ];

  const total = rows.reduce((s, r) => s + (parseInt(r.harga) || 0), 0);
  const faktur = new Set(rows.map((r) => r.faktur)).size;
  const item = rows.reduce((s, r) => s + (parseInt(r.jumlah) || 0), 0);
  const anggotaUnik = new Set(rows.map((r) => r.anggotaId)).size;

  const summary = [
    { label: "Total Penjualan", value: convertRupiah.convert(total), icon: "bi-cash-stack", color: "primary" },
    { label: "Jumlah Transaksi", value: `${faktur} faktur`, icon: "bi-receipt", color: "info" },
    { label: "Item Terjual", value: item.toLocaleString("id-ID"), icon: "bi-box-seam", color: "warning" },
    customer
      ? { label: "Rata-rata / Transaksi", value: convertRupiah.convert(faktur ? Math.round(total / faktur) : 0), icon: "bi-calculator", color: "success" }
      : { label: "Anggota Bertransaksi", value: `${anggotaUnik} orang`, icon: "bi-people", color: "success" },
  ];

  const judul = customer ? "Laporan Penjualan Customer Umum" : "Laporan Penjualan Anggota";
  const periode = formatNilai("date", tanggal);
  const meta = () => ({
    judul,
    info: [
      { label: "Tanggal", value: periode },
      { label: "Pembayaran", value: pembayaran || "Semua" },
    ],
    ringkasan: summary.map((s) => ({ label: s.label, value: s.value })),
    columns,
    rows,
    namaFile: `${judul} ${periode}`,
  });

  return (
    <ReportShell
      title={judul}
      subtitle={customer ? `Penjualan ke pelanggan non-anggota · ${periode}` : `Penjualan ke anggota koperasi · ${periode}`}
      tabs={TABS}
      filters={
        <>
          <FilterField label="Tanggal">
            <input type="date" className="form-control" value={tanggal} max={hariIni()} onChange={(e) => setTanggal(e.target.value)} />
          </FilterField>
          <FilterField label="Pembayaran" width={140}>
            <select className="form-select" value={pembayaran} onChange={(e) => setPembayaran(e.target.value)}>
              <option value="">Semua</option>
              <option value="Tunai">Tunai</option>
              <option value="QRIS">QRIS</option>
              <option value="Bon">Bon</option>
            </select>
          </FilterField>
        </>
      }
      summary={summary}
      columns={columns}
      rows={rows}
      loading={loading}
      error={error}
      cari={(r, q) => [r.faktur, r.barang?.nama, r.anggota?.nama].some((v) => (v || "").toLowerCase().includes(q))}
      onPdf={() => exportPdf(meta())}
      onExcel={() => exportExcel(meta())}
    />
  );
};

export default LaporanAnggota;
