import React, { useEffect, useState } from "react";
import axios from "../../../api/axios";
import { Link } from "react-router-dom";
import convertRupiah from "rupiah-format";
import GrafikBatang from "../../../components/GrafikBatang";

const rupiah = (v) => convertRupiah.convert(v || 0);
const formatTanggal = (v, opsi) => new Date(v).toLocaleDateString("id-ID", opsi);

// Persentase perubahan terhadap periode sebelumnya; null jika periode sebelumnya kosong
const persenPerubahan = (sekarang, sebelum) => (sebelum ? ((sekarang - sebelum) / sebelum) * 100 : null);

const Perubahan = ({ nilai, label }) => {
  if (nilai === null) return <span className="text-muted">Belum ada data {label}</span>;
  const naik = nilai >= 0;
  return (
    <span className={naik ? "text-success" : "text-danger"}>
      <i className={`bi ${naik ? "bi-arrow-up-right" : "bi-arrow-down-right"} me-1`} />
      {naik ? "+" : ""}
      {nilai.toFixed(1)}% <span className="text-muted">vs {label}</span>
    </span>
  );
};

const KpiCard = ({ title, value, icon, color, loading, children }) => (
  <div className="col-12 col-sm-6 col-xl-3">
    <div className="card border-0 shadow-sm h-100 kpi-card">
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <span className="text-muted small text-uppercase fw-semibold me-2">{title}</span>
          <div className={`kpi-icon bg-${color} bg-opacity-10 text-${color}`}>
            <i className={`bi ${icon}`} />
          </div>
        </div>
        {loading ? (
          <div className="placeholder-glow">
            <span className="placeholder col-9 rounded mb-2" style={{ height: "1.8rem" }} />
            <span className="placeholder col-6 rounded" />
          </div>
        ) : (
          <>
            <div className="kpi-value fw-bold text-truncate mb-1">{value}</div>
            <div className="small">{children}</div>
          </>
        )}
      </div>
    </div>
  </div>
);

const CardHeader = ({ title, subtitle, link, linkLabel = "Lihat semua", children }) => (
  <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-3">
    {/* basis 0: subjudul panjang membungkus di dalam, bukan mendorong link ke baris baru */}
    <div style={{ flex: "1 1 0", minWidth: "160px" }}>
      <h6 className="fw-bold mb-0">{title}</h6>
      {subtitle && <small className="text-muted">{subtitle}</small>}
    </div>
    {children}
    {link && (
      <Link to={link} className="small text-decoration-none">
        {linkLabel} <i className="bi bi-chevron-right" />
      </Link>
    )}
  </div>
);

const Kosong = ({ icon = "bi-inbox", text }) => (
  <div className="text-center text-muted py-4">
    <i className={`bi ${icon} fs-2 d-block mb-1`} />
    <small>{text}</small>
  </div>
);

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [periode, setPeriode] = useState("harian");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get("/dashboard");
      setData(res.data);
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.msg || "Gagal memuat data dashboard");
    } finally {
      setLoading(false);
    }
  };

  const penjualan = data?.penjualan;
  const stok = data?.stok;
  const marginLaba = penjualan?.bulanIni.total ? (penjualan.labaBulanIni / penjualan.bulanIni.total) * 100 : 0;

  const dataGrafik =
    periode === "harian"
      ? (data?.grafikHarian || []).map((d) => ({
          ...d,
          label: formatTanggal(d.tanggal, { weekday: "short" }),
          labelPanjang: formatTanggal(d.tanggal, { weekday: "long", day: "numeric", month: "long" }),
        }))
      : (data?.grafikBulanan || []).map((d) => ({
          ...d,
          label: formatTanggal(`${d.bulan}-01`, { month: "short" }),
          labelPanjang: formatTanggal(`${d.bulan}-01`, { month: "long", year: "numeric" }),
        }));
  const totalGrafik = dataGrafik.reduce((sum, d) => sum + d.total, 0);
  const totalMetode = (data?.metodePembayaran || []).reduce((sum, m) => sum + m.total, 0);
  const maksTerlaris = Math.max(...(data?.barangTerlaris || []).map((b) => b.terjual), 1);

  return (
    <main id="main" className="main dashboard-page">
      <div className="pagetitle d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <div>
          <h1 className="fs-2 fw-bold mb-1">Dashboard</h1>
          <p className="text-muted mb-0 small">
            <i className="bi bi-calendar3 me-1" />
            {formatTanggal(new Date(), { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/transPenjualan" className="btn btn-primary btn-sm px-3">
            <i className="bi bi-cart-plus me-1" />
            Transaksi Baru
          </Link>
          <button className="btn btn-outline-secondary btn-sm px-3" onClick={loadData} disabled={loading}>
            <i className={`bi bi-arrow-clockwise me-1 ${loading ? "spin" : ""}`} />
            Muat Ulang
          </button>
        </div>
      </div>

      <section className="section dashboard">
        {error && (
          <div className="alert alert-danger d-flex align-items-center justify-content-between">
            <span>
              <i className="bi bi-exclamation-triangle me-2" />
              {error}
            </span>
            <button className="btn btn-sm btn-outline-danger" onClick={loadData}>
              Coba lagi
            </button>
          </div>
        )}

        {/* KPI */}
        <div className="row g-4 mb-4">
          <KpiCard title="Penjualan Hari Ini" value={rupiah(penjualan?.hariIni.total)} icon="bi-cart-check" color="primary" loading={loading}>
            <div className="mb-1 text-muted">{penjualan?.hariIni.transaksi} transaksi</div>
            <Perubahan nilai={persenPerubahan(penjualan?.hariIni.total, penjualan?.kemarin.total)} label="kemarin" />
          </KpiCard>
          <KpiCard title="Penjualan Bulan Ini" value={rupiah(penjualan?.bulanIni.total)} icon="bi-graph-up-arrow" color="success" loading={loading}>
            <div className="mb-1 text-muted">{penjualan?.bulanIni.transaksi} transaksi</div>
            <Perubahan nilai={persenPerubahan(penjualan?.bulanIni.total, penjualan?.bulanLalu.total)} label="bulan lalu" />
          </KpiCard>
          <KpiCard title="Estimasi Laba Bulan Ini" value={rupiah(penjualan?.labaBulanIni)} icon="bi-piggy-bank" color="info" loading={loading}>
            <div className="mb-1 text-muted">Margin {marginLaba.toFixed(1)}%</div>
            <span className="text-muted">Dari harga beli barang saat ini</span>
          </KpiCard>
          <KpiCard title="Bon Belum Lunas" value={rupiah(data?.bon.total)} icon="bi-journal-text" color="danger" loading={loading}>
            <div className="mb-1 text-muted">{data?.bon.anggota} anggota memiliki bon</div>
            <span className="text-muted">Total piutang berjalan</span>
          </KpiCard>
        </div>

        {/* GRAFIK + METODE PEMBAYARAN */}
        <div className="row g-4 mb-4">
          <div className="col-12 col-lg-8">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-4">
                <CardHeader title="Tren Penjualan" subtitle={loading ? "" : `Total ${rupiah(totalGrafik)} dalam ${periode === "harian" ? "7 hari" : "12 bulan"} terakhir`}>
                  <div className="btn-group btn-group-sm">
                    <button className={`btn ${periode === "harian" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setPeriode("harian")}>
                      7 Hari
                    </button>
                    <button className={`btn ${periode === "bulanan" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setPeriode("bulanan")}>
                      12 Bulan
                    </button>
                  </div>
                </CardHeader>
                {loading ? (
                  <div className="placeholder-glow">
                    <span className="placeholder col-12 rounded" style={{ height: "220px" }} />
                  </div>
                ) : (
                  <GrafikBatang data={dataGrafik.map((d) => ({ ...d, nilai: d.total, info: `${d.transaksi} transaksi` }))} format={rupiah} kosong="Belum ada penjualan pada periode ini" />
                )}
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-4">
                <CardHeader title="Metode Pembayaran" subtitle="Bulan ini" />
                {loading ? (
                  <div className="placeholder-glow">
                    {[1, 2, 3].map((i) => (
                      <span key={i} className="placeholder col-12 rounded mb-3" style={{ height: "2.5rem" }} />
                    ))}
                  </div>
                ) : data?.metodePembayaran.length ? (
                  data.metodePembayaran.map((m) => {
                    const persen = totalMetode ? (m.total * 100) / totalMetode : 0;
                    return (
                      <div key={m.metode} className="mb-3">
                        <div className="d-flex justify-content-between small mb-1">
                          <span className="fw-semibold">{m.metode}</span>
                          <span className="text-muted">{persen.toFixed(0)}%</span>
                        </div>
                        <div className="progress progress-thin mb-1">
                          <div className="progress-bar" style={{ width: `${persen}%` }} />
                        </div>
                        <div className="d-flex justify-content-between small text-muted">
                          <span>{m.transaksi} transaksi</span>
                          <span>{rupiah(m.total)}</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <Kosong icon="bi-wallet2" text="Belum ada penjualan bulan ini" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* TERLARIS + STOK + RINGKASAN */}
        <div className="row g-4 mb-4">
          <div className="col-12 col-md-6 col-xl-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-4">
                <CardHeader title="Barang Terlaris" subtitle="Bulan ini, berdasarkan jumlah terjual" link="/reportPenjualan" />
                {loading ? (
                  <div className="placeholder-glow">
                    {[1, 2, 3, 4].map((i) => (
                      <span key={i} className="placeholder col-12 rounded mb-3" style={{ height: "2rem" }} />
                    ))}
                  </div>
                ) : data?.barangTerlaris.length ? (
                  data.barangTerlaris.map((b, i) => (
                    <div key={b.id} className="d-flex align-items-center gap-3 mb-3">
                      <span className="rank-badge">{i + 1}</span>
                      <div className="flex-grow-1 min-w-0">
                        <div className="d-flex justify-content-between small">
                          <span className="fw-semibold text-truncate me-2">{b.nama}</span>
                          <span className="text-nowrap">{b.terjual} terjual</span>
                        </div>
                        <div className="progress progress-thin my-1">
                          <div className="progress-bar" style={{ width: `${(b.terjual * 100) / maksTerlaris}%` }} />
                        </div>
                        <small className="text-muted">{rupiah(b.total)}</small>
                      </div>
                    </div>
                  ))
                ) : (
                  <Kosong icon="bi-bag" text="Belum ada barang terjual bulan ini" />
                )}
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6 col-xl-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-4">
                <CardHeader title="Stok Perlu Perhatian" subtitle={stok ? `Stok ≤ ${stok.batasStok}` : ""} link="/barang" linkLabel="Kelola" />
                {!loading && stok && (
                  <div className="d-flex gap-2 mb-3">
                    <span className="badge bg-danger bg-opacity-10 text-danger px-3 py-2">
                      <i className="bi bi-x-circle me-1" />
                      {stok.stokHabis} habis
                    </span>
                    <span className="badge bg-warning bg-opacity-25 text-dark px-3 py-2">
                      <i className="bi bi-exclamation-circle me-1" />
                      {stok.stokMenipis} menipis
                    </span>
                  </div>
                )}
                {loading ? (
                  <div className="placeholder-glow">
                    {[1, 2, 3, 4].map((i) => (
                      <span key={i} className="placeholder col-12 rounded mb-3" style={{ height: "1.8rem" }} />
                    ))}
                  </div>
                ) : stok?.listStokMenipis.length ? (
                  <ul className="list-group list-group-flush">
                    {stok.listStokMenipis.map((b) => (
                      <li key={b.id} className="list-group-item px-0 d-flex justify-content-between align-items-center">
                        <span className="text-truncate me-2 small fw-semibold">{b.nama}</span>
                        {b.jumlah <= 0 ? (
                          <span className="badge bg-danger">Habis</span>
                        ) : (
                          <span className="badge bg-warning text-dark">
                            Sisa {b.jumlah} {b.satuan || ""}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <Kosong icon="bi-check-circle" text="Semua stok aman" />
                )}
              </div>
            </div>
          </div>

          <div className="col-12 col-xl-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-4">
                <CardHeader title="Ringkasan Koperasi" />
                {loading ? (
                  <div className="placeholder-glow">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <span key={i} className="placeholder col-12 rounded mb-3" style={{ height: "1.8rem" }} />
                    ))}
                  </div>
                ) : (
                  <ul className="list-group list-group-flush summary-list">
                    {[
                      { icon: "bi-box-seam", color: "primary", label: "Total Barang", value: stok?.totalBarang, link: "/barang" },
                      { icon: "bi-cash-stack", color: "success", label: "Nilai Stok (Waserda)", value: rupiah(stok?.nilaiStok), link: "/reportBarang" },
                      { icon: "bi-truck", color: "secondary", label: "Pembelian Bulan Ini", value: rupiah(data?.pembelianBulanIni.total), link: "/reportPembelian" },
                      { icon: "bi-people", color: "warning", label: "Total Anggota", value: data?.totalAnggota, link: "/anggota" },
                      { icon: "bi-shop", color: "info", label: "Total Supplier", value: data?.totalSupplier, link: "/supplier" },
                    ].map((s) => (
                      <Link key={s.label} to={s.link} className="list-group-item list-group-item-action px-0 d-flex align-items-center gap-3 border-0">
                        <div className={`summary-icon bg-${s.color} bg-opacity-10 text-${s.color}`}>
                          <i className={`bi ${s.icon}`} />
                        </div>
                        <span className="flex-grow-1 small text-muted">{s.label}</span>
                        <span className="fw-bold">{s.value}</span>
                      </Link>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* TRANSAKSI TERAKHIR */}
        <div className="card border-0 shadow-sm">
          <div className="card-body p-4">
            <CardHeader title="Transaksi Terakhir" subtitle="5 faktur penjualan terbaru" link="/reportPenjualan" />
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0 dashboard-table">
                <thead className="table-light">
                  <tr>
                    <th>Faktur</th>
                    <th>Pembeli</th>
                    <th>Waktu</th>
                    <th className="text-center">Item</th>
                    <th className="text-center">Pembayaran</th>
                    <th className="text-end">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="text-center py-4">
                        <div className="spinner-border spinner-border-sm text-primary me-2" />
                        <span className="text-muted">Memuat data...</span>
                      </td>
                    </tr>
                  ) : data?.transaksiTerakhir.length ? (
                    data.transaksiTerakhir.map((t) => (
                      <tr key={t.faktur}>
                        <td className="fw-semibold">{t.faktur}</td>
                        <td>{t.anggota}</td>
                        <td className="text-muted small">{formatTanggal(t.waktu, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</td>
                        <td className="text-center">{t.item}</td>
                        <td className="text-center">
                          <span className={`badge ${t.status === "Bon" ? "bg-danger bg-opacity-10 text-danger" : "bg-light text-dark border"}`}>{t.status === "Bon" ? "Bon (belum lunas)" : t.typePembayaran}</span>
                        </td>
                        <td className="text-end fw-bold">{rupiah(t.total)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6">
                        <Kosong text="Belum ada transaksi" />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        /* Template memberi tiap .card & .pagetitle h1 margin-left -90px; pada grid multi-kolom
           card jadi saling menimpa. Geser satu kali di level halaman, lalu nolkan per elemen. */
        .dashboard-page .card { margin: 0; border-radius: 14px; }
        .dashboard-page .pagetitle h1 { margin-left: 0; }
        @media (min-width: 1200px) {
          .dashboard-page .pagetitle,
          .dashboard-page .section { margin-left: -90px; }
        }
        .kpi-card { transition: transform .2s ease, box-shadow .2s ease; }
        .kpi-card:hover { transform: translateY(-3px); box-shadow: 0 10px 24px rgba(0,0,0,.08) !important; }
        .kpi-icon, .summary-icon {
          flex-shrink: 0;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .kpi-icon { width: 42px; height: 42px; font-size: 1.25rem; }
        .summary-icon { width: 36px; height: 36px; font-size: 1rem; }
        .kpi-value { font-size: 1.5rem; line-height: 1.25; }
        .min-w-0 { min-width: 0; }
        .progress-thin { height: 6px; border-radius: 4px; }
        .rank-badge {
          width: 28px; height: 28px; flex-shrink: 0;
          border-radius: 50%;
          background: var(--bs-light); border: 1px solid var(--bs-border-color);
          display: flex; align-items: center; justify-content: center;
          font-size: .8rem; font-weight: 600;
        }
        .summary-list .list-group-item { padding-top: .6rem; padding-bottom: .6rem; border-radius: 8px; }

        .dashboard-table thead th {
          font-size: .75rem; text-transform: uppercase; letter-spacing: .03em;
          color: #6c757d; white-space: nowrap;
        }
        .dashboard-table td { white-space: nowrap; }
        .spin { display: inline-block; animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </main>
  );
};

export default Dashboard;
