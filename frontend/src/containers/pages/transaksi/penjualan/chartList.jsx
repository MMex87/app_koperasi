import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import axios from '../../../../api/axios'
import ActionType from '../../../../redux/reducer/globalActionType'

const chartList = (props) => {
    const [transaksi, setTransaksi] = useState([])


    const getTransaksi = async () => {
        try {
            const response = await axios.get('/transPenjualanJoin')
            setTransaksi(response.data)
        } catch (error) {
            console.error(error.response)
        }
    }

    useEffect(() => {
        getTransaksi()
    }, [])


    return (
        <>
            <h1 className="card-title mt-1">Faktur : { props.faktur }</h1>
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
                        transaksi.map((val, index) => (
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

export default connect(mapStateToProps, mapDispatchToProps)(chartList)