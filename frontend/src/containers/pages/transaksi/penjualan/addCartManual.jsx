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

  return (
    <>
      <div className="col-md-3">
        <label htmlFor="kodeBarang" className="form-label">
          Kode Barang
        </label>
        <input
          type="text"
          className="form-control"
          id="kodeBarang"
          value={props.kodeBarang}
          onChange={handleChangeKodeBarang}
          onClick={() => setDisplayKode(!displayKode)}
        />
        {displayKode && (
          <div className="flex-container flex-column pos-rel bodyAutoComplate">
            <ul className="list-group list-group-flush">
              {barangKode
                .filter(
                  ({ kodeBarang }) => kodeBarang.indexOf(props.kodeBarang) > -1
                )
                .map((v, i) => (
                  <li
                    key={i}
                    onClick={() => {
                      handleAutoKodeBarang(v.kodeBarang, v.supplierId);
                    }}
                    className="list-group-item listAutoComplate"
                  >
                    {v.kodeBarang + " ( " + v.supplier.nama + " )"}
                  </li>
                ))}
            </ul>
          </div>
        )}
      </div>
      <div className="col-md-3">
        <label htmlFor="namabarang" className="form-label">
          Nama Barang
        </label>
        <input
          type="text"
          className="form-control"
          id="namabarang"
          value={props.namaBarang}
          onChange={handleChangeNamaBarang}
          onClick={() => setDisplayNama(!displayNama)}
        />
        {displayNama && (
          <div className="flex-container flex-column pos-rel bodyAutoComplate">
            <ul className="list-group list-group-flush">
              {barang
                .filter(({ nama }) => nama.indexOf(props.namaBarang) > -1)
                .map((v, i) => (
                  <li
                    key={i}
                    onClick={() => {
                      handleAutoNamaBarang(v.nama, v.supplierId);
                    }}
                    className="list-group-item listAutoComplate"
                  >
                    {v.nama + " ( " + v.supplier.nama + " )"}
                  </li>
                ))}
            </ul>
          </div>
        )}
      </div>
      <div className="col-3">
        <label htmlFor="jumlah" className="form-label">
          Jumlah
        </label>
        <input
          type="text"
          className="form-control"
          id="jumlah"
          value={props.jumlah}
          onChange={(e) => props.handleJumlah(e.target.value)}
        />
      </div>
      <div className="col-md-3">
        <label htmlFor="harga" className="form-label">
          Harga
        </label>
        <input
          type="text"
          className="form-control"
          disabled
          id="harga"
          value={props.harga}
          onChange={(e) => props.handleHargaBarang(e.target.value)}
        />
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
    handleAnggota: (anggota) =>
      dispatch({ type: ActionType.SET_ANGGOTA_PENJUALAN, index: anggota }),
    handleTypeBayar: (typeBayar) =>
      dispatch({ type: ActionType.SET_TYPE_BAYAR_PENJUALAN, index: typeBayar }),
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
    handleJumlah: (jumlah) =>
      dispatch({ type: ActionType.SET_JUMLAH_PENJUALAN, index: jumlah }),
    handlejenisBarang: (jenisBarang) =>
      dispatch({ type: ActionType.SET_JENIS_PENJUALAN, index: jenisBarang }),
    handleHargaBarang: (hargaBarang) =>
      dispatch({ type: ActionType.SET_HARGA_PENJUALAN, index: hargaBarang }),
    handleFakturPenjualan: (faktur) =>
      dispatch({ type: ActionType.SET_FAKTUR_PENJUALAN, index: faktur }),
    handleSupplierIdPenjualan: (supplier) =>
      dispatch({ type: ActionType.SET_ID_SUPPLIER_PENJUALAN, index: supplier }),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(addCartManual);