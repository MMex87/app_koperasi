import axios from "../../../../api/axios";
import { useState, useEffect } from "react";
import moment from "moment";
import ReactPaginate from "react-paginate";
import convertRupiah from "rupiah-format";
import { Link } from "react-router-dom";

const RPenjualan = () => {
  const [dataPenjualan, setDataPenjualan] = useState([]);
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(0);
  const [rows, setRows] = useState(0);
  const [nama, setNama] = useState("");

  useEffect(() => {
    getData();
  }, [page, nama]);

  const changePage = ({ selected }) => {
    setPage(selected);
  };

  const getData = async () => {
    const response = await axios.get(`http://localhost:8800/transPenjualanJoinRetur?&page=${page}&namaBarang=${nama}`);
    setDataPenjualan(response.data.result);
    setPage(response.data.page);
    setPages(response.data.totalPage);
    setRows(response.data.totalRows);
  };

  const search = (e) => {
    setNama(e.target.value);
  };

  console.log(dataPenjualan);

  return (
    <main id="main">
      <div className="pagetitle text-center">
        <h1 className="fw-bold fs-2">Retur Penjualan</h1>
      </div>

      <section className="section">
        <div className="card">
          <div className="card-body p-4">
            <div className="col-lg-12">
              <div className="col-md-12">
                <>
                  <div className="row">
                    <div className="col-md-9"></div>
                    <div className="col-md-3 text-end">
                      <input type="text" className="form-control" name="query" placeholder="Cari Barang" title="Enter search keyword" aria-label="Recipient's username" aria-describedby="button-addon2" value={nama} onChange={search} />
                    </div>
                  </div>
                  <table className="table table-striped table-hover align-middle mt-2">
                    <thead className="table-dark">
                      <tr>
                        <th>#</th>
                        <th>Faktur</th>
                        <th>Barang</th>
                        <th>Jumlah</th>
                        <th>Total</th>
                        <th>Tanggal</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dataPenjualan.map((data, index) => (
                        <tr key={data.id}>
                          <th>{index + 1}</th>
                          <td>{data.faktur}</td>
                          <td>{data.barang.nama}</td>
                          <td>{data.jumlah}</td>
                          <td>{convertRupiah.convert(data.barang.hargaJual * data.jumlah)}</td>
                          <td>{moment(data.createdAt).format("D MMMM YYYY")}</td>
                          <Link to={`/retrunPenjualan/${data.id}`} className="btn btn-sm btn-info">
                            Retur
                          </Link>
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
                </>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default RPenjualan;
