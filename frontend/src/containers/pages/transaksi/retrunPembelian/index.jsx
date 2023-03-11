import { Component } from "react";

class RPembelian extends Component {
  render() {
    return (
      <main id="main">
        <div className="pagetitle text-center">
          <h1 className="fw-bold fs-2">Retrun Pembelian</h1>
        </div>

        <section className="section">
          <div className="card p-3">
            <div className="col-lg-12">
              <div className="col-md-12">
                <div className="row">
                  <div className="col-md-9"></div>
                  <div className="col-md-3 text-end">
                    <input type="text" className="form-control" placeholder="Cari Supplier" />
                  </div>
                </div>
                <div className="mt-3">
                  <table className="table ">
                    <thead>
                      <tr>
                        <th scope="col">#</th>
                        <th scope="col">Faktur</th>
                        <th scope="col">Supplier</th>
                        <th scope="col">Barang</th>
                        <th scope="col">Jumlah</th>
                        <th scope="col">Total</th>
                        <th scope="col">Tanggal</th>
                        <th scope="col">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <th>1</th>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td>
                          <button className="btn btn-warning">Edit</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }
}

export default RPembelian;
