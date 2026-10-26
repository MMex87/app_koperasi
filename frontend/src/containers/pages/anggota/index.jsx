import React, { useEffect, useState } from "react";
import axios from "../../../api/axios.jsx";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";
import ReactPaginate from "react-paginate";
import getSearchAnggota from "../../../utils/anggota/getSearchAnggota.jsx";

const inisial = (nama = "") =>
  nama
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((k) => k.charAt(0).toUpperCase())
    .join("") || "?";

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 2500,
  timerProgressBar: true,
});

const Anggota = () => {
  const [anggota, setAnggota] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [limit] = useState(10);
  const [pages, setPages] = useState(0);
  const [rows, setRows] = useState(0);
  const [loading, setLoading] = useState(true);

  // edit state
  const [anggotaId, setAnggotaId] = useState(0);
  const [namaAnggota, setNamaAnggota] = useState("");
  const [noHp, setNoHp] = useState("");

  useEffect(() => {
    loadAnggota();
  }, [page, search]);

  const loadAnggota = async () => {
    setLoading(true);
    try {
      const data = await getSearchAnggota(encodeURIComponent(search), limit, page);
      setAnggota(data.result);
      setPages(data.totalPage);
      setRows(data.totalRows);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const changePage = ({ selected }) => {
    setPage(selected);
  };

  const cari = (e) => {
    setSearch(e.target.value);
    setPage(0);
  };

  const edit = (id, nama, noHp) => {
    setAnggotaId(id);
    setNamaAnggota(nama || "");
    setNoHp(noHp || "");
  };

  const batal = () => {
    setAnggotaId(0);
    setNamaAnggota("");
    setNoHp("");
  };

  const save = async () => {
    if (!namaAnggota.trim()) {
      return Swal.fire("Gagal!", "Nama anggota tidak boleh kosong", "warning");
    }
    try {
      await axios.put(`/anggota/${anggotaId}`, {
        nama: namaAnggota.trim(),
        noHP: noHp,
      });
      batal();
      loadAnggota();
      Toast.fire({ icon: "success", title: "Data anggota diperbarui" });
    } catch (error) {
      console.error(error);
      Swal.fire("Gagal!", error.response?.data?.msg || "Gagal menyimpan data anggota", "error");
    }
  };

  return (
    <main id="main" className="main app-page">
      <div className="pagetitle d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <div>
          <h1 className="fs-2 fw-bold mb-1">Data Anggota</h1>
          <small className="text-muted">Daftar anggota koperasi yang dapat bertransaksi</small>
        </div>
        <Link to="/anggota/tambah" className="btn btn-primary px-3">
          <i className="bi bi-person-plus me-1" />
          Tambah Anggota
        </Link>
      </div>

      <section className="section">
        <div className="card border-0 shadow-sm">
          <div className="card-body p-4">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
              <div className="input-group" style={{ maxWidth: "340px" }}>
                <span className="input-group-text bg-white">
                  <i className="bi bi-search" />
                </span>
                <input type="text" className="form-control" placeholder="Cari nama anggota..." value={search} onChange={cari} />
              </div>
              <span className="badge rounded-pill bg-primary bg-opacity-10 text-primary px-3 py-2">{rows} anggota</span>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0 data-table">
                <thead className="table-light">
                  <tr>
                    <th className="text-center" style={{ width: "60px" }}>
                      No
                    </th>
                    <th>Nama</th>
                    <th>No HP</th>
                    <th className="text-center" style={{ width: "140px" }}>
                      Aksi
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="text-center py-5">
                        <div className="spinner-border spinner-border-sm text-primary me-2" />
                        <span className="text-muted">Memuat data...</span>
                      </td>
                    </tr>
                  ) : anggota.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center text-muted py-5">
                        <i className="bi bi-people fs-1 d-block mb-2" />
                        {search ? `Tidak ada anggota bernama "${search}"` : "Belum ada data anggota"}
                      </td>
                    </tr>
                  ) : (
                    anggota.map((val, index) => {
                      const sedangEdit = anggotaId === val.id;
                      return (
                        <tr key={val.id} className={sedangEdit ? "table-warning" : ""}>
                          <td className="text-center text-muted">{page * limit + index + 1}</td>
                          <td>
                            {sedangEdit ? (
                              <input type="text" className="form-control form-control-sm" value={namaAnggota} autoFocus onChange={(e) => setNamaAnggota(e.target.value)} />
                            ) : (
                              <div className="d-flex align-items-center gap-2">
                                <span className="avatar">{inisial(val.nama)}</span>
                                <span className="fw-semibold">{val.nama}</span>
                              </div>
                            )}
                          </td>
                          <td>
                            {sedangEdit ? (
                              <input type="tel" className="form-control form-control-sm" placeholder="08xxxxxxxxxx" value={noHp} onChange={(e) => setNoHp(e.target.value.replace(/[^0-9+]/g, ""))} />
                            ) : val.noHP ? (
                              <span>
                                <i className="bi bi-telephone text-muted me-2" />
                                {val.noHP}
                              </span>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
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
                            ) : (
                              <button className="btn btn-sm btn-outline-warning" onClick={() => edit(val.id, val.nama, val.noHP)}>
                                <i className="bi bi-pencil me-1" />
                                Edit
                              </button>
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
      </section>
    </main>
  );
};

export default Anggota;
