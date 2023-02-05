import React, { Component } from 'react'

export default class TransPenjualan extends Component {
    render() {
        return (
            <main id="main" className="main">
                <div className="pagetitle text-center">
                    <h1>Transaksi Penjualan</h1>
                </div>
                <section className="section">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="card">
                                <div className="card-body row">
                                    <div className="col-md-6">
                                        <h1 className="card-title mt-1">Faktur : FKJ20230203001 </h1>
                                    </div>
                                    <div className="search-bar col-6 text-center mt-3">
                                        <form className="search-form d-flex" method="POST" action="#">
                                            <input type="text" name="query" placeholder="Cari Faktur" title="Enter search keyword" />
                                            <button type="submit" title="Search"><i className="bi bi-search" /></button>
                                        </form>
                                    </div>
                                    <form className="row g-3">
                                        <div className="col-md-6">
                                            <label htmlFor="inputName5" className="form-label">Nama Anggota</label>
                                            <input type="text" className="form-control" id="inputName5" />
                                        </div>
                                        <div className="col-md-6">
                                            <label htmlFor="inputEmail5" className="form-label">Type Pembayaran</label>
                                            <select id="inputState" className="form-select">
                                                <option selected>Tunai</option>
                                                <option>BON</option>
                                            </select>
                                        </div>
                                        <div className="col-md-3">
                                            <label htmlFor="inputPassword5" className="form-label">Kode Barang</label>
                                            <input type="password" className="form-control" id="inputPassword5" />
                                        </div>
                                        <div className="col-md-3">
                                            <label htmlFor="inputPassword5" className="form-label">Nama Barang</label>
                                            <input type="password" className="form-control" id="inputPassword5" />
                                        </div>
                                        <div className="col-2">
                                            <label htmlFor="inputAddress5" className="form-label">Jumlah</label>
                                            <input type="text" className="form-control" id="inputAddres5s" />
                                        </div>
                                        <div className="col-1">
                                            <label htmlFor="inputAddress5" className="form-label">Jenis</label>
                                            <input type="text" className="form-control" id="inputAddres5s" />
                                        </div>
                                        <div className="col-md-3">
                                            <label htmlFor="inputState" className="form-label">Harga</label>
                                            <input type="text" className="form-control" id="inputEmail5" />
                                        </div>
                                        <div className="text-lg-end">
                                            <button type="submit" className="btn btn-primary">Tambah</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="section">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="card">
                                <div className="card-body">
                                    <h1 className="card-title mt-1">Faktur : FKJ20230203001</h1>
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
                                                <td>Muhammad</td>
                                                <td>Muhammad</td>
                                                <td>Muhammad</td>
                                                <td>Muhammad</td>
                                                <td>00001</td>
                                                <td>08171167618</td>
                                                <td>
                                                    <button className="btn btn-warning bx bx-edit-alt text-black-50" />
                                                    <button className="bx bx-trash btn btn-danger " />
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="footer">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="card">
                                <div className="card-body text-end row">
                                    <div className="col-md-10">
                                        <h1 className="card-title mt-auto text-center">Total : 20000</h1>
                                    </div>
                                    <div className="col-md-2 mt-auto">
                                        <button className=" btn btn-primary">Print </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>


        )
    }
}
