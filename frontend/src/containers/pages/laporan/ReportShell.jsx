import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import ReactPaginate from "react-paginate";
import { formatNilai } from "./exportLaporan";

// Kerangka bersama halaman laporan: judul, tab, filter, ringkasan, tabel berpaginasi, dan tombol unduh
const ReportShell = ({ title, subtitle, tabs, filters, summary = [], columns, rows, loading, error, onPdf, onExcel, rowAction, cari, emptyText = "Tidak ada data pada periode ini", pageSize = 10 }) => {
  const [page, setPage] = useState(0);
  const [q, setQ] = useState("");

  const hasil = useMemo(() => (q && cari ? rows.filter((r) => cari(r, q.toLowerCase())) : rows), [rows, q, cari]);
  const pages = Math.ceil(hasil.length / pageSize);
  const tampil = hasil.slice(page * pageSize, page * pageSize + pageSize);

  useEffect(() => {
    setPage(0);
  }, [rows, q]);

  const kosong = !loading && rows.length === 0;

  return (
    <main id="main" className="main app-page">
      <div className="pagetitle d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <div>
          <h1 className="fs-2 fw-bold mb-1">{title}</h1>
          {subtitle && <small className="text-muted">{subtitle}</small>}
        </div>
        <div className="d-flex gap-2">
          {onExcel && (
            <button className="btn btn-outline-success" onClick={onExcel} disabled={loading || kosong}>
              <i className="bi bi-file-earmark-excel me-1" />
              Excel
            </button>
          )}
          {onPdf && (
            <button className="btn btn-danger" onClick={onPdf} disabled={loading || kosong}>
              <i className="bi bi-file-earmark-pdf me-1" />
              Unduh PDF
            </button>
          )}
        </div>
      </div>

      <section className="section">
        {/* FILTER */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-3 d-flex flex-wrap align-items-end gap-3">
            {tabs && (
              <div className="btn-group">
                {tabs.map((t) => (
                  <NavLink key={t.to} to={t.to} end className={({ isActive }) => `btn ${isActive ? "btn-primary" : "btn-outline-primary"}`}>
                    {t.label}
                  </NavLink>
                ))}
              </div>
            )}
            {filters}
          </div>
        </div>

        {error && (
          <div className="alert alert-danger">
            <i className="bi bi-exclamation-triangle me-2" />
            {error}
          </div>
        )}

        {/* RINGKASAN */}
        {summary.length > 0 && (
          <div className="row g-3 mb-4">
            {summary.map((s) => (
              <div key={s.label} className="col-6 col-xl">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body p-3 d-flex align-items-center gap-3">
                    <div className={`form-icon bg-${s.color || "primary"} bg-opacity-10 text-${s.color || "primary"}`} style={{ width: 44, height: 44, fontSize: "1.2rem" }}>
                      <i className={`bi ${s.icon}`} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-muted small">{s.label}</div>
                      {loading ? <span className="placeholder-glow"><span className="placeholder col-8 rounded" /></span> : <div className="fw-bold fs-5 text-truncate">{s.value}</div>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TABEL */}
        <div className="card border-0 shadow-sm">
          <div className="card-body p-4">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
              {cari ? (
                <div className="input-group" style={{ maxWidth: "320px" }}>
                  <span className="input-group-text bg-white">
                    <i className="bi bi-search" />
                  </span>
                  <input type="text" className="form-control" placeholder="Cari di hasil laporan..." value={q} onChange={(e) => setQ(e.target.value)} />
                </div>
              ) : (
                <span />
              )}
              <span className="badge rounded-pill bg-primary bg-opacity-10 text-primary px-3 py-2">{hasil.length} baris</span>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0 data-table">
                <thead className="table-light">
                  <tr>
                    <th className="text-center">No</th>
                    {columns.map((c) => (
                      <th key={c.label} className={c.type === "rupiah" || c.type === "number" ? "text-end" : ""}>
                        {c.label}
                      </th>
                    ))}
                    {rowAction && <th className="text-center">Aksi</th>}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={columns.length + 2} className="text-center py-5">
                        <div className="spinner-border spinner-border-sm text-primary me-2" />
                        <span className="text-muted">Memuat data...</span>
                      </td>
                    </tr>
                  ) : tampil.length === 0 ? (
                    <tr>
                      <td colSpan={columns.length + 2} className="text-center text-muted py-5">
                        <i className="bi bi-inbox fs-1 d-block mb-2" />
                        {q ? `Tidak ada hasil untuk "${q}"` : emptyText}
                      </td>
                    </tr>
                  ) : (
                    tampil.map((row, i) => (
                      <tr key={row.id ?? i}>
                        <td className="text-center text-muted">{page * pageSize + i + 1}</td>
                        {columns.map((c) => (
                          <td key={c.label} className={`${c.type === "rupiah" || c.type === "number" ? "text-end" : ""} ${c.bold ? "fw-semibold" : ""} ${c.type === "datetime" ? "text-muted small" : ""}`}>
                            {c.render ? c.render(row) : formatNilai(c.type, c.get(row))}
                          </td>
                        ))}
                        {rowAction && <td className="text-center">{rowAction(row)}</td>}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {pages > 1 && (
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-3">
                <small className="text-muted">
                  Halaman <b>{page + 1}</b> dari <b>{pages}</b>
                </small>
                <ReactPaginate
                  previousLabel={"‹"}
                  nextLabel={"›"}
                  pageCount={pages}
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
    </main>
  );
};

// Pilihan periode bersama
export const BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
export const daftarTahun = () => {
  const now = new Date().getFullYear();
  return Array.from({ length: 6 }, (_, i) => now - i);
};
export const hariIni = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export const FilterField = ({ label, children, width = 180 }) => (
  <div style={{ minWidth: width }}>
    <label className="form-label small fw-semibold text-muted mb-1">{label}</label>
    {children}
  </div>
);

export default ReportShell;
