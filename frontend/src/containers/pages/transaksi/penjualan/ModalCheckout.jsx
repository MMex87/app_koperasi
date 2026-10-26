import React, { useEffect, useRef, useState } from "react";
import { connect } from "react-redux";
import axios from "../../../../api/axios";
import { buatStruk, cetakStruk, formatTanggalStruk, rupiahStruk } from "../../../../utils/struk";
import ActionType from "../../../../redux/reducer/globalActionType";
import Swal from "sweetalert2";
import convertRupiah from "rupiah-format";

const ModalCheckout = (props) => {
  const [pembayaran, setPembayaran] = useState("");
  const [bayarFinal, setBayarFinal] = useState(0);
  const inputRef = useRef(null);
  const checkoutModalRef = useRef(null);
  const kembalianModalRef = useRef(null);

  const getTotal = (faktur) => {
    return props.transaksiProps.filter((val) => val.faktur === faktur).reduce((acc, val) => acc + parseInt(val.harga), 0);
  };

  // ===============================
  // ========== PRINT ==============
  // ===============================

  const print = async (e) => {
    e.preventDefault();

    const transaksi = props.transaksiProps.filter(({ faktur }) => faktur === props.faktur);

    if (transaksi.length === 0) {
      return Swal.fire("Gagal Print!", "Tolong isi CartList Terlebih Dahulu!", "warning");
    }

    const total = getTotal(props.faktur);
    // Non-tunai (QRIS) dibayar pas sesuai total
    const bayarInt = props.typePembayaran === "Tunai" ? parseInt(pembayaran) : total;

    if (!props.typePembayaran) {
      return Swal.fire("Pembayaran Belum Dipilih", "Pilih jenis pembayaran terlebih dahulu!", "warning");
    }

    if (props.typePembayaran === "Tunai" && !bayarInt) {
      return Swal.fire("Pembayaran Belum Diisi", "Isi nominal pembayaran terlebih dahulu!", "warning");
    }

    if (props.typePembayaran === "Tunai" && bayarInt < total) {
      return Swal.fire("Pembayaran Kurang", "Nominal pembayaran lebih kecil dari total!", "warning");
    }

    // ===============================
    // ========== CHECKOUT ===========
    // ===============================
    // Cek stok, kurangi stok, simpan log, dan ubah status diproses backend
    // dalam satu DB transaction: jika satu item gagal, semuanya dibatalkan.

    try {
      await axios.post("/checkoutPenjualan", {
        faktur: props.faktur,
        typePembayaran: props.typePembayaran,
      });
    } catch (err) {
      console.error(err);
      return Swal.fire("Checkout Gagal!", err.response?.data?.msg || "Terjadi kesalahan saat proses checkout!", "error");
    }

    // Modal kembalian hanya dibuka setelah checkout berhasil
    setBayarFinal(bayarInt);
    window.bootstrap.Modal.getOrCreateInstance(checkoutModalRef.current).hide();
    window.bootstrap.Modal.getOrCreateInstance(kembalianModalRef.current).show();

    try {
      // ===============================
      // ========== CETAK PDF ==========
      // ===============================

      const bayar = bayarInt;
      const kembali = bayar - total;

      const doc = buatStruk({
        info: [
          { label: "Faktur", value: props.faktur },
          { label: "Tanggal", value: formatTanggalStruk(new Date()) },
          { label: "Pembayaran", value: props.typePembayaran },
          { label: "Anggota", value: (props.anggota || "-").trim() },
        ],
        items: transaksi.map((val) => ({
          nama: val.barang?.nama,
          qty: val.jumlah,
          harga: val.barang?.hargaJual,
          subtotal: val.jumlah * val.barang?.hargaJual,
        })),
        totals: [
          { label: "TOTAL", value: rupiahStruk(total), bold: true },
          { label: "Bayar", value: rupiahStruk(bayar) },
          { label: "Kembali", value: rupiahStruk(kembali) },
        ],
      });
      cetakStruk(doc);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Checkout berhasil, tetapi struk gagal dicetak!", "error");
    }
  };

  // ===============================
  // ========== RESET ==============
  // ===============================

  const reset = (e) => {
    e.preventDefault();
    props.handleAnggota("");
    props.handleTypeBayar("");
    props.handleKodeBarang("");
    props.handleNamaBarang("");
    props.handleJumlah("");
    props.handlejenisBarang("");
    props.handleHargaBarang("");
    props.handleFakturPenjualan("");
    props.refreshAutoFokus();
    setPembayaran("");
    setBayarFinal(0);
  };

  // ======================================================
  // === REFRESH OTOMATIS SETELAH PRINT DITUTUP ===========
  // ======================================================

  useEffect(() => {
    const handleAfterPrint = () => {
      window.location.reload();
    };

    window.addEventListener("afterprint", handleAfterPrint);
    return () => window.removeEventListener("afterprint", handleAfterPrint);
  }, []);

  useEffect(() => {
    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 400);
  }, [props.refresh]);

  const items = props.transaksiProps.filter((v) => v.faktur === props.faktur);
  const total = props.totalHarga || 0;
  const tunai = props.typePembayaran === "Tunai";
  const bayarInt = parseInt(pembayaran) || 0;
  const selisih = bayarInt - total;

  // Pilihan nominal cepat: uang pas + pembulatan ke pecahan umum
  const nominalCepat = [...new Set([total, Math.ceil(total / 5000) * 5000, Math.ceil(total / 10000) * 10000, 20000, 50000, 100000])].filter((v) => v >= total && v > 0).slice(0, 5);

  return (
    <>
      {/* MODAL CHECKOUT */}
      <div className="modal fade" id="exampleModal" tabIndex="-1" ref={checkoutModalRef}>
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content border-0">
            <div className="modal-header">
              <div>
                <h1 className="modal-title fs-5 fw-bold">Pembayaran</h1>
                <small className="text-muted">
                  {props.faktur} · {props.anggota || "-"}
                </small>
              </div>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>

            <form onSubmit={print}>
              <div className="modal-body">
                {/* TABEL */}
                <div className="table-responsive border rounded" style={{ maxHeight: 260 }}>
                  <table className="table table-sm align-middle mb-0">
                    <thead className="table-light sticky-top">
                      <tr>
                        <th className="ps-3">Barang</th>
                        <th className="text-end">Harga</th>
                        <th className="text-center">Jumlah</th>
                        <th className="text-end pe-3">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((val, i) => (
                        <tr key={i}>
                          <td className="ps-3">{val.barang?.nama}</td>
                          <td className="text-end text-nowrap">{convertRupiah.convert(val.barang?.hargaJual)}</td>
                          <td className="text-center">{val.jumlah}</td>
                          <td className="text-end text-nowrap pe-3">{convertRupiah.convert(val.jumlah * val.barang?.hargaJual)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="d-flex justify-content-between align-items-center bg-light rounded p-3 mt-3">
                  <span className="text-muted">
                    Total Bayar <span className="badge bg-secondary ms-1">{props.typePembayaran || "Belum dipilih"}</span>
                  </span>
                  <span className="fs-3 fw-bold text-primary">{convertRupiah.convert(total)}</span>
                </div>

                {tunai ? (
                  <div className="row g-3 mt-1">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Nominal Pembayaran</label>
                      <div className="input-group input-group-lg">
                        <span className="input-group-text">Rp</span>
                        <input type="number" className="form-control" value={pembayaran} onChange={(e) => setPembayaran(e.target.value)} ref={inputRef} />
                      </div>
                      <div className="d-flex flex-wrap gap-1 mt-2">
                        {nominalCepat.map((n, i) => (
                          <button key={n} type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setPembayaran(String(n))}>
                            {i === 0 ? "Uang Pas" : `${n.toLocaleString("id-ID")}`}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">{selisih < 0 ? "Kurang" : "Kembalian"}</label>
                      <div className={`form-control form-control-lg fw-bold ${!bayarInt ? "text-muted" : selisih < 0 ? "text-danger" : "text-success"}`}>{bayarInt ? convertRupiah.convert(Math.abs(selisih)) : "-"}</div>
                    </div>
                  </div>
                ) : (
                  props.typePembayaran && (
                    <div className="alert alert-info mt-3 mb-0">
                      <i className="bi bi-qr-code me-2" />
                      Pastikan pembayaran {props.typePembayaran} sebesar <b>{convertRupiah.convert(total)}</b> sudah diterima sebelum mencetak struk.
                    </div>
                  )
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-light border" data-bs-dismiss="modal">
                  Batal
                </button>
                <button type="submit" className="btn btn-success px-4" disabled={items.length === 0 || (tunai && selisih < 0)}>
                  <i className="bi bi-printer me-2" />
                  Bayar &amp; Cetak
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* MODAL KEMBALIAN */}
      <div className="modal fade" id="exampleModalToggle2" tabIndex="-1" data-bs-backdrop="static" ref={kembalianModalRef}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 text-center">
            <div className="modal-body p-4">
              <i className="bi bi-check-circle-fill text-success" style={{ fontSize: "3.5rem" }} />
              <h5 className="fw-bold mt-2">Transaksi Berhasil</h5>
              <div className="text-muted small">Kembalian</div>
              <div className="display-6 fw-bold text-success">{convertRupiah.convert(Math.max(bayarFinal - total, 0))}</div>
              <div className="text-muted small mt-1">
                Bayar {convertRupiah.convert(bayarFinal)} · Total {convertRupiah.convert(total)}
              </div>
            </div>

            <form onSubmit={reset}>
              <div className="modal-footer justify-content-center border-0 pt-0">
                <button className="btn btn-primary px-5" data-bs-dismiss="modal">
                  Oke
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

const mapStateToProps = (state) => ({
  anggota: state.anggota,
  typePembayaran: state.typePembayaran,
  kodeBarang: state.kodeBarang,
  namaBarang: state.namaBarang,
  jumlah: state.jumlah,
  jenis: state.jenis,
  harga: state.harga,
  faktur: state.faktur,
  supplierId: state.supplierId,
});

const mapDispatchToProps = (dispatch) => ({
  handleAnggota: (v) => dispatch({ type: ActionType.SET_ANGGOTA_PENJUALAN, index: v }),
  handleTypeBayar: (v) => dispatch({ type: ActionType.SET_TYPE_BAYAR_PENJUALAN, index: v }),
  handleKodeBarang: (v) => dispatch({ type: ActionType.SET_KODE_BARANG_PENJUALAN, index: v }),
  handleNamaBarang: (v) => dispatch({ type: ActionType.SET_NAMA_BARANG_PENJUALAN, index: v }),
  handleJumlah: (v) => dispatch({ type: ActionType.SET_JUMLAH_PENJUALAN, index: v }),
  handlejenisBarang: (v) => dispatch({ type: ActionType.SET_JENIS_PENJUALAN, index: v }),
  handleHargaBarang: (v) => dispatch({ type: ActionType.SET_HARGA_PENJUALAN, index: v }),
  handleFakturPenjualan: (v) => dispatch({ type: ActionType.SET_FAKTUR_PENJUALAN, index: v }),
  handleSupplierIdPenjualan: (v) => dispatch({ type: ActionType.SET_ID_SUPPLIER_PENJUALAN, index: v }),
});

export default connect(mapStateToProps, mapDispatchToProps)(ModalCheckout);
