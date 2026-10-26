import React, { useEffect, useState } from "react";
import axios from "../../../../api/axios";
import { generateFaktur } from "../../../../components/faktur/generateFaktur";
import { connect } from "react-redux";
import ActionType from "../../../../redux/reducer/globalActionType";
import CartList from "./cartList";
import AddCartScan from "./addCartScan";
import AddCartManual from "./addCartManual";
import getSupplier from "../../../../utils/supplier/getSupplier";
import getTransPembelian, { cariTransaksi } from "../../../../utils/transaksiPembelian/getTransaksiPembelian";
import Swal from "sweetalert2";
import getBarangJoin from "../../../../utils/barang/getBarangJoin";
import barangTerbeli from "../../../../utils/barang/barangTerbeli";
import { findBarang } from "../../../../utils/barang/getBarang";

const TransaksiPembalian = (props) => {
  /* ================= STATE ================= */
  const [transaksi, setTransaksi] = useState([]);
  const [visiJenisInput, setVisiJenisInput] = useState(false);
  const [displaySupplier, setDisplaySupplier] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [barang, setBarang] = useState([]);

  /* ================= EFFECT ================= */
  useEffect(() => {
    if (props.faktur === "") {
      props.handleFakturPembelian(generateFaktur("FKB"));
    }

    getSupplier().then(setSuppliers);
    getBarangJoin().then(setBarang);
    getTransPembelian().then(setTransaksi);
  }, []);

  useEffect(() => {
    getTransPembelian().then(setTransaksi);
  }, [props.namaBarang]);

  /* ================= ALERT ================= */
  const Toast = Swal.mixin({
    customClass: {
      confirmButton: "btn btn-success",
      cancelButton: "btn btn-danger",
    },
    buttonsStyling: false,
  });

  /* ================= HANDLER ================= */
  const handleVisiInput = (e) => {
    setVisiJenisInput(e.target.value === "scan");
  };

  const handleAutoAnggota = (val) => {
    setDisplaySupplier(false);
    props.handleSupplier(val);
  };

  const handlecart = async (e) => {
    e.preventDefault();

    try {
      const fakturLokal = props.faktur;
      const { jumlah, harga, harga_jual: hargaJual } = props;

      const supplierData = suppliers.find(({ nama }) => nama === props.supplier);
      if (!supplierData) {
        Swal.fire("Gagal!", "Supplier tidak valid", "warning");
        return;
      }

      const idSupplier = supplierData.id;

      const barangNamaSama = barang.find((b) => b.nama.toLowerCase() === props.namaBarang.toLowerCase() && b.supplier?.nama === props.supplier);

      const barangSupplierBeda = barang.find((b) => (b.nama.toLowerCase() === props.namaBarang.toLowerCase() || b.kodeBarang === props.kodeBarang) && b.supplier?.nama !== props.supplier);

      /* ================= VALIDASI ================= */
      if (!jumlah || !harga || !hargaJual) {
        Swal.fire("Gagal!", "Tolong isi semua data", "warning");
        return;
      }

      if (props.namaBarang.length < 3 || props.kodeBarang.length < 3) {
        Swal.fire("Gagal!", "Nama Barang & Kode minimal 3 karakter", "warning");
        return;
      }

      if (barangNamaSama && !props.barangId) {
        Swal.fire("Gagal!", "Nama barang sudah ada pada supplier yang sama", "warning");
        return;
      }

      if (barangSupplierBeda) {
        Swal.fire("Gagal!", "Satu barang hanya boleh memiliki satu supplier", "error");
        return;
      }

      /* ================= PROSES ================= */
      const cariBarangDb = await findBarang(props.kodeBarang, idSupplier);
      const trans = await cariTransaksi(fakturLokal, props.barangId);

      // ================= BARANG BARU =================
      if (!trans) {
        if (!cariBarangDb) {
          const resBarang = await axios.post("/barang", {
            nama: props.namaBarang,
            kodeBarang: props.kodeBarang,
            jenisBarang: props.jenis,
            satuan: props.satuan,
            jumlah: 0,
            hargaBeli: harga,
            hargaJual,
            supplierId: idSupplier,
          });

          await axios.post("/transPembelian", {
            jumlah,
            faktur: fakturLokal,
            harga,
            hargaJual,
            supplierId: idSupplier,
            barangId: resBarang.data.barangId,
            statusPembelian: "onProcess",
          });
        }

        // ================= BARANG SUDAH ADA =================
        else {
          await axios.put(`/barang/${props.barangId}`, {
            jenisBarang: props.jenis,
            satuan: props.satuan,
            hargaBeli: harga,
            hargaJual,
          });

          await axios.post("/transPembelian", {
            jumlah,
            faktur: fakturLokal,
            harga,
            hargaJual,
            supplierId: idSupplier,
            barangId: props.barangId,
            statusPembelian: "onProcess",
          });
      try {
        if (
          jumlah == "" ||
          fakturLokal == "" ||
          harga == "" ||
          idSupplier == undefined ||
          hargaJual == ""
        ) {
          // ketika barang kurang lengkap di isinya
          Swal.fire(
            "Gagal menambahkan data!!",
            "Tolong isi semua Data",
            "warning"
          );
        } else {
          if (
            this.props.namaBarang.length > 2 &&
            this.props.kodeBarang.length > 2
          ) {
            if (trans == null) {
              if (cariBarang == null) {
                // ketika barang tidak ada sama sekali di db barang
                const barang = await axios.post("/barang", {
                  nama: this.props.namaBarang,
                  kodeBarang: this.props.kodeBarang,
                  jenisBarang: this.props.jenis,
                  satuan: this.props.satuan,
                  jumlah,
                  hargaBeli: harga,
                  hargaJual,
                  supplierId: idSupplier,
                });
                await axios.post("/transPembelian", {
                  jumlah,
                  faktur: fakturLokal,
                  harga,
                  hargaJual,
                  supplierId: idSupplier,
                  barangId: barang.data.barangId,
                  statusPembelian: "onProcess",
                });
              } else if (cariBarang.supplier.nama != this.props.supplier) {
                // ketika barang sudah ada di db, tetapi nama suppliernya tidak sama
                const barang = await axios.post("/barang", {
                  nama: this.props.namaBarang,
                  kodeBarang: this.props.kodeBarang,
                  jenisBarang: this.props.jenis,
                  satuan: this.props.satuan,
                  jumlah,
                  hargaBeli: harga,
                  hargaJual,
                  supplierId: idSupplier,
                });
                await axios.post("/transPembelian", {
                  jumlah,
                  faktur: fakturLokal,
                  harga,
                  hargaJual,
                  supplierId: idSupplier,
                  barangId: barang.data.barangId,
                  statusPembelian: "onProcess",
                });
              } else {
                // ketika barang sudah ada di db barang
                barangTerbeli(this.props.barangId, jumlah);
                await axios.put(`/barang/${this.props.barangId}`, {
                  jenisBarang: this.props.jenis,
                  satuan: this.props.satuan,
                  hargaBeli: harga,
                  hargaJual,
                });
                await axios.post(`/transPembelian`, {
                  jumlah,
                  faktur: fakturLokal,
                  harga,
                  hargaJual,
                  supplierId: idSupplier,
                  barangId: this.props.barangId,
                  statusPembelian: "onProcess",
                });
              }
            } else {
              // ketika barang sudah ada di keranjang dan menambahkan barang yang sama
              barangTerbeli(this.props.barangId, jumlah);
              await axios.put(`/barang/${this.props.barangId}`, {
                jenisBarang: this.props.jenis,
                satuan: this.props.satuan,
                hargaBeli: harga,
                hargaJual,
              });
              await axios.put(`/transPembelian/${trans.id}`, {
                jumlah: parseInt(trans.jumlah) + parseInt(jumlah),
              });
            }
            this.props.handleKodeBarang("");
            this.props.handlejenisBarang("");
            this.props.handleHargaBarang("");
            this.props.handleJumlah("");
            this.props.handleSatuanBarang("");
            this.props.handleHargaJualBarang("");
            this.props.handleNamaBarang("");
            this.props.handleSupplier("");
          } else {
            Swal.fire(
              "Gagal menambahkan data!!",
              "Tolong isi Nama Barang dan Kode minimal 3 huruf!",
              "warning"
            );
          }
        }
      }

      // ================= TRANSAKSI SUDAH ADA =================
      else {
        await axios.put(`/transPembelian/${trans.id}`, {
          jumlah: parseInt(trans.jumlah) + parseInt(jumlah),
        });
      }

      /* ================= RESET ================= */
      props.handleKodeBarang("");
      props.handleNamaBarang("");
      props.handleJumlah("");
      props.handleHargaBarang("");
      props.handleHargaJualBarang("");
      props.handleSatuanBarang("");
      props.handleSupplier("");
    } catch (err) {
      console.error(err);
      Swal.fire("Error!", "Terjadi kesalahan sistem", "error");
    }
  };

  const getBarangById = async (id) => {
    const res = await axios.get(`/barang/${id}`);
    return res.data;
  };

  const simpanLogStok = async ({ faktur, barangId, qty_awal, qty, qty_baru }) => {
    await axios.post("/logPembelian", {
      qty: qty,
      qty_awal: qty_awal,
      qty_baru: qty_baru,
      keterangan: "Pembelian (+)",
      barangId: barangId,
      faktur: faktur,
    });
  };

  const simpan = () => {
    const data = transaksi.filter((v) => v.statusPembelian === "onProcess");

    Toast.fire({
      title: "Simpan Data ?",
      text: "Simpan Data Pembelian!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ok, Simpan!",
      cancelButtonText: "Batal",
      reverseButtons: true,
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      try {
        for (const v of data) {
          // ===== AMBIL STOK BARANG =====
          const barangDb = await getBarangById(v.barangId);
          const qty_awal = parseInt(barangDb.jumlah);
          const qty_baru = qty_awal + parseInt(v.jumlah);

          // ===== UPDATE STOK BARANG (DI SINI BARU TAMBAH) =====
          await axios.put(`/barang/${v.barangId}`, {
            jumlah: qty_baru,
          });

          // ===== SIMPAN LOG =====
          await simpanLogStok({
            qty: v.jumlah,
            qty_awal,
            qty_baru,
            barangId: v.barangId,
            faktur: v.faktur,
          });

          // ===== UPDATE STATUS TRANSAKSI =====
          await axios.put(`/transPembelian/${v.id}`, {
            statusPembelian: "Done",
          });
        }

        props.handleSupplier("");
        Toast.fire("Berhasil!", "Pembelian & Stok Berhasil Disimpan", "success");
      } catch (err) {
        console.error(err);
        Swal.fire("Error!", "Gagal menyimpan data", "error");
      }
    });
  };

  /* ================= JSX ================= */
  return (
    <main id="main" className="main">
      <div className="pagetile text-center">
        <h1 className="fw-bold fs-2">Transaksi Pembelian</h1>
      </div>

      <section className="section">
        <div className="row">
          <div className="col-lg-12">
            <div className="card">
              <div className="card-body row">
                <div className="col-md-3">
                  <h1 className="card-title mt-1 fw-bolder">Faktur : {props.faktur}</h1>
                </div>

                <form className="row g-3" onSubmit={handlecart}>
                  <div className="col-md-6">
                    <label className="form-label">Nama Supplier</label>
                    <input type="text" className="form-control" value={props.supplier} onChange={(e) => props.handleSupplier(e.target.value)} onClick={() => setDisplaySupplier(!displaySupplier)} />

                    {displaySupplier && (
                      <div className="bodyAutoComplate">
                        <ul className="list-group">
                          {suppliers
                            .filter(({ nama }) => nama.toLowerCase().includes(props.supplier.toLowerCase()))
                            .map((v) => (
                              <li key={v.id} className="list-group-item listAutoComplate" onClick={() => handleAutoAnggota(v.nama)}>
                                {v.nama}
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="col-12">
                    <label className="form-label">Jenis Input</label>
                    <select className="form-select" onChange={handleVisiInput}>
                      <option value="manual">Manual</option>
                      <option value="scan">Scan Barcode</option>
                    </select>
                  </div>

                  {visiJenisInput ? <AddCartScan /> : <AddCartManual />}

                  <div className="text-lg-end">
                    <button type="submit" className="btn btn-primary btn-sm px-3">
                      Tambah
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="row">
          <div className="col-lg-12">
            <div className="card">
              <div className="card-body">
                <CartList />
                <div className="d-flex justify-content-end">
                  <button className="btn btn-success btn-sm px-3" onClick={simpan}>
                    Simpan
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div style={{ height: 200 }} />
    </main>
  );
};

/* ================= REDUX ================= */
const mapStateToProps = (state) => ({
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
});

const mapDispatchToProps = (dispatch) => ({
  handleSupplier: (v) =>
    dispatch({
      type: ActionType.SET_SUPPLIER_PEMBELIAN,
      index: v,
    }),
  handleKodeBarang: (v) =>
    dispatch({
      type: ActionType.SET_KODE_BARANG_PEMBELIAN,
      index: v,
    }),
  handleNamaBarang: (v) =>
    dispatch({
      type: ActionType.SET_NAMA_BARANG_PEMBELIAN,
      index: v,
    }),
  handleJumlah: (v) =>
    dispatch({
      type: ActionType.SET_JUMLAH_PEMBELIAN,
      index: v,
    }),
  handleSatuanBarang: (v) =>
    dispatch({
      type: ActionType.SET_SATUAN_PEMBELIAN,
      index: v,
    }),
  handlejenisBarang: (v) =>
    dispatch({
      type: ActionType.SET_JENIS_PEMBELIAN,
      index: v,
    }),
  handleHargaBarang: (v) =>
    dispatch({
      type: ActionType.SET_HARGA_PEMBELIAN,
      index: v,
    }),
  handleHargaJualBarang: (v) =>
    dispatch({
      type: ActionType.SET_HARGA_JUAL_PEMBELIAN,
      index: v,
    }),
  handleFakturPembelian: (v) =>
    dispatch({
      type: ActionType.SET_FAKTUR_PEMBELIAN,
      index: v,
    }),
});

export default connect(mapStateToProps, mapDispatchToProps)(TransaksiPembalian);
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
    handleFakturPembelian: (faktur) =>
      dispatch({ type: ActionType.SET_FAKTUR_PEMBELIAN, index: faktur }),
    handleBarangId: (barangId) =>
      dispatch({ type: ActionType.SET_BARANG_ID, index: barangId }),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(TransaksiPembalian);
