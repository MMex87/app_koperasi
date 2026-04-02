import React, { useEffect, useState } from "react";
import axios from "../../../api/axios.jsx";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";
import ReactPaginate from "react-paginate";
import getSearchAnggota from "../../../utils/anggota/getSearchAnggota.jsx";

const Anggota = () => {
  const [anggota, setAnggota] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [limit] = useState(10);
  const [pages, setPages] = useState(0);
  const [rows, setRows] = useState(0);

  // edit state
  const [anggotaId, setAnggotaId] = useState(0);
  const [namaAnggota, setNamaAnggota] = useState("");
  const [noHp, setNoHp] = useState("");

  // Load data pertama kali
  useEffect(() => {
    loadAnggota();
  }, []);

  // Load ketika page / search berubah
  useEffect(() => {
    loadAnggota();
  }, [page, search, anggotaId]);

  const loadAnggota = () => {
    getSearchAnggota(search, limit, page).then((data) => {
      setAnggota(data.result);
      setPage(data.page);
      setPages(data.totalPage);
      setRows(data.totalRows);
    });
  };

  // Pagination
  const changePage = ({ selected }) => {
    setPage(selected);
  };

  const edit = (id, nama, noHp) => {
    setAnggotaId(id);
    setNamaAnggota(nama);
    setNoHp(noHp);
  };

  const Toast = Swal.mixin({
    customClass: {
      confirmButton: "btn btn-success",
      cancelButton: "btn btn-danger",
    },
    buttonsStyling: false,
  });

  const batal = () => {
    setAnggotaId(0);
    setNamaAnggota("");
    setNoHp("");
  };

  // Edit data anggota
  const save = async () => {
    try {
      await axios.put(`/anggota/${anggotaId}`, {
        nama: namaAnggota,
        noHP: noHp,
      });
      batal();
      loadAnggota();
    } catch (error) {
      console.error(error);
    }
  };

  console.log(noHp);

  return (
    <main id="main" className="main">
      <div className="pagetitle text-center">
        <h1 className="fw-bold fs-2">Data Anggota</h1>
      </div>

      <section className="section">
        <div className="card shadow-sm">
          <div className="card-body p-4">
            {/* Search + Tambah */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="input-group search-group" style={{ maxWidth: "300px" }}>
                <span className="input-group-text bg-white">
                  <i className="bi bi-search"></i>
                </span>
                <input type="text" className="form-control" placeholder="Cari Anggota..." onChange={(e) => setSearch(e.target.value)} />
              </div>

              <Link to="/anggota/tambah" className="btn btn-primary btn-sm px-3">
                <i className="bi bi-plus-lg"></i> Tambah
              </Link>
            </div>

            {/* TABLE */}
            <table className="table table-striped table-hover align-middle">
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Nama</th>
                  <th>No HP</th>
                  <th className="text-center">Aksi</th>
                </tr>
              </thead>

              <tbody>
                {anggota.map((val, index) => (
                  <tr key={index} className={anggotaId === val.id ? "table-warning" : ""}>
                    <td>{index + 1}</td>
                    {/* NAMA */}
                    <td>{anggotaId === val.id ? <input type="text" className="form-control form-control-sm" value={namaAnggota} onChange={(e) => setNamaAnggota(e.target.value)} /> : val.nama}</td>

                    {/* KODE */}
                    <td>{anggotaId === val.id ? <input type="number" className="form-control form-control-sm" value={noHp} onChange={(e) => setNoHp(e.target.value)} /> : val.noHP}</td>

                    {/* BUTTON AKSI */}
                    <td className="text-center" style={{ width: "150px" }}>
                      {anggotaId === val.id ? (
                        <>
                          <button className="btn btn-sm btn-secondary me-1" onClick={batal}>
                            <i className="bi bi-x-lg"></i> Batal
                          </button>
                          <button className="btn btn-sm btn-success" onClick={save}>
                            <i className="bi bi-check-lg"></i> Simpan
                          </button>
                        </>
                      ) : (
                        <button className="btn btn-sm btn-warning" onClick={() => edit(val.id, val.nama, val.noHP)}>
                          <i className="bi bi-pencil-square"></i> Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* PAGINATION */}
            <div className="d-flex justify-content-between align-items-center mt-3">
              <p className="m-0">
                Total Anggota: <b>{rows}</b> — Halaman <b>{page + 1}</b> dari <b>{pages}</b>
              </p>

              <ReactPaginate
                previousLabel={"‹"}
                nextLabel={"›"}
                pageCount={pages}
                onPageChange={changePage}
                containerClassName={"pagination pagination-sm m-0"}
                pageClassName={"page-item"}
                pageLinkClassName={"page-link"}
                previousClassName={"page-item"}
                previousLinkClassName={"page-link"}
                nextClassName={"page-item"}
                nextLinkClassName={"page-link"}
                activeClassName={"active"}
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Anggota;
