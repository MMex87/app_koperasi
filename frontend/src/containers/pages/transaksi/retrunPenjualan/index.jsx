import axios from "../../../../api/axios";
import { useState, useEffect } from "react";
import ReactPaginate from "react-paginate";
import convertRupiah from "rupiah-format";
import { Link } from "react-router-dom";

const formatTanggal = (v) => new Date(v).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

const RPenjualan = () => {
  const [dataPenjualan, setDataPenjualan] = useState([]);
  const [page, setPage] = useState(0);
  const [limit] = useState(10);
  const [pages, setPages] = useState(0);
  const [rows, setRows] = useState(0);
  const [nama, setNama] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getData();
  }, [page, nama]);

  const changePage = ({ selected }) => {
    setPage(selected);
  };

  const getData = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/transPenjualanJoinRetur", { params: { page, limit, namaBarang: nama } });
      setDataPenjualan(response.data.result);
      setPages(response.data.totalPage);
      setRows(response.data.totalRows);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const search = (e) => {
    setNama(e.target.value);
    setPage(0);
  };

  return (
    <main id="main" className="main retur-page">
      <div className="pagetitle mb-4">
        <h1 className="fs-2 fw-bold mb-1">Retur Penjualan</h1>
        <small className="text-muted">Transaksi penjualan tahun {new Date().getFullYear()} — pilih yang barangnya dikembalikan pembeli, stok akan bertambah kembali</small>
      </div>

      <section className="section">
        <div className="card border-0 shadow-sm">
          <div className="card-body p-4">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
              <div className="input-group" style={{ maxWidth: "360px" }}>
                <span className="input-group-text bg-white">
                  <i className="bi bi-search" />
                </span>
                <input type="text" className="form-control" placeholder="Cari nama barang atau faktur..." value={nama} onChange={search} />
              </div>
              <span className="badge rounded-pill bg-primary bg-opacity-10 text-primary px-3 py-2">{rows} transaksi</span>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0 retur-table">
                <thead className="table-light">
                  <tr>
                    <th className="text-center">No</th>
                    <th>Tanggal</th>
                    <th>Faktur</th>
                    <th>Barang</th>
                    <th className="text-center">Jumlah</th>
                    <th className="text-end">Total</th>
                    <th className="text-center">Status</th>
                    <th className="text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="text-center py-5">
                        <div className="spinner-border spinner-border-sm text-primary me-2" />
                        <span className="text-muted">Memuat data...</span>
                      </td>
                    </tr>
                  ) : dataPenjualan.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center text-muted py-5">
                        <i className="bi bi-inbox fs-1 d-block mb-2" />
                        {nama ? `Tidak ada transaksi yang cocok dengan "${nama}"` : "Belum ada transaksi penjualan"}
                      </td>
                    </tr>
                  ) : (
                    dataPenjualan.map((data, index) => (
                      <tr key={data.id}>
                        <td className="text-center text-muted">{page * limit + index + 1}</td>
                        <td className="text-muted small">{formatTanggal(data.createdAt)}</td>
                        <td className="fw-semibold">{data.faktur}</td>
                        <td>
                          <div className="fw-semibold">{data.barang.nama}</div>
                          <small className="text-muted">{data.anggota?.nama || "-"}</small>
                        </td>
                        <td className="text-center">{data.jumlah}</td>
                        <td className="text-end">{convertRupiah.convert(data.harga)}</td>
                        <td className="text-center">
                          {data.statusPenjualan === "Retur" ? (
                            <span className="badge bg-warning text-dark">
                              <i className="bi bi-arrow-return-left me-1" />
                              Pernah diretur
                            </span>
                          ) : (
                            <span className="badge bg-light text-dark border">{data.statusPenjualan}</span>
                          )}
                        </td>
                        <td className="text-center">
                          <Link to={`/retrunPenjualan/${data.id}`} className="btn btn-sm btn-outline-primary">
                            <i className="bi bi-arrow-return-left me-1" />
                            Retur
                          </Link>
                        </td>
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

      <style>{`
        /* Template memberi tiap .card & .pagetitle h1 margin-left -90px; geser sekali di level halaman */
        .retur-page .card { margin: 0; border-radius: 14px; }
        .retur-page .pagetitle h1 { margin-left: 0; }
        @media (min-width: 1200px) {
          .retur-page .pagetitle,
          .retur-page .section { margin-left: -90px; }
        }
        .retur-page .retur-table thead th {
          font-size: .75rem; text-transform: uppercase; letter-spacing: .03em;
          color: #6c757d; white-space: nowrap;
        }
        .retur-page .retur-table td { white-space: nowrap; }
      `}</style>
    </main>
  );
};

export default RPenjualan;
