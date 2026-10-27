import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import ActionType from "../../../../redux/reducer/globalActionType";
import Swal from "sweetalert2";
import { generateFaktur } from "../../../../components/faktur/generateFaktur";
import convertRupiah from "rupiah-format";
import getTransPembelianJoin from "../../../../utils/transaksiPembelian/getTransPembelianJoin";
import hapusTransaksiPembelian from "../../../../utils/transaksiPembelian/hapusTransaksiPembelian";
import editTransaksiCartListPembelian from "../../../../utils/transaksiPembelian/editTransaksiCartListPembelian";

const CartList = (props) => {
  /* ================= ALERT ================= */
  const Toast = Swal.mixin({
    customClass: {
      confirmButton: "btn btn-success",
      cancelButton: "btn btn-danger",
    },
    buttonsStyling: false,
  });

  /* ================= STATE ================= */
  const [transaksi, setTransaksi] = useState([]);
  const [refresh, setRefresh] = useState(false);

  // edit state
  const [displayEdit, setDisplayEdit] = useState(false);
  const [idEdit, setIdEdit] = useState(null);
  const [jumlah, setJumlah] = useState(0);
  const [editHargaBeli, setEditHargaBeli] = useState(0);
  const [editHargaJual, setEditHargaJual] = useState(0);

  // search faktur
  const [displaySearch, setDisplaySearch] = useState(false);
  const [displayAutoFaktur, setDisplayAutoFaktur] = useState(false);
  const [searchFaktur, setSearchFaktur] = useState("");
  const [dataFilterFaktur, setDataFilterFaktur] = useState([]);

  /* ================= EFFECT ================= */
  useEffect(() => {
    getTransPembelianJoin().then((data) => {
      setTransaksi(data);

      // remove duplicate faktur
      const uniqueFaktur = data.filter((v, i, self) => i === self.findIndex((t) => t.faktur === v.faktur));
      setDataFilterFaktur(uniqueFaktur);

      const onProcess = data.find((v) => v.statusPembelian === "onProcess");

      if (!onProcess) {
        setDisplaySearch(true);

        if (!data.find((v) => v.faktur === searchFaktur)) {
          props.handleFakturPembelian(generateFaktur("FKB"));
        }
      } else {
        setDisplaySearch(false);
        props.handleFakturPembelian(onProcess.faktur);
        props.handleSupplier(onProcess.supplier.nama);
      }
    });
  }, [props.harga, props.jumlah, refresh, searchFaktur, props.supplier]);

  /* ================= HANDLER ================= */
  const handleEditJumlah = (id, qty, hargaBeli, hargaJual) => {
    setDisplayEdit(true);
    setIdEdit(id);
    setJumlah(qty);
    setEditHargaBeli(hargaBeli);
    setEditHargaJual(hargaJual);
  };

  const handleAutoFaktur = (val) => {
    setDisplayAutoFaktur(false);
    setSearchFaktur(val);
    props.handleFakturPembelian(val);
  };

  const batal = () => {
    setDisplayEdit(false);
    setIdEdit(null);
    setJumlah(0);
    setEditHargaBeli(0);
    setEditHargaJual(0);
  };

  const save = async () => {
    const jumlahInt = parseInt(jumlah);
    const hargaBeliInt = parseInt(editHargaBeli);
    const hargaJualInt = parseInt(editHargaJual);

    if (!jumlahInt || jumlahInt <= 0) {
      return Swal.fire("Gagal!", "Jumlah harus lebih dari 0", "warning");
    }
    if (!hargaBeliInt || hargaBeliInt <= 0 || !hargaJualInt || hargaJualInt <= 0) {
      return Swal.fire("Gagal!", "Harga beli dan harga jual harus lebih dari 0", "warning");
    }
    // Harga jual di bawah harga beli diizinkan (promo / jual rugi), cukup dikonfirmasi
    if (hargaJualInt < hargaBeliInt) {
      const lanjut = await Swal.fire({ icon: "warning", title: "Harga jual di bawah harga beli", text: "Barang ini akan dijual rugi. Tetap simpan?", showCancelButton: true, confirmButtonText: "Tetap simpan", cancelButtonText: "Periksa lagi", reverseButtons: true });
      if (!lanjut.isConfirmed) return;
    }

    try {
      await editTransaksiCartListPembelian({
        id: idEdit,
        jumlah: jumlahInt,
        harga: hargaBeliInt,
        hargaJual: hargaJualInt,
      });

      // Stok dan harga barang baru diperbarui saat Simpan Pembelian (checkout)
      batal();
      setTimeout(() => setRefresh(!refresh), 100);
    } catch (err) {
      console.error(err);
      Swal.fire("Gagal!", err.response?.data?.msg || "Gagal menyimpan perubahan", "error");
    }
  };

  const handleHapusTransaksi = (idTrans) => {
    Toast.fire({
      title: "Apa Kamu Yakin?",
      text: "Kamu akan Menghapus Data Pembelian!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ok, Hapus!",
      cancelButtonText: "Tidak, Batal!",
      reverseButtons: true,
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      // Item di keranjang belum menambah stok, jadi stok barang tidak perlu dikurangi
      try {
        await hapusTransaksiPembelian(idTrans);
        setRefresh(!refresh);
        Toast.fire("Terhapus!", "Data Pembelian Sudah Terhapus.", "success");
      } catch (err) {
        console.error(err);
        Swal.fire("Gagal!", err.response?.data?.msg || "Gagal menghapus data", "error");
      }
    });
  };

  /* ================= JSX ================= */
  const items = transaksi.filter((v) => v.faktur === props.faktur);
  const hargaJualItem = (v) => v.hargaJual || v.barang.hargaJual;
  const totalItem = items.reduce((sum, v) => sum + (parseInt(v.jumlah) || 0), 0);
  const totalBeli = items.reduce((sum, v) => sum + (parseInt(v.harga) || 0) * (parseInt(v.jumlah) || 0), 0);
  const totalJual = items.reduce((sum, v) => sum + (parseInt(hargaJualItem(v)) || 0) * (parseInt(v.jumlah) || 0), 0);
  const supplierList = [...new Set(items.map((v) => v.supplier?.nama).filter(Boolean))];

  return (
    <div className="row g-4">
      {/* TABLE KERANJANG */}
      <div className="col-xl-8">
        <div className="card border-0 shadow-sm h-100">
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">
                <i className="bi bi-box-seam me-2" />
                Daftar Pembelian
              </h5>
              <span className="badge rounded-pill bg-primary bg-opacity-10 text-primary px-3 py-2">{items.length} barang</span>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0 cart-table">
                <thead className="table-light">
                  <tr>
                    <th className="text-center" style={{ width: "50px" }}>
                      #
                    </th>
                    <th style={{ minWidth: "180px" }}>Barang</th>
                    <th className="text-center" style={{ width: "110px" }}>
                      Jumlah
                    </th>
                    <th className="text-end">Harga Beli</th>
                    <th className="text-end">Harga Jual</th>
                    <th className="text-end">Subtotal</th>
                    <th className="text-center" style={{ width: "110px" }}>
                      Aksi
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center text-muted py-5">
                        <i className="bi bi-inbox fs-1 d-block mb-2" />
                        Belum ada barang yang dibeli
                        <small className="d-block">Tambahkan barang melalui form di atas</small>
                      </td>
                    </tr>
                  ) : (
                    items.map((v, i) => {
                      const sedangEdit = displayEdit && v.id === idEdit;
                      const jualRugi = sedangEdit && editHargaJual < editHargaBeli;
                      return (
                        <tr key={v.id} className={sedangEdit ? "table-warning" : ""}>
                          <td className="text-center text-muted">{i + 1}</td>
                          <td>
                            <div className="fw-semibold">{v.barang.nama}</div>
                            <small className="text-muted">{v.supplier.nama}</small>
                          </td>

                          {sedangEdit ? (
                            <>
                              <td>
                                <input type="number" min="1" className="form-control form-control-sm text-center" value={jumlah} autoFocus onChange={(e) => setJumlah(+e.target.value)} />
                              </td>
                              <td>
                                <input type="number" min="1" className="form-control form-control-sm text-end" value={editHargaBeli} onChange={(e) => setEditHargaBeli(+e.target.value)} />
                              </td>
                              <td>
                                <input type="number" min="1" className={`form-control form-control-sm text-end ${jualRugi ? "border-warning" : ""}`} title={jualRugi ? "Di bawah harga beli (rugi)" : undefined} value={editHargaJual} onChange={(e) => setEditHargaJual(+e.target.value)} />
                              </td>
                              <td className="text-end fw-bold text-nowrap">{convertRupiah.convert(jumlah * editHargaBeli)}</td>
                            </>
                          ) : (
                            <>
                              <td className="text-center">{v.jumlah}</td>
                              <td className="text-end text-nowrap">{convertRupiah.convert(v.harga)}</td>
                              <td className="text-end text-nowrap">{convertRupiah.convert(hargaJualItem(v))}</td>
                              <td className="text-end fw-bold text-nowrap">{convertRupiah.convert(v.harga * v.jumlah)}</td>
                            </>
                          )}

                          <td className="text-center text-nowrap">
                            {sedangEdit ? (
                              <>
                                <button className="btn btn-sm btn-success me-1" title="Simpan" onClick={save}>
                                  <i className="bi bi-check-lg" />
                                </button>
                                <button className="btn btn-sm btn-secondary" title="Batal" onClick={batal}>
                                  <i className="bi bi-x-lg" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button className="btn btn-sm btn-outline-warning me-1" title="Ubah" onClick={() => handleEditJumlah(v.id, v.jumlah, v.harga, hargaJualItem(v))}>
                                  <i className="bi bi-pencil" />
                                </button>
                                <button className="btn btn-sm btn-outline-danger" title="Hapus" onClick={() => handleHapusTransaksi(v.id)}>
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
              <dt className="col-5 text-muted fw-normal">Supplier</dt>
              <dd className="col-7 text-end fw-semibold">{supplierList.join(", ") || props.supplier || "-"}</dd>
              <dt className="col-5 text-muted fw-normal">Jumlah Item</dt>
              <dd className="col-7 text-end fw-semibold">{totalItem}</dd>
              <dt className="col-5 text-muted fw-normal">Estimasi Nilai Jual</dt>
              <dd className="col-7 text-end fw-semibold">{convertRupiah.convert(totalJual)}</dd>
              <dt className="col-5 text-muted fw-normal">Estimasi Margin</dt>
              <dd className={`col-7 text-end fw-semibold ${totalJual - totalBeli < 0 ? "text-danger" : "text-success"}`}>{convertRupiah.convert(totalJual - totalBeli)}</dd>
            </dl>
            <hr />
            <div className="text-muted small">Total Pembelian</div>
            <div className="total-amount fw-bold text-primary mb-3 text-break">{convertRupiah.convert(totalBeli)}</div>
            <button className="btn btn-success w-100 py-2" disabled={items.length === 0 || displayEdit} onClick={props.onSimpan}>
              <i className="bi bi-save me-2" />
              Simpan Pembelian
            </button>
            {displayEdit && <small className="text-muted d-block text-center mt-2">Selesaikan edit terlebih dahulu</small>}
            <small className="text-muted d-block text-center mt-2">Stok dan harga barang diperbarui setelah pembelian disimpan</small>
          </div>
        </div>
      </div>
    </div>
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
  harga_jual: state.harga_jual,
  faktur: state.faktur_beli,
});

const mapDispatchToProps = (dispatch) => ({
  handleSupplier: (v) => dispatch({ type: ActionType.SET_SUPPLIER_PEMBELIAN, index: v }),
  handleFakturPembelian: (v) => dispatch({ type: ActionType.SET_FAKTUR_PEMBELIAN, index: v }),
});

export default connect(mapStateToProps, mapDispatchToProps)(CartList);
