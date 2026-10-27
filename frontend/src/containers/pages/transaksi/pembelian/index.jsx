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
import { findBarang } from "../../../../utils/barang/getBarang";

const TransaksiPembalian = (props) => {
  /* ================= STATE ================= */
  const [transaksi, setTransaksi] = useState([]);
  const [visiJenisInput, setVisiJenisInput] = useState(false);
  const [displaySupplier, setDisplaySupplier] = useState(false);
  // Supplier dianggap dipilih hanya jika dipilih dari daftar (ketikan manual tidak cukup)
  const [supplierDipilih, setSupplierDipilih] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [barang, setBarang] = useState([]);

  /* ================= EFFECT ================= */
  useEffect(() => {
    if (props.faktur === "") {
      props.handleFakturPembelian(generateFaktur("FKB"));
    }

    getSupplier().then(setSuppliers);
    getBarangJoin(true).then(setBarang);
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
    setSupplierDipilih(true);
    props.handleSupplier(val);
  };

  const handleInputSupplier = (val) => {
    setSupplierDipilih(false);
    props.handleSupplier(val);
  };

  // Dipanggil dari form (manual) atau modal scan; true jika berhasil masuk daftar
  const handlecart = async (e) => {
    e?.preventDefault();

    try {
      const fakturLokal = props.faktur;
      const { jumlah, harga, harga_jual: hargaJual } = props;

      const supplierData = suppliers.find(({ nama }) => nama === props.supplier);
      if (!supplierData || !(supplierDipilih || props.keranjangTerisi)) {
        Swal.fire("Pilih supplier dulu", "Pilih nama supplier dari daftar sebelum menambah barang", "warning");
        return;
      }

      const idSupplier = supplierData.id;

      const barangNamaSama = barang.find((b) => b.nama.toLowerCase() === props.namaBarang.toLowerCase() && b.supplier?.nama === props.supplier);

      const barangSupplierBeda = barang.find((b) => (b.nama.toLowerCase() === props.namaBarang.toLowerCase() || b.kodeBarang === props.kodeBarang) && b.supplier?.nama !== props.supplier);

      /* ================= VALIDASI ================= */
      const jumlahInt = parseInt(jumlah);
      const hargaInt = parseInt(harga);
      const hargaJualInt = parseInt(hargaJual);

      if (!jumlah || !harga || !hargaJual) {
        Swal.fire("Gagal!", "Tolong isi semua data", "warning");
        return;
      }

      if (!jumlahInt || jumlahInt <= 0) {
        Swal.fire("Gagal!", "Jumlah harus lebih dari 0", "warning");
        return;
      }

      if (!hargaInt || hargaInt <= 0 || !hargaJualInt || hargaJualInt <= 0) {
        Swal.fire("Gagal!", "Harga beli dan harga jual harus lebih dari 0", "warning");
        return;
      }

      // Harga jual di bawah harga beli diizinkan (promo / jual rugi), cukup dikonfirmasi
      if (hargaJualInt < hargaInt) {
        const lanjut = await Swal.fire({ icon: "warning", title: "Harga jual di bawah harga beli", text: "Barang ini akan dijual rugi. Tetap tambahkan?", showCancelButton: true, confirmButtonText: "Tetap tambahkan", cancelButtonText: "Periksa lagi", reverseButtons: true });
        if (!lanjut.isConfirmed) return;
      }

      if (props.namaBarang.length < 3 || props.kodeBarang.length < 3) {
        Swal.fire("Gagal!", "Nama Barang & Kode minimal 3 karakter", "warning");
        return;
      }

      // Nama + kode sama dengan barang yang ada = restock (boleh, tidak perlu pilih dari autocomplete).
      // Nama sama tapi kode berbeda = duplikat nama, ditolak.
      if (barangNamaSama && String(barangNamaSama.kodeBarang) !== String(props.kodeBarang)) {
        Swal.fire("Gagal!", `Nama barang sudah dipakai barang lain (kode ${barangNamaSama.kodeBarang}) pada supplier yang sama`, "warning");
        return;
      }

      if (barangSupplierBeda) {
        Swal.fire("Gagal!", "Satu barang hanya boleh memiliki satu supplier", "error");
        return;
      }

      // Kode harus unik: kode yang sudah dipakai barang lain tidak boleh dipakai nama baru (bukan restock)
      const barangKodeSama = barang.find((b) => String(b.kodeBarang).trim() === props.kodeBarang.trim() && b.nama.toLowerCase() !== props.namaBarang.toLowerCase());
      if (barangKodeSama) {
        Swal.fire("Gagal!", `Kode ${props.kodeBarang} sudah dipakai barang "${barangKodeSama.nama}"`, "warning");
        return;
      }

      /* ================= PROSES ================= */
      const cariBarangDb = await findBarang(props.kodeBarang, idSupplier);
      // Pakai id dari database (bukan dari state form) agar tidak salah mengubah barang lain
      const barangIdDb = cariBarangDb ? cariBarangDb.id : null;
      const trans = barangIdDb ? await cariTransaksi(fakturLokal, barangIdDb) : null;

      // ================= BARANG BARU =================
      if (!trans) {
        if (!cariBarangDb) {
          const resBarang = await axios.post("/barang", {
            nama: props.namaBarang,
            kodeBarang: props.kodeBarang,
            jenisBarang: props.jenis,
            satuan: props.satuan,
            jumlah: 0,
            hargaBeli: hargaInt,
            hargaJual: hargaJualInt,
            supplierId: idSupplier,
          });

          await axios.post("/transPembelian", {
            jumlah: jumlahInt,
            faktur: fakturLokal,
            harga: hargaInt,
            hargaJual: hargaJualInt,
            supplierId: idSupplier,
            barangId: resBarang.data.barangId,
            statusPembelian: "onProcess",
          });
        }

        // ================= BARANG SUDAH ADA =================
        else {
          // Harga beli/jual baru disimpan di transaksi dan baru diterapkan ke barang saat Simpan Pembelian
          await axios.put(`/barang/${barangIdDb}`, {
            jenisBarang: props.jenis,
            satuan: props.satuan,
          });

          await axios.post("/transPembelian", {
            jumlah: jumlahInt,
            faktur: fakturLokal,
            harga: hargaInt,
            hargaJual: hargaJualInt,
            supplierId: idSupplier,
            barangId: barangIdDb,
            statusPembelian: "onProcess",
          });
        }
      }

      // ================= TRANSAKSI SUDAH ADA =================
      else {
        // Harga yang diisi sekarang menggantikan harga di baris keranjang (berlaku saat checkout)
        await axios.put(`/transPembelian/${trans.id}`, {
          jumlah: parseInt(trans.jumlah) + jumlahInt,
          harga: hargaInt,
          hargaJual: hargaJualInt,
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
      return true;
    } catch (err) {
      console.error(err);
      Swal.fire("Error!", err.response?.data?.msg || "Terjadi kesalahan sistem", "error");
      return false;
    }
  };

  const simpan = async () => {
    // Ambil data terbaru: keranjang bisa sudah diedit/dihapus di CartList
    let terbaru;
    try {
      terbaru = await getTransPembelian();
    } catch (err) {
      console.error(err);
      Swal.fire("Error!", "Gagal mengambil data keranjang", "error");
      return;
    }
    setTransaksi(terbaru);
    const data = terbaru.filter((v) => v.statusPembelian === "onProcess" && v.faktur === props.faktur);

    if (data.length === 0) {
      Swal.fire("Gagal!", "Keranjang pembelian masih kosong", "warning");
      return;
    }

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
        // Tambah stok, simpan log, dan ubah status ke Done diproses backend
        // dalam satu DB transaction: jika satu item gagal, semuanya dibatalkan.
        await axios.post("/checkoutPembelian", { faktur: props.faktur });

        props.handleSupplier("");
        Toast.fire("Berhasil!", "Pembelian & Stok Berhasil Disimpan", "success");
      } catch (err) {
        console.error(err);
        Swal.fire("Error!", err.response?.data?.msg || "Gagal menyimpan data", "error");
      }
    });
  };

  /* ================= JSX ================= */
  const supplierFiltered = suppliers.filter(({ nama }) => nama.toLowerCase().includes((props.supplier || "").toLowerCase()));
  // Barang hanya bisa diisi setelah supplier dipilih dari daftar (bukan sekadar diketik).
  // Supplier yang sudah terkunci dari keranjang yang berjalan juga dianggap terpilih.
  const supplierTerpilih = suppliers.some(({ nama }) => nama === props.supplier) && (supplierDipilih || props.keranjangTerisi);

  return (
    <main id="main" className="main pembelian-page">
      <div className="pagetitle d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <div>
          <h1 className="fs-2 fw-bold mb-1">Transaksi Pembelian</h1>
          <small className="text-muted">Catat barang masuk dari supplier, lalu simpan untuk menambah stok</small>
        </div>
        <span className="badge bg-primary bg-opacity-10 text-primary fs-6 px-3 py-2">
          <i className="bi bi-receipt me-1" />
          {props.faktur}
        </span>
      </div>

      <section className="section">
        {/* FORM */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-4">
            <form className="row g-3" onSubmit={handlecart}>
              <div className="col-md-8 position-relative">
                <label className="form-label fw-semibold">Nama Supplier</label>
                <div className="input-group">
                  <span className="input-group-text bg-white">
                    <i className="bi bi-shop" />
                  </span>
                  <input type="text" className="form-control" placeholder="Ketik nama supplier..." autoComplete="off" value={props.supplier} disabled={props.keranjangTerisi} onChange={(e) => handleInputSupplier(e.target.value)} onClick={() => setDisplaySupplier(!displaySupplier)} />
                </div>
                {props.keranjangTerisi && <small className="text-muted">Terkunci: satu faktur hanya untuk satu supplier. Kosongkan keranjang untuk mengganti.</small>}
                {!supplierTerpilih && <small className="text-danger">Pilih supplier dari daftar dulu sebelum mengisi barang.</small>}

                {displaySupplier && (
                  <ul className="list-group autocomplete-menu shadow">
                    {supplierFiltered.length ? (
                      supplierFiltered.map((v) => (
                        <li key={v.id} className="list-group-item list-group-item-action" onClick={() => handleAutoAnggota(v.nama)}>
                          {v.nama}
                        </li>
                      ))
                    ) : (
                      <li className="list-group-item text-muted small">Supplier tidak ditemukan</li>
                    )}
                  </ul>
                )}
              </div>

              <div className="col-md-4">
                <label className="form-label fw-semibold d-block">Jenis Input</label>
                <div className="btn-group w-100">
                  <button type="button" className={`btn ${!visiJenisInput ? "btn-primary" : "btn-outline-primary"}`} onClick={() => handleVisiInput({ target: { value: "manual" } })}>
                    <i className="bi bi-keyboard me-1" />
                    Manual
                  </button>
                  <button type="button" className={`btn ${visiJenisInput ? "btn-primary" : "btn-outline-primary"}`} onClick={() => handleVisiInput({ target: { value: "scan" } })}>
                    <i className="bi bi-upc-scan me-1" />
                    Scan
                  </button>
                </div>
              </div>

              <div className="col-12">
                <hr className="my-1" />
              </div>

              {visiJenisInput ? <AddCartScan onTambah={handlecart} supplierTerpilih={supplierTerpilih} /> : <AddCartManual supplierTerpilih={supplierTerpilih} />}

              <div className="col-12 text-end">
                <button type="submit" className="btn btn-primary px-4">
                  <i className="bi bi-plus-lg me-1" />
                  Tambah ke Daftar
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* DAFTAR + RINGKASAN */}
        <CartList onSimpan={simpan} />
      </section>

      <style>{`
        /* Template memberi tiap .card & .pagetitle h1 margin-left -90px; geser sekali di level halaman */
        .pembelian-page .card { margin: 0; border-radius: 14px; }
        .pembelian-page .pagetitle h1 { margin-left: 0; }
        @media (min-width: 1200px) {
          .pembelian-page .pagetitle,
          .pembelian-page .section { margin-left: -90px; }
          /* hanya saat sticky; .card position:relative akan tergeser jika top berlaku di layar kecil */
          .pembelian-page .summary-card { top: 80px; }
        }
        .pembelian-page .autocomplete-menu {
          position: absolute; left: calc(var(--bs-gutter-x) * .5); right: calc(var(--bs-gutter-x) * .5);
          top: 100%; z-index: 1050; margin-top: 2px;
          max-height: 240px; overflow-y: auto; border-radius: 8px;
        }
        .pembelian-page .autocomplete-menu .list-group-item { cursor: pointer; }
        .pembelian-page .cart-table thead th {
          font-size: .75rem; text-transform: uppercase; letter-spacing: .03em;
          color: #6c757d; white-space: nowrap;
        }
        .pembelian-page .total-amount { font-size: 2rem; line-height: 1.2; }
      `}</style>
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
  keranjangTerisi: state.keranjangPembelianTerisi,
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
