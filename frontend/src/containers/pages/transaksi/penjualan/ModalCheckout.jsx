import React, { useEffect, useRef, useState } from "react";
import { connect } from "react-redux";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import barangTerjual from "../../../../utils/barang/barangTerjual";
import axios from "../../../../api/axios";
import ActionType from "../../../../redux/reducer/globalActionType";
import Swal from "sweetalert2";
import convertRupiah from "rupiah-format";

const ModalCheckout = (props) => {
  const [pembayaran, setPembayaran] = useState("");
  const inputRef = useRef(null);

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
    if (parseInt(pembayaran) < total && props.typePembayaran === "Cash") {
      return Swal.fire("Pembayaran Kurang", "Nominal pembayaran lebih kecil dari total!", "warning");
    }

    // ==================================================
    // ========== VALIDASI STOK BEFORE PRINT ============
    // ==================================================

    for (let trans of transaksi) {
      const barangId = trans.barangId || trans.barang?.id;

      try {
        const res = await axios.get(`/barang/${barangId}`);
        const stokServer = res.data?.jumlah ?? 0;

        if (trans.jumlah > stokServer) {
          return Swal.fire({
            icon: "error",
            title: "Stok Tidak Cukup!",
            text: `Barang "${trans.barang?.nama}" hanya tersisa ${stokServer}, tetapi pembelian adalah ${trans.jumlah}.`,
          });
        }
      } catch (err) {
        console.error(err);
        return Swal.fire({
          icon: "error",
          title: "Gagal Memeriksa Stok!",
          text: `Tidak dapat mengambil stok barang "${trans.barang?.nama}".`,
        });
      }
    }

    // ===============================
    // ========== LANJUT CHECKOUT ====
    // ===============================

    try {
      // ================================
      // ========== UPDATE STOK =========
      // ========== + SIMPAN LOG ========
      // ================================
      for (let trans of transaksi) {
        const barangId = trans.barangId || trans.barang?.id;

        // 1. Ambil stok awal
        const barangRes = await axios.get(`/barang/${barangId}`);
        const stokAwal = barangRes.data?.jumlah ?? 0;

        // 2. Hitung stok akhir
        const stokAkhir = stokAwal - trans.jumlah;

        // 3. Update stok (fungsi existing)
        barangTerjual(barangId, trans.jumlah);

        // 4. Simpan LOG stok
        try {
          await axios.post("/logPenjualan", {
            qty: trans.jumlah,
            qty_awal: stokAwal,
            qty_baru: stokAkhir,
            keterangan: "Penjualan (-)",
            barangId: barangId,
            faktur: props.faktur,
          });
        } catch (err) {
          console.error("Gagal menyimpan log:", err);
          Swal.fire("Error", "Gagal menyimpan log perubahan stok!", "error");
          return;
        }
        await axios.put(`/transPenjualan/${trans.id}`, {
          statusPenjualan: props.typePembayaran === "Bon" ? "Bon" : "Selesai",
        });
      }

      // ===============================
      // ========== CETAK PDF ==========
      // ===============================

      const doc = new jsPDF("p", "mm", [48, 120]);

      let today = new Date();
      const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "July", "Agustus", "September", "Oktober", "November", "Desember"];
      today = String(today.getDate()).padStart(2, "0") + " - " + months[today.getMonth()] + " - " + today.getFullYear();

      doc.setFontSize(12);
      doc.text(`Cafe-Wijaya`, 5, 5);
      doc.setFontSize(7);

      doc.text(`Faktur : ${props.faktur}`, 1, 11);
      doc.text(`Tanggal : ${today}`, 1, 15);
      doc.text(`Pembayaran : ${props.typePembayaran}`, 1, 19);
      doc.text(`Anggota : ${props.anggota}`, 1, 23);
      doc.line(1, 26, 46, 26);

      doc.autoTable({
        body: transaksi.map((val) => [val.barang?.nama, val.barang?.hargaJual, val.jumlah, val.jumlah * val.barang?.hargaJual]),
        styles: { fontSize: 7 },
        startY: 28,
        margin: { left: 0, right: 3 },
        theme: "plain",
      });

      let heightTable = doc.lastAutoTable.finalY;

      const bayar = parseInt(pembayaran);
      const kembali = bayar - total;

      doc.line(1, heightTable + 1, 46, heightTable + 1);

      doc.text(`Total : ${total}`, 1, heightTable + 6);
      doc.text(`Bayar : ${bayar}`, 1, heightTable + 10);
      doc.text(`Kembali : ${kembali}`, 1, heightTable + 14);

      doc.autoPrint();

      const pdf = doc.output("bloburl");
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = pdf;

      iframe.onload = () => {
        try {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
        } catch (error) {
          console.error("Gagal mencetak PDF:", error);
        }
      };

      document.body.appendChild(iframe);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Terjadi kesalahan saat proses checkout!", "error");
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

  return (
    <>
      {/* MODAL CHECKOUT */}
      <div className="modal fade" id="exampleModal" tabIndex="-1">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5">Daftar Barang</h1>
              <button className="btn-close" data-bs-dismiss="modal"></button>
            </div>

            <form onSubmit={print}>
              <div className="modal-body">
                {/* TABEL */}
                <div className="overflow-auto" style={{ height: 300 }}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Anggota</th>
                        <th>Barang</th>
                        <th>Jumlah</th>
                        <th>Harga</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {props.transaksiProps
                        .filter((v) => v.faktur === props.faktur)
                        .map((val, i) => (
                          <tr key={i}>
                            <td>{i + 1}</td>
                            <td>{val.anggota?.nama}</td>
                            <td>{val.barang?.nama}</td>
                            <td>{val.jumlah}</td>
                            <td>{convertRupiah.convert(val.barang?.hargaJual)}</td>
                            <td>{convertRupiah.convert(val.jumlah * val.barang?.hargaJual)}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-3 d-flex justify-content-end">
                  <h3>Total: {convertRupiah.convert(props.totalHarga)}</h3>
                </div>

                <div className="mt-3 row">
                  <div className="col-6">
                    <label className="form-label">Nominal Pembayaran</label>
                    <input type="number" className="form-control" value={pembayaran} onChange={(e) => setPembayaran(e.target.value)} ref={inputRef} />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" data-bs-dismiss="modal">
                  Close
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  data-bs-target={props.transaksiProps.some((v) => v.faktur === props.faktur) ? "#exampleModalToggle2" : ""}
                  data-bs-toggle={props.transaksiProps.some((v) => v.faktur === props.faktur) ? "modal" : ""}
                  data-bs-dismiss={props.transaksiProps.some((v) => v.faktur === props.faktur) ? "" : "modal"}
                >
                  Print
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* MODAL KEMBALIAN */}
      <div className="modal fade" id="exampleModalToggle2" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5">Total Kembalian</h1>
            </div>

            <div className="modal-body">
              <h1>
                {(parseInt(pembayaran) - props.totalHarga).toLocaleString("id-ID", {
                  style: "currency",
                  currency: "IDR",
                })}
              </h1>
            </div>

            <form onSubmit={reset}>
              <div className="modal-footer">
                <button className="btn btn-primary" data-bs-dismiss="modal">
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
