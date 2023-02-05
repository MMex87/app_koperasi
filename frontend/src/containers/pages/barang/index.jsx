import React, { Component } from 'react'

export default class Barang extends Component {
    render() {
        return (
            <main id="main" className="main">
                <div className="pagetitle">
                    <h1>Data Barang</h1>
                </div>
                <section className="section">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="card">
                                <div className="card-body">
                                    <h5 className="card-title text-center "> Data Barang</h5>
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th scope="col">#</th>
                                                <th scope="col">Nama Barang</th>
                                                <th scope="col">Kode Barang</th>
                                                <th scope="col">Supplier</th>
                                                <th scope="col">Satuan</th>
                                                <th scope="col">Jenis</th>
                                                <th scope="col">Harga Beli</th>
                                                <th scope="col">Harga Jual</th>
                                                <th scope="col">Jumlah</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <th scope="row">1</th>
                                                <td>Bodrex</td>
                                                <td>00001</td>
                                                <td>Mayora</td>
                                                <td>Box</td>
                                                <td>Obat</td>
                                                <td>2000</td>
                                                <td>2500</td>
                                                <td>20</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <nav aria-label="...">
                                        <ul className="pagination justify-content-center">
                                            <li className="page-item disabled">
                                                <a className="page-link" href="#" aria-label="Previous">
                                                    <span aria-hidden="true">«</span>
                                                </a>
                                            </li>
                                            <li className="page-item"><a className="page-link" href="#">1</a></li>
                                            <li className="page-item active"><a className="page-link" href="#">2</a></li>
                                            <li className="page-item"><a className="page-link" href="#">3</a></li>
                                            <li className="page-item">
                                                <a className="page-link" href="#" aria-label="Next">
                                                    <span aria-hidden="true">»</span>
                                                </a>
                                            </li>
                                        </ul>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

        )
    }
}
