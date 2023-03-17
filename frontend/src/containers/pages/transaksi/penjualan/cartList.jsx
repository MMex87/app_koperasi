import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import axios from "../../../../api/axios";
import ActionType from "../../../../redux/reducer/globalActionType";
import getTotalHarga from "../../../../utils/transaksiPenjualan/getTotalHarga";
import getTransPenjualanJoin from "../../../../utils/transaksiPenjualan/getTransPenjualanJoin";
import hapusTransaksiPenjualan from "../../../../utils/transaksiPenjualan/hapusTransaksiPenjualan";
import Swal from "sweetalert2";
import { generateFaktur } from "../../../../components/faktur/generateFaktur";
import ModalCheckout from "./ModalCheckout";
import editTransaksiCartListPenjualan from "../../../../utils/transaksiPenjualan/editTransaksiCartListPenjualan";

const CartList = (props) => {
  // alert
  const Toast = Swal.mixin({
    customClass: {
      confirmButton: "btn btn-success",
      cancelButton: "btn btn-danger",
    },
    buttonsStyling: false,
  });

  const [transaksi, setTransaksi] = useState([]);
  const [hargaJual, setHargaJual] = useState(0);
  const [jumlah, setJumlah] = useState(0);
  const [refresh, setRefresh] = useState(false);
  const [display, setDisplay] = useState(false);
  const [idEdit, setIdEdit] = useState('')

  // state search faktur
  const [displaySearch, setDisplaySearch] = useState(false);
  const [displayAutoFaktur, setDisplayAutoFaktur] = useState(false);
  const [searchFaktur, setSearchFaktur] = useState("");

  const [dataFilterFaktur, setDataFilterFaktur] = useState([]);

  const refreshAutoFokus = () => {
    setRefresh(!refresh)
  }

  useEffect(() => {
    getTransPenjualanJoin().then((data) => {
      setTransaksi(data);
      let arrayFilterPenjualan = [];
      let dataFaktur = [];
      dataFaktur = data;

      // sortir Data Double
      const filteredSearchFaktur = dataFaktur.filter((value, index, self) => index === self.findIndex((t) => t.faktur === value.faktur));
      arrayFilterPenjualan = filteredSearchFaktur;

      // filter status penjualan
      if (dataFaktur.filter(({ statusPenjualan }) => statusPenjualan == "onProcess").length == 0) {
        setDisplaySearch(true);

        // filter Faktur Search
        if (dataFaktur.filter(({ faktur }) => faktur == searchFaktur).length == 0) {
          let genFaktur = generateFaktur("FKJ")
          props.handleFakturPenjualan(genFaktur);
          getTotalHarga(genFaktur).then((data) => {
            setHargaJual(data);
          });
        } else {
          getTotalHarga(searchFaktur).then((data) => {
            setHargaJual(data);
          });
        }
      } else {
        setDisplaySearch(false);
        let fakturLama = dataFaktur.find(({ statusPenjualan }) => statusPenjualan == "onProcess");
        let dataPenjualan = arrayFilterPenjualan.find(({ faktur }) => faktur == fakturLama.faktur);

        getTotalHarga(dataPenjualan.faktur).then((data) => {
          setHargaJual(data);
        });

        props.handleFakturPenjualan(dataPenjualan.faktur);
        props.handleAnggota(dataPenjualan.anggota.nama);
        props.handleTypeBayar(dataPenjualan.typePembayaran);
      }

      getTotalHarga(props.faktur).then((data) => {
        setHargaJual(data);
      });

      setDataFilterFaktur(filteredSearchFaktur);
    });
  }, [props.harga, props.jumlah, props.anggota, refresh, searchFaktur]);

  const handleEditJumlah = (val, val2) => {
    setDisplay(true);
    setIdEdit(val)
    setJumlah(val2)
  };

  const batal = async () => {
    setDisplay(false)
    setIdEdit(0)
    setJumlah(0)
  }

  const handleAutoFaktur = (val) => {
    setDisplayAutoFaktur(false);
    setSearchFaktur(val);
    props.handleFakturPenjualan(val);
  };

  const save = async () => {
    const data = {
      jumlah: jumlah,
      id: idEdit
    }
    editTransaksiCartListPenjualan(data)

    setIdEdit(0)
    setJumlah(0)
    setDisplay(false)
    setTimeout(() => {
      setRefresh(!refresh)
    }, 100)
  };

  const handleHapusTransaksi = (val) => {
    Toast.fire({
      title: "Apa Kamu Yakin?",
      text: "Kamu akan Menghapus Data Penjualan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ok, Hapus!",
      cancelButtonText: "Tidak, Batal!",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        hapusTransaksiPenjualan(val);
        setRefresh(!refresh);
        Toast.fire("Terhapus!", "Data Penjualan Sudah Terhapus.", "success");
      } else if (
        /* Read more about handling dismissals below */
        result.dismiss === Swal.DismissReason.cancel
      ) {
        Toast.fire("Dibatalkan", "Data Penjualan tetap aman :)", "error");
      }
    });
  };

  return (
    <>
      <div className="col-lg-12">
        <div className="row">
          <div className="col-md-9">
            <h1 className="card-title mt-1 fw-bold">Faktur : { props.faktur }</h1>
          </div>
          { displaySearch && (
            <div className="col-md-3">
              <div className="search-bar text-center mt-3">
                <form className="search-form d-flex align-items-center" method="POST" action="#">
                  <div className="input-group mb-3">
                    <div>
                      <input
                        type="text"
                        className="form-control"
                        name="query"
                        placeholder="Cari Faktur"
                        title="Enter search keyword"
                        aria-label="Recipient's username"
                        aria-describedby="button-addon2"
                        value={ searchFaktur }
                        onChange={ (e) => setSearchFaktur(e.target.value) }
                        onClick={ () => setDisplayAutoFaktur(!displayAutoFaktur) }
                      />
                      { displayAutoFaktur && (
                        <div className="flex-container flex-column pos-rel bodyAutoComplate position-relative">
                          <ul className="list-group list-group-flush">
                            { dataFilterFaktur
                              .filter(({ faktur }) => faktur.indexOf(searchFaktur) > -1)
                              .map((v, i) => (
                                <li key={ i } onClick={ () => handleAutoFaktur(v.faktur) } className="list-group-item listAutoComplate">
                                  { " " }
                                  { v.faktur }
                                </li>
                              )) }
                          </ul>
                        </div>
                      ) }
                    </div>
                  </div>
                </form>
              </div>
            </div>
          ) }
        </div>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Nama Anggota</th>
            <th>Nama Barang</th>
            <th>Jenis Barang</th>
            <th>Jumlah</th>
            <th>Harga</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          { transaksi
            .filter(({ faktur }) => faktur == props.faktur)
            .map((val, index) => (
              <tr key={ index }>
                <th>{ index + 1 }</th>
                <td>{ val.anggota.nama }</td>
                <td>{ val.barang.nama }</td>
                <td>{ val.barang.jenisBarang }</td>
                <td>{ display && val.id == idEdit
                  ?
                  <input type="text" className="form-control" id="jumlah" value={ jumlah } onChange={ (e) => setJumlah(e.target.value) } /> : val.jumlah }</td>
                <td>{ val.barang.hargaJual }</td>
                <td>
                  { display && val.id == idEdit
                    ?
                    (
                      <>
                        <button className="btn btn-warning" onClick={ batal }>Batal</button>
                        <button className="btn btn-success" onClick={ save }>
                          Save
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="btn btn-warning bx bx-edit-alt text-black-50 me-2" onClick={ () => handleEditJumlah(val.id, val.jumlah) } />
                        <button className="bx bx-trash btn btn-danger " onClick={ () => handleHapusTransaksi(val.id) } />
                      </>
                    ) }
                </td>
              </tr>
            )) }
        </tbody>
      </table>
      <div className="col-lg-12 sticky-footer">
        <div className="card" id="card_total">
          <div className="card-body text-end row">
            <div className="col-md-7">
              <h1 className="card-title text-end fw-bold fs-1">TOTAL :</h1>
            </div>
            <div className="col-md-5">
              <h1 className="card-title text-end fs-1 fw-bold">{ hargaJual.toLocaleString("id-ID", { style: "currency", currency: "IDR" }) }</h1>
            </div>
            <div className="col-md-12 ">
              <button className=" btn mt-auto fs-3 fw-normal btn-success bx bx-printer" data-bs-toggle="modal" data-bs-target="#exampleModal"
                onClick={ () => setRefresh(!refresh) }></button>
            </div>
          </div>
        </div>
      </div>
      {/* <!-- Modal Chekout--> */ }
      <ModalCheckout transaksiProps={ transaksi } totalHarga={ hargaJual }
        refreshAutoFokus={ refreshAutoFokus } refresh={ refresh } />
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
    supplierId: state.supplierId
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
    handleSupplierIdPenjualan: (supplier) => dispatch({ type: ActionType.SET_ID_SUPPLIER_PENJUALAN, index: supplier }),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CartList);
