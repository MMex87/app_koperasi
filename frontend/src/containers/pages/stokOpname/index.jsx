import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  getBulanIni,
  getDaftarOpname,
  mulaiOpname,
  buatUlangOpname,
  hapusOpname,
  namaPeriode,
  pesanError,
} from "../../../utils/stokOpname/api";
import TemplateDownload from "./TemplateDownload";
import { mintaPetugas } from "./dialog";

const formatWaktu = (v) => (v ? new Date(v).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "-");
const angka = (v) => Number(v || 0).toLocaleString("id-ID");

const BadgeStatus = ({ status, lewat }) => {
  if (status === "final") return <span className="badge bg-success bg-opacity-10 text-success">Selesai</span>;
  if (lewat) return <span className="badge bg-secondary bg-opacity-10 text-secondary">Draft (tidak diselesaikan)</span>;
  return <span className="badge bg-warning bg-opacity-25 text-dark">Draft</span>;
};

export default function StokOpname() {
  const navigate = useNavigate();
  const [bulanIni, setBulanIni] = useState(null);
  const [riwayat, setRiwayat] = useState([]);
  const [periodeAktif, setPeriodeAktif] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [proses, setProses] = useState(false);

  const muat = async () => {
    setLoading(true);
    setError("");
    try {
      const [status, daftar] = await Promise.all([getBulanIni(), getDaftarOpname()]);
      setBulanIni(status);
      setRiwayat(daftar.data || []);
      setPeriodeAktif(daftar.periodeSekarang);
    } catch (err) {
      console.error(err);
      setError(pesanError(err, "Gagal memuat data stok opname"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    muat();
  }, []);

  const mulai = async () => {
    const petugas = await mintaPetugas({
      title: `Mulai stok opname ${namaPeriode(bulanIni?.periode)}?`,
      text: "Hitungan tersimpan otomatis dan bisa dilanjutkan kapan saja selama bulan ini.",
      confirmButtonText: "Mulai",
    });
    if (!petugas) return;
    setProses(true);
    try {
      const { opname } = await mulaiOpname(petugas);
      navigate(`/stok-opname/${opname.id}`);
    } catch (err) {
      Swal.fire("Gagal", pesanError(err, "Stok opname gagal dimulai"), "error");
      muat();
    } finally {
      setProses(false);
    }
  };

  const buatUlang = async () => {
    const { isConfirmed } = await Swal.fire({
      icon: "warning",
      title: "Buat ulang stok opname?",
      html: `Semua hitungan bulan ini (<b>${angka(bulanIni.jumlahItem)} barang</b>) akan dihapus dan opname dimulai dari kosong.<br/>Stok barang tidak berubah.`,
      showCancelButton: true,
      confirmButtonText: "Ya, buat ulang",
      cancelButtonText: "Batal",
      confirmButtonColor: "#d33",
      reverseButtons: true,
    });
    if (!isConfirmed) return;
    const petugas = await mintaPetugas({ title: "Petugas opname", confirmButtonText: "Lanjut" });
    if (!petugas) return;
    setProses(true);
    try {
      await buatUlangOpname(bulanIni.id, petugas);
      navigate(`/stok-opname/${bulanIni.id}`);
    } catch (err) {
      Swal.fire("Gagal", pesanError(err, "Stok opname gagal dibuat ulang"), "error");
    } finally {
      setProses(false);
    }
  };

  const hapusDraft = async (row) => {
    const { isConfirmed } = await Swal.fire({
      icon: "warning",
      title: `Hapus draft ${row.nomor}?`,
      text: "Draft ini tidak pernah diselesaikan. Stok barang tidak berubah.",
      showCancelButton: true,
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#d33",
      reverseButtons: true,
    });
    if (!isConfirmed) return;
    try {
      await hapusOpname(row.id);
      muat();
    } catch (err) {
      Swal.fire("Gagal", pesanError(err, "Draft gagal dihapus"), "error");
    }
  };

  const status = bulanIni?.status;

  return (
    <main id="main" className="main app-page">
      <div className="d-flex flex-wrap align-items-baseline gap-2 mb-3">
        <h1 className="fs-4 fw-bold mb-0">Stok Opname</h1>
        <small className="text-muted">Hitung stok fisik sekali sebulan</small>
      </div>

      <section className="section">
        {error && <div className="alert alert-danger">{error}</div>}

        <div className="row g-3 mb-3">
          <div className="col-lg-6 d-flex">
            <div className="card border-0 shadow-sm w-100 mb-0">
              <div className="card-body p-3">
                <div className="text-muted small mb-1">Opname bulan ini</div>
                <h5 className="fw-bold mb-2">{bulanIni ? namaPeriode(bulanIni.periode) : "…"}</h5>

                {loading && !bulanIni ? (
                  <div className="text-muted">Memuat…</div>
                ) : status === "belum" ? (
                  <>
                    <p className="text-muted small mb-2">Belum ada stok opname untuk bulan ini.</p>
                    <button className="btn btn-primary btn-sm" disabled={proses} onClick={mulai}>
                      <i className="bi bi-clipboard-plus me-1" />
                      Mulai Opname
                    </button>
                  </>
                ) : status === "draft" ? (
                  <>
                    <p className="small mb-2">
                      <BadgeStatus status="draft" /> <span className="ms-1">{bulanIni.nomor}</span> · <b>{angka(bulanIni.jumlahItem)}</b> barang sudah dihitung
                      {bulanIni.petugas && <> · petugas {bulanIni.petugas}</>}
                      <br />
                      <small className="text-muted">Terakhir diubah {formatWaktu(bulanIni.updatedAt)}</small>
                    </p>
                    <div className="d-flex flex-wrap gap-2">
                      <Link to={`/stok-opname/${bulanIni.id}`} className="btn btn-primary btn-sm">
                        <i className="bi bi-play-fill me-1" />
                        Lanjutkan
                      </Link>
                      <button className="btn btn-outline-danger btn-sm" disabled={proses} onClick={buatUlang}>
                        <i className="bi bi-arrow-counterclockwise me-1" />
                        Buat Ulang
                      </button>
                    </div>
                  </>
                ) : status === "final" ? (
                  <>
                    <p className="small mb-2">
                      <BadgeStatus status="final" /> Opname bulan ini sudah selesai {formatWaktu(bulanIni.finalAt)}
                      {bulanIni.petugas && <> oleh {bulanIni.petugas}</>}.
                      <br />
                      <small className="text-muted">Opname berikutnya bisa dimulai bulan depan.</small>
                    </p>
                    <Link to={`/stok-opname/${bulanIni.id}`} className="btn btn-outline-primary btn-sm">
                      <i className="bi bi-eye me-1" />
                      Lihat Hasil
                    </Link>
                  </>
                ) : null}
              </div>
            </div>
          </div>

          <div className="col-lg-6 d-flex">
            <div className="card border-0 shadow-sm w-100 mb-0">
              <div className="card-body p-3">
                <div className="text-muted small mb-1">Lembar hitung</div>
                <h5 className="fw-bold mb-1">Download Template</h5>
                <p className="text-muted small mb-1">
                  Lembar hitung tanpa stok sistem. Excel yang sudah diisi bisa di-upload di halaman hitung.
                </p>
                <TemplateDownload />
              </div>
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm">
          <div className="card-body p-3">
            <h6 className="fw-bold mb-2">Riwayat Stok Opname</h6>
            <div className="table-responsive">
              <table className="table table-sm table-hover align-middle mb-0 small">
                <thead className="table-light">
                  <tr>
                    <th>Periode</th>
                    <th>Nomor</th>
                    <th>Status</th>
                    <th>Petugas</th>
                    <th className="text-end">Item</th>
                    <th className="text-end">Selisih +</th>
                    <th className="text-end">Selisih −</th>
                    <th>Selesai</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {!riwayat.length && (
                    <tr>
                      <td colSpan={9} className="text-center text-muted py-4">
                        {loading ? "Memuat…" : "Belum ada stok opname"}
                      </td>
                    </tr>
                  )}
                  {riwayat.map((r) => {
                    const lewat = r.status === "draft" && r.periode !== periodeAktif;
                    return (
                      <tr key={r.id}>
                        <td className="fw-semibold">{namaPeriode(r.periode)}</td>
                        <td>{r.nomor}</td>
                        <td>
                          <BadgeStatus status={r.status} lewat={lewat} />
                        </td>
                        <td>{r.petugas || "-"}</td>
                        <td className="text-end">{angka(r.jumlahItem)}</td>
                        <td className="text-end text-success">{r.status === "final" ? `+${angka(r.totalPlus)}` : "-"}</td>
                        <td className="text-end text-danger">{r.status === "final" ? angka(r.totalMinus) : "-"}</td>
                        <td>{formatWaktu(r.finalAt)}</td>
                        <td className="text-end text-nowrap">
                          <Link to={`/stok-opname/${r.id}`} className="btn btn-sm btn-light border">
                            {r.status === "draft" && !lewat ? "Lanjutkan" : "Detail"}
                          </Link>
                          {lewat && (
                            <button className="btn btn-sm btn-outline-danger ms-1" onClick={() => hapusDraft(r)} title="Hapus draft">
                              <i className="bi bi-trash" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
