import { Link } from "react-router-dom";
import convertRupiah from "rupiah-format";

// Tampilan bersama halaman proses retur penjualan & pembelian.
// arahStok: +1 jika retur menambah stok (penjualan), -1 jika mengurangi (pembelian).
const ProsesRetur = ({ title, subtitle, backTo, info, barang, maks, stokSaatIni, arahStok, hargaSatuan, labelNilai, retur, setRetur, onSubmit, submitting, catatan }) => {
  const returInt = parseInt(retur) || 0;
  const valid = returInt > 0 && returInt <= maks;
  const stokSesudah = stokSaatIni + arahStok * returInt;
  const ubah = (v) => setRetur(Math.min(Math.max(v, 0), maks));

  return (
    <main id="main" className="main retur-page">
      <div className="pagetitle d-flex align-items-center gap-3 mb-4">
        <Link to={backTo} className="btn btn-light btn-sm border" title="Kembali">
          <i className="bi bi-arrow-left" />
        </Link>
        <div>
          <h1 className="fs-2 fw-bold mb-0">{title}</h1>
          <small className="text-muted">{subtitle}</small>
        </div>
      </div>

      <section className="section">
        <div className="row g-4">
          {/* INFO TRANSAKSI */}
          <div className="col-lg-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-4">
                <h5 className="fw-bold mb-3">
                  <i className="bi bi-receipt me-2" />
                  Detail Transaksi
                </h5>
                <div className="d-flex align-items-center gap-3 bg-light rounded p-3 mb-3">
                  <div className="retur-icon bg-primary bg-opacity-10 text-primary">
                    <i className="bi bi-box-seam" />
                  </div>
                  <div className="min-w-0">
                    <div className="fw-bold fs-5 text-truncate">{barang.nama}</div>
                    <small className="text-muted">{barang.kodeBarang || "-"}</small>
                  </div>
                </div>
                <dl className="mb-0">
                  {info.map((i) => (
                    <div key={i.label} className="d-flex justify-content-between gap-3 border-bottom py-2">
                      <dt className="fw-normal text-muted">{i.label}</dt>
                      <dd className="fw-semibold mb-0 text-end">{i.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>

          {/* FORM RETUR */}
          <div className="col-lg-6">
            <div className="card border-0 shadow-sm h-100">
              <form className="card-body p-4 d-flex flex-column" onSubmit={onSubmit}>
                <h5 className="fw-bold mb-3">
                  <i className="bi bi-arrow-repeat me-2" />
                  Jumlah Retur
                </h5>

                {maks <= 0 ? (
                  <div className="alert alert-warning mb-0">
                    <i className="bi bi-exclamation-triangle me-2" />
                    {catatan || "Transaksi ini tidak dapat diretur."}
                  </div>
                ) : (
                  <>
                    <div className="input-group input-group-lg mb-2">
                      <button type="button" className="btn btn-outline-secondary" onClick={() => ubah(returInt - 1)} disabled={returInt <= 0}>
                        <i className="bi bi-dash-lg" />
                      </button>
                      <input type="number" min="1" max={maks} className={`form-control text-center fw-bold ${returInt > maks ? "is-invalid" : ""}`} value={retur} onChange={(e) => setRetur(e.target.value === "" ? "" : parseInt(e.target.value) || 0)} autoFocus />
                      <button type="button" className="btn btn-outline-secondary" onClick={() => ubah(returInt + 1)} disabled={returInt >= maks}>
                        <i className="bi bi-plus-lg" />
                      </button>
                      <button type="button" className="btn btn-outline-primary" onClick={() => ubah(maks)}>
                        Semua
                      </button>
                    </div>
                    <small className={returInt > maks ? "text-danger" : "text-muted"}>
                      Maksimal {maks} {barang.satuan || ""}
                      {catatan ? ` · ${catatan}` : ""}
                    </small>

                    <div className="bg-light rounded p-3 mt-3">
                      <div className="d-flex justify-content-between small mb-2">
                        <span className="text-muted">Stok barang</span>
                        <span className="fw-semibold">
                          {stokSaatIni} <i className="bi bi-arrow-right mx-1" />
                          <span className={returInt ? (arahStok > 0 ? "text-success" : "text-danger") : ""}>{valid ? stokSesudah : stokSaatIni}</span>
                          {valid && (
                            <span className={`ms-1 ${arahStok > 0 ? "text-success" : "text-danger"}`}>
                              ({arahStok > 0 ? "+" : "-"}
                              {returInt})
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="text-muted small">{labelNilai}</span>
                        <span className="fs-4 fw-bold text-primary">{convertRupiah.convert(valid ? hargaSatuan * returInt : 0)}</span>
                      </div>
                    </div>
                  </>
                )}

                <div className="d-flex justify-content-end gap-2 mt-auto pt-4">
                  <Link to={backTo} className="btn btn-light border">
                    Batal
                  </Link>
                  <button className="btn btn-success px-4" type="submit" disabled={!valid || submitting}>
                    {submitting ? <span className="spinner-border spinner-border-sm me-2" /> : <i className="bi bi-check-lg me-2" />}
                    Proses Retur
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        /* Template memberi tiap .card & .pagetitle h1 margin-left -90px; pada grid multi-kolom
           card jadi saling menimpa. Geser satu kali di level halaman, lalu nolkan per elemen. */
        .retur-page .card { margin: 0; border-radius: 14px; }
        .retur-page .pagetitle h1 { margin-left: 0; }
        @media (min-width: 1200px) {
          .retur-page .pagetitle,
          .retur-page .section { margin-left: -90px; }
        }
        .retur-page .retur-icon {
          width: 48px; height: 48px; flex-shrink: 0; border-radius: 12px;
          display: flex; align-items: center; justify-content: center; font-size: 1.4rem;
        }
        .retur-page .min-w-0 { min-width: 0; }
      `}</style>
    </main>
  );
};

export default ProsesRetur;
