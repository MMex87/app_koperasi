import React, { useEffect, useRef, useState } from "react";
import { connect } from "react-redux";
import Swal from "sweetalert2";
import ActionType from "../../../../redux/reducer/globalActionType";
import getBarang from "../../../../utils/barang/getBarang";
import ModalScanBarang from "./modalScanBarang";

const AddCartScan = (props) => {
  const [barang, setBarang] = useState([]);
  const [terdaftar, setTerdaftar] = useState(false);
  const inputRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    // GET /barang mengembalikan { barang, count }, bukan array
    getBarang().then((data) => {
      setBarang(data.barang || []);
    });
  }, []);

  // Modal ditutup (sukses, Batal, atau X): kosongkan form scan dan kembali ke input scan
  useEffect(() => {
    const el = modalRef.current;
    const handleHidden = () => {
      props.handleKodeBarang("");
      props.handleNamaBarang("");
      props.handleJumlah("");
      props.handleHargaBarang("");
      props.handleHargaJualBarang("");
      props.handleSatuanBarang("");
      props.handlejenisBarang("");
      props.handleBarangId("");
      inputRef.current?.focus();
    };
    el.addEventListener("hidden.bs.modal", handleHidden);
    return () => el.removeEventListener("hidden.bs.modal", handleHidden);
  }, []);

  const handleScan = (e) => {
    // Karakter kontrol dari scanner (GS1/CR) dibuang agar kode tersimpan bersih
    const kode = e.target.value.replace(/[\x00-\x1f\x7f]/g, "");
    const barangs = barang.find(({ kodeBarang }) => String(kodeBarang ?? "").trim() === kode.trim());
    props.handleKodeBarang(kode);
    if (barangs != undefined) {
      props.handleNamaBarang(barangs.nama);
      props.handleBarangId(barangs.id);
      props.handlejenisBarang(barangs.jenisBarang);
      props.handleHargaBarang(barangs.hargaBeli);
      props.handleSatuanBarang(barangs.satuan);
      props.handleHargaJualBarang(barangs.hargaJual);
    } else {
      props.handleSatuanBarang("");
      props.handleBarangId("");
      props.handleHargaJualBarang("");
      props.handleNamaBarang("");
      props.handlejenisBarang("");
      props.handleHargaBarang("");
    }
  };

  // Enter dari scanner tidak men-submit form; buka modal sesuai barang terdaftar atau baru
  const handleKeyDown = (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    if (!props.supplierTerpilih) {
      // Kosongkan kode hasil scan agar scan berikutnya tidak menempel
      props.handleKodeBarang("");
      Swal.fire("Pilih supplier dulu", "Pilih nama supplier dari daftar sebelum scan barang", "warning");
      return;
    }
    if (!props.kodeBarang) return;
    setTerdaftar(!!props.barangId);
    window.bootstrap.Modal.getOrCreateInstance(modalRef.current).show();
  };

  return (
    <>
      <div className="col-md-6">
        <label htmlFor="kodeBarangScan" className="form-label fw-semibold">
          Kode Barang
        </label>
        <div className="input-group">
          <span className="input-group-text bg-white">
            <i className="bi bi-upc-scan" />
          </span>
          {/* onFocus select: scan ulang menimpa kode lama, tidak menempel */}
          <input type="text" inputMode="numeric" autoComplete="off" className="form-control" id="kodeBarangScan" placeholder="Scan barcode barang..." value={props.kodeBarang} autoFocus={true} onChange={handleScan} onKeyDown={handleKeyDown} onFocus={(e) => e.target.select()} />
        </div>
        <small className="text-muted">{props.supplierTerpilih ? "Setelah di-scan, isi data di jendela yang muncul." : "Pilih supplier dari daftar sebelum scan barang."}</small>
      </div>

      <ModalScanBarang {...props} modalRef={modalRef} terdaftar={terdaftar} />
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
    satuan: state.satuan_beli,
    harga_jual: state.harga_jual,
    faktur: state.faktur_beli,
    barangId: state.barangId,
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
    handleSatuanBarang: (satuanBarang) =>
      dispatch({ type: ActionType.SET_SATUAN_PEMBELIAN, index: satuanBarang }),
    handlejenisBarang: (jenisBarang) =>
      dispatch({ type: ActionType.SET_JENIS_PEMBELIAN, index: jenisBarang }),
    handleHargaBarang: (hargaBarang) =>
      dispatch({ type: ActionType.SET_HARGA_PEMBELIAN, index: hargaBarang }),
    handleHargaJualBarang: (hargaJualBarang) =>
      dispatch({
        type: ActionType.SET_HARGA_JUAL_PEMBELIAN,
        index: hargaJualBarang,
      }),
    handleFakturPenjualan: (faktur) =>
      dispatch({ type: ActionType.SET_FAKTUR_PEMBELIAN, index: faktur }),
    handleBarangId: (barangId) =>
      dispatch({ type: ActionType.SET_BARANG_ID, index: barangId }),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(AddCartScan);
