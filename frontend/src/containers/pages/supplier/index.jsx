import React, { Component } from 'react'

export default class Supplier extends Component {
    render() {
        return (
            <main id="main" className="main">
                <div className="pagetitle">
                    <h1>Data Supplier</h1>
                    <nav>
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item"> <a href="supplier.html">Input Supplier</a> </li>
                        </ol>
                    </nav>
                </div>
                <section className="section">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="card">
                                <div className="card-body">
                                    <h5 className="card-title text-center "> Data Supplier</h5>
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th scope="col">#</th>
                                                <th scope="col">Nama Supplier</th>
                                                <th scope="col">Nomor Handphone</th>
                                                <th scope="col">Alamat</th>
                                                <th scope="col">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <th scope="row">1</th>
                                                <td>Muhammad</td>
                                                <td>08171167618</td>
                                                <td>Ngantang</td>
                                                <td>
                                                    <button className="btn btn-warning bx bx-edit-alt text-black-50" />
                                                    <button className="bx bx-trash btn btn-danger " />
                                                </td>
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
