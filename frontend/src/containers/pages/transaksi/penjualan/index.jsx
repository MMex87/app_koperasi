import React, { Component } from 'react'
import axios from '../../../../api/axios'
import { generateFaktur } from '../../../../components/faktur/generateFaktur'
import { connect } from 'react-redux'
import ActionType from '../../../../redux/reducer/globalActionType'
import AddChartManual from './addChartManual'
import AddChartScan from './addChartScan'
import ChartList from './chartList'
import getAnggota from '../../../../utils/anggota/getAnggota'

class TransPenjualan extends Component {

    state = {
        transaksi: [],
        visiJenisInput: false,
        displayAnggota: false,
        anggotas: []
    }

    componentDidMount() {
        this.props.handleFakturPenjualan(generateFaktur('FKJ'))
        getAnggota().then((data) => {
            this.setState({ anggotas: data })
        })

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
            this.setState({ displayAnggota: false })
            this.props.handleAnggota(val)
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
                                        <h1 className="card-title mt-1">Faktur : { this.props.faktur } </h1>
                                    </div>
                                    <div className='col-md-3'>
                                        <button type='button' className='btn btn-outline-secondary mt-3' onClick={ () => this.props.handleFakturPenjualan(generateFaktur('FKJ')) }>Generate Faktur</button>
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
                                            <input type="text" className="form-control" id="namaAnggota" value={ this.props.anggota }
                                                autoComplete='false'
                                                onChange={ (e) => this.props.handleAnggota(e.target.value) }
                                                onClick={ () => this.setState({ displayAnggota: !this.state.displayAnggota }) } />
                                            {
                                                this.state.displayAnggota &&
                                                <div className="flex-container flex-column pos-rel bodyAutoComplate">
                                                    <ul className="list-group list-group-flush">
                                                        {
                                                            this.state.anggotas
                                                                .filter(({ nama }) =>
                                                                    nama.indexOf(this.props.anggota) > -1
                                                                )
                                                                .map((v, i) => (
                                                                    <li key={ i } onClick={ () => { handleAutoAnggota(v.nama) } } className="list-group-item listAutoComplate" > { v.nama }</li>
                                                                ))
                                                        }
                                                    </ul>
                                                </div>
                                            }
                                        </div>
                                        <div className="col-md-6">
                                            <label htmlFor="typePembayaran" className="form-label">Type Pembayaran</label>
                                            <select id="typePembayaran" className="form-select" onChange={ (e) => this.props.handleTypeBayar(e.target.value) }>
                                                <option
                                                    selected={ this.props.typePembayaran == 'Tunai' ? true : false }
                                                    value={ 'Tunai' }>Tunai</option>
                                                <option
                                                    selected={ this.props.typePembayaran == 'Bon' ? true : false }
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
                                                <AddChartScan />
                                                :
                                                <AddChartManual />
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
                                    <ChartList />
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

const mapStateToProps = state => {
    return {
        anggota: state.anggota,
        typePembayaran: state.typePembayaran,
        kodeBarang: state.kodeBarang,
        namaBarang: state.namaBarang,
        jumlah: state.jumlah,
        jenis: state.jenis,
        harga: state.harga,
        faktur: state.faktur,
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        handleAnggota: (anggota) => dispatch({ type: ActionType.SET_ANGGOTA_PENJUALAN, index: anggota }),
        handleTypeBayar: (typeBayar) => dispatch({ type: ActionType.SET_TYPE_BAYAR_PENJUALAN, index: typeBayar }),
        handleKodeBarang: (kodeBarang) => dispatch({ type: ActionType.SET_KODE_BARANG_PENJUALAN, index: kodeBarang }),
        handleNamaBarang: (namaBarang) => dispatch({ type: ActionType.SET_NAMA_BARANG_PENJUALAN, index: namaBarang }),
        handleJumlah: (jumlah) => dispatch({ type: ActionType.SET_JUMLAH_PENJUALAN, index: jumlah }),
        handlejenisBarang: (jenisBarang) => dispatch({ type: ActionType.SET_JENIS_PENJUALAN, index: jenisBarang }),
        handleHargaBarang: (hargaBarang) => dispatch({ type: ActionType.SET_HARGA_PENJUALAN, index: hargaBarang }),
        handleFakturPenjualan: (faktur) => dispatch({ type: ActionType.SET_FAKTUR_PENJUALAN, index: faktur })
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(TransPenjualan)