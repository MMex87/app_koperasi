import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../../../api/axios";
import convertRupiah from "rupiah-format";
import { arsipkanBarang } from "../../../utils/barang/arsipBarang";

const formatTanggal = (v) => (v ? new Date(v).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "Belum pernah");

// Kategori masalah data: judul, keterangan, warna, dan kolom yang ditampilkan
const KATEGORI = [
  { key: "kandidatArsip", judul: "Kandidat arsip", ket: (h) => `Stok 0 dan tidak ada pergerakan stok ${h} hari terakhir`, warna: "secondary", icon: "bi-archive" },
  { key: "kodeDuplikat", judul: "Kode barang ganda", ket: () => "Satu kode dipakai beberapa barang — scan barcode bisa salah barang", warna: "danger", icon: "bi-upc" },
  { key: "tanpaNama", judul: "Barang tanpa nama", ket: () => "Tidak bisa dicari di kasir", warna: "warning", icon: "bi-type" },
  { key: "tanpaKode", judul: "Barang tanpa kode", ket: () => "Tidak bisa di-scan", warna: "warning", icon: "bi-upc-scan" },
  { key: "hargaKosong", judul: "Harga jual kosong", ket: () => "Harga jual 0 atau belum diisi", warna: "warning", icon: "bi-tag" },
  { key: "supplierTanpaNama", judul: "Supplier tanpa nama", ket: () => "Perbaiki di menu Supplier", warna: "info", icon: "bi-shop" },
];

const KesehatanData = ({ onBerubah }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hari, setHari] = useState(90);
  const [aktif, setAktif] = useState("kandidatArsip");

  const load = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/barang-kesehatan", { params: { hari } });
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [hari]);

  const arsipkan = async (daftar) => {
    if (await arsipkanBarang(daftar)) {
      load();
      onBerubah?.();
    }
  };

  const kategori = KATEGORI.find((k) => k.key === aktif);
  const daftar = data?.[aktif] || [];

  return (
    <>
      <div className="row g-3 mb-4">
        {KATEGORI.map((k) => {
          const n = data?.[k.key]?.length ?? 0;
          return (
            <div key={k.key} className="col-6 col-md-4 col-xl-2">
              <button type="button" className={`card border-0 shadow-sm h-100 w-100 text-start ${aktif === k.key ? "border border-2 border-primary" : ""}`} onClick={() => setAktif(k.key)}>
                <div className="card-body p-3">
                  <div className={`text-${k.warna} mb-1`}>
                    <i className={`bi ${k.icon} me-1`} />
                    <span className="small fw-semibold">{k.judul}</span>
                  </div>
                  <div className="fs-4 fw-bold">{loading ? "…" : n}</div>
                  {n === 0 && !loading && <small className="text-success">Bersih</small>}
                </div>
              </button>
            </div>
          );
        })}
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">
          <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-3">
            <div>
              <h5 className="fw-bold mb-0">{kategori.judul}</h5>
              <small className="text-muted">{kategori.ket(data?.hari ?? hari)}</small>
            </div>
            {aktif === "kandidatArsip" && (
              <div className="d-flex flex-wrap align-items-center gap-2">
                <select className="form-select form-select-sm" style={{ width: "auto" }} value={hari} onChange={(e) => setHari(Number(e.target.value))}>
                  <option value={30}>Tanpa aktivitas 30 hari</option>
                  <option value={90}>Tanpa aktivitas 90 hari</option>
                  <option value={180}>Tanpa aktivitas 180 hari</option>
                  <option value={365}>Tanpa aktivitas 1 tahun</option>
                </select>
                <button className="btn btn-sm btn-secondary" disabled={!daftar.length} onClick={() => arsipkan(daftar)}>
                  <i className="bi bi-archive me-1" />
                  Arsipkan semua ({daftar.length})
                </button>
              </div>
            )}
          </div>

          <div className="table-responsive" style={{ maxHeight: "520px" }}>
            <table className="table table-hover align-middle mb-0 data-table">
              <thead className="table-light sticky-top">
                <tr>
                  {aktif === "supplierTanpaNama" ? (
                    <>
                      <th>ID</th>
                      <th>No HP</th>
                      <th>Alamat</th>
                      <th className="text-center">Jumlah Barang</th>
                      <th className="text-center">Aksi</th>
                    </>
                  ) : (
                    <>
                      <th>Barang</th>
                      <th>Kode</th>
                      <th className="text-center">Stok</th>
                      {aktif === "kandidatArsip" && <th>Supplier</th>}
                      {aktif === "kandidatArsip" && <th>Aktivitas Terakhir</th>}
                      {aktif === "hargaKosong" && <th className="text-end">Harga Beli</th>}
                      <th className="text-center">Aksi</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5">
                      <div className="spinner-border spinner-border-sm text-primary me-2" />
                      <span className="text-muted">Memeriksa data...</span>
                    </td>
                  </tr>
                ) : daftar.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center text-success py-5">
                      <i className="bi bi-check-circle fs-1 d-block mb-2" />
                      Tidak ada masalah pada kategori ini
                    </td>
                  </tr>
                ) : aktif === "supplierTanpaNama" ? (
                  daftar.map((s) => (
                    <tr key={s.id}>
                      <td>#{s.id}</td>
                      <td>{s.noHP || "-"}</td>
                      <td>{s.alamat || "-"}</td>
                      <td className="text-center">{s.jumlahBarang}</td>
                      <td className="text-center">
                        <Link to={`/supplier/edit/${s.id}`} className="btn btn-sm btn-outline-warning">
                          <i className="bi bi-pencil me-1" />
                          Beri nama
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  daftar.map((b) => (
                    <tr key={b.id}>
                      <td className="fw-semibold">{b.nama?.trim() || <span className="text-muted fst-italic">(tanpa nama)</span>}</td>
                      <td>{b.kodeBarang?.trim() || <span className="text-muted">-</span>}</td>
                      <td className="text-center">{b.jumlah}</td>
                      {aktif === "kandidatArsip" && <td>{b.supplier || "-"}</td>}
                      {aktif === "kandidatArsip" && <td className="text-muted small">{formatTanggal(b.terakhir)}</td>}
                      {aktif === "hargaKosong" && <td className="text-end">{convertRupiah.convert(b.hargaBeli || 0)}</td>}
                      <td className="text-center text-nowrap">
                        <Link to={`/barang/${b.id}`} className="btn btn-sm btn-outline-info me-1" title="Detail">
                          <i className="bi bi-eye" />
                        </Link>
                        {aktif === "kandidatArsip" && (
                          <button className="btn btn-sm btn-outline-secondary" title="Arsipkan" onClick={() => arsipkan([b])}>
                            <i className="bi bi-archive" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {aktif !== "kandidatArsip" && aktif !== "supplierTanpaNama" && daftar.length > 0 && (
            <small className="text-muted d-block mt-2">Perbaiki nama, kode, atau harga lewat tombol Edit di tab Aktif (cari berdasarkan nama/kode).</small>
          )}
        </div>
      </div>
    </>
  );
};

export default KesehatanData;
