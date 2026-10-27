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
    // Anggota dikunci selama keranjang berisi barang (satu faktur = satu anggota)
    props.handleKeranjangTerisi(!!onProcess);

    if (!onProcess) {
      setDisplaySearch(true);

      let fakturAktif = data.find((v) => v.faktur === searchFaktur)?.faktur || generateFaktur("FKJ");

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
  }, [loadTransaksi, props.harga, props.jumlah, props.anggota, props.versiKeranjang, refresh]);

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

      const jumlahInt = parseInt(jumlah);
      if (!jumlahInt || jumlahInt <= 0) {
        Swal.fire({
          icon: "warning",
          title: "Jumlah harus lebih dari 0",
        });
        return;
      }

      // 🔥 Validasi stok lagi via backend (stok realtime)
      const res = await axios.get(`/barang/${item.barang.id}`);
      const stokTerbaru = res.data?.jumlah || 0;

      if (jumlahInt > stokTerbaru) {
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
        jumlah: jumlahInt,
        harga: hargaSatuan * jumlahInt,
      });

      batalEdit();
      setTimeout(() => setRefresh((v) => !v));
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Gagal menyimpan perubahan",
        text: err.response?.data?.msg,
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
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      try {
        await hapusTransaksiPenjualan(id);
        setRefresh((v) => !v);
        Toast.fire("Terhapus!", "Barang sudah dihapus dari keranjang.", "success");
      } catch (err) {
        console.error(err);
        Toast.fire("Gagal!", err.response?.data?.msg || "Gagal menghapus barang", "error");
      }
    });
  };
  // Hapus semua item keranjang faktur aktif (stok belum berkurang, jadi aman dihapus)
  const kosongkanKeranjang = async () => {
    const items = transaksi.filter((v) => v.faktur === props.faktur && v.statusPenjualan === "onProcess");
    const result = await Toast.fire({
      title: "Kosongkan keranjang?",
      text: `${items.length} barang akan dihapus dari keranjang.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Kosongkan",
      cancelButtonText: "Batal",
      reverseButtons: true,
    });
    if (!result.isConfirmed) return;

    try {
      for (const item of items) {
        await hapusTransaksiPenjualan(item.id);
      }
      batalEdit();
      setRefresh((v) => !v);
      Toast.fire("Berhasil", "Keranjang sudah dikosongkan.", "success");
    } catch (err) {
      console.error(err);
      setRefresh((v) => !v);
      Toast.fire("Gagal!", err.response?.data?.msg || "Sebagian barang gagal dihapus", "error");
    }
  };

  /* ======================================================
     RENDER
  ====================================================== */

  const transaksiByFaktur = transaksi.filter((v) => v.faktur === props.faktur);
  const totalItem = transaksiByFaktur.reduce((sum, v) => sum + (parseInt(v.jumlah) || 0), 0);
  const melebihiStok = displayEdit && jumlah > stokBarang;

  return (
    <>
      <div className="row g-4">
        {/* TABLE KERANJANG */}
        <div className="col-xl-8">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0">
                  <i className="bi bi-cart3 me-2" />
                  Keranjang
                </h5>
                <div className="d-flex align-items-center gap-2">
                  <span className="badge rounded-pill bg-primary bg-opacity-10 text-primary px-3 py-2">{transaksiByFaktur.length} barang</span>
                  {transaksiByFaktur.length > 0 && (
                    <button className="btn btn-sm btn-outline-danger" onClick={kosongkanKeranjang} disabled={displayEdit}>
                      <i className="bi bi-trash3 me-1" />
                      Kosongkan
                    </button>
                  )}
                </div>
              </div>

              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0 cart-table">
                  <thead className="table-light">
                    <tr>
                      <th className="text-center" style={{ width: "50px" }}>
                        #
                      </th>
                      <th>Barang</th>
                      <th className="text-end">Harga</th>
                      <th className="text-center" style={{ width: "150px" }}>
                        Jumlah
                      </th>
                      <th className="text-end">Subtotal</th>
                      <th className="text-center" style={{ width: "120px" }}>
                        Aksi
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {transaksiByFaktur.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center text-muted py-5">
                          <i className="bi bi-cart-x fs-1 d-block mb-2" />
                          Keranjang masih kosong
                          <small className="d-block">Tambahkan barang melalui form di atas</small>
                        </td>
                      </tr>
                    ) : (
                      transaksiByFaktur.map((val, index) => {
                        const sedangEdit = displayEdit && val.id === idEdit;
                        return (
                          <tr key={val.id} className={sedangEdit ? "table-warning" : ""}>
                            <td className="text-center text-muted">{index + 1}</td>
                            <td className="fw-semibold">{val.barang.nama}</td>
                            <td className="text-end text-nowrap">{convertRupiah.convert(val.barang.hargaJual)}</td>

                            {/* EDIT JUMLAH + VALIDASI STOK */}
                            <td className="text-center">
                              {sedangEdit ? (
                                <>
                                  <input type="number" min="1" className={`form-control form-control-sm text-center ${melebihiStok ? "is-invalid" : ""}`} value={jumlah} autoFocus onChange={(e) => setJumlah(parseInt(e.target.value) || 0)} />
                                  <small className={melebihiStok ? "text-danger" : "text-muted"}>Stok: {stokBarang}</small>
                                </>
                              ) : (
                                val.jumlah
                              )}
                            </td>

                            <td className="text-end fw-bold text-nowrap">{convertRupiah.convert((sedangEdit ? jumlah : val.jumlah) * val.barang.hargaJual)}</td>

                            {/* EDIT & HAPUS BUTTON */}
                            <td className="text-center text-nowrap">
                              {sedangEdit ? (
                                <>
                                  <button className="btn btn-sm btn-success me-1" title="Simpan" disabled={melebihiStok || jumlah <= 0} onClick={() => saveEdit(val.barang.hargaJual)}>
                                    <i className="bi bi-check-lg" />
                                  </button>
                                  <button className="btn btn-sm btn-secondary" title="Batal" onClick={batalEdit}>
                                    <i className="bi bi-x-lg" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button className="btn btn-sm btn-outline-warning me-1" title="Ubah jumlah" onClick={() => handleEditJumlah(val.id, val.jumlah)}>
                                    <i className="bi bi-pencil" />
                                  </button>
                                  <button className="btn btn-sm btn-outline-danger" title="Hapus dari keranjang" onClick={() => handleHapusTransaksi(val.id)}>
                                    <i className="bi bi-trash" />
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* RINGKASAN */}
        <div className="col-xl-4">
          <div className="card border-0 shadow-sm sticky-xl-top summary-card">
            <div className="card-body p-4">
              <h5 className="fw-bold mb-3">
                <i className="bi bi-receipt me-2" />
                Ringkasan
              </h5>
              <dl className="row small mb-0">
                <dt className="col-5 text-muted fw-normal">Faktur</dt>
                <dd className="col-7 text-end fw-semibold text-break">{props.faktur}</dd>
                <dt className="col-5 text-muted fw-normal">Anggota</dt>
                <dd className="col-7 text-end fw-semibold text-truncate">{props.anggota || "-"}</dd>
                <dt className="col-5 text-muted fw-normal">Pembayaran</dt>
                <dd className="col-7 text-end fw-semibold">{props.typePembayaran || "-"}</dd>
                <dt className="col-5 text-muted fw-normal">Jumlah Item</dt>
                <dd className="col-7 text-end fw-semibold">{totalItem}</dd>
              </dl>
              <hr />
              <div className="text-muted small">Total Bayar</div>
              <div className="total-amount fw-bold text-primary mb-3 text-break">{convertRupiah.convert(hargaJual)}</div>
              <button className="btn btn-success w-100 py-2" data-bs-toggle="modal" data-bs-target="#exampleModal" disabled={transaksiByFaktur.length === 0} onClick={() => setRefresh((v) => !v)}>
                <i className="bi bi-printer me-2" />
                Bayar &amp; Cetak Struk
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL CHECKOUT */}
      <ModalCheckout transaksiProps={transaksi} totalHarga={hargaJual} refreshAutoFokus={() => setRefresh((v) => !v)} refresh={refresh} />
    </>
  );
};

const mapStateToProps = (state) => ({
  anggota: state.anggota,
  typePembayaran: state.typePembayaran,
  kodeBarang: state.kodeBarang,
  versiKeranjang: state.versiKeranjang,
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
  handleKeranjangTerisi: (v) => dispatch({ type: ActionType.SET_KERANJANG_TERISI_PENJUALAN, index: v }),
});

export default connect(mapStateToProps, mapDispatchToProps)(CartList);
