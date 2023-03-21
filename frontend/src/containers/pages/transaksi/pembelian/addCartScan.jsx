import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import ActionType from '../../../../redux/reducer/globalActionType'
import getBarang from '../../../../utils/barang/getBarang'

const addCartScan = (props) => {

    const [barang, setBarang] = useState([])
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        getBarang().then((data) => {
            setBarang(data)
        })
    }, [])

    const handleScan = (e) => {
        const kode = e.target.value
        const barangs = barang.find(({ kodeBarang }) => kodeBarang == kode)
        props.handleKodeBarang(kode)
        if (e.target.value == '') {
            setVisible(false)
        } else {
            setVisible(true)
        }
        if (barangs != undefined) {
            props.handleNamaBarang(barangs.nama)
            props.handlejenisBarang(barangs.jenisBarang)
            props.handleHargaBarang(barangs.hargaBeli)
            props.handleSatuanBarang(barangs.satuan)
            props.handleHargaJualBarang(barangs.hargaJual)
        } else {
            props.handleSatuanBarang('')
            props.handleHargaJualBarang('')
            props.handleNamaBarang('')
            props.handlejenisBarang('')
            props.handleHargaBarang('')
        }
    }

    return (
        <>
            <div className="col-12">
                <label htmlFor="kodeBarangScan" className="form-label">Kode Barang</label>
                <input type="text" className="form-control" id="kodeBarangScan" value={ props.kodeBarang } autoFocus={ true }
                    onChange={ handleScan } />
            </div>
            {
                visible &&
                <div className='row'>
                    <div className="col-md-6">
                        <label htmlFor="kodeBarang" className="form-label">
                            Kode Barang
                        </label>
                        <input type="text" className="form-control" id="kodeBarang" value={ props.kodeBarang } disabled />
                    </div>
                    <div className="col-md-2">
                        <label htmlFor="jumlah" className="form-label">
                            Jumlah
                        </label>
                        <input type="text" className="form-control" id="jumlah" value={ props.jumlah } onChange={ (e) => props.handleJumlah(e.target.value) } />
                    </div>
                    <div className="col-md-2">
                        <label htmlFor="jenis" className="form-label">
                            Jenis
                        </label>
                        <select onChange={ (e) => props.handlejenisBarang(e.target.value) } className="form-select" >
                            <option value="">-- Pilih Jenis --</option>
                            <option name="Makanan" value={ 'Makanan' } selected={ props.jenis == 'Makanan' ? true : "" }>Makanan</option>
                            <option name="Minuman" value={ 'Minuman' } selected={ props.jenis == 'Minuman' ? true : "" }>Minuman</option>
                            <option name="Barang" value={ 'Barang' } selected={ props.jenis == 'Barang' ? true : "" }>Barang</option>
                        </select>
                    </div>
                    <div className="col-md-2">
                        <label htmlFor="satuan" className="form-label">
                            Satuan
                        </label>
                        <select onChange={ (e) => props.handleSatuanBarang(e.target.value) } className="form-select" >
                            <option value="">-- Pilih Satuan --</option>
                            <option name="Pcs" value={ 'Pcs' } selected={ props.satuan == 'Pcs' ? true : '' }>Pcs</option>
                            <option name="Box" value={ 'Box' } selected={ props.satuan == 'Box' ? true : '' }>Box</option>
                        </select>
                    </div>
                    <div className="col-md-6">
                        <label htmlFor="namabarang" className="form-label">
                            Nama Barang
                        </label>
                        <input type="text" className="form-control" id="namabarang" value={ props.namaBarang } onChange={ (e) => props.handleNamaBarang(e.target.value) } />
                    </div>
                    <div className="col-md-3">
                        <label htmlFor="harga" className="form-label">
                            Harga Beli
                        </label>
                        <input type="text" className="form-control" id="harga" value={ props.harga } onChange={ (e) => props.handleHargaBarang(e.target.value) } />
                    </div>
                    <div className="col-md-3">
                        <label htmlFor="harga" className="form-label">
                            Harga Jual
                        </label>
                        <input type="text" className="form-control" id="harga" value={ props.harga_jual } onChange={ (e) => props.handleHargaJualBarang(e.target.value) } />
                    </div>
                </div>
            }
        </>
    )
}

const mapStateToProps = state => {
    return {
        supplier: state.supplier,
        kodeBarang: state.kodeBarang_beli,
        namaBarang: state.namaBarang_beli,
        jumlah: state.jumlah_beli,
        jenis: state.jenis_beli,
        harga: state.harga_beli,
        satuan: state.satuan_beli,
        harga_jual: state.harga_jual,
        faktur: state.faktur_beli,
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        handleSupplier: (supplier) => dispatch({ type: ActionType.SET_SUPPLIER_PEMBELIAN, index: supplier }),
        handleKodeBarang: (kodeBarang) => dispatch({ type: ActionType.SET_KODE_BARANG_PEMBELIAN, index: kodeBarang }),
        handleNamaBarang: (namaBarang) => dispatch({ type: ActionType.SET_NAMA_BARANG_PEMBELIAN, index: namaBarang }),
        handleJumlah: (jumlah) => dispatch({ type: ActionType.SET_JUMLAH_PEMBELIAN, index: jumlah }),
        handleSatuanBarang: (satuanBarang) => dispatch({ type: ActionType.SET_SATUAN_PEMBELIAN, index: satuanBarang }),
        handlejenisBarang: (jenisBarang) => dispatch({ type: ActionType.SET_JENIS_PEMBELIAN, index: jenisBarang }),
        handleHargaBarang: (hargaBarang) => dispatch({ type: ActionType.SET_HARGA_PEMBELIAN, index: hargaBarang }),
        handleHargaJualBarang: (hargaJualBarang) => dispatch({ type: ActionType.SET_HARGA_JUAL_PEMBELIAN, index: hargaJualBarang }),
        handleFakturPenjualan: (faktur) => dispatch({ type: ActionType.SET_FAKTUR_PEMBELIAN, index: faktur })
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(addCartScan)