import React, { Component } from 'react'

export class Anggota extends Component {
    render() {
        return (
            <main id="main" class="main">
                <div class="pagetitle">
                    <h1>Data Anggota</h1>
                    <nav>
                        <ol class="breadcrumb">
                            <li class="breadcrumb-item"> <a href="anggota.html">Input Anggota</a> </li>
                        </ol>
                    </nav>
                </div>
                <section class="section">
                    <div class="row">
                        <div class="col-lg-12">
                            <div class="card">
                                <div class="card-body">
                                    <h5 class="card-title text-center "> Data Anggota</h5>

                                    <table class="table">
                                        <thead>
                                            <tr>
                                                <th scope="col">#</th>
                                                <th scope="col">Nama Anggota</th>
                                                <th scope="col">NIK</th>
                                                <th scope="col">Nomor Handphone</th>
                                                <th scope="col">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <th scope="row">1</th>
                                                <td>Muhammad</td>
                                                <td>00001</td>
                                                <td>08171167618</td>
                                                <td>
                                                    <button class="btn btn-warning bx bx-edit-alt text-black-50"></button>
                                                    <button class="bx bx-trash btn btn-danger "></button>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>

                                    <nav aria-label="...">
                                        <ul class="pagination justify-content-center">
                                            <li class="page-item disabled">
                                                <a class="page-link" href="#" aria-label="Previous">
                                                    <span aria-hidden="true">&laquo;</span>
                                                </a>
                                            </li>
                                            <li class="page-item"><a class="page-link" href="#">1</a></li>
                                            <li class="page-item active"><a class="page-link" href="#">2</a></li>
                                            <li class="page-item"><a class="page-link" href="#">3</a></li>
                                            <li class="page-item">
                                                <a class="page-link" href="#" aria-label="Next">
                                                    <span aria-hidden="true">&raquo;</span>
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

export default Anggota
