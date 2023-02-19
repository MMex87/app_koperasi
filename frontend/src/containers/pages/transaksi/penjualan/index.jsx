import React, { Component } from 'react'
import axios from '../../../../api/axios'
import { generateFaktur } from '../../../../components/faktur/generateFaktur'

export default class TransPenjualan extends Component {
    state = {
        transaksi: [],
        faktur: '',
        visiJenisInput: false,
        anggota: '',
        typePembayaran: '',
        kodeBarang: '',
        namaBarang: '',
        jumlah: '',
        jenis: '',
        harga: '',
        displayAnggota: false,
        anggotas: []
    }

    componentDidMount() {
        this.getTransaksi()
        this.setState({ faktur: generateFaktur('FKJ') })
        this.getAnggota()
    }


    getTransaksi = async () => {
        try {
            const response = await axios.get('/transPenjualanJoin')
            this.setState({ transaksi: response.data })
        } catch (error) {
            console.error(error.response)
        }
    }

    getAnggota = async () => {
        try {
            const response = await axios.get('/anggota')
            this.setState({ anggotas: response.data })
        } catch (error) {
            console.error(error)
        }
    }



    render() {

        const handleChart = async (e) => {
            e.preventDefault()
            try {

            } catch (error) {
                console.error(error)
            }
        }
        const handleVisiInput = (e) => {
            let handle = e.target.value
            if (handle == 'scan') {
                this.setState({ visiJenisInput: true })
            } else {
                this.setState({ visiJenisInput: false })
            }
        }

        const handleAutoAnggota = (val) => {
            this.setState({ displayAnggota: false, anggota: val })
        }


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
                                    <div className="col-md-4">
                                        <h1 className="card-title mt-1">Faktur : { this.state.faktur } </h1>
                                    </div>
                                    <div className='col-md-3'>
                                        <button type='button' className='btn btn-outline-secondary mt-3' onClick={ () => this.setState({ faktur: generateFaktur('FKJ') }) }>Generate Faktur</button>
                                    </div>
                                    <div className="search-bar col-5 text-center mt-3">
                                        <form className="search-form d-flex align-items-center" method="POST" action="#">
                                            <div className="input-group mb-3">
                                                <input type="text" className="form-control" name="query" placeholder="Cari Faktur" title="Enter search keyword" aria-label="Recipient's username" aria-describedby="button-addon2" />
                                                <button className="btn btn-outline-secondary" type="button" id="button-addon2"><i className="bi bi-search" /></button>
                                            </div>
                                        </form>
                                    </div>
                                    <form className="row g-3" onSubmit={ handleChart }>
                                        <div className="col-md-6">
                                            <label htmlFor="namaAnggota" className="form-label">Nama Anggota</label>
                                            <input type="text" className="form-control" id="namaAnggota" value={ this.state.anggota }
                                                autoComplete='false'
                                                onChange={ (e) => this.setState({ anggota: e.target.value }) }
                                                onClick={ () => this.setState({ displayAnggota: !this.state.displayAnggota }) } />
                                            {
                                                this.state.displayAnggota &&
                                                <div className="flex-container flex-column pos-rel" style={ { height: 50 } }>
                                                    <ul className="list-group list-group-flush">
                                                        {
                                                            this.state.anggotas
                                                                .filter(({ nama }) =>
                                                                    nama.indexOf(this.state.anggota) > -1
                                                                )
                                                                .map((v, i) => (
                                                                    <li key={ i } onClick={ () => { handleAutoAnggota(v.nama) } } className="list-group-item" > { v.nama }</li>
                                                                ))
                                                        }
                                                    </ul>
                                                </div>
                                            }
                                        </div>
                                        <div className="col-md-6">
                                            <label htmlFor="typePembayaran" className="form-label">Type Pembayaran</label>
                                            <select id="typePembayaran" className="form-select" onChange={ (e) => this.setState({ typePembayaran: e.target.value }) }>
                                                <option
                                                    selected={ this.state.typePembayaran == 'Tunai' && 'true' }
                                                    value={ 'Tunai' }>Tunai</option>
                                                <option
                                                    selected={ this.state.typePembayaran == 'Bon' && 'true' }
                                                    value={ 'Bon' }>BON</option>
                                            </select>
                                        </div>
                                        <div className="col-12">
                                            <label htmlFor="jenisInput" className="form-label">Jenis Input</label>
                                            <select id="jenisInput" className="form-select" onChange={ handleVisiInput }>
                                                <option value={ 'manual' }>Manual</option>
                                                <option value={ 'scan' }>Scan Barcode</option>
                                            </select>
                                        </div>
                                        {
                                            this.state.visiJenisInput
                                                ?
                                                <div className="col-12">
                                                    <label htmlFor="kodeBarang" className="form-label">Kode Barang</label>
                                                    <input type="password" className="form-control" id="kodeBarang" value={ this.state.kodeBarang } autoFocus={ true }
                                                        onChange={ (e) => this.setState({ kodeBarang: e.target.value }) } />
                                                </div>
                                                :
                                                <>
                                                    <div className="col-md-3">
                                                        <label htmlFor="kodeBarang" className="form-label">Kode Barang</label>
                                                        <input type="password" className="form-control" id="kodeBarang"
                                                            value={ this.state.kodeBarang }
                                                            onChange={ (e) => this.setState({ kodeBarang: e.target.value }) }
                                                        />
                                                    </div>
                                                    <div className="col-md-3">
                                                        <label htmlFor="namabarang" className="form-label">Nama Barang</label>
                                                        <input type="password" className="form-control" id="namabarang" value={ this.state.namaBarang }
                                                            onChange={ (e) => this.setState({ namaBarang: e.target.value }) } />
                                                    </div>
                                                    <div className="col-2">
                                                        <label htmlFor="jumlah" className="form-label">Jumlah</label>
                                                        <input type="text" className="form-control" id="jumlah" value={ this.state.jumlah }
                                                            onChange={ (e) => this.setState({ jumlah: e.target.value }) } />
                                                    </div>
                                                    <div className="col-1">
                                                        <label htmlFor="jenis" className="form-label">Jenis</label>
                                                        <input type="text" className="form-control" id="jenis" value={ this.state.jenis }
                                                            onChange={ (e) => this.setState({ jenis: e.target.value }) } />
                                                    </div>
                                                    <div className="col-md-3">
                                                        <label htmlFor="harga" className="form-label">Harga</label>
                                                        <input type="text" className="form-control" id="harga" value={ this.state.harga }
                                                            onChange={ (e) => this.setState({ harga: e.target.value }) } />
                                                    </div>
                                                </>
                                        }
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
                                    <h1 className="card-title mt-1">Faktur : { this.state.faktur }</h1>
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Nama Anggota</th>
                                                <th>Type Pembayaran</th>
                                                <th>Kode Barang</th>
                                                <th>Nama Barang</th>
                                                <th>Jumlah</th>
                                                <th>Harga</th>
                                                <th>Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                this.state.transaksi.map((val, index) => (
                                                    <tr key={ index }>
                                                        <th>{ index + 1 }</th>
                                                        <td>{ val.anggota.nama }</td>
                                                        <td>{ val.typePembayaran }</td>
                                                        <td>{ val.barang.kodeBarang }</td>
                                                        <td>{ val.barang.nama }</td>
                                                        <td>1</td>
                                                        <td>{ val.barang.hargaJual }</td>
                                                        <td>
                                                            <button className="btn btn-warning bx bx-edit-alt text-black-50" />
                                                            <button className="bx bx-trash btn btn-danger " />
                                                        </td>
                                                    </tr>

                                                ))
                                            }
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
