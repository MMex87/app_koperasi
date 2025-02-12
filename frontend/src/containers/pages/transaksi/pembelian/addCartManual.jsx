import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import ActionType from "../../../../redux/reducer/globalActionType";
import getBarangJoinAutoComplate from "../../../../utils/barang/getBarangJoinAutoComplate";

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
      props.handleHargaBarang(barangs.hargaJual);
      props.handleHargaJualBarang(barangs.hargaBeli);
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
      props.handleHargaBarang(barangs.hargaJual);
      props.handleHargaJualBarang(barangs.hargaBeli);
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
      <div className="col-md-6">
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
                      handleAutoKodeBarang(v.kodeBarang);
                    }}
                    className="list-group-item listAutoComplate"
                  >
                    {v.kodeBarang}
                  </li>
                ))}
            </ul>
          </div>
        )}
      </div>
      <div className="col-md-2">
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
      <div className="col-md-2">
        <label htmlFor="jenis" className="form-label">
          Jenis
        </label>
        <select
          onChange={(e) => props.handlejenisBarang(e.target.value)}
          className="form-select"
        >
          <option value="">-- Pilih Jenis --</option>
          <option
            name="Makanan"
            value={"Makanan"}
            selected={props.jenis == "Makanan" ? true : ""}
          >
            Makanan
          </option>
          <option
            name="Minuman"
            value={"Minuman"}
            selected={props.jenis == "Minuman" ? true : ""}
          >
            Minuman
          </option>
          <option
            name="Barang"
            value={"Barang"}
            selected={props.jenis == "Barang" ? true : ""}
          >
            Barang
          </option>
        </select>
      </div>
      <div className="col-md-2">
        <label htmlFor="satuan" className="form-label">
          Satuan
        </label>
        <select
          onChange={(e) => props.handleSatuanBarang(e.target.value)}
          className="form-select"
        >
          <option value="">-- Pilih Satuan --</option>
          <option
            name="Pcs"
            value={"Pcs"}
            selected={props.satuan == "Pcs" ? true : ""}
          >
            Pcs
          </option>
          <option
            name="Box"
            value={"Box"}
            selected={props.satuan == "Box" ? true : ""}
          >
            Box
          </option>
        </select>
      </div>
      <div className="col-md-6">
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
                      handleAutoNamaBarang(v.nama);
                    }}
                    className="list-group-item listAutoComplate"
                  >
                    {" "}
                    {v.nama}
                  </li>
                ))}
            </ul>
          </div>
        )}
      </div>
      <div className="col-md-3">
        <label htmlFor="harga" className="form-label">
          Harga Beli
        </label>
        <input
          type="text"
          className="form-control"
          id="harga"
          value={props.harga}
          onChange={(e) => props.handleHargaBarang(e.target.value)}
        />
      </div>
      <div className="col-md-3">
        <label htmlFor="harga" className="form-label">
          Harga Jual
        </label>
        <input
          type="text"
          className="form-control"
          id="harga"
          value={props.harga_jual}
          onChange={(e) => props.handleHargaJualBarang(e.target.value)}
        />
      </div>
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