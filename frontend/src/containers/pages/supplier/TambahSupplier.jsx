import React, { Component } from 'react'

export default class TambahSupplier extends Component {
    render() {
        return (
            <main id="main" class="main">
                <div class="pagetitle">
                    <h1>Input Supplier</h1>
                    <nav>
                        <ol class="breadcrumb">
                            <li class="breadcrumb-item"> <a href="index.html">Data Supplier</a> </li>
                        </ol>
                    </nav>
                </div>
                <section class="section">
                    <div class="row">
                        <div class="col-lg-12">
                            <div class="card">
                                <div class="card-body">
                                    <h5 class="card-title text-center "> Input Supplier</h5>

                                    <form>
                                        <div class="row mb-3">
                                            <label for="inputEmail3" class="col-sm-2 col-form-label">Nama Supplier</label>
                                            <div class="col-sm-10">
                                                <input type="text" class="form-control" id="inputText" />
                                            </div>
                                        </div>
                                        <div class="row mb-3">
                                            <label for="inputEmail3" class="col-sm-2 col-form-label">Nomor Handphone</label>
                                            <div class="col-sm-10">
                                                <input type="number" class="form-control" id="inputEmail" />
                                            </div>
                                        </div>
                                        <div class="row mb-3">
                                            <label for="inputPassword3" class="col-sm-2 col-form-label">Alamat</label>
                                            <div class="col-sm-10">
                                                <input type="text" class="form-control" id="inputPassword" />
                                            </div>
                                        </div>
                                        <div class="text-center">
                                            <button type="submit" class="btn btn-primary">Tambah</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        )
    }
}
