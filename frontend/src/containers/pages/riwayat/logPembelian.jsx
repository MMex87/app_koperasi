import moment from "moment";
import ReactPaginate from "react-paginate";
import "jspdf-autotable";
import { useEffect, useState } from "react";
import axios from "axios";

const logPembelian = () => {
  const [dataLog, setDataLog] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(0);
  const [rows, setRows] = useState(0);

  useEffect(() => {
    getData();
  }, [page, search]);

  const getData = async () => {
    const response = await axios.get(`http://localhost:8800/logPembelian?search=${search}&limit=10&page=${page}`);
    setDataLog(response.data.result);
    setPage(response.data.page);
    setPages(response.data.totalPage);
    setRows(response.data.totalRows);
  };

  const changePage = ({ selected }) => {
    setPage(selected);
  };
  return (
    <main id="main">
      <div className="text-center pagetitle">
        <h1 className="fs-2 fw-bold"> Riwayat Pembelian Barang </h1>
      </div>

      <section className="section">
        <div className="card">
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-center text-end mb-4">
              <div className="input-group search-group" style={{ maxWidth: "300px" }}>
                <span className="input-group-text bg-white">
                  <i className="bi bi-search"></i>
                </span>
                <input type="text" className="form-control" placeholder="Cari barang..." onChange={(e) => setSearch(e.target.value)} />
              </div>
            </div>

            <table className="table table-striped table-hover align-middle">
              <thead className="table-dark">
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Barang</th>
                  <th scope="col">Stok Awal</th>
                  <th scope="col">Pembelian</th>
                  <th scope="col">Stok Akhir </th>
                  <th scope="col">Keterangan </th>
                  <th scope="col">Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {dataLog.map((data, index) => (
                  <tr key={data.id}>
                    <th>{index + 1}</th>
                    <td>{data.barang.nama}</td>
                    <td>{data.qty_awal}</td>
                    <td>{data.qty}</td>
                    <td>{data.qty_baru}</td>
                    <td>{data.keterangan}</td>
                    <td>{moment(data.createdAt).format("LLL")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="d-flex justify-content-between align-items-center mt-3">
              <p className="m-0">
                Total Penjualan: <b>{rows}</b> — Halaman <b>{page + 1}</b> dari <b>{pages}</b>
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

export default logPembelian;
