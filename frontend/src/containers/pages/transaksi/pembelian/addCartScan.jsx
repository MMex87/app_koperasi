import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import ActionType from "../../../../redux/reducer/globalActionType";
import getBarang from "../../../../utils/barang/getBarang";
import FieldsBarang from "./fieldsBarang";

const addCartScan = (props) => {
  const [barang, setBarang] = useState([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // GET /barang mengembalikan { barang, count }, bukan array
    getBarang().then((data) => {
      setBarang(data.barang || []);
    });
  }, []);

  const handleScan = (e) => {
    const kode = e.target.value;
    const barangs = barang.find(({ kodeBarang }) => kodeBarang == kode);
    props.handleKodeBarang(kode);
    if (e.target.value == "") {
      setVisible(false);
    } else {
      setVisible(true);
    }
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
          <input type="text" className="form-control" id="kodeBarangScan" placeholder="Scan barcode barang..." value={props.kodeBarang} autoFocus={true} onChange={handleScan} />
        </div>
      </div>
      <div className="col-md-6 d-flex align-items-end">
        {visible &&
          (props.barangId ? (
            <div className="alert alert-info py-2 px-3 mb-0 w-100">
              <i className="bi bi-check-circle me-2" />
              Barang terdaftar — data terisi otomatis (restock)
            </div>
          ) : (
            <div className="alert alert-success py-2 px-3 mb-0 w-100">
              <i className="bi bi-plus-circle me-2" />
              Kode baru — lengkapi data untuk membuat barang baru
            </div>
          ))}
      </div>

      {visible && (
        <>
          <div className="col-12">
            <label htmlFor="namabarang" className="form-label fw-semibold">
              Nama Barang
            </label>
            <input type="text" className="form-control" id="namabarang" placeholder="Min. 3 karakter" value={props.namaBarang} onChange={(e) => props.handleNamaBarang(e.target.value)} />
          </div>
          <FieldsBarang {...props} />
        </>
      )}
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

export default connect(mapStateToProps, mapDispatchToProps)(addCartScan);