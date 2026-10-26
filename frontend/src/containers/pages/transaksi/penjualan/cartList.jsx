import React, { useEffect, useState, useCallback } from "react";
import { connect } from "react-redux";
import Swal from "sweetalert2";
import axios from "../../../../api/axios";
import convertRupiah from "rupiah-format";

import ActionType from "../../../../redux/reducer/globalActionType";
import getTotalHarga from "../../../../utils/transaksiPenjualan/getTotalHarga";
import getTransPenjualanJoin from "../../../../utils/transaksiPenjualan/getTransPenjualanJoin";
import hapusTransaksiPenjualan from "../../../../utils/transaksiPenjualan/hapusTransaksiPenjualan";
import editTransaksiCartListPenjualan from "../../../../utils/transaksiPenjualan/editTransaksiCartListPenjualan";
import { generateFaktur } from "../../../../components/faktur/generateFaktur";

import ModalCheckout from "./ModalCheckout";

const CartList = (props) => {
  // Alert toast
  const Toast = Swal.mixin({
    customClass: {
      confirmButton: "btn btn-success",
      cancelButton: "btn btn-danger",
    },
    buttonsStyling: false,
  });

  const [transaksi, setTransaksi] = useState([]);
  const [hargaJual, setHargaJual] = useState(0);

  // EDIT INPUT
  const [jumlah, setJumlah] = useState(0);
  const [displayEdit, setDisplayEdit] = useState(false);
  const [idEdit, setIdEdit] = useState(null);
  const [stokBarang, setStokBarang] = useState(0); // 🟢 stok realtime dari backend

  const [refresh, setRefresh] = useState(false);

  // search faktur
  const [displaySearch, setDisplaySearch] = useState(false);
  const [displayAutoFaktur, setDisplayAutoFaktur] = useState(false);
  const [searchFaktur, setSearchFaktur] = useState("");
  const [listFakturFiltered, setListFakturFiltered] = useState([]);

  /* ======================================================
     LOAD DATA TRANSAKSI
  ====================================================== */
  const loadTransaksi = useCallback(async () => {
    const data = await getTransPenjualanJoin();
    setTransaksi(data);

    const uniqueFaktur = data.filter((v, i, arr) => i === arr.findIndex((x) => x.faktur === v.faktur));
    setListFakturFiltered(uniqueFaktur);

    // cek transaksi on process
    const onProcess = data.find((v) => v.statusPenjualan === "onProcess");

    if (!onProcess) {
      setDisplaySearch(true);

      let fakturAktif = data.find((v) => v.faktur === searchFaktur)?.faktur || generateFaktur("FKJ");
      if (props.faktur) {
        getTotalHarga(props.faktur).then((data) => {
          setHargaJual(data);
        });
      }

      props.handleFakturPenjualan(fakturAktif);
      const total = await getTotalHarga(fakturAktif);
      setHargaJual(total);
    } else {
      setDisplaySearch(false);

      props.handleFakturPenjualan(onProcess.faktur);
      props.handleAnggota(onProcess.anggota.nama);
      props.handleTypeBayar(onProcess.typePembayaran);

      const total = await getTotalHarga(onProcess.faktur);
      setHargaJual(total);
    }

    if (props.faktur) {
      const total = await getTotalHarga(props.faktur);
      setHargaJual(total);
    }
  }, [props, searchFaktur]);

  useEffect(() => {
    loadTransaksi();
  }, [loadTransaksi, props.harga, props.jumlah, props.anggota, refresh]);

  /* ======================================================
     HANDLER
  ====================================================== */
  const handleEditJumlah = async (id, existingJumlah) => {
    setDisplayEdit(true);
    setIdEdit(id);
    setJumlah(existingJumlah);

    const item = transaksi.find((v) => v.id === id);
    if (!item) return;

    try {
      // 🔥 Ambil stok terbaru dari backend
      const res = await axios.get(`/barang/${item.barang.id}`);
      setStokBarang(res.data?.jumlah || 0);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Gagal mengambil stok barang",
      });
    }
  };

  const batalEdit = () => {
    setDisplayEdit(false);
    setIdEdit(null);
    setJumlah(0);
    setStokBarang(0);
  };

  const handleAutoFaktur = (faktur) => {
    setDisplayAutoFaktur(false);
    setSearchFaktur(faktur);
    props.handleFakturPenjualan(faktur);
  };

  /* ======================================================
     SAVE EDIT + VALIDASI STOK API
  ====================================================== */
  const saveEdit = async (hargaSatuan) => {
    try {
      const item = transaksi.find((v) => v.id === idEdit);
      if (!item) return;

      // 🔥 Validasi stok lagi via backend (stok realtime)
      const res = await axios.get(`/barang/${item.barang.id}`);
      const stokTerbaru = res.data?.jumlah || 0;

      if (parseInt(jumlah) > stokTerbaru) {
        Swal.fire({
          icon: "error",
          title: "Stok Tidak Cukup",
          text: `Jumlah (${jumlah}) melebihi stok (${stokTerbaru})`,
        });
        return;
      }

      // UPDATE CART
      await editTransaksiCartListPenjualan({
        id: idEdit,
        jumlah: parseInt(jumlah),
        harga: hargaSatuan * parseInt(jumlah),
      });

      batalEdit();
      setTimeout(() => setRefresh((v) => !v));
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Gagal validasi stok dengan server",
      });
    }
  };

  const handleHapusTransaksi = (id) => {
    Toast.fire({
      title: "Yakin Hapus Data?",
      text: "Hapus Data Penjualan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        hapusTransaksiPenjualan(id);
        setRefresh((v) => !v);
        Toast.fire("Terhapus!", "Data Penjualan Sudah Terhapus.", "success");
      } else {
        Toast.fire("Dibatalkan", "Data Batal Dihapus", "error");
      }
    });
  };
  /* ======================================================
     RENDER
  ====================================================== */

  const transaksiByFaktur = transaksi.filter((v) => v.faktur === props.faktur);
  console.log(transaksi)


  return (
    <>
      <div className="col-lg-12">
        <div className="row">
          <div className="col-md-9">
            <h1 className="card-title mt-1 fw-bold">Faktur : {props.faktur}</h1>
          </div>
          {displaySearch && (
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
                        value={searchFaktur}
                        onChange={(e) => setSearchFaktur(e.target.value)}
                        onClick={() => setDisplayAutoFaktur(!displayAutoFaktur)}
                      />
                      {displayAutoFaktur && (
                        <div className="flex-container flex-column pos-rel bodyAutoComplate position-relative">
                          <ul className="list-group list-group-flush">
                            {dataFilterFaktur
                              .filter(({ faktur }) => faktur.indexOf(searchFaktur) > -1)
                              .map((v, i) => (
                                <li key={i} onClick={() => handleAutoFaktur(v.faktur)} className="list-group-item listAutoComplate">
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

      {/* TABLE */}
      <table className="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Anggota</th>
            <th>Barang</th>
            <th>Jumlah</th>
            <th>Harga</th>
            <th>Aksi</th>
          </tr>
        </thead>

        <tbody>
          {transaksiByFaktur.map((val, index) => {
            return (
              <tr key={val.id}>
                <th>{index + 1}</th>
                <td>{val.anggota.nama}</td>
                <td>{val.barang.nama}</td>

                {/* EDIT JUMLAH + VALIDASI STOK */}
                <td>
                  {displayEdit && val.id === idEdit ? (
                    <input
                      type="number"
                      className="form-control"
                      value={jumlah}
                      onChange={(e) => {
                        const newJumlah = parseInt(e.target.value) || 0;

                        // VALIDASI REALTIME (stok dari backend)
                        if (newJumlah > stokBarang) {
                          Swal.fire({
                            icon: "warning",
                            title: "Jumlah Melebihi Stok",
                            text: `Stok tersedia hanya ${stokBarang}`,
                          });
                          return;
                        }

                        setJumlah(newJumlah);
                      }}
                    />
                  ) : (
                    val.jumlah
                  )}
                </td>

                <td>{convertRupiah.convert(val.barang.hargaJual)}</td>

                {/* EDIT & HAPUS BUTTON */}
                <td>
                  {displayEdit && val.id === idEdit ? (
                    <>
                      <button className="btn btn-warning me-2" onClick={batalEdit}>
                        Batal
                      </button>

                      <button className="btn btn-success" onClick={() => saveEdit(val.barang.hargaJual)}>
                        Save
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="bx bx-edit btn btn-warning me-1" onClick={() => handleEditJumlah(val.id, val.jumlah)}></button>

                      <button className="bx bx-trash btn btn-danger" onClick={() => handleHapusTransaksi(val.id)} />
                    </>
                  )}
                </td>
              </tr>
            );
          })}
          {transaksi
            .filter(({ faktur }) => faktur == props.faktur)
            .map((val, index) => (
              <tr key={index}>
                <th>{index + 1}</th>
                <td>{val.anggota.nama}</td>
                <td>{val.barang.nama}</td>
                <td>{val.barang.jenisBarang}</td>
                <td>{display && val.id == idEdit
                  ?
                  <input type="text" className="form-control" id="jumlah" value={jumlah} onChange={(e) => setJumlah(e.target.value)} /> : val.jumlah}</td>
                <td>{val.barang.hargaJual}</td>
                <td>
                  {display && val.id == idEdit
                    ?
                    (
                      <>
                        <button className="btn btn-warning" onClick={batal}>Batal</button>
                        <button className="btn btn-success" onClick={() => save(val.barang.hargaJual)}>
                          Save
                        </button>
                      </>
                    ) : (
                      <>
                        {/* <button className="btn btn-warning bx bx-edit-alt text-black-50 me-2" onClick={ () => handleEditJumlah(val.id, val.jumlah) } /> */}
                        <button className="bx bx-trash btn btn-danger " onClick={() => handleHapusTransaksi(val.id)} />
                      </>
                    )}
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      {/* TOTAL */}
      <div className="col-lg-12 sticky-footer">
        <div className="card" id="card_total">
          <div className="card-body text-end row">
            <div className="col-md-7">
              <h1 className="fw-bold fs-1">TOTAL :</h1>
            </div>
            <div className="col-md-5">
              <h1 className="fw-bold fs-1">{convertRupiah.convert(hargaJual)}</h1>
            </div>

            <div className="col-md-12">
              <button className="btn mt-auto fs-3 fw-normal btn-success bx bx-printer" data-bs-toggle="modal" data-bs-target="#exampleModal" onClick={() => setRefresh((v) => !v)} />
              <h1 className="card-title text-end fs-1 fw-bold">{hargaJual.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}</h1>
            </div>
            <div className="col-md-12 ">
              <button className=" btn mt-auto fs-3 fw-normal btn-success bx bx-printer" data-bs-toggle="modal" data-bs-target="#exampleModal"
                onClick={() => setRefresh(!refresh)}></button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL CHECKOUT */}
      <ModalCheckout transaksiProps={transaksi} totalHarga={hargaJual} refreshAutoFokus={() => setRefresh((v) => !v)} refresh={refresh} />
      {/* <!-- Modal Chekout--> */}
      <ModalCheckout transaksiProps={transaksi} totalHarga={hargaJual}
        refreshAutoFokus={refreshAutoFokus} refresh={refresh} />
    </>
  );
};

const mapStateToProps = (state) => ({
  anggota: state.anggota,
  typePembayaran: state.typePembayaran,
  kodeBarang: state.kodeBarang,
  namaBarang: state.namaBarang,
  jumlah: state.jumlah,
  harga: state.harga,
  faktur: state.faktur,
  supplierId: state.supplierId,
});

const mapDispatchToProps = (dispatch) => ({
  handleAnggota: (v) => dispatch({ type: ActionType.SET_ANGGOTA_PENJUALAN, index: v }),
  handleTypeBayar: (v) => dispatch({ type: ActionType.SET_TYPE_BAYAR_PENJUALAN, index: v }),
  handleKodeBarang: (v) => dispatch({ type: ActionType.SET_KODE_BARANG_PENJUALAN, index: v }),
  handleNamaBarang: (v) => dispatch({ type: ActionType.SET_NAMA_BARANG_PENJUALAN, index: v }),
  handleJumlah: (v) => dispatch({ type: ActionType.SET_JUMLAH_PENJUALAN, index: v }),
  handlejenisBarang: (v) => dispatch({ type: ActionType.SET_JENIS_PENJUALAN, index: v }),
  handleHargaBarang: (v) => dispatch({ type: ActionType.SET_HARGA_PENJUALAN, index: v }),
  handleFakturPenjualan: (v) => dispatch({ type: ActionType.SET_FAKTUR_PENJUALAN, index: v }),
  handleSupplierIdPenjualan: (v) => dispatch({ type: ActionType.SET_ID_SUPPLIER_PENJUALAN, index: v }),
});

export default connect(mapStateToProps, mapDispatchToProps)(CartList);