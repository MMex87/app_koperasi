import React, { useEffect, useState } from "react";
import axios from "../../../api/axios";
import ReactPaginate from "react-paginate";
import { Link, useParams } from "react-router-dom";
import convertRupiah from "rupiah-format";

const rupiah = (v) => convertRupiah.convert(v || 0);
const formatWaktu = (v) => (v ? new Date(v).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "-");
const formatTanggal = (v) => (v ? new Date(v).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "-");

// Urutan & tampilan tiap jenis pergerakan stok (key sama dengan backend)
const JENIS = [
  { key: "penjualan", label: "Penjualan", icon: "bi-cart-dash", tanda: "-", warna: "danger" },
  { key: "returPenjualan", label: "Retur Penjualan", icon: "bi-arrow-return-left", tanda: "+", warna: "success" },
  { key: "pembelian", label: "Pembelian", icon: "bi-truck", tanda: "+", warna: "success" },
  { key: "returPembelian", label: "Retur Pembelian", icon: "bi-arrow-return-right", tanda: "-", warna: "danger" },
  // Pembatalan faktur: hanya ditampilkan jika pernah terjadi
  { key: "batalPenjualan", label: "Batal Penjualan", icon: "bi-x-octagon", tanda: "+", warna: "secondary", opsional: true },
  { key: "batalPembelian", label: "Batal Pembelian", icon: "bi-x-octagon", tanda: "-", warna: "secondary", opsional: true },
  { key: "penyesuaianTambah", label: "Penyesuaian (+)", icon: "bi-sliders", tanda: "+", warna: "warning", opsional: true },
  { key: "penyesuaianKurang", label: "Penyesuaian (-)", icon: "bi-sliders", tanda: "-", warna: "warning", opsional: true },
];
const infoJenis = (key) => JENIS.find((j) => j.key === key) || { label: "Lainnya", icon: "bi-question-circle", warna: "secondary" };

const InfoItem = ({ label, children }) => (
  <div className="col-6 col-md-4 col-xl">
    <div className="text-muted small mb-1">{label}</div>
    <div className="fw-bold fs-5 text-truncate">{children}</div>
  </div>
);

export default function DetailBarang() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [jenis, setJenis] = useState("");
  const [page, setPage] = useState(0);
  const [limit] = useState(10);

  useEffect(() => {
    loadDetail();
  }, [id, jenis, page]);

  const loadDetail = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`/barang/${id}/detail`, { params: { page, limit, jenis } });
      setData(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || "Gagal memuat detail barang");
    } finally {
      setLoading(false);
    }
  };

  const gantiJenis = (key) => {
    setJenis(key);
    setPage(0);
  };

  const barang = data?.barang;
  // Jenis opsional (pembatalan) hanya muncul jika barang ini pernah mengalaminya
  const jenisTampil = JENIS.filter((j) => !j.opsional || data?.ringkasan?.[j.key]?.transaksi > 0);
  const marginPersen = barang?.hargaBeli ? ((barang.hargaJual - barang.hargaBeli) / barang.hargaBeli) * 100 : 0;
  const stokHabis = barang && barang.jumlah <= 0;
  const stokMenipis = barang && barang.jumlah > 0 && barang.jumlah <= 10;

  return (
    <main id="main" className="main detail-barang-page">
      <div className="pagetitle d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <div className="d-flex align-items-center gap-3">
          <Link to="/barang" className="btn btn-light btn-sm border" title="Kembali ke Data Barang">
            <i className="bi bi-arrow-left" />
          </Link>
          <div>
            <h1 className="fs-2 fw-bold mb-0">{barang ? barang.nama : "Detail Barang"}</h1>
            <small className="text-muted">
              <Link to="/barang" className="text-decoration-none">
                Data Barang
              </Link>{" "}
              / Detail
            </small>
          </div>
        </div>
        <button className="btn btn-outline-secondary btn-sm px-3" onClick={loadDetail} disabled={loading}>
          <i className="bi bi-arrow-clockwise me-1" />
          Muat Ulang
        </button>
      </div>

      <section className="section">
        {error && (
          <div className="alert alert-danger d-flex align-items-center justify-content-between">
            <span>
              <i className="bi bi-exclamation-triangle me-2" />
              {error}
            </span>
            <Link to="/barang" className="btn btn-sm btn-outline-danger">
              Kembali
            </Link>
          </div>
        )}

        {/* INFO BARANG */}
        {barang && (
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body p-4">
              <div className="d-flex flex-wrap gap-2 mb-4">
                <span className="badge bg-light text-dark border">
                  <i className="bi bi-upc me-1" />
                  {barang.kodeBarang || "-"}
                </span>
                <span className="badge bg-light text-dark border">
                  <i className="bi bi-tag me-1" />
                  {barang.jenisBarang || "-"}
                </span>
                <span className="badge bg-light text-dark border">
                  <i className="bi bi-shop me-1" />
                  {barang.supplier?.nama || "-"}
                </span>
                {data.arsip && (
                  <span className="badge bg-secondary" title={data.arsip.alasan ? `Alasan: ${data.arsip.alasan}` : undefined}>
                    <i className="bi bi-archive me-1" />
                    Diarsipkan
                  </span>
                )}
                {stokHabis && (
                  <span className="badge bg-danger">
                    <i className="bi bi-x-circle me-1" />
                    Stok habis
                  </span>
                )}
                {stokMenipis && (
                  <span className="badge bg-warning text-dark">
                    <i className="bi bi-exclamation-circle me-1" />
                    Stok menipis
                  </span>
                )}
              </div>

              <div className="row g-4">
                <InfoItem label="Stok Saat Ini">
                  {barang.jumlah} <span className="fs-6 fw-normal text-muted">{barang.satuan}</span>
                </InfoItem>
                <InfoItem label="Harga Beli">{rupiah(barang.hargaBeli)}</InfoItem>
                <InfoItem label="Harga Jual">{rupiah(barang.hargaJual)}</InfoItem>
                <InfoItem label="Margin per Unit">
                  {rupiah(barang.hargaJual - barang.hargaBeli)} <span className="fs-6 fw-normal text-muted">({marginPersen.toFixed(1)}%)</span>
                </InfoItem>
                <InfoItem label="Nilai Stok (Harga Jual)">{rupiah(Math.max(barang.jumlah, 0) * barang.hargaJual)}</InfoItem>
              </div>
            </div>
          </div>
        )}

        {/* RINGKASAN PERGERAKAN */}
        {data && (
          <div className="row g-4 mb-4">
            {jenisTampil.map((j) => {
              const r = data.ringkasan[j.key];
              return (
                <div key={j.key} className="col-12 col-sm-6 col-xl-3">
                  <button type="button" className={`card border-0 shadow-sm h-100 w-100 text-start movement-card ${jenis === j.key ? "active" : ""}`} onClick={() => gantiJenis(jenis === j.key ? "" : j.key)} title={`Tampilkan riwayat ${j.label}`}>
                    <div className="card-body p-4 d-flex gap-3">
                      <div className={`movement-icon bg-${j.warna} bg-opacity-10 text-${j.warna}`}>
                        <i className={`bi ${j.icon}`} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-muted small text-uppercase fw-semibold">{j.label}</div>
                        <div className="fs-4 fw-bold">
                          {j.tanda}
                          {r.qty} <span className="fs-6 fw-normal text-muted">{barang?.satuan}</span>
                        </div>
                        <small className="text-muted d-block">{r.transaksi} kali</small>
                        <small className="text-muted d-block text-truncate">Terakhir: {formatTanggal(r.terakhir)}</small>
                      </div>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* RIWAYAT STOK */}
        <div className="card border-0 shadow-sm">
          <div className="card-body p-4">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
              <div>
                <h5 className="fw-bold mb-0">Riwayat Stok</h5>
                <small className="text-muted">Penjualan & retur pembelian mengurangi stok, pembelian & retur penjualan menambah stok</small>
              </div>
              <div className="btn-group btn-group-sm flex-wrap">
                <button className={`btn ${jenis === "" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => gantiJenis("")}>
                  Semua
                </button>
                {jenisTampil.map((j) => (
                  <button key={j.key} className={`btn ${jenis === j.key ? "btn-primary" : "btn-outline-primary"}`} onClick={() => gantiJenis(j.key)}>
                    {j.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0 riwayat-table">
                <thead className="table-light">
                  <tr>
                    <th>Waktu</th>
                    <th>Jenis</th>
                    <th>Faktur / Alasan</th>
                    <th className="text-center">Stok Awal</th>
                    <th className="text-center">Perubahan</th>
                    <th className="text-center">Stok Akhir</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="text-center py-5">
                        <div className="spinner-border spinner-border-sm text-primary me-2" />
                        <span className="text-muted">Memuat data...</span>
                      </td>
                    </tr>
                  ) : !data?.riwayat.length ? (
                    <tr>
                      <td colSpan="6" className="text-center text-muted py-5">
                        <i className="bi bi-clock-history fs-2 d-block mb-1" />
                        Belum ada riwayat stok{jenis ? ` untuk ${infoJenis(jenis).label.toLowerCase()}` : ""}
                      </td>
                    </tr>
                  ) : (
                    data.riwayat.map((r) => {
                      const j = infoJenis(r.jenis);
                      return (
                        <tr key={`${r.keterangan}-${r.id}`}>
                          <td className="text-muted small">{formatWaktu(r.createdAt)}</td>
                          <td>
                            <span className={`badge bg-${j.warna} bg-opacity-10 text-${j.warna}`}>
                              <i className={`bi ${j.icon} me-1`} />
                              {j.label}
                            </span>
                          </td>
                          <td className={r.faktur ? "fw-semibold" : ""} style={r.alasan ? { whiteSpace: "normal", minWidth: "180px" } : undefined}>
                            {r.faktur || (r.alasan ? <span className="fst-italic text-muted">“{r.alasan}”</span> : "-")}
                          </td>
                          <td className="text-center">{r.qty_awal}</td>
                          <td className={`text-center fw-bold text-${r.perubahan < 0 ? "danger" : "success"}`}>
                            {r.perubahan > 0 ? "+" : ""}
                            {r.perubahan}
                          </td>
                          <td className="text-center fw-semibold">{r.qty_baru}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {data?.totalPage > 1 && (
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-3">
                <small className="text-muted">
                  Total <b>{data.totalRows}</b> riwayat — Halaman <b>{page + 1}</b> dari <b>{data.totalPage}</b>
                </small>
                <ReactPaginate
                  previousLabel={"‹"}
                  nextLabel={"›"}
                  pageCount={data.totalPage}
                  forcePage={page}
                  onPageChange={({ selected }) => setPage(selected)}
                  marginPagesDisplayed={1}
                  pageRangeDisplayed={3}
                  containerClassName={"pagination pagination-sm m-0"}
                  pageClassName={"page-item"}
                  pageLinkClassName={"page-link"}
                  previousClassName={"page-item"}
                  previousLinkClassName={"page-link"}
                  nextClassName={"page-item"}
                  nextLinkClassName={"page-link"}
                  breakClassName={"page-item"}
                  breakLinkClassName={"page-link"}
                  activeClassName={"active"}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      <style>{`
        /* Template memberi tiap .card & .pagetitle h1 margin-left -90px; pada grid multi-kolom
           card jadi saling menimpa. Geser satu kali di level halaman, lalu nolkan per elemen. */
        .detail-barang-page .card { margin: 0; border-radius: 14px; }
        .detail-barang-page .pagetitle h1 { margin-left: 0; }
        @media (min-width: 1200px) {
          .detail-barang-page .pagetitle,
          .detail-barang-page .section { margin-left: -90px; }
        }
        .movement-card { transition: transform .2s ease, box-shadow .2s ease; outline: 2px solid transparent; }
        .movement-card:hover { transform: translateY(-3px); box-shadow: 0 10px 24px rgba(0,0,0,.08) !important; }
        .movement-card.active { outline-color: var(--bs-primary); }
        .movement-icon {
          width: 44px; height: 44px; flex-shrink: 0;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.3rem;
        }
        .min-w-0 { min-width: 0; }
        .riwayat-table thead th {
          font-size: .75rem; text-transform: uppercase; letter-spacing: .03em;
          color: #6c757d; white-space: nowrap;
        }
        .riwayat-table td { white-space: nowrap; }
      `}</style>
    </main>
  );
}
