import axios from "../../../../api/axios";
import {useState, useEffect} from "react";
import moment from "moment";
import ReactPaginate from "react-paginate";
import convertRupiah from "rupiah-format";
import { Link } from "react-router-dom";

const RPembelian = () => {
  const [dataPembelian, setDataPembelian] = useState([]);
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(0);
  const [rows, setRows] = useState(0);
  const [nama, setNama] = useState("");


  useEffect(() => {
    getData();
  },[page,nama]);

  const changePage = ({ selected }) => {
    setPage(selected);
  };

  const getData = async () => {
    const response = await axios.get(`http://localhost:8800/transPembelianJoinRetur?&page=${page}&namaBarang=${nama}`);
    setDataPembelian(response.data.result);
    setPage(response.data.page);
    setPages(response.data.totalPage);
    setRows(response.data.totalRows);
  };

  const search = (e) => {
    setNama(e.target.value)
  }


  // console.log(dataPembelian)

    return (
      <main id="main">
        <div className="pagetitle text-center">
          <h1 className="fw-bold fs-2">Retur Pembelian</h1>
        </div>

        <section className="section">
          <div className="card p-3">
            <div className="col-lg-12">
              <div className="col-md-12">
                <div className="">
                  <>
                  <div className="row">
                    <div className="col-md-9"></div>
                    <div className="col-md-3 text-end">
                      <input
                        type="text"
                        className="form-control"
                        name="query"
                        placeholder="Cari Barang"
                        title="Enter search keyword"
                        aria-label="Recipient's username"
                        aria-describedby="button-addon2"
                        value={nama}
                        onChange={search}
                      />
                    </div>
                  </div>
                        <table className="table ">
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Faktur</th>
                              <th>Barang</th>
                              <th>Jumlah</th>
                              <th>Total</th>
                              <th>Tanggal</th>
                              <th>Status</th>
                              <th>Aksi</th>
                            </tr>
                          </thead>
                          <tbody>
                            {dataPembelian.map((data, index) => (
                              <tr key={data.id}>
                                <th>{index + 1}</th>
                                <td>{data.faktur}</td>
                                <td>{data.barang.nama}</td>
                                <td>{data.jumlah}</td>
                                <td>{convertRupiah.convert(data.barang.hargaJual * data.jumlah)}</td>
                                <td>{moment(data.createdAt).format("D MMMM YYYY")}</td>
                                <td>{data.statusPembelian}</td>
                                <Link to={`/retrunPembelian/${data.id}`} className="btn btn-warning me-3">
                                    Retur
                                </Link>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <div className="p-3">
                          <div className="d-flex justify-content-between">
                            <p className="text-center">
                            Total Rows : {rows} Page: {rows ? page + 1 : 0} of {pages}
                            </p>
                            <nav aria-label="Page navigate example justify-content-end">
                              <ReactPaginate
                                previousLabel={ "< Prev" }
                                nextLabel={ "Next >" }
                                pageCount={ pages }
                                onPageChange={ changePage }
                                containerClassName={ "pagination" }
                                pageLinkClassName={ "page-link" }
                                pageClassName={ "page-item" }
                                previousLinkClassName={ "page-link" }
                                previousClassName={ "page-item" }
                                nextClassName={ "page-item" }
                                nextLinkClassName={ "page-link" }
                                activeClassName={ "active" }
                              />
                            </nav>
                          </div>
                        </div>
                      </>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

export default RPembelian;