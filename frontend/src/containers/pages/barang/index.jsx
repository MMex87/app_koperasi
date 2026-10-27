import axios from "../../../api/axios";
import React, { useState, useEffect } from "react";
import ReactPaginate from "react-paginate";
import { Link } from "react-router-dom";
import getSearchBarang from "../../../utils/barang/getSearchBarang.jsx";
import convertRupiah from "rupiah-format";
import Swal from "sweetalert2";
import sesuaikanStok from "../../../utils/barang/sesuaikanStok";
import { ambilSesiAdmin, mintaSesiAdmin, jalankanAdmin, keluarAdmin } from "../../../utils/adminSession";
import { arsipkanBarang, aktifkanBarang } from "../../../utils/barang/arsipBarang";
import KesehatanData from "./KesehatanData";

// Daftar barang dipakai dua halaman: /barang (Detail & Edit) dan /barang-admin (aksi lengkap:
// sesuaikan stok & hapus barang yang berdampak ke stok/laporan).
export function DaftarBarang({ admin = false }) {
  const [barang, setBarang] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStok, setFilterStok] = useState("");
  const [page, setPage] = useState(0);
  const [limit] = useState(10);
  const [pages, setPages] = useState(0);
  const [rows, setRows] = useState(0);

  // edit state
  const [barangId, setBarangId] = useState(0);
  const [namaBarang, setNamaBarang] = useState("");
  const [kodeBarang, setKodeBarang] = useState("");
  const [hargaJual, setHargaJual] = useState(0);
  const [hargaBeli, setHargaBeli] = useState(0);
  const [loading, setLoading] = useState(true);
  // Mode admin: halaman terkunci sampai operator memasukkan PIN
  const [sesiAdmin, setSesiAdmin] = useState(() => (admin ? ambilSesiAdmin() : null));
  // Tab admin: "aktif" (barang dijual), "arsip" (barang diarsipkan), "kesehatan" (data yang perlu dibersihkan)
  const [tab, setTab] = useState("aktif");
  const [terpilih, setTerpilih] = useState([]);

  useEffect(() => {
    if (tab !== "kesehatan") loadBarang();
  }, [search, page, tab, filterStok]);

  const gantiTab = (t) => {
    setTab(t);
    setPage(0);
    setTerpilih([]);
    batal();
  };

  // Hanya barang stok 0 yang bisa diarsip
  const pilih = (val) => setTerpilih((p) => (p.some((b) => b.id === val.id) ? p.filter((b) => b.id !== val.id) : [...p, val]));
  const bisaDiarsip = barang.filter((b) => (parseInt(b.jumlah) || 0) <= 0);
  const semuaTerpilih = bisaDiarsip.length > 0 && bisaDiarsip.every((b) => terpilih.some((t) => t.id === b.id));
  const pilihSemua = () =>
    setTerpilih(semuaTerpilih ? terpilih.filter((t) => !bisaDiarsip.some((b) => b.id === t.id)) : [...terpilih, ...bisaDiarsip.filter((b) => !terpilih.some((t) => t.id === b.id))]);

  const arsipkanTerpilih = async () => {
    if (await arsipkanBarang(terpilih)) {
      setTerpilih([]);
      loadBarang();
    }
  };
  const aktifkan = async (val) => (await aktifkanBarang(val)) && loadBarang();

  const masukAdmin = async () => setSesiAdmin(await mintaSesiAdmin({ paksa: true }));
  const keluar = () => {
    keluarAdmin();
    setSesiAdmin(null);
  };

  const loadBarang = async () => {
    setLoading(true);
    try {
      const data = await getSearchBarang(encodeURIComponent(search), limit, page, admin && tab === "arsip", filterStok);
      setBarang(data.result);
      setRows(data.totalRows);
      setPages(data.totalPage);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const cari = (e) => {
    setSearch(e.target.value);
    setPage(0);
  };

  const gantiFilterStok = (e) => {
    setFilterStok(e.target.value);
    setPage(0);
    setTerpilih([]);
  };

  const changePage = ({ selected }) => {
    setPage(selected);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const edit = (id, nama, kode, hbeli, hjual) => {
    setBarangId(id);
    setNamaBarang(nama);
    setKodeBarang(kode);
    setHargaBeli(hbeli);
    setHargaJual(hjual);
  };

  const batal = () => {
    setBarangId(0);
    setNamaBarang("");
    setKodeBarang("");
    setHargaBeli(0);
    setHargaJual(0);
  };

  const save = async () => {
    if (!namaBarang.trim() || !String(kodeBarang).trim()) {
      return Swal.fire("Gagal!", "Nama dan kode barang tidak boleh kosong", "warning");
    }
    // Harga jual di bawah harga beli diizinkan (promo / jual rugi), cukup dikonfirmasi
    if (parseInt(hargaJual) < parseInt(hargaBeli)) {
      const lanjut = await Swal.fire({
        icon: "warning",
        title: "Harga jual di bawah harga beli",
        text: "Barang ini akan dijual rugi. Tetap simpan?",
        showCancelButton: true,
        confirmButtonText: "Tetap simpan",
        cancelButtonText: "Periksa lagi",
        reverseButtons: true,
      });
      if (!lanjut.isConfirmed) return;
    }
    try {
      await axios.put(`/barang/${barangId}`, {
        nama: namaBarang,
        kodeBarang: kodeBarang,
        hargaBeli: hargaBeli,
        hargaJual: hargaJual,
      });
      batal();
      loadBarang();
      Swal.fire({ toast: true, position: "top-end", icon: "success", title: "Data barang diperbarui", showConfirmButton: false, timer: 2500 });
    } catch (error) {
      console.error(error);
      Swal.fire("Gagal!", error.response?.data?.msg || "Gagal menyimpan data barang", "error");
    }
  };

  const hapus = async (id) => {
    if (!(await mintaSesiAdmin({ keterangan: "Menghapus barang memerlukan PIN admin." }))) return;
    let info;
    try {
      const res = await axios.get(`/barang/${id}/hapus-info`);
      info = res.data;
    } catch (error) {
      console.error(error);
      return Swal.fire("Gagal!", error.response?.data?.msg || "Gagal mengambil data barang", "error");
    }

    const t = info.terkait;
    const result = await Swal.fire({
      icon: "warning",
      title: `Hapus barang "${info.barang.nama}"?`,
      html:
        `<div class="text-start">` +
        `<p><b>Data berikut ikut terhapus permanen dan tidak bisa dikembalikan:</b></p>` +
        `<ul>` +
        `<li>${t.transPenjualan} transaksi penjualan</li>` +
        `<li>${t.transPembelian} transaksi pembelian</li>` +
        `<li>${t.returnPenjualan} retur penjualan, ${t.returnPembelian} retur pembelian</li>` +
        `<li>${t.logPenjualan + t.logPembelian + (t.penyesuaianStok || 0)} riwayat log stok</li>` +
        `</ul>` +
        `<p>Laporan penjualan dan pembelian akan berubah. Ketik <b>HAPUS</b> untuk melanjutkan.</p>` +
        `</div>`,
      input: "text",
      inputPlaceholder: "HAPUS",
      showCancelButton: true,
      confirmButtonText: "Hapus Permanen",
      cancelButtonText: "Batal",
      confirmButtonColor: "#d33",
      reverseButtons: true,
      preConfirm: (value) => {
        if (value !== "HAPUS") {
          Swal.showValidationMessage("Ketik HAPUS (huruf besar) untuk konfirmasi");
          return false;
        }
        return true;
      },
    });

    if (!result.isConfirmed) return;

    try {
      const res = await jalankanAdmin((headers) => axios.delete(`/barang/${id}`, { params: { konfirmasi: "ya" }, headers }));
      if (!res) return;
      Swal.fire("Terhapus!", res.data.msg, "success");
      loadBarang();
    } catch (error) {
      console.error(error);
      Swal.fire("Gagal!", error.response?.data?.msg || "Gagal menghapus barang", "error");
    }
  };

  if (admin && !sesiAdmin) {
    return (
      <main id="main" className="main app-page">
        <section className="section">
          <div className="card border-0 shadow-sm mx-auto text-center" style={{ maxWidth: "460px" }}>
            <div className="card-body p-5">
              <div className="form-icon bg-danger bg-opacity-10 text-danger mx-auto mb-3" style={{ width: 64, height: 64, fontSize: "1.8rem" }}>
                <i className="bi bi-shield-lock" />
              </div>
              <h4 className="fw-bold">Mode Admin Terkunci</h4>
              <p className="text-muted small mb-4">Halaman ini berisi aksi yang mengubah stok dan menghapus data. Masukkan nama operator dan PIN admin untuk melanjutkan.</p>
              <button className="btn btn-danger px-4" onClick={masukAdmin}>
                <i className="bi bi-unlock me-1" />
                Masuk Mode Admin
              </button>
              <div className="mt-3">
                <Link to="/barang" className="small text-decoration-none">
                  Kembali ke Data Barang
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main id="main" className="main app-page">
      <div className="pagetitle d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <div>
          <h1 className="fs-2 fw-bold mb-1">
            Data Barang
            {admin && <span className="badge bg-danger bg-opacity-10 text-danger fs-6 align-middle ms-2">Admin</span>}
          </h1>
          <small className="text-muted">{admin ? "Kelola stok dan data barang — penyesuaian stok tercatat di riwayat" : "Barang baru ditambahkan melalui transaksi pembelian"}</small>
        </div>
        <div className="d-flex flex-wrap align-items-center gap-2">
          {admin && sesiAdmin && (
            <>
              <span className="badge bg-light text-dark border px-3 py-2">
                <i className="bi bi-person-badge me-1" />
                {sesiAdmin.operator}
              </span>
              <button className="btn btn-outline-danger" onClick={keluar} title="Keluar dari mode admin">
                <i className="bi bi-box-arrow-right me-1" />
                Keluar
              </button>
            </>
          )}
          <Link to="/transPembelian" className="btn btn-primary px-3">
            <i className="bi bi-plus-lg me-1" />
            Tambah via Pembelian
          </Link>
        </div>
      </div>

      <section className="section">
        {admin && (
          <ul className="nav nav-pills mb-3 gap-2">
            {[
              ["aktif", "bi-box-seam", "Barang Aktif"],
              ["arsip", "bi-archive", "Arsip"],
              ["kesehatan", "bi-clipboard2-pulse", "Kesehatan Data"],
            ].map(([k, icon, label]) => (
              <li key={k} className="nav-item">
                <button type="button" className={`nav-link ${tab === k ? "active" : "bg-white border"}`} onClick={() => gantiTab(k)}>
                  <i className={`bi ${icon} me-1`} />
                  {label}
                </button>
              </li>
            ))}
          </ul>
        )}

        {admin && tab === "kesehatan" ? (
          <KesehatanData />
        ) : (
        <div className="card border-0 shadow-sm">
          <div className="card-body p-4">
            {admin && tab === "arsip" && (
              <div className="alert alert-secondary small py-2">
                <i className="bi bi-info-circle me-1" />
                Barang arsip tidak muncul di kasir & daftar barang. Barang otomatis aktif lagi jika stoknya bertambah.
              </div>
            )}
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
              <div className="d-flex flex-wrap align-items-center gap-2">
                <div className="input-group" style={{ maxWidth: "340px" }}>
                  <span className="input-group-text bg-white">
                    <i className="bi bi-search" />
                  </span>
                  <input type="text" className="form-control" placeholder="Cari nama atau kode barang..." value={search} onChange={cari} />
                </div>
                {/* Batas menipis 10, sama dengan dashboard */}
                <select className="form-select" style={{ width: "auto" }} value={filterStok} onChange={gantiFilterStok} title="Filter stok">
                  <option value="">Semua stok</option>
                  <option value="tersedia">Tersedia (&gt; 10)</option>
                  <option value="menipis">Menipis (1–10)</option>
                  <option value="habis">Habis (0)</option>
                </select>
              </div>
              <div className="d-flex align-items-center gap-2">
                {admin && tab === "aktif" && terpilih.length > 0 && (
                  <button className="btn btn-sm btn-secondary" onClick={arsipkanTerpilih}>
                    <i className="bi bi-archive me-1" />
                    Arsipkan terpilih ({terpilih.length})
                  </button>
                )}
                <span className="badge rounded-pill bg-primary bg-opacity-10 text-primary px-3 py-2">
                  {rows} barang{admin && tab === "arsip" ? " diarsip" : ""}
                </span>
              </div>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0 data-table">
                <thead className="table-light">
                  <tr>
                    {admin && tab === "aktif" && (
                      <th className="text-center" title="Pilih barang stok 0 untuk diarsipkan">
                        <input type="checkbox" className="form-check-input" checked={semuaTerpilih} disabled={!bisaDiarsip.length} onChange={pilihSemua} />
                      </th>
                    )}
                    <th className="text-center">No</th>
                    <th>Barang</th>
                    <th>Supplier</th>
                    <th>Jenis</th>
                    <th className="text-end">Harga Beli</th>
                    <th className="text-end">Harga Jual</th>
                    <th className="text-center">Stok</th>
                    <th className="text-center">Aksi</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={admin && tab === "aktif" ? 9 : 8} className="text-center py-5">
                        <div className="spinner-border spinner-border-sm text-primary me-2" />
                        <span className="text-muted">Memuat data...</span>
                      </td>
                    </tr>
                  ) : barang.length === 0 ? (
                    <tr>
                      <td colSpan={admin && tab === "aktif" ? 9 : 8} className="text-center text-muted py-5">
                        <i className="bi bi-box-seam fs-1 d-block mb-2" />
                        {search ? `Tidak ada barang yang cocok dengan "${search}"` : "Belum ada data barang"}
                      </td>
                    </tr>
                  ) : (
                    barang.map((val, index) => {
                      const sedangEdit = barangId === val.id;
                      const jualRugi = sedangEdit && parseInt(hargaJual) < parseInt(hargaBeli);
                      return (
                        <tr key={val.id} className={sedangEdit ? "table-warning" : ""}>
                          {admin && tab === "aktif" && (
                            <td className="text-center">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                title={(parseInt(val.jumlah) || 0) > 0 ? "Barang yang masih punya stok tidak bisa diarsip" : "Pilih untuk diarsipkan"}
                                disabled={(parseInt(val.jumlah) || 0) > 0}
                                checked={terpilih.some((t) => t.id === val.id)}
                                onChange={() => pilih(val)}
                              />
                            </td>
                          )}
                          <td className="text-center text-muted">{page * limit + index + 1}</td>

                          {/* NAMA + KODE */}
                          <td style={{ minWidth: "220px" }}>
                            {sedangEdit ? (
                              <>
                                <input type="text" className="form-control form-control-sm mb-1" placeholder="Nama barang" value={namaBarang} autoFocus onChange={(e) => setNamaBarang(e.target.value)} />
                                <input type="text" className="form-control form-control-sm" placeholder="Kode barang" value={kodeBarang} onChange={(e) => setKodeBarang(e.target.value)} />
                              </>
                            ) : (
                              <>
                                <Link to={`/barang/${val.id}`} className="fw-semibold text-decoration-none d-block">
                                  {val.nama}
                                </Link>
                                <small className="text-muted">
                                  <i className="bi bi-upc me-1" />
                                  {val.kodeBarang}
                                </small>
                              </>
                            )}
                          </td>

                          <td>{val.supplier?.nama || "-"}</td>
                          <td>
                            <span className="badge bg-light text-dark border">{val.jenisBarang || "-"}</span>
                            <small className="text-muted ms-1">{val.satuan}</small>
                          </td>

                          {/* HARGA BELI */}
                          <td className="text-end text-nowrap" style={sedangEdit ? { minWidth: "120px" } : undefined}>
                            {sedangEdit ? <input type="number" min="0" className="form-control form-control-sm text-end" value={hargaBeli} onChange={(e) => setHargaBeli(e.target.value)} /> : convertRupiah.convert(val.hargaBeli)}
                          </td>

                          {/* HARGA JUAL */}
                          <td className="text-end text-nowrap" style={sedangEdit ? { minWidth: "120px" } : undefined}>
                            {sedangEdit ? <input type="number" min="0" className={`form-control form-control-sm text-end ${jualRugi ? "border-warning" : ""}`} title={jualRugi ? "Di bawah harga beli (rugi)" : undefined} value={hargaJual} onChange={(e) => setHargaJual(e.target.value)} /> : convertRupiah.convert(val.hargaJual)}
                          </td>

                          <td className="text-center">
                            {val.jumlah <= 0 ? <span className="badge bg-danger">Habis</span> : <span className={`badge ${val.jumlah <= 10 ? "bg-warning text-dark" : "bg-light text-dark border"}`}>{val.jumlah}</span>}
                          </td>

                          {/* BUTTON AKSI */}
                          <td className="text-center text-nowrap">
                            {sedangEdit ? (
                              <>
                                <button className="btn btn-sm btn-success me-1" title="Simpan" onClick={save}>
                                  <i className="bi bi-check-lg" />
                                </button>
                                <button className="btn btn-sm btn-secondary" title="Batal" onClick={batal}>
                                  <i className="bi bi-x-lg" />
                                </button>
                              </>
                            ) : admin && tab === "arsip" ? (
                              <>
                                <Link to={`/barang/${val.id}`} className="btn btn-sm btn-outline-info me-1" title="Detail & riwayat stok">
                                  <i className="bi bi-eye" />
                                </Link>
                                <button className="btn btn-sm btn-outline-success" title="Keluarkan dari arsip" onClick={() => aktifkan(val)}>
                                  <i className="bi bi-arrow-counterclockwise me-1" />
                                  Aktifkan
                                </button>
                              </>
                            ) : (
                              <>
                                <Link to={`/barang/${val.id}`} className="btn btn-sm btn-outline-info me-1" title="Detail & riwayat stok">
                                  <i className="bi bi-eye" />
                                </Link>
                                {admin && (
                                  <button className="btn btn-sm btn-outline-secondary me-1" title="Sesuaikan stok (tercatat di riwayat)" onClick={async () => (await sesuaikanStok(val)) && loadBarang()}>
                                    <i className="bi bi-sliders" />
                                  </button>
                                )}
                                <button className="btn btn-sm btn-outline-warning me-1" title="Edit" onClick={() => edit(val.id, val.nama, val.kodeBarang, val.hargaBeli, val.hargaJual)}>
                                  <i className="bi bi-pencil" />
                                </button>
                                {admin && (
                                  <button className="btn btn-sm btn-outline-danger" title="Hapus barang" onClick={() => hapus(val.id)}>
                                    <i className="bi bi-trash" />
                                  </button>
                                )}
                              </>
                            )}
                          </td>
                        </tr>
                      );
                    })
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
                  onPageChange={changePage}
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
        )}
      </section>
    </main>
  );
}

const Barang = () => <DaftarBarang />;

export default Barang;
