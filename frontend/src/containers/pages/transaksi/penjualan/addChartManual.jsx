import React from 'react'
import { connect } from 'react-redux'
import ActionType from '../../../../redux/reducer/globalActionType'

const addChartManual = (props) => {
  return (
    <>
      <div className="col-md-3">
        <label htmlFor="kodeBarang" className="form-label">Kode Barang</label>
        <input type="text" className="form-control" id="kodeBarang"
          value={ props.kodeBarang }
          onChange={ (e) => props.handleKodeBarang(e.target.value) }
        />
      </div>
      <div className="col-md-3">
        <label htmlFor="namabarang" className="form-label">Nama Barang</label>
        <input type="text" className="form-control" id="namabarang" value={ props.namaBarang }
          onChange={ (e) => props.handleNamaBarang(e.target.value) } />
      </div>
      <div className="col-2">
        <label htmlFor="jumlah" className="form-label">Jumlah</label>
        <input type="text" className="form-control" id="jumlah" value={ props.jumlah }
          onChange={ (e) => props.handleJumlah(e.target.value) } />
      </div>
      <div className="col-1">
        <label htmlFor="jenis" className="form-label">Jenis</label>
        <input type="text" className="form-control" id="jenis" value={ props.jenis }
          onChange={ (e) => props.handlejenisBarang(e.target.value) } />
      </div>
      <div className="col-md-3">
        <label htmlFor="harga" className="form-label">Harga</label>
        <input type="text" className="form-control" id="harga" value={ props.harga }
          onChange={ (e) => props.handleHargaBarang(e.target.value) } />
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

export default connect(mapStateToProps, mapDispatchToProps)(addChartManual)