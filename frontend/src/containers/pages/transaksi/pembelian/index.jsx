import React, { Component } from "react";
import axios from "../../../../api/axios";
import { generateFaktur } from "../../../../components/faktur/generateFaktur";
import { connect } from "react-redux";
import ActionType from "../../../../redux/reducer/globalActionType";
import CartList from "./cartList";
import AddCartScan from "./addCartScan";
import AddCartManual from "./addCartManual";
import getSupplier from "../../../../utils/supplier/getSupplier";
import getTransPembelian from "../../../../utils/transaksiPembelian/getTransaksiPembelian";
import Swal from "sweetalert2";
import getBarangJoin from "../../../../utils/barang/getBarangJoin";
import barangTerbeli from "../../../../utils/barang/barangTerbeli";

class TransaksiPembalian extends Component {
  state = {
    transaksi: [],
    visiJenisInput: false,
    displaySupplier: false,
    suppliers: [],
    barang: [],
  };

  componentDidMount() {
    if (this.props.faktur == "") {
      this.props.handleFakturPembelian(generateFaktur("FKB"));
    }
    getSupplier().then((data) => {
      this.setState({ suppliers: data });
    });
    getBarangJoin().then((data) => {
      this.setState({ barang: data });
    });
    getTransPembelian().then((data) => {
      this.setState({ transaksi: data });
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.namaBarang != this.props.namaBarang) {
      getTransPembelian().then((data) => {
        this.setState({ transaksi: data });
      });
    }
  }

  render() {
    // alert
    const Toast = Swal.mixin({
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger",
      },
      buttonsStyling: false,
    });

    const handlecart = async (e) => {
      e.preventDefault();
      let idSupplier;
      let barangIdLokal;
      let fakturLokal = this.props.faktur;
      let jumlah = this.props.jumlah;
      let harga = this.props.harga;
      let hargaJual = this.props.harga_jual;
      let barangKondisi = this.state.barang.find(
        ({ nama, supplier }) =>
          nama == this.props.namaBarang && supplier.nama == this.props.supplier
      );
      let supplierKondisi = this.state.suppliers.find(
        ({ nama }) => nama == this.props.supplier
      );
      if (supplierKondisi != undefined) {
        idSupplier = this.state.suppliers.find(
          ({ nama }) => nama == this.props.supplier
        ).id;
      }
      if (barangKondisi != undefined) {
        barangIdLokal = this.state.barang.find(
          ({ nama, supplier }) =>
            nama == this.props.namaBarang &&
            supplier.nama == this.props.supplier
        ).id;
      }
      let trans = this.state.transaksi.find(
        ({ faktur, barangId }) =>
          faktur == fakturLokal && barangId == barangIdLokal
      );
      let cariBarang = this.state.barang.find(
        ({ kodeBarang, supplier }) =>
          kodeBarang == this.props.kodeBarang &&
          supplier.nama == this.props.supplier
      );

      console.log(this.props.namaBarang.length);

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
            if (trans == undefined) {
              if (cariBarang == undefined) {
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
                barangTerbeli(barangIdLokal, jumlah);
                await axios.put(`/barang/${barangIdLokal}`, {
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
                  barangId: barangIdLokal,
                  statusPembelian: "onProcess",
                });
              }
            } else {
              // ketika barang sudah ada di keranjang dan menambahkan barang yang sama
              barangTerbeli(barangIdLokal, jumlah);
              await axios.put(`/barang/${barangIdLokal}`, {
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
      } catch (error) {
        console.error(error);
      }
    };

    const simpan = () => {
      let data = this.state.transaksi.filter(
        ({ statusPembelian }) => statusPembelian == "onProcess"
      );
      Toast.fire({
        title: "Apa Kamu Yakin?",
        text: "Kamu akan Menyimpan Data Pembelian!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Ok, Simpan!",
        cancelButtonText: "Tidak, Batal!",
        reverseButtons: true,
      }).then((result) => {
        if (result.isConfirmed) {
          for (let val of data) {
            axios.put(`/transPembelian/${val.id}`, {
              statusPembelian: "Done",
            });
          }
          this.props.handleSupplier("");
          Toast.fire("Tersimpan!", "Data Pembelian Sudah Terhapus.", "success");
        } else if (
          /* Read more about handling dismissals below */
          result.dismiss === Swal.DismissReason.cancel
        ) {
          Toast.fire("Dibatalkan", "Data Pembelian tetap aman :)", "error");
        }
      });
    };

    const handleVisiInput = (e) => {
      let handle = e.target.value;
      if (handle == "scan") {
        this.setState({ visiJenisInput: true });
      } else {
        this.setState({ visiJenisInput: false });
      }
    };

    const handleAutoAnggota = (val) => {
      this.setState({ displaySupplier: false });
      this.props.handleSupplier(val);
    };

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
                    <h1 className="card-title mt-1 fw-bolder">
                      Faktur : {this.props.faktur}{" "}
                    </h1>
                  </div>
                  <form className="row g-3" onSubmit={handlecart}>
                    <div className="col-md-6">
                      <label htmlFor="namaAnggota" className="form-label">
                        Nama Supplier
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="namaAnggota"
                        value={this.props.supplier}
                        autoComplete="false"
                        onChange={(e) =>
                          this.props.handleSupplier(e.target.value)
                        }
                        onClick={() =>
                          this.setState({
                            displaySupplier: !this.state.displaySupplier,
                          })
                        }
                      />
                      {this.state.displaySupplier && (
                        <div className="flex-container flex-column pos-rel bodyAutoComplate">
                          <ul className="list-group list-group-flush">
                            {this.state.suppliers
                              .filter(
                                ({ nama }) =>
                                  nama.indexOf(this.props.supplier) > -1
                              )
                              .map((v, i) => (
                                <li
                                  key={i}
                                  onClick={() => {
                                    handleAutoAnggota(v.nama);
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
                    <div className="col-md-6"></div>
                    <div className="col-12">
                      <label htmlFor="jenisInput" className="form-label">
                        Jenis Input
                      </label>
                      <select
                        id="jenisInput"
                        className="form-select"
                        onChange={handleVisiInput}
                      >
                        <option value={"manual"}>Manual</option>
                        <option value={"scan"}>Scan Barcode</option>
                      </select>
                    </div>
                    {this.state.visiJenisInput ? (
                      <AddCartScan />
                    ) : (
                      <AddCartManual />
                    )}
                    <div className="text-lg-end">
                      {this.state.visiJenisInput ? (
                        this.props.kodeBarang != "" && (
                          <button type="submit" className="btn btn-primary">
                            Tambah
                          </button>
                        )
                      ) : (
                        <button type="submit" className="btn btn-primary">
                          Tambah
                        </button>
                      )}
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
                    <button className="btn btn-success" onClick={simpan}>
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
  }
}

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
    handleFakturPembelian: (faktur) =>
      dispatch({ type: ActionType.SET_FAKTUR_PEMBELIAN, index: faktur }),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(TransaksiPembalian);
