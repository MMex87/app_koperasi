import React, { Component } from "react";
import AddCartManual from "../penjualan/addCartManual";
import AddCartScan from "../penjualan/addCartScan";

export default class TransPembelian extends Component {
  state = {
    transaksi: [],
    visiJenisInput: false,
    displayAnggota: false,
    anggotas: [],
    barang: [],
  };
  render() {
    const handleVisiInput = (e) => {
      let handle = e.target.value;
      if (handle == "scan") {
        this.setState({ visiJenisInput: true });
      } else {
        this.setState({ visiJenisInput: false });
      }
    };

    return (
      <main id="main" className="main">
        <div className="pagetile text-center">
          <h1 className="fw-bold fs-2">Transaksi Pembelian</h1>
        </div>
        <section className="section">
          <div className="row">
            <div className="col-lg-12">
              <div className="card">
                <div className="card-body row">
                  <div className="col-md-6">
                    <h1 className="card-title mt-1 fw-bold">Faktur : FKJ20230203001 </h1>
                  </div>

                  <form className="row g-3">
                    <div className="col-md-6">
                      <label htmlFor="inputName5" className="form-label">
                        Nama Supplier
                      </label>
                      <input type="text" className="form-control" id="inputName5" />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="inputEmail5" className="form-label">
                        Type Pembayaran
                      </label>
                      <select id="inputState" className="form-select">
                        <option selected>-- Pilih Type Pembayaran --</option>
                        <option>Tunai</option>
                        <option>BON</option>
                      </select>
                    </div>
                    <div className="col-12">
                      <label htmlFor="jenisInput" className="form-label">
                        Jenis Input
                      </label>
                      <select id="jenisInput" className="form-select" onChange={handleVisiInput}>
                        <option value={"manual"}>Manual</option>
                        <option value={"scan"}>Scan Barcode</option>
                      </select>
                    </div>
                    {this.state.visiJenisInput ? <AddCartScan /> : <AddCartManual />}

                    <div className="text-lg-end">
                      <button type="submit" className="btn btn-primary fw-bold">
                        TAMBAH
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="card">
            <div className="card-body">
              <div className="col-lg-12">
                <div className="row">
                  <div className="col-md-8">
                    <h1 className="card-title mt-1 fw-bold">Faktur :</h1>
                  </div>
                  <div className="col-md-4">
                    <div className="search-bar text-center mt-3">
                      <form className="search-form d-flex align-items-center" method="POST" action="#">
                        <div className="input-group mb-3">
                          <input type="text" className="form-control" name="query" placeholder="Cari Faktur" title="Enter search keyword" aria-label="Recipient's username" aria-describedby="button-addon2" />
                          <button className="btn btn-outline-secondary" type="button" id="button-addon2">
                            <i className="bi bi-search" />
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>

                  <table className="table">
                    <thead>
                      <tr>
                        <th scope="col">#</th>
                        <th scope="col">Nama Anggota</th>
                        <th scope="col">Type Pembayaran</th>
                        <th scope="col">Kode Barang</th>
                        <th scope="col">Nama Barang</th>
                        <th scope="col">Jumlah</th>
                        <th scope="col">Harga</th>
                        <th scope="col">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <th scope="row">1</th>
                        <td>ras Muhammad</td>
                        <td>ras Muhammad</td>
                        <td>ras Muhammad</td>
                        <td>ras Muhammad</td>
                        <td>00001</td>
                        <td>08171167618</td>
                        <td>
                          <button className="btn btn-warning bx bx-edit-alt text-black-50 me-2" />
                          <button className="bx bx-trash btn btn-danger " />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="text-end me-2">
                    <button className="btn btn-success fw-bolder">SIMPAN</button>
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
