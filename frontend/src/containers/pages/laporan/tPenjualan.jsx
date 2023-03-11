import React, { Component } from "react";
import getTransPenjualanJoin from "../../../utils/transaksiPenjualan/getTransPenjualanJoin";
import moment from "moment";

class tPenjualan extends Component {
  constructor(props) {
    super(props);
    this.state = {
      penjualan: [],
      search: "",
    };
  }

  componentDidMount() {
    getTransPenjualanJoin(this.state.penjualan).then((asu) => {
      this.setState({ penjualan: asu });
      this.setState({ search: asu });
    });
  }

  render() {
    console.log(this.state.penjualan);
    return (
      <main id="main">
        <div className="text-center pagetitle">
          <h1 className="fs-2 fw-bold"> Laporan Penjualan </h1>
        </div>

        <section className="section">
          <div className="card">
            <div className="card-body">
              <div className="col-lg-12">
                <div className="row">
                  <div className="col-md-10"></div>
                  <div className="text-end col-md-2 pt-3">
                    <input type="date" className=" form-control" />
                  </div>
                  <table className="table mt-2">
                    <thead>
                      <tr>
                        <th scope="col">#</th>
                        <th scope="col">Faktur</th>
                        <th scope="col">Anggota</th>
                        <th scope="col">Pembayaran</th>
                        <th scope="col">Barang</th>
                        <th scope="col">Jumlah</th>
                        <th scope="col">Harga</th>
                        <th scope="col">Tanggal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {this.state.penjualan.map((val, index) => (
                        <tr key={index}>
                          <th>{index + 1}</th>
                          <td>{val.faktur}</td>
                          <td>{val.anggota.nama}</td>
                          <td>{val.typePembayaran}</td>
                          <td>{val.barang.nama}</td>
                          <td>{val.jumlah}</td>
                          <td>{val.harga.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}</td>
                          <td>{moment(val.waktuBeli).format("D MMM YYYY")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div>
                    <button className="btn btn-success"> Simpan</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }
}

export default tPenjualan;
