// TransPenjualan.jsx — Versi Perbaikan & Refactor (Functional Component)
import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "../../../../api/axios";
import { generateFaktur } from "../../../../components/faktur/generateFaktur";
import { useDispatch, useSelector } from "react-redux";
import ActionType from "../../../../redux/reducer/globalActionType";
import AddCartManual from "./addCartManual";
import AddCartScan from "./addCartScan";
import CartList from "./cartList";
import getAnggotaAutoComplate from "../../../../utils/anggota/getAnggotaAutoComplate";
import getBarangJoinAutoComplate from "../../../../utils/barang/getBarangJoinAutoComplate";
import getTransPenjualanJoin from "../../../../utils/transaksiPenjualan/getTransPenjualanJoin";
import Swal from "sweetalert2";

const TransPenjualan = () => {
  const dispatch = useDispatch();

  // Global Redux state
  const anggota = useSelector((s) => s.anggota);
  const typePembayaran = useSelector((s) => s.typePembayaran);
  const kodeBarang = useSelector((s) => s.kodeBarang);
  const namaBarang = useSelector((s) => s.namaBarang);
  const jumlah = useSelector((s) => s.jumlah);
  const harga = useSelector((s) => s.harga);
  const faktur = useSelector((s) => s.faktur);
  const supplierId = useSelector((s) => s.supplierId);
  const keranjangTerisi = useSelector((s) => s.keranjangPenjualanTerisi);

  // Local state
  const [penjualan, setPenjualan] = useState([]);
  const [visiJenisInput, setVisiJenisInput] = useState(false);
  const [displayAnggota, setDisplayAnggota] = useState(false);
  const [anggotas, setAnggotas] = useState([]);
  const [barang, setBarang] = useState([]);
  const [typeInput, setTypeInput] = useState("manual");

  const loadTransaksi = useCallback(async () => {
    const data = await getTransPenjualanJoin();
    setPenjualan(data);
  });

  // Load faktur saat pertama kali
  useEffect(() => {
    loadTransaksi();
    if (!faktur) dispatch({ type: ActionType.SET_FAKTUR_PENJUALAN, index: generateFaktur("FKJ") });
  }, [faktur, dispatch]);

  // Auto-complete anggota
  useEffect(() => {
    getAnggotaAutoComplate(anggota).then(setAnggotas);
  }, [anggota]);

  // Auto-complete barang
  useEffect(() => {
    const param = namaBarang ? namaBarang : kodeBarang;
    getBarangJoinAutoComplate(param).then(setBarang);
  }, [namaBarang, kodeBarang]);

  // Antrian agar scan beruntun diproses satu per satu (mencegah baris keranjang ganda untuk barang yang sama)
  const antrian = useRef(Promise.resolve());

  const resetInputBarang = () => {
    dispatch({ type: ActionType.SET_KODE_BARANG_PENJUALAN, index: "" });
    dispatch({ type: ActionType.SET_NAMA_BARANG_PENJUALAN, index: "" });
    dispatch({ type: ActionType.SET_JUMLAH_PENJUALAN, index: "" });
    dispatch({ type: ActionType.SET_HARGA_PENJUALAN, index: "" });
  };

  // Tambah barang ke keranjang; dipakai input manual dan scan barcode
  const prosesTambah = async (selectedBarang, jumlahInt, hargaInt) => {
    const selectedAnggota = anggotas.find((a) => a.nama === anggota);

    if (!selectedAnggota || !typePembayaran) {
      Swal.fire("Gagal menambahkan data!!", "Pilih nama anggota dan jenis pembayaran terlebih dahulu", "warning");
      return false;
    }
    if (!selectedBarang) {
      Swal.fire("Gagal menambahkan data!!", "Barang tidak ditemukan", "warning");
      return false;
    }
    if (!jumlahInt || jumlahInt <= 0) {
      Swal.fire("Gagal menambahkan data!!", "Jumlah harus lebih dari 0", "warning");
      return false;
    }
    if (!hargaInt || hargaInt <= 0) {
      Swal.fire("Gagal menambahkan data!!", "Harga harus lebih dari 0", "warning");
      return false;
    }

    try {
      const barangIdLokal = Number(selectedBarang.id);
      const [res, stok] = await Promise.all([
        axios.get("/transPenjualan/on-process", { params: { barangId: barangIdLokal, faktur } }),
        // Stok terbaru dari server (daftar barang di halaman bisa sudah usang)
        axios.get(`/barang/${barangIdLokal}`),
      ]);

      const trans = res.data;
      const jumlahDiKeranjang = trans ? parseInt(trans.jumlah) : 0;
      const jumlahBaru = jumlahDiKeranjang + jumlahInt;
      const stokTersedia = parseInt(stok.data?.jumlah ?? selectedBarang.jumlah) || 0;

      // Stok tidak cukup (termasuk jumlah yang sudah ada di keranjang)
      if (stokTersedia - jumlahBaru < 0) {
        Swal.fire("Gagal menambahkan data!!", `Stok ${selectedBarang.nama} tidak cukup (sisa ${stokTersedia})`, "warning");
        return false;
      }

      if (!trans) {
        // Insert baru
        await axios.post("/transPenjualan", {
          jumlah: jumlahInt,
          faktur,
          harga: hargaInt * jumlahInt,
          typePembayaran,
          anggotaId: Number(selectedAnggota.id),
          barangId: barangIdLokal,
          statusPenjualan: "onProcess",
        });
      } else {
        // Update (jumlah bertambah)
        await axios.put(`/transPenjualan/${trans.id}`, {
          jumlah: jumlahBaru,
          harga: hargaInt * jumlahBaru,
        });
      }
      await loadTransaksi();
      dispatch({ type: ActionType.REFRESH_KERANJANG_PENJUALAN });
      return true;
    } catch (err) {
      console.error(err);
      Swal.fire("Error!", err.response?.data?.msg || "Gagal memproses data", "error");
      return false;
    }
  };

  const tambahKeKeranjang = (selectedBarang, jumlahInt, hargaInt) => {
    const hasil = antrian.current.then(() => prosesTambah(selectedBarang, jumlahInt, hargaInt));
    antrian.current = hasil.catch(() => false);
    return hasil;
  };

  // Submit Tambah Cart (input manual)
  const handleCart = async (e) => {
    e.preventDefault();
    const selectedBarang = barang.find((b) => b.nama === namaBarang && b.supplierId === supplierId);
    const berhasil = await tambahKeKeranjang(selectedBarang, parseInt(jumlah), parseInt(harga));
    if (berhasil) resetInputBarang();
  };

  // Scan barcode: langsung masuk keranjang 1 pcs dengan harga jual barang
  const handleScan = async (barangScan) => {
    const berhasil = await tambahKeKeranjang(barangScan, 1, parseInt(barangScan.hargaJual));
    if (berhasil) resetInputBarang();
    return berhasil;
  };

  // Jenis input (manual / scan)
  const handleVisiInput = (e) => {
    const value = e.target.value;
    setTypeInput(value);
    setVisiJenisInput(value === "scan");
  };

  const handleAutoAnggota = (val) => {
    setDisplayAnggota(false);
    dispatch({ type: ActionType.SET_ANGGOTA_PENJUALAN, index: val });
  };

  const anggotaFiltered = anggotas.filter((v) => v.nama.toLowerCase().includes((anggota || "").toLowerCase()));

  return (
    <main id="main" className="main penjualan-page">
      <div className="pagetitle d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <div>
          <h1 className="fs-2 fw-bold mb-1">Transaksi Penjualan</h1>
          <small className="text-muted">Tambahkan barang ke keranjang, lalu lakukan pembayaran</small>
        </div>
        <span className="badge bg-primary bg-opacity-10 text-primary fs-6 px-3 py-2">
          <i className="bi bi-receipt me-1" />
          {faktur}
        </span>
      </div>

      <section className="section">
        {/* FORM */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-4">
            <form className="row g-3" onSubmit={handleCart}>
              {/* Input Anggota */}
              <div className="col-md-6 position-relative">
                <label className="form-label fw-semibold">Nama Anggota</label>
                <div className="input-group">
                  <span className="input-group-text bg-white">
                    <i className="bi bi-person" />
                  </span>
                  <input type="text" className="form-control" placeholder="Ketik nama anggota..." autoComplete="off" value={anggota} disabled={keranjangTerisi} onChange={(e) => dispatch({ type: ActionType.SET_ANGGOTA_PENJUALAN, index: e.target.value })} onClick={() => setDisplayAnggota(!displayAnggota)} />
                </div>
                {keranjangTerisi && <small className="text-muted">Terkunci: satu faktur hanya untuk satu anggota. Kosongkan keranjang untuk mengganti.</small>}

                {displayAnggota && (
                  <ul className="list-group autocomplete-menu shadow">
                    {anggotaFiltered.length ? (
                      anggotaFiltered.map((v, i) => (
                        <li key={i} onClick={() => handleAutoAnggota(v.nama)} className="list-group-item list-group-item-action">
                          {v.nama}
                        </li>
                      ))
                    ) : (
                      <li className="list-group-item text-muted small">Anggota tidak ditemukan</li>
                    )}
                  </ul>
                )}
              </div>

              {/* Type Pembayaran */}
              <div className="col-sm-6 col-md-3">
                <label className="form-label fw-semibold">Pembayaran</label>
                <select className="form-select" value={typePembayaran} onChange={(e) => dispatch({ type: ActionType.SET_TYPE_BAYAR_PENJUALAN, index: e.target.value })}>
                  <option value="">-- Pilih --</option>
                  <option value="Tunai">Tunai</option>
                  <option value="QRIS">QRIS</option>
                </select>
              </div>

              {/* Jenis Input */}
              <div className="col-sm-6 col-md-3">
                <label className="form-label fw-semibold d-block">Jenis Input</label>
                <div className="btn-group w-100">
                  <button type="button" className={`btn ${typeInput === "manual" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => handleVisiInput({ target: { value: "manual" } })}>
                    <i className="bi bi-keyboard me-1" />
                    Manual
                  </button>
                  <button type="button" className={`btn ${typeInput === "scan" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => handleVisiInput({ target: { value: "scan" } })}>
                    <i className="bi bi-upc-scan me-1" />
                    Scan
                  </button>
                </div>
              </div>

              <div className="col-12">
                <hr className="my-1" />
              </div>

              {/* Input Barang */}
              {visiJenisInput ? <AddCartScan onScan={handleScan} /> : <AddCartManual />}

              {!visiJenisInput && (
                <div className="col-12 text-end">
                  <button type="submit" className="btn btn-primary px-4">
                    <i className="bi bi-cart-plus me-1" />
                    Tambah ke Keranjang
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* KERANJANG + RINGKASAN */}
        <CartList />
      </section>

      <style>{`
        /* Template memberi tiap .card & .pagetitle h1 margin-left -90px; geser sekali di level halaman */
        .penjualan-page .card { margin: 0; border-radius: 14px; }
        .penjualan-page .pagetitle h1 { margin-left: 0; }
        @media (min-width: 1200px) {
          .penjualan-page .pagetitle,
          .penjualan-page .section { margin-left: -90px; }
          /* hanya saat sticky; .card position:relative akan tergeser jika top berlaku di layar kecil */
          .penjualan-page .summary-card { top: 80px; }
        }
        .penjualan-page .autocomplete-menu {
          position: absolute; left: calc(var(--bs-gutter-x) * .5); right: calc(var(--bs-gutter-x) * .5);
          top: 100%; z-index: 1050; margin-top: 2px;
          max-height: 240px; overflow-y: auto; border-radius: 8px;
        }
        .penjualan-page .autocomplete-menu .list-group-item { cursor: pointer; }
        .penjualan-page .cart-table thead th {
          font-size: .75rem; text-transform: uppercase; letter-spacing: .03em;
          color: #6c757d; white-space: nowrap;
        }
        .penjualan-page .total-amount { font-size: 2rem; line-height: 1.2; }
      `}</style>
    </main>
  );
};

export default TransPenjualan;
