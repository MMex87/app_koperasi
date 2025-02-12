import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import ActionType from "../../../../redux/reducer/globalActionType";
import Swal from "sweetalert2";
import { generateFaktur } from "../../../../components/faktur/generateFaktur";
import getTransPembelianJoin from "../../../../utils/transaksiPembelian/getTransPembelianJoin";
import hapusTransaksiPembelian from "../../../../utils/transaksiPembelian/hapusTransaksiPembelian";
import editTransaksiCartListPembelian from "../../../../utils/transaksiPembelian/editTransaksiCartListPembelian";
import axios from "../../../../api/axios";

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
  const [hargaBeli, setHargaBeli] = useState(0);
  const [jumlah, setJumlah] = useState(0);
  const [refresh, setRefresh] = useState(false);
  const [display, setDisplay] = useState(false);
  const [idEdit, setIdEdit] = useState(0);
  const [editHargaBeli, setEditHargaBeli] = useState(0);
  const [editHargaJual, setEditHargaJual] = useState(0);

  // state search faktur
  const [displaySearch, setDisplaySearch] = useState(false);
  const [displayAutoFaktur, setDisplayAutoFaktur] = useState(false);
  const [searchFaktur, setSearchFaktur] = useState("");

  const [dataFilterFaktur, setDataFilterFaktur] = useState([]);
  // let hargaJual = 0

  useEffect(() => {
    getTransPembelianJoin().then((data) => {
      setTransaksi(data);
      let arrayFilterPembelian = [];
      let dataFaktur = [];
      dataFaktur = data;

      // sortir Data Double
      const filteredSearchFaktur = dataFaktur.filter(
        (value, index, self) =>
          index === self.findIndex((t) => t.faktur === value.faktur)
      );
      arrayFilterPembelian = filteredSearchFaktur;

      // filter status Pembelian
      if (
        dataFaktur.filter(
          ({ statusPembelian }) => statusPembelian == "onProcess"
        ).length == 0
      ) {
        setDisplaySearch(true);

        // filter Faktur Search
        if (
          dataFaktur.filter(({ faktur }) => faktur == searchFaktur).length == 0
        ) {
          props.handleFakturPembelian(generateFaktur("FKB"));
        }
      } else {
        setDisplaySearch(false);
        let fakturLama = dataFaktur.find(
          ({ statusPembelian }) => statusPembelian == "onProcess"
        );
        let dataPembelian = arrayFilterPembelian.find(
          ({ faktur }) => faktur == fakturLama.faktur
        );

        props.handleFakturPembelian(dataPembelian.faktur);
        props.handleSupplier(dataPembelian.supplier.nama);
      }

      setDataFilterFaktur(filteredSearchFaktur);
    });
  }, [props.harga, props.jumlah, refresh, searchFaktur, props.supplier]);

  const handleEditJumlah = (val, val2, val3, val4) => {
    setDisplay(true);
    setIdEdit(val);
    setJumlah(val2);
    setEditHargaBeli(val3);
    setEditHargaJual(val4);
  };

  const handleAutoFaktur = (val) => {
    setDisplayAutoFaktur(false);
    setSearchFaktur(val);
    props.handleFakturPembelian(val);
  };

  const batal = async () => {
    setDisplay(false);
    setIdEdit(0);
    setJumlah(0);
    setEditHargaBeli(0);
    setEditHargaJual(0);
  };

  const save = async () => {
    const data = {
      harga: editHargaBeli,
      jumlah: jumlah,
      id: idEdit,
    };
    editTransaksiCartListPembelian(data);
    const resTrans = await axios.get(`/transPembelian/${idEdit}`);
    const resBarang = await axios.get(`/barang/${resTrans.data.barangId}`);
    if (jumlah > resTrans.data.jumlah) {
      let selisih = jumlah - resTrans.data.jumlah;
      await axios.put(`/barang/${resTrans.data.barangId}`, {
        hargaJual: editHargaJual,
        hargaBeli: editHargaBeli,
        jumlah: resBarang.data.jumlah + selisih,
      });
    } else {
      let selisih = resTrans.data.jumlah - jumlah;
      await axios.put(`/barang/${resTrans.data.barangId}`, {
        hargaJual: editHargaJual,
        hargaBeli: editHargaBeli,
        jumlah: resBarang.data.jumlah - selisih,
      });
    }

    setIdEdit(0);
    setJumlah(0);
    setEditHargaBeli(0);
    setDisplay(false);
    setTimeout(() => {
      setRefresh(!refresh);
    }, 100);
  };

  const handleHapusTransaksi = (val, val2, val3) => {
    Toast.fire({
      title: "Apa Kamu Yakin?",
      text: "Kamu akan Menghapus Data Pembelian!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ok, Hapus!",
      cancelButtonText: "Tidak, Batal!",
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        await hapusTransaksiPembelian(val);
        const resBarang = await axios.get(`/barang/${val2}`);
        await axios.put(`/barang/${val2}`, {
          jumlah: resBarang.data.jumlah - val3,
        });
        setRefresh(!refresh);
        Toast.fire("Terhapus!", "Data Pembelian Sudah Terhapus.", "success");
      } else if (
        /* Read more about handling dismissals below */
        result.dismiss === Swal.DismissReason.cancel
      ) {
        Toast.fire("Dibatalkan", "Data Pembelian tetap aman :)", "error");
      }
    });
  };

  return (
    <>
      <div className="col-lg-12">
        <div className="row">
          <div className="col-md-8">
            <h1 className="card-title mt-1 fw-bold">Faktur : {props.faktur}</h1>
          </div>
          {displaySearch && (
            <div className="col-md-4 ">
              <div className="search-bar text-center mt-3">
                <form
                  className="search-form d-flex align-items-center"
                  method="POST"
                  action="#"
                >
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
                        value={searchFaktur}
                        onChange={(e) => setSearchFaktur(e.target.value)}
                        onClick={() => setDisplayAutoFaktur(!displayAutoFaktur)}
                      />
                      {displayAutoFaktur && (
                        <div className="flex-container flex-column pos-rel bodyAutoComplate">
                          <ul className="list-group list-group-flush">
                            {dataFilterFaktur
                              .filter(
                                ({ faktur }) =>
                                  faktur.indexOf(searchFaktur) > -1
                              )
                              .map((v, i) => (
                                <li
                                  key={i}
                                  onClick={() => handleAutoFaktur(v.faktur)}
                                  className="list-group-item listAutoComplate"
                                >
                                  {" "}
                                  {v.faktur}
                                </li>
                              ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Nama Anggota</th>
            <th>Nama Barang</th>
            <th>Jumlah</th>
            <th>Harga Beli</th>
            <th>Harga Jual</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {transaksi
            .filter(({ faktur }) => faktur == props.faktur)
            .map((val, index) => (
              <tr key={index}>
                <th>{index + 1}</th>
                <td>{val.supplier.nama}</td>
                <td>{val.barang.nama}</td>
                {display && val.id == idEdit ? (
                  <>
                    <td>
                      <input
                        type="text"
                        className="form-control"
                        id="jumlah"
                        value={jumlah}
                        onChange={(e) => setJumlah(e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="form-control"
                        id="hargaBeli"
                        value={editHargaBeli}
                        onChange={(e) => setEditHargaBeli(e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="form-control"
                        id="hargaBeli"
                        value={editHargaJual}
                        onChange={(e) => setEditHargaJual(e.target.value)}
                      />
                    </td>
                  </>
                ) : (
                  <>
                    <td>{val.jumlah}</td>
                    <td>{val.barang.hargaBeli}</td>
                    <td>{val.barang.hargaJual}</td>
                  </>
                )}
                <td>
                  {display && val.id == idEdit ? (
                    <>
                      <button className="btn btn-success" onClick={save}>
                        Save
                      </button>
                      <button className="btn btn-warning" onClick={batal}>
                        Batal
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="btn btn-warning bx bx-edit-alt text-black-50"
                        onClick={() =>
                          handleEditJumlah(
                            val.id,
                            val.jumlah,
                            val.harga,
                            val.barang.hargaJual
                          )
                        }
                      />
                      <button
                        className="bx bx-trash btn btn-danger "
                        onClick={() =>
                          handleHapusTransaksi(val.id, val.barangId, val.jumlah)
                        }
                      />
                    </>
                  )}
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
    supplier: state.supplier,
    kodeBarang: state.kodeBarang_beli,
    namaBarang: state.namaBarang_beli,
    jumlah: state.jumlah_beli,
    jenis: state.jenis_beli,
    harga: state.harga_beli,
    harga_jual: state.harga_jual,
    faktur: state.faktur_beli,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    handleSupplier: (supplier) =>
      dispatch({ type: ActionType.SET_SUPPLIER_PEMBELIAN, index: supplier }),
    handleKodeBarang: (kodeBarang) =>
      dispatch({
        type: ActionType.SET_KODE_BARANG_PEMBELIAN,
        index: kodeBarang,
      }),
    handleNamaBarang: (namaBarang) =>
      dispatch({
        type: ActionType.SET_NAMA_BARANG_PEMBELIAN,
        index: namaBarang,
      }),
    handleJumlah: (jumlah) =>
      dispatch({ type: ActionType.SET_JUMLAH_PEMBELIAN, index: jumlah }),
    handlejenisBarang: (jenisBarang) =>
      dispatch({ type: ActionType.SET_JENIS_PEMBELIAN, index: jenisBarang }),
    handleHargaBarang: (hargaBarang) =>
      dispatch({ type: ActionType.SET_HARGA_PEMBELIAN, index: hargaBarang }),
    handleHargaJualBarang: (hargaJualBarang) =>
      dispatch({
        type: ActionType.SET_HARGA_JUAL_PEMBELIAN,
        index: hargaJualBarang,
      }),
    handleFakturPembelian: (faktur) =>
      dispatch({ type: ActionType.SET_FAKTUR_PEMBELIAN, index: faktur }),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CartList);