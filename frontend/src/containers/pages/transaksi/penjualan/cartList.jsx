import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import axios from "../../../../api/axios";
import ActionType from "../../../../redux/reducer/globalActionType";

const CartList = (props) => {
  const [transaksi, setTransaksi] = useState([]);

  const getTransaksi = async () => {
    try {
      const response = await axios.get("/transPenjualanJoin");
      setTransaksi(response.data);
    } catch (error) {
      console.error(error.response);
    }
  };

  useEffect(() => {
    getTransaksi();
  }, [props.harga]);

  return (
    <>
      <div className="col-lg-12">
        <div className="row">
          <div className="col-md-8">
            <h1 className="card-title mt-1 fw-bold">Faktur : {props.faktur}</h1>
          </div>
          <div className="col-md-4 ">
            <div className="search-bar text-center mt-3">
              <form className="search-form d-flex align-items-center" method="POST" action="#">
                <div className="input-group mb-3">
                  <input type="text" className="form-control" name="query" placeholder="Cari Faktur" title="Enter search keyword" aria-label="Recipient's username" aria-describedby="button-addon2" />
                  {/* <button className="btn btn-outline-secondary" type="button" id="button-addon2">
                    {/* <i className="bi bi-search" /> */}
                  {/* </button> */}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

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
          {transaksi.map((val, index) => (
            <tr key={index}>
              <th>{index + 1}</th>
              <td>{val.anggota.nama}</td>
              <td>{val.typePembayaran}</td>
              <td>{val.barang.kodeBarang}</td>
              <td>{val.barang.nama}</td>
              <td>{val.jumlah}</td>
              <td>{val.barang.hargaJual}</td>
              <td>
                <button className="btn btn-warning bx bx-edit-alt text-black-50" />
                <button className="bx bx-trash btn btn-danger " />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

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

export default connect(mapStateToProps, mapDispatchToProps)(CartList);
