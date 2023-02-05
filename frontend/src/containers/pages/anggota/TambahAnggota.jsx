import React, { Component } from 'react'


class TambahAnggota extends Component {
    render() {
        return (
            <main id="main" className="main">
                <div className="pagetitle">
                    <h1>Input Anggota</h1>
                    <nav>
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item"> <a href="index.html">Data Anggota</a> </li>
                        </ol>
                    </nav>
                </div>
                <section className="section">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="card">
                                <div className="card-body">
                                    <h5 className="card-title text-center "> Input Anggota</h5>
                                    <form>
                                        <div className="row mb-3">
                                            <label htmlFor="inputEmail3" className="col-sm-2 col-form-label">Nama Anggota</label>
                                            <div className="col-sm-10">
                                                <input type="text" className="form-control" id="inputText" />
                                            </div>
                                        </div>
                                        <div className="row mb-3">
                                            <label htmlFor="inputEmail3" className="col-sm-2 col-form-label">NIK</label>
                                            <div className="col-sm-10">
                                                <input type="number" className="form-control" id="inputEmail" />
                                            </div>
                                        </div>
                                        <div className="row mb-3">
                                            <label htmlFor="inputPassword3" className="col-sm-2 col-form-label">Nomor Handphone</label>
                                            <div className="col-sm-10">
                                                <input type="number" className="form-control" id="inputPassword" />
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <button type="submit" className="btn btn-primary">Tambah</button>
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


export default TambahAnggota