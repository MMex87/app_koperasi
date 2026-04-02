import React, { useState, useEffect } from "react";
import axios from "../../../api/axios.jsx";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";
import ReactPaginate from "react-paginate";
import getSearchSupplier from "../../../utils/supplier/getSearchSupplier.jsx";

const Supplier = () => {
  const [supplier, setSupplier] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [limit] = useState(10);
  const [pages, setPages] = useState(0);
  const [rows, setRows] = useState(0);

  // edit state
  const [supllierId, setSupillerId] = useState(0);
  const [namaSupllier, setNamaSupllier] = useState("");
  const [noHp, setNoHp] = useState("");
  const [alamat, setAlamat] = useState("");

  // Load data pertama kali
  useEffect(() => {
    loadSupplier();
  }, []);

  // Load ketika page / search berubah
  useEffect(() => {
    loadSupplier();
  }, [page, search, supllierId]);

  const loadSupplier = () => {
    getSearchSupplier(search, limit, page).then((data) => {
      setSupplier(data.result);
      setPage(data.page);
      setPages(data.totalPage);
      setRows(data.totalRows);
    });
  };

  // Pagination
  const changePage = ({ selected }) => {
    setPage(selected);
  };

  const edit = (id, nama, noHp, alamat) => {
    setSupillerId(id);
    setNamaSupllier(nama);
    setNoHp(noHp);
    setAlamat(alamat);
  };

  const Toast = Swal.mixin({
    customClass: {
      confirmButton: "btn btn-success",
      cancelButton: "btn btn-danger",
    },
    buttonsStyling: false,
  });

  const batal = () => {
    setSupillerId(0);
    setNamaSupllier("");
    setNoHp("");
    setAlamat("");
  };

  // Edit data anggota
  const save = async () => {
    try {
      await axios.put(`/supplier/${supllierId}`, {
        nama: namaSupllier,
        noHP: noHp,
        alamat: alamat,
      });
      batal();
      loadSupplier();
    } catch (error) {
      console.error(error);
    }
  };

  console.log(supplier);

  return (
    <main id="main" className="main">
      <div className="pagetitle text-center">
        <h1 className="fw-bold fs-2">Data Supplier</h1>
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
                <input type="text" className="form-control" placeholder="Cari Supplier..." onChange={(e) => setSearch(e.target.value)} />
              </div>

              <Link to="/supplier/tambah" className="btn btn-primary btn-sm px-3">
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
                  <th>Alamat</th>
                  <th className="text-center">Aksi</th>
                </tr>
              </thead>

              <tbody>
                {supplier.map((val, index) => (
                  <tr key={index} className={supllierId === val.id ? "table-warning" : ""}>
                    <td>{index + 1}</td>
                    {/* NAMA */}
                    <td>{supllierId === val.id ? <input type="text" className="form-control form-control-sm" value={namaSupllier} onChange={(e) => setNamaSupllier(e.target.value)} /> : val.nama}</td>

                    <td>{supllierId === val.id ? <input type="number" className="form-control form-control-sm" value={noHp} onChange={(e) => setNoHp(e.target.value)} /> : val.noHP}</td>

                    {/* KODE */}
                    <td>{supllierId === val.id ? <input type="text" className="form-control form-control-sm" value={alamat} onChange={(e) => setAlamat(e.target.value)} /> : val.alamat}</td>

                    {/* BUTTON AKSI */}
                    <td className="text-center" style={{ width: "150px" }}>
                      {supllierId === val.id ? (
                        <>
                          <button className="btn btn-sm btn-secondary me-1" onClick={batal}>
                            <i className="bi bi-x-lg"></i> Batal
                          </button>
                          <button className="btn btn-sm btn-success" onClick={save}>
                            <i className="bi bi-check-lg"></i> Simpan
                          </button>
                        </>
                      ) : (
                        <button className="btn btn-sm btn-warning" onClick={() => edit(val.id, val.nama, val.noHP, val.alamat)}>
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
                Total Supplier: <b>{rows}</b> — Halaman <b>{page + 1}</b> dari <b>{pages}</b>
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

export default Supplier;
