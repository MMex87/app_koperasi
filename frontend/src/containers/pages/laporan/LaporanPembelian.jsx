import { useEffect, useMemo, useState } from "react";
import axios from "../../../api/axios";
import Swal from "sweetalert2";
import convertRupiah from "rupiah-format";
import ReportShell, { BULAN, daftarTahun, hariIni, FilterField } from "./ReportShell";
import { exportPdf, exportExcel, cetakStrukPembelian, formatNilai, batalkanFaktur, bisaDibatalkan } from "./exportLaporan";

// harga transaksi pembelian = harga beli satuan
const COLUMNS = [
  { label: "Waktu", type: "datetime", get: (r) => r.waktuBeli },
  { label: "Faktur", type: "text", get: (r) => r.faktur, bold: true },
  { label: "Supplier", type: "text", get: (r) => r.supplier?.nama },
  { label: "Barang", type: "text", get: (r) => r.barang?.nama },
  { label: "Harga Beli", type: "rupiah", get: (r) => r.harga },
  { label: "Jumlah", type: "number", get: (r) => r.jumlah },
  { label: "Total", type: "rupiah", get: (r) => (parseInt(r.harga) || 0) * (parseInt(r.jumlah) || 0), bold: true },
];

const LaporanPembelian = () => {
  const [periodeMode, setPeriodeMode] = useState("harian");
  const bulanan = periodeMode === "bulanan";
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [suppliers, setSuppliers] = useState([]);

  const [tanggal, setTanggal] = useState(hariIni());
  const [bulan, setBulan] = useState(new Date().getMonth() + 1);
  const [tahun, setTahun] = useState(new Date().getFullYear());
  const [supplier, setSupplier] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    axios.get("/supplier").then((r) => setSuppliers(r.data || []));
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = bulanan
          ? await axios.get("/transPembelianJoinSearchBulan", { params: { supplier, bulan: String(bulan).padStart(2, "0"), tahun, limit: 0 } })
          : await axios.get("/transPembelianJoinSearch", { params: { supplier, date: tanggal, limit: 0 } });
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
  }, [bulanan, tanggal, bulan, tahun, supplier, reload]);

  // Pembelian yang belum disimpan (onProcess) belum menambah stok, jadi tidak dihitung
  const rows = useMemo(() => data.filter((r) => !["onProcess", "Batal"].includes(r.statusPembelian) && r.jumlah > 0), [data]);

  const total = rows.reduce((s, r) => s + (parseInt(r.harga) || 0) * (parseInt(r.jumlah) || 0), 0);
  const nilaiJual = rows.reduce((s, r) => s + (parseInt(r.hargaJual || r.barang?.hargaJual) || 0) * (parseInt(r.jumlah) || 0), 0);
  const item = rows.reduce((s, r) => s + (parseInt(r.jumlah) || 0), 0);
  const faktur = new Set(rows.map((r) => r.faktur)).size;

  const periode = bulanan ? `${BULAN[bulan - 1]} ${tahun}` : formatNilai("date", tanggal);
  const namaSupplier = suppliers.find((s) => String(s.id) === String(supplier))?.nama || "Semua";

  const summary = [
    { label: "Total Pembelian", value: convertRupiah.convert(total), icon: "bi-cash-stack", color: "primary" },
    { label: "Jumlah Faktur", value: `${faktur} faktur`, icon: "bi-receipt", color: "info" },
    { label: "Item Dibeli", value: item.toLocaleString("id-ID"), icon: "bi-box-seam", color: "warning" },
    { label: "Estimasi Nilai Jual", value: convertRupiah.convert(nilaiJual), icon: "bi-tags", color: "success" },
  ];

  const meta = () => ({
    judul: `Laporan Pembelian ${bulanan ? "Bulanan" : "Harian"}`,
    info: [
      { label: bulanan ? "Bulan" : "Tanggal", value: periode },
      { label: "Supplier", value: namaSupplier },
    ],
    ringkasan: summary.map((s) => ({ label: s.label, value: s.value })),
    columns: COLUMNS,
    rows,
    namaFile: `Laporan Pembelian ${periode}`,
  });

  const cetak = async (faktur) => {
    try {
      await cetakStrukPembelian(faktur);
    } catch (err) {
      console.error(err);
      Swal.fire("Gagal", "Nota gagal dicetak", "error");
    }
  };

  return (
    <ReportShell
      title="Laporan Pembelian"
      subtitle={`Periode ${periode}`}
      filters={
        <>
          <FilterField label="Periode" width={170}>
            <div className="btn-group w-100">
              <button type="button" className={`btn ${!bulanan ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setPeriodeMode("harian")}>
                Harian
              </button>
              <button type="button" className={`btn ${bulanan ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setPeriodeMode("bulanan")}>
                Bulanan
              </button>
            </div>
          </FilterField>
          {bulanan ? (
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
          ) : (
            <FilterField label="Tanggal">
              <input type="date" className="form-control" value={tanggal} max={hariIni()} onChange={(e) => setTanggal(e.target.value)} />
            </FilterField>
          )}
          <FilterField label="Supplier">
            <select className="form-select" value={supplier} onChange={(e) => setSupplier(e.target.value)}>
              <option value="">Semua supplier</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
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
      rowAction={(r) => (
        <div className="d-flex gap-1 justify-content-center">
          <button className="btn btn-sm btn-outline-secondary" title="Cetak nota pembelian" onClick={() => cetak(r.faktur)}>
            <i className="bi bi-printer" />
          </button>
          {bisaDibatalkan(r.waktuBeli) && (
            <button className="btn btn-sm btn-outline-danger" title="Batalkan faktur (hanya hari ini)" onClick={async () => (await batalkanFaktur("pembelian", r.faktur)) && setReload((n) => n + 1)}>
              <i className="bi bi-x-octagon" />
            </button>
          )}
        </div>
      )}
      onPdf={() => exportPdf(meta())}
      onExcel={() => exportExcel(meta())}
    />
  );
};

export default LaporanPembelian;
