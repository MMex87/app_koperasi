import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import ActionType from "../../../../redux/reducer/globalActionType";
import getBarangJoinAutoComplate from "../../../../utils/barang/getBarangJoinAutoComplate";

const addCartManual = (props) => {
  const [barang, setBarang] = useState([]);
  const [barangKode, setBarangKode] = useState([]);
  const [displayKode, setDisplayKode] = useState(false);
  const [displayNama, setDisplayNama] = useState(false);

  const handleAutoKodeBarang = (val, val2) => {
    setDisplayKode(false);
    props.handleSupplierIdPenjualan(val2);
    props.handleKodeBarang(val);
    const barangs = barang.find(({ kodeBarang }) => kodeBarang == val);
    if (barangs != undefined) {
      props.handleNamaBarang(barangs.nama);
      props.handlejenisBarang(barangs.jenisBarang);
      props.handleHargaBarang(barangs.hargaJual);
    }
  };

  const handleAutoNamaBarang = (val, val2) => {
    setDisplayNama(false);
    props.handleSupplierIdPenjualan(val2);
    props.handleNamaBarang(val);
    const barangs = barang.find(({ nama }) => nama == val);
    if (barangs != undefined) {
      props.handleKodeBarang(barangs.kodeBarang);
      props.handlejenisBarang(barangs.jenisBarang);
      props.handleHargaBarang(barangs.hargaJual);
    }
  };

  const handleChangeKodeBarang = (e) => {
    const kode = e.target.value;
    const barangs = barang.find(({ kodeBarang }) => kodeBarang == kode);
    props.handleKodeBarang(kode);
    if (barangs != undefined) {
      props.handleNamaBarang(barangs.nama);
      props.handlejenisBarang(barangs.jenisBarang);
      props.handleHargaBarang(barangs.hargaJual);
      props.handleSupplierIdPenjualan(barangs.supplierId);
    } else {
      props.handleSupplierIdPenjualan("");
      props.handleNamaBarang("");
      props.handlejenisBarang("");
      props.handleHargaBarang("");
    }
  };

  const handleChangeNamaBarang = (e) => {
    const namaBarang = e.target.value;
    const barangs = barang.find(({ nama }) => nama == namaBarang);
    props.handleNamaBarang(namaBarang);
    if (barangs != undefined) {
      props.handleKodeBarang(barangs.kodeBarang);
      props.handlejenisBarang(barangs.jenisBarang);
      props.handleHargaBarang(barangs.hargaJual);
      props.handleSupplierIdPenjualan(barangs.supplierId);
    } else {
      props.handleSupplierIdPenjualan("");
      props.handleKodeBarang("");
      props.handlejenisBarang("");
      props.handleHargaBarang("");
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

  const AutoItem = ({ judul, sub, stok, onClick }) => (
    <li onClick={onClick} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center gap-2">
      <span className="text-truncate">
        {judul} <small className="text-muted">({sub})</small>
      </span>
      {stok !== undefined && <span className={`badge ${stok > 0 ? "bg-light text-dark border" : "bg-danger"}`}>{stok > 0 ? `Stok ${stok}` : "Habis"}</span>}
    </li>
  );

  return (
    <>
      <div className="col-md-3 position-relative">
        <label htmlFor="kodeBarang" className="form-label fw-semibold">
          Kode Barang
        </label>
        <input type="text" className="form-control" id="kodeBarang" placeholder="Min. 3 karakter" autoComplete="off" value={props.kodeBarang} onChange={handleChangeKodeBarang} onClick={() => setDisplayKode(!displayKode)} />
        {displayKode && props.kodeBarang.length > 2 && (
          <ul className="list-group autocomplete-menu shadow">
            {kodeFiltered.length ? (
              kodeFiltered.map((v, i) => <AutoItem key={i} judul={v.kodeBarang} sub={v.supplier.nama} stok={v.jumlah} onClick={() => handleAutoKodeBarang(v.kodeBarang, v.supplierId)} />)
            ) : (
              <li className="list-group-item text-muted small">Barang tidak ditemukan</li>
            )}
          </ul>
        )}
      </div>
      <div className="col-md-4 position-relative">
        <label htmlFor="namabarang" className="form-label fw-semibold">
          Nama Barang
        </label>
        <input type="text" className="form-control" id="namabarang" placeholder="Min. 3 karakter" autoComplete="off" value={props.namaBarang} onChange={handleChangeNamaBarang} onClick={() => setDisplayNama(!displayNama)} />
        {displayNama && props.namaBarang.length > 2 && (
          <ul className="list-group autocomplete-menu shadow">
            {namaFiltered.length ? (
              namaFiltered.map((v, i) => <AutoItem key={i} judul={v.nama} sub={v.supplier.nama} stok={v.jumlah} onClick={() => handleAutoNamaBarang(v.nama, v.supplierId)} />)
            ) : (
              <li className="list-group-item text-muted small">Barang tidak ditemukan</li>
            )}
          </ul>
        )}
      </div>
      <div className="col-sm-6 col-md-2">
        <label htmlFor="jumlah" className="form-label fw-semibold">
          Jumlah
        </label>
        <input type="number" min="1" className="form-control" id="jumlah" placeholder="0" value={props.jumlah} onChange={(e) => props.handleJumlah(e.target.value)} />
      </div>
      <div className="col-sm-6 col-md-3">
        <label htmlFor="harga" className="form-label fw-semibold">
          Harga Satuan
        </label>
        <div className="input-group">
          <span className="input-group-text">Rp</span>
          <input type="number" className="form-control" disabled id="harga" value={props.harga} onChange={(e) => props.handleHargaBarang(e.target.value)} />
        </div>
      </div>
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
    supplierId: state.supplierId,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    handleAnggota: (anggota) => dispatch({ type: ActionType.SET_ANGGOTA_PENJUALAN, index: anggota }),
    handleTypeBayar: (typeBayar) => dispatch({ type: ActionType.SET_TYPE_BAYAR_PENJUALAN, index: typeBayar }),
    handleKodeBarang: (kodeBarang) =>
      dispatch({
        type: ActionType.SET_KODE_BARANG_PENJUALAN,
        index: kodeBarang,
      }),
    handleNamaBarang: (namaBarang) =>
      dispatch({
        type: ActionType.SET_NAMA_BARANG_PENJUALAN,
        index: namaBarang,
      }),
    handleJumlah: (jumlah) => dispatch({ type: ActionType.SET_JUMLAH_PENJUALAN, index: jumlah }),
    handlejenisBarang: (jenisBarang) => dispatch({ type: ActionType.SET_JENIS_PENJUALAN, index: jenisBarang }),
    handleHargaBarang: (hargaBarang) => dispatch({ type: ActionType.SET_HARGA_PENJUALAN, index: hargaBarang }),
    handleFakturPenjualan: (faktur) => dispatch({ type: ActionType.SET_FAKTUR_PENJUALAN, index: faktur }),
    handleSupplierIdPenjualan: (supplier) => dispatch({ type: ActionType.SET_ID_SUPPLIER_PENJUALAN, index: supplier }),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(addCartManual);
