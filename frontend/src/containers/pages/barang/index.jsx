import axios from "../../../api/axios";
import React, { useState, useEffect } from "react";
import ReactPaginate from "react-paginate";
import { Link } from "react-router-dom";
import getSearchBarang from "../../../utils/barang/getSearchBarang.jsx";
import convertRupiah from "rupiah-format";

export default function Barang() {
  const [barang, setBarang] = useState([]);
  const [search, setSearch] = useState("");
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

  useEffect(() => {
    loadBarang();
  }, []);

  useEffect(() => {
    loadBarang();
  }, [search, page, barangId]);

  const loadBarang = () => {
    getSearchBarang(search, limit, page).then((data) => {
      setBarang(data.result);
      setPage(data.page);
      setRows(data.totalRows);
      setPages(data.totalPage);
    });
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
  };

  const save = async () => {
    try {
      await axios.put(`/barang/${barangId}`, {
        nama: namaBarang,
        kodeBarang: kodeBarang,
        hargaBeli: hargaBeli,
        hargaJual: hargaJual,
      });
      batal();
      loadBarang();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <main id="main" className="main">
      <div className="pagetitle mb-3">
        <h1 className="text-center fs-2 fw-bold">Data Barang</h1>
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
                <input type="text" className="form-control" placeholder="Cari barang..." onChange={(e) => setSearch(e.target.value)} />
              </div>

              <Link to="/transPembelian" className="btn btn-primary btn-sm px-3">
                <i className="bi bi-plus-lg"></i> Tambah
              </Link>
            </div>

            {/* TABLE */}
            <table className="table table-striped table-hover align-middle">
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Nama Barang</th>
                  <th>Kode</th>
                  <th>Supplier</th>
                  <th>Satuan</th>
                  <th>Jenis</th>
                  <th className="text-end">Harga Beli</th>
                  <th className="text-end">Harga Jual</th>
                  <th className="text-center">Jumlah</th>
                  <th className="text-center">Aksi</th>
                </tr>
              </thead>

              <tbody>
                {barang.map((val, index) => (
                  <tr key={index} className={barangId === val.id ? "table-warning" : ""}>
                    <td>{index + 1}</td>

                    {/* NAMA */}
                    <td style={{ width: "220px" }}>{barangId === val.id ? <input type="text" className="form-control form-control-sm" value={namaBarang} onChange={(e) => setNamaBarang(e.target.value)} /> : val.nama}</td>

                    {/* KODE */}
                    <td style={{ width: "140px" }}>{barangId === val.id ? <input type="text" className="form-control form-control-sm" value={kodeBarang} onChange={(e) => setKodeBarang(e.target.value)} /> : val.kodeBarang}</td>

                    <td>{val.supplier.nama}</td>
                    <td>{val.satuan}</td>
                    <td>{val.jenisBarang}</td>

                    {/* HARGA BELI */}
                    <td className="text-end">
                      {barangId === val.id ? <input type="number" className="form-control form-control-sm text-end" value={hargaBeli} onChange={(e) => setHargaBeli(e.target.value)} /> : convertRupiah.convert(val.hargaBeli)}
                    </td>

                    {/* HARGA JUAL */}
                    <td className="text-end">
                      {barangId === val.id ? <input type="number" className="form-control form-control-sm text-end" value={hargaJual} onChange={(e) => setHargaJual(e.target.value)} /> : convertRupiah.convert(val.hargaJual)}
                    </td>

                    <td className="text-center">{val.jumlah}</td>

                    {/* BUTTON AKSI */}
                    <td className="text-center" style={{ width: "150px" }}>
                      {barangId === val.id ? (
                        <>
                          <button className="btn btn-sm btn-secondary me-1" onClick={batal}>
                            <i className="bi bi-x-lg"></i> Batal
                          </button>
                          <button className="btn btn-sm btn-success" onClick={save}>
                            <i className="bi bi-check-lg"></i> Simpan
                          </button>
                        </>
                      ) : (
                        <button className="btn btn-sm btn-warning" onClick={() => edit(val.id, val.nama, val.kodeBarang, val.hargaBeli, val.hargaJual)}>
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
                Total Barang: <b>{rows}</b> — Halaman <b>{page + 1}</b> dari <b>{pages}</b>
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
}
