import React, { Component } from 'react'
import axios from '../../../../api/axios'
import { generateFaktur } from '../../../../components/faktur/generateFaktur'
import { connect } from 'react-redux'
import ActionType from '../../../../redux/reducer/globalActionType'
import AddCartManual from './addCartManual'
import AddCartScan from './addCartScan'
import CartList from './cartList'
import getAnggota from '../../../../utils/anggota/getAnggota'
import getBarang from '../../../../utils/barang/getBarang'
import getTransPenjualan from '../../../../utils/transaksiPenjualan/getTransPenjualan'

class TransPenjualan extends Component {
    state = {
        transaksi: [],
        visiJenisInput: false,
        displayAnggota: false,
        anggotas: [],
        barang: [],
    };

    componentDidMount() {
        if (this.props.faktur == '') {
            this.props.handleFakturPenjualan(generateFaktur('FKJ'))
        }
        getAnggota().then((data) => {
            this.setState({ anggotas: data })
        })
        getBarang().then((data) => {
            this.setState({ barang: data })
        })
        getTransPenjualan().then((data) => {
            this.setState({ penjualan: data })
        })
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.namaBarang != this.props.namaBarang) {
            getTransPenjualan().then((data) => {
                this.setState({ penjualan: data })
            })
        }
    }

    render() {
        const handlecart = async (e) => {
            e.preventDefault()
            let anggotaId = this.state.anggotas.find(({ nama }) => nama == this.props.anggota).id
            let barangIdLokal = this.state.barang.find(({ nama }) => nama == this.props.namaBarang).id
            let fakturLokal = this.props.faktur
            let jumlah = this.props.jumlah
            let typePembayaran = this.props.typePembayaran
            let harga = this.props.harga
            let trans = this.state.penjualan.find(({ faktur, barangId }) => faktur == fakturLokal && barangId == barangIdLokal)
            console.log(trans)
            try {
                if (jumlah == '' || fakturLokal == '' || harga == '' || typePembayaran == '' || anggotaId == '' || barangIdLokal == '') {
                    console.log('tidak memenuhi syarat')
                } else {
                    if (
                        trans == undefined
                    ) {
                        console.log('masuk kosong')
                        await axios.post('/transPenjualan', {
                            jumlah,
                            faktur: fakturLokal,
                            harga,
                            typePembayaran,
                            anggotaId,
                            barangId: barangIdLokal,
                            statusPenjualan: 'onProcess'
                        })
                    } else {
                        console.log('masuk ada')
                        await axios.put(`/transPenjualan/${trans.id}`, {
                            jumlah: parseInt(trans.jumlah) + parseInt(jumlah)
                        })
                    }
                    this.props.handleKodeBarang('')
                    this.props.handlejenisBarang('')
                    this.props.handleHargaBarang('')
                    this.props.handleJumlah('')
                    this.props.handleNamaBarang('')
                }
            } catch (error) {
                console.error(error.response)
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
            this.setState({ displayAnggota: false });
            this.props.handleAnggota(val);
        };

        return (
            <main id="main" className="main" >
                <div className="pagetitle text-center">
                    <h1>Transaksi Penjualan</h1>
                </div>
                <section className="section">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="card">
                                <div className="card-body row">
                                    <div className="col-md-3">
                                        <h1 className="card-title mt-1 fw-bolder">Faktur : { this.props.faktur } </h1>
                                    </div>
                                    {/* <div className="col-md-3">
                                        <button type="button" className="btn btn-outline-secondary mt-3 " 
                                        onClick={ () => this.props.handleFakturPenjualan(generateFaktur("FKJ")) 
                                        }>
                                            Buat Faktur
                                        </button>
                                    </div> */}
                                    <form className="row g-3" onSubmit={ handlecart }>
                                        <div className="col-md-6">
                                            <label htmlFor="namaAnggota" className="form-label">
                                                Nama Anggota
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="namaAnggota"
                                                value={ this.props.anggota }
                                                autoComplete="false"
                                                onChange={ (e) => this.props.handleAnggota(e.target.value) }
                                                onClick={ () => this.setState({ displayAnggota: !this.state.displayAnggota }) }
                                            />
                                            { this.state.displayAnggota && (
                                                <div className="flex-container flex-column pos-rel bodyAutoComplate">
                                                    <ul className="list-group list-group-flush">
                                                        { this.state.anggotas
                                                            .filter(({ nama }) => nama.indexOf(this.props.anggota) > -1)
                                                            .map((v, i) => (
                                                                <li
                                                                    key={ i }
                                                                    onClick={ () => {
                                                                        handleAutoAnggota(v.nama);
                                                                    } }
                                                                    className="list-group-item listAutoComplate"
                                                                >
                                                                    { " " }
                                                                    { v.nama }
                                                                </li>
                                                            )) }
                                                    </ul>
                                                </div>
                                            ) }
                                        </div>
                                        <div className="col-md-6">
                                            <label htmlFor="typePembayaran" className="form-label">
                                                Type Pembayaran
                                            </label>
                                            <select id="typePembayaran" className="form-select" onChange={ (e) => this.props.handleTypeBayar(e.target.value) }>
                                                <option selected value="">
                                                    -- Pilih Type Pembayaran --
                                                </option>
                                                <option selected={ this.props.typePembayaran == "Tunai" ? true : false } value={ "Tunai" }>
                                                    Tunai
                                                </option>
                                                <option selected={ this.props.typePembayaran == "Bon" ? true : false } value={ "Bon" }>
                                                    BON
                                                </option>
                                            </select>
                                        </div>
                                        <div className="col-12">
                                            <label htmlFor="jenisInput" className="form-label">
                                                Jenis Input
                                            </label>
                                            <select id="jenisInput" className="form-select" onChange={ handleVisiInput }>
                                                <option value={ "manual" }>Manual</option>
                                                <option value={ "scan" }>Scan Barcode</option>
                                            </select>
                                        </div>
                                        { this.state.visiJenisInput ? <AddCartScan /> : <AddCartManual /> }
                                        <div className="text-lg-end">
                                            <button type="submit" className="btn btn-primary">
                                                Tambah
                                            </button>
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
                                    <CartList />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <div style={ { height: 200 } } />
            </main>
        );
    }
}


const mapStateToProps = (state) => {
    return {
        anggota: state.anggota,
        typePembayaran: state.typePembayaran,
        kodeBarang: state.kodeBarang,
        namaBarang: state.namaBarang,
        jumlah: state.jumlah,
        jenis: state.jenis,
        harga: state.harga,
        faktur: state.faktur,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        handleAnggota: (anggota) => dispatch({ type: ActionType.SET_ANGGOTA_PENJUALAN, index: anggota }),
        handleTypeBayar: (typeBayar) => dispatch({ type: ActionType.SET_TYPE_BAYAR_PENJUALAN, index: typeBayar }),
        handleKodeBarang: (kodeBarang) => dispatch({ type: ActionType.SET_KODE_BARANG_PENJUALAN, index: kodeBarang }),
        handleNamaBarang: (namaBarang) => dispatch({ type: ActionType.SET_NAMA_BARANG_PENJUALAN, index: namaBarang }),
        handleJumlah: (jumlah) => dispatch({ type: ActionType.SET_JUMLAH_PENJUALAN, index: jumlah }),
        handlejenisBarang: (jenisBarang) => dispatch({ type: ActionType.SET_JENIS_PENJUALAN, index: jenisBarang }),
        handleHargaBarang: (hargaBarang) => dispatch({ type: ActionType.SET_HARGA_PENJUALAN, index: hargaBarang }),
        handleFakturPenjualan: (faktur) => dispatch({ type: ActionType.SET_FAKTUR_PENJUALAN, index: faktur }),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(TransPenjualan);
