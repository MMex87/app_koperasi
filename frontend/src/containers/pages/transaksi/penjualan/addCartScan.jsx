import { useEffect, useState } from "react";
import { connect } from "react-redux";
import ActionType from "../../../../redux/reducer/globalActionType";
import getBarangJoin from "../../../../utils/barang/getBarangJoin";

const addCartScan = (props) => {
  const [barang, setBarang] = useState([]);

  useEffect(() => {
    getBarangJoin().then((data) => {
      setBarang(data);
    });
  }, []);

  const handleScan = (e) => {
    const kode = e.target.value;
    const barangs = barang.find(({ kodeBarang }) => kodeBarang == kode);
    props.handleKodeBarang(kode);
    if (barangs != undefined) {
      props.handleJumlah(1);
      props.handleNamaBarang(barangs.nama);
      props.handlejenisBarang(barangs.jenisBarang);
      props.handleHargaBarang(barangs.hargaJual);
      props.handleSupplierIdPenjualan(barangs.supplierId);
    } else {
      // Kode tidak dikenal: kosongkan data barang sebelumnya agar tidak tertambah salah
      props.handleNamaBarang("");
      props.handlejenisBarang("");
      props.handleHargaBarang("");
      props.handleSupplierIdPenjualan("");
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
          <input type="number" className="form-control" id="kodeBarangScan" placeholder="Scan barcode barang..." value={props.kodeBarang} autoFocus={true} onChange={handleScan} />
        </div>
      </div>
      <div className="col-md-6 d-flex align-items-end">
        {props.namaBarang ? (
          <div className="alert alert-success py-2 px-3 mb-0 w-100 d-flex justify-content-between align-items-center">
            <span>
              <i className="bi bi-check-circle me-2" />
              <b>{props.namaBarang}</b>
            </span>
            <span>Rp {Number(props.harga || 0).toLocaleString("id-ID")}</span>
          </div>
        ) : (
          props.kodeBarang && (
            <div className="alert alert-warning py-2 px-3 mb-0 w-100">
              <i className="bi bi-exclamation-circle me-2" />
              Kode barang tidak dikenali
            </div>
          )
        )}
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
    handleKodeBarang: (kodeBarang) => dispatch({ type: ActionType.SET_KODE_BARANG_PENJUALAN, index: kodeBarang }),
    handleNamaBarang: (namaBarang) => dispatch({ type: ActionType.SET_NAMA_BARANG_PENJUALAN, index: namaBarang }),
    handleJumlah: (jumlah) => dispatch({ type: ActionType.SET_JUMLAH_PENJUALAN, index: jumlah }),
    handlejenisBarang: (jenisBarang) => dispatch({ type: ActionType.SET_JENIS_PENJUALAN, index: jenisBarang }),
    handleHargaBarang: (hargaBarang) => dispatch({ type: ActionType.SET_HARGA_PENJUALAN, index: hargaBarang }),
    handleFakturPenjualan: (faktur) => dispatch({ type: ActionType.SET_FAKTUR_PENJUALAN, index: faktur }),
    handleSupplierIdPenjualan: (supplier) => dispatch({ type: ActionType.SET_ID_SUPPLIER_PENJUALAN, index: supplier }),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(addCartScan);
