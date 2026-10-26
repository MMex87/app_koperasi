import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import ActionType from "../../../../redux/reducer/globalActionType";
import getBarangJoinAutoComplate from "../../../../utils/barang/getBarangJoinAutoComplate";
import FieldsBarang from "./fieldsBarang";

const addCartManual = (props) => {
  const [barang, setBarang] = useState([]);
  const [barangKode, setBarangKode] = useState([]);
  const [displayKode, setDisplayKode] = useState(false);
  const [displayNama, setDisplayNama] = useState(false);

  const handleAutoKodeBarang = (val) => {
    setDisplayKode(false);
    props.handleKodeBarang(val);
    const barangs = barang.find(({ kodeBarang }) => kodeBarang == val);
    if (barangs != undefined) {
      props.handleNamaBarang(barangs.nama);
      props.handleBarangId(barangs.id);
      props.handlejenisBarang(barangs.jenisBarang);
      props.handleSatuanBarang(barangs.satuan);
      props.handleHargaBarang(barangs.hargaBeli);
      props.handleHargaJualBarang(barangs.hargaJual);
    }
  };

  const handleAutoNamaBarang = (val) => {
    setDisplayNama(false);
    props.handleNamaBarang(val);
    const barangs = barang.find(({ nama }) => nama == val);
    if (barangs != undefined) {
      props.handleKodeBarang(barangs.kodeBarang);
      props.handleBarangId(barangs.id);
      props.handlejenisBarang(barangs.jenisBarang);
      props.handleSatuanBarang(barangs.satuan);
      props.handleHargaBarang(barangs.hargaBeli);
      props.handleHargaJualBarang(barangs.hargaJual);
    }
  };

  const handleChangeKodeBarang = (e) => {
    const kode = e.target.value;
    const barangs = barang.find(({ kodeBarang }) => kodeBarang == kode);
    props.handleKodeBarang(kode);
    if (barangs != undefined) {
      props.handleNamaBarang(barangs.nama);
      props.handleBarangId(barangs.id);
      props.handlejenisBarang(barangs.jenisBarang);
      props.handleSatuanBarang(barangs.satuan);
      props.handleHargaBarang(barangs.hargaBeli);
      props.handleHargaJualBarang(barangs.hargaJual);
    } else {
      // Kode tidak cocok: lepas barangId lama agar tidak mengubah barang lain
      props.handleBarangId("");
    }
  };

  const handleChangeNamaBarang = (e) => {
    const namaBarang = e.target.value;
    const barangs = barang.find(({ nama }) => nama == namaBarang);
    props.handleNamaBarang(namaBarang);
    if (barangs != undefined) {
      props.handlejenisBarang(barangs.jenisBarang);
      props.handleBarangId(barangs.id);
      props.handleSatuanBarang(barangs.satuan);
      props.handleHargaBarang(barangs.hargaBeli);
      props.handleHargaJualBarang(barangs.hargaJual);
    } else {
      // Nama tidak cocok: lepas barangId lama agar tidak mengubah barang lain
      props.handleBarangId("");
    }
  };

  useEffect(() => {
    if (props.namaBarang.length > 2) {
      getBarangJoinAutoComplate(props.namaBarang).then((data) => {
        setBarang(data);
      });
    }

    if (props.kodeBarang.length > 2) {
      getBarangJoinAutoComplate(props.kodeBarang).then((data) => {
        setBarangKode(data);
      });
    }

    if (props.namaBarang.length < 2) {
      setBarang([]);
    }

    if (props.kodeBarang.length < 2) {
      setBarangKode([]);
    }
  }, [props.namaBarang, props.kodeBarang]);

  const kodeFiltered = barangKode.filter(({ kodeBarang }) => (kodeBarang || "").toLowerCase().includes(props.kodeBarang.toLowerCase()));
  const namaFiltered = barang.filter(({ nama }) => (nama || "").toLowerCase().includes(props.namaBarang.toLowerCase()));

  const AutoItem = ({ judul, v, onClick }) => (
    <li onClick={onClick} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center gap-2">
      <span className="text-truncate">
        {judul} <small className="text-muted">({v.supplier?.nama})</small>
      </span>
      <span className="badge bg-light text-dark border">Stok {v.jumlah}</span>
    </li>
  );

  return (
    <>
      <div className="col-md-4 position-relative">
        <label htmlFor="kodeBarang" className="form-label fw-semibold">
          Kode Barang
        </label>
        <input type="text" className="form-control" id="kodeBarang" placeholder="Min. 3 karakter" autoComplete="off" value={props.kodeBarang} onChange={handleChangeKodeBarang} onClick={() => setDisplayKode(!displayKode)} />
        {displayKode && props.kodeBarang.length > 2 && (
          <ul className="list-group autocomplete-menu shadow">
            {kodeFiltered.length ? (
              kodeFiltered.map((v, i) => <AutoItem key={i} judul={v.kodeBarang} v={v} onClick={() => handleAutoKodeBarang(v.kodeBarang)} />)
            ) : (
              <li className="list-group-item text-muted small">Kode belum terdaftar — akan dibuat sebagai barang baru</li>
            )}
          </ul>
        )}
      </div>
      <div className="col-md-8 position-relative">
        <label htmlFor="namabarang" className="form-label fw-semibold d-flex justify-content-between">
          Nama Barang
          {props.namaBarang.length > 2 && (props.barangId ? <span className="badge bg-info bg-opacity-10 text-info">Barang terdaftar · restock</span> : <span className="badge bg-success bg-opacity-10 text-success">Barang baru</span>)}
        </label>
        <input type="text" className="form-control" id="namabarang" placeholder="Min. 3 karakter" autoComplete="off" value={props.namaBarang} onChange={handleChangeNamaBarang} onClick={() => setDisplayNama(!displayNama)} />
        {displayNama && props.namaBarang.length > 2 && (
          <ul className="list-group autocomplete-menu shadow">
            {namaFiltered.length ? (
              namaFiltered.map((v, i) => <AutoItem key={i} judul={v.nama} v={v} onClick={() => handleAutoNamaBarang(v.nama)} />)
            ) : (
              <li className="list-group-item text-muted small">Nama belum terdaftar — akan dibuat sebagai barang baru</li>
            )}
          </ul>
        )}
      </div>

      <FieldsBarang {...props} />
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
    satuan: state.satuan_beli,
    harga: state.harga_beli,
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
    handlejenisBarang: (jenisBarang) =>
      dispatch({ type: ActionType.SET_JENIS_PEMBELIAN, index: jenisBarang }),
    handleSatuanBarang: (satuanBarang) =>
      dispatch({ type: ActionType.SET_SATUAN_PEMBELIAN, index: satuanBarang }),
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

export default connect(mapStateToProps, mapDispatchToProps)(addCartManual);