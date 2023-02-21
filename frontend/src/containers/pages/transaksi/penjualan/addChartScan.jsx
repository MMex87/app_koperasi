import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import ActionType from '../../../../redux/reducer/globalActionType'
import getBarang from '../../../../utils/barang/getBarang'

const addChartScan = (props) => {

    const [barang, setBarang] = useState([])

    useEffect(() => {
        getBarang().then((data) => {
            setBarang(data)
        })
    }, [])

    const handleScan = (e) => {
        const kode = e.target.value
        const barangs = barang.find(({ kodeBarang }) => kodeBarang == kode)
        props.handleKodeBarang(kode)
        if (barangs != undefined) {
            props.handleJumlah(1)
            props.handleNamaBarang(barangs.nama)
            props.handlejenisBarang(barangs.jenisBarang)
        }
    }

    return (


        <>
            <div className="col-12">
                <label htmlFor="kodeBarangScan" className="form-label">Kode Barang</label>
                <input type="text" className="form-control" id="kodeBarangScan" value={ props.kodeBarang } autoFocus={ true }
                    onChange={ handleScan } />
            </div>
        </>
    )
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

export default connect(mapStateToProps, mapDispatchToProps)(addChartScan)