import React, { useEffect, useState } from "react";
import Axios from "axios";
import convertRupiah  from "rupiah-format";

const Dashboard = () => {
  const [dataBarang, setDataBarang] = useState([])
  const [barang, setBarang] = useState("")
  const [anggota, setAnggota] = useState("")
  const [Pendapatan, setPendapatan] = useState("")
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(5);
  const [pages, setPages] = useState(0);
  const [rows, setRows] = useState(0);


  useEffect(() => {
    getData()
  },[page])

  
  
  const getData = async () => {
    const barang = await Axios.get("http://localhost:8800/barang")
    setBarang(barang.data.count)

    const response = await Axios.get(`http://localhost:8800/lapBarang?page=${page}&limit=${limit}`);
    setDataBarang(response.data.result);
    setPage(response.data.page);
    setPages(response.data.totalPage);
    setRows(response.data.totalRows);
    
    const anggota = await Axios.get("http://localhost:8800/anggota")
    setAnggota(anggota.data.count)

    const p = await Axios.get("http://localhost:8800/lapBarangDownload");

    const Qty = p.data.total.reduce((e, item) => {
      return e + parseInt(item.total, 10)
    }, 0)
    setPendapatan(Qty)

  }

  console.log(dataBarang)
  
  return (
    <main id="main" className="main">
      <div className="pagetitle">
        <h1 className="card-title text-center">Dashboard</h1>
      </div>
      <section className="section dashboard">
        <div className="row">
          <div className="col-lg-12">
            <div className="row">
              <div class="col-xxl-4 col-md-6">
                <div class="card info-card sales-card">
                  <div class="card-body">
                    <h5 class="card-title">Barang </h5>

                    <div class="d-flex align-items-center">
                      <div class="card-icon rounded-circle d-flex align-items-center justify-content-center">
                        <i class="bi bi-cart"></i>
                      </div>
                      <div class="ps-3">
                        <h6>{barang}</h6>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="col-xxl-4 col-md-6">
                <div class="card info-card revenue-card">
                  <div class="card-body">
                    <h5 class="card-title">Pendapatan </h5>

                    <div class="d-flex align-items-center">
                      <div class="card-icon rounded-circle d-flex align-items-center justify-content-center">
                        <i class="bi bi-currency-dollar"></i>
                      </div>
                      <div class="ps-3">
                        <h6>{convertRupiah.convert(Pendapatan)}</h6>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-xxl-4 col-md-6">
                <div className="card info-card customers-card">
                  <div className="card-body">
                    <h5 class="card-title">Anggota </h5>

                    <div className="d-flex align-items-center">
                      <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
                        <i className="bi bi-people" />
                      </div>
                      <div className="ps-3">
                        <h6>{anggota}</h6>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-12">
              <div class="card recent-sales overflow-auto">

                <div class="card-body">
                  <h5 class="card-title"> Data Barang</h5>

                  <table class="table table-borderless datatable">
                    <thead>
                      <tr>
                        <th scope="col">#</th>
                        <th scope="col">Nama</th>
                        <th scope="col">Jumlah</th>
                        <th scope="col">Harga Jual</th>
                        <th scope="col">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                    {dataBarang.map((data, index) => (
                      <tr key={data.id}>
                        <th>{index + 1}</th>
                        <td>{data.nama}</td>
                        <td>{data.jumlah}</td>
                        <td>{convertRupiah.convert(data.hargaJual)}</td>
                        <td>{convertRupiah.convert(data.hargaJual * data.jumlah)}</td>
                      </tr>
                    ))}
                    </tbody>
                  </table>

                </div>

              </div>
            </div>

            </div>
          </div>
        </div>
      </section>
    </main>
  );
};
export default Dashboard;
