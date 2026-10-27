import { useEffect, useMemo, useState } from "react";
import axios from "../../../api/axios";
import convertRupiah from "rupiah-format";
import ReportShell, { hariIni, FilterField } from "./ReportShell";
import { exportPdf, exportExcel, formatNilai } from "./exportLaporan";

const JENIS_PEMBELI = { "": "Semua pembeli", anggota: "Anggota", customer: "Customer umum" };

// Laporan penjualan per pembeli: anggota terdaftar dan customer umum dalam satu halaman.
// Data diambil dari dua endpoint agar pembagian anggota/customer tetap mengikuti backend (idAnggotaCustomer).
const LaporanAnggota = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tanggal, setTanggal] = useState(hariIni());
  const [pembayaran, setPembayaran] = useState("");
  const [jenis, setJenis] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const params = { params: { date: tanggal, limit: 0 } };
        const [anggota, customer] = await Promise.all([axios.get("/transPenjualanJoinSearchAnggota", params), axios.get("/transPenjualanJoinSearchCustomer", params)]);
        const gabung = [...(anggota.data.result || []).map((r) => ({ ...r, jenisPembeli: "anggota" })), ...(customer.data.result || []).map((r) => ({ ...r, jenisPembeli: "customer" }))];
        setData(gabung.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      } catch (err) {
        console.error(err);
        setData([]);
        setError(err.response?.data?.msg || "Gagal memuat laporan");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [tanggal]);

  const rows = useMemo(
    () => data.filter((r) => !["onProcess", "Batal"].includes(r.statusPenjualan) && r.jumlah > 0 && (!pembayaran || r.typePembayaran === pembayaran) && (!jenis || r.jenisPembeli === jenis)),
    [data, pembayaran, jenis]
  );

  // harga transaksi penjualan = total baris
  const columns = [
    { label: "Waktu", type: "datetime", get: (r) => r.createdAt },
    { label: "Faktur", type: "text", get: (r) => r.faktur, bold: true },
    {
      label: "Pembeli",
      type: "text",
      get: (r) => (r.jenisPembeli === "customer" ? "Customer umum" : r.anggota?.nama?.trim()),
      render: (r) =>
        r.jenisPembeli === "customer" ? (
          <span className="badge bg-light text-dark border">Umum</span>
        ) : (
          <span>
            <i className="bi bi-person-badge text-primary me-1" />
            {r.anggota?.nama?.trim() || "-"}
          </span>
        ),
    },
    { label: "Barang", type: "text", get: (r) => r.barang?.nama },
    { label: "Jumlah", type: "number", get: (r) => r.jumlah },
    { label: "Pembayaran", type: "text", get: (r) => r.typePembayaran },
    { label: "Total", type: "rupiah", get: (r) => r.harga, bold: true },
  ];

  const total = rows.reduce((s, r) => s + (parseInt(r.harga) || 0), 0);
  const totalCustomer = rows.filter((r) => r.jenisPembeli === "customer").reduce((s, r) => s + (parseInt(r.harga) || 0), 0);
  const faktur = new Set(rows.map((r) => r.faktur)).size;
  const anggotaUnik = new Set(rows.filter((r) => r.jenisPembeli === "anggota").map((r) => r.anggotaId)).size;

  const summary = [
    { label: "Total Penjualan", value: convertRupiah.convert(total), icon: "bi-cash-stack", color: "primary" },
    { label: "Jumlah Transaksi", value: `${faktur} faktur`, icon: "bi-receipt", color: "info" },
    { label: "Dari Anggota", value: convertRupiah.convert(total - totalCustomer), icon: "bi-people", color: "success" },
    { label: "Dari Customer Umum", value: convertRupiah.convert(totalCustomer), icon: "bi-person", color: "warning" },
  ];

  const periode = formatNilai("date", tanggal);
  const meta = () => ({
    judul: "Laporan Penjualan Anggota & Customer",
    info: [
      { label: "Tanggal", value: periode },
      { label: "Pembeli", value: JENIS_PEMBELI[jenis] },
      { label: "Pembayaran", value: pembayaran || "Semua" },
    ],
    ringkasan: [...summary.map((s) => ({ label: s.label, value: s.value })), { label: "Anggota Bertransaksi", value: `${anggotaUnik} orang` }],
    columns,
    rows,
    namaFile: `Laporan Anggota & Customer ${periode}`,
  });

  return (
    <ReportShell
      title="Laporan Anggota & Customer"
      subtitle={`Penjualan per pembeli · ${periode} · ${anggotaUnik} anggota bertransaksi`}
      filters={
        <>
          <FilterField label="Tanggal">
            <input type="date" className="form-control" value={tanggal} max={hariIni()} onChange={(e) => setTanggal(e.target.value)} />
          </FilterField>
          <FilterField label="Pembeli" width={170}>
            <select className="form-select" value={jenis} onChange={(e) => setJenis(e.target.value)}>
              {Object.entries(JENIS_PEMBELI).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </FilterField>
          <FilterField label="Pembayaran" width={140}>
            <select className="form-select" value={pembayaran} onChange={(e) => setPembayaran(e.target.value)}>
              <option value="">Semua</option>
              <option value="Tunai">Tunai</option>
              <option value="QRIS">QRIS</option>
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
