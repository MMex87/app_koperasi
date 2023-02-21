import React, { Component } from 'react'
import axios from '../../../api/axios.jsx'
import getBarang from '../../../utils/barang/getBarang.jsx'

export default class Barang extends Component {
    state = {
        barang: []
    }

    componentDidMount() {
        getBarang().then((data) => {
            this.setState({ barang: data })
        })
    }


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
                                            {
                                                this.state.barang.map((val, index) => (
                                                    <tr key={ index }>
                                                        <th scope="row">{ index + 1 }</th>
                                                        <td>{ val.nama }</td>
                                                        <td>{ val.kodeBarang }</td>
                                                        <td>paidi</td>
                                                        <td>{ val.satuan }</td>
                                                        <td>{ val.jenisBarang }</td>
                                                        <td>{ val.hargaBeli }</td>
                                                        <td>{ val.hargaJual }</td>
                                                        <td>{ val.jumlah }</td>
                                                    </tr>
                                                ))
                                            }
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
