// TransPenjualan.jsx — Versi Perbaikan & Refactor (Functional Component)
import React, { useState, useEffect, useCallback } from "react";
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

  // Submit Tambah Cart
  const handleCart = async (e) => {
    e.preventDefault();
    try {
      await loadTransaksi();

      let selectedAnggota = anggotas.find((a) => a.nama === anggota);
      let selectedBarang = barang.find((b) => b.nama === namaBarang && b.supplierId === supplierId);

      if (!selectedAnggota || !selectedBarang || !jumlah || !harga || !typePembayaran) {
        Swal.fire("Gagal menambahkan data!!", "Tolong isi semua Data", "warning");
        return;
      }

      // Stok tidak cukup
      if (selectedBarang.jumlah - jumlah < 0) {
        Swal.fire("Gagal menambahkan data!!", "Stok Barang Tidak cukup!!", "warning");
        return;
      }

      let anggotaIdLokal = Number(selectedAnggota.id);
      let barangIdLokal = Number(selectedBarang.id);

      const res = await axios.get("/transPenjualan/on-process", {
        params: {
          barangId: barangIdLokal,
          faktur,
        },
      });

      const trans = res.data;

      if (!trans) {
        // Insert baru
        await axios.post("/transPenjualan", {
          jumlah,
          faktur,
          harga: parseInt(harga) * parseInt(jumlah),
          typePembayaran,
          anggotaId: anggotaIdLokal,
          barangId: barangIdLokal,
          statusPenjualan: "onProcess",
        });
      } else {
        // Update (jumlah bertambah)
        let jumlahBaru = parseInt(trans.jumlah) + parseInt(jumlah);
        console.log(jumlahBaru);
        await axios.put(`/transPenjualan/${trans.id}`, {
          jumlah: jumlahBaru,
          harga: parseInt(harga) * jumlahBaru,
        });
      }
      // Reset input
      dispatch({ type: ActionType.SET_KODE_BARANG_PENJUALAN, index: "" });
      dispatch({ type: ActionType.SET_NAMA_BARANG_PENJUALAN, index: "" });
      dispatch({ type: ActionType.SET_JUMLAH_PENJUALAN, index: "" });
      dispatch({ type: ActionType.SET_HARGA_PENJUALAN, index: "" });
    } catch (err) {
      console.error(err);
      Swal.fire("Error!", "Gagal memproses data", "error");
    }
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

  return (
    <main id="main" className="main">
      <div className="pagetitle text-center">
        <h1 className="fw-bold fs-2">Transaksi Penjualan</h1>
      </div>

      <section className="section">
        <div className="row">
          <div className="col-lg-12">
            <div className="card">
              <div className="card-body row">
                <div className="col-md-3">
                  <h1 className="card-title mt-1 fw-bolder">Faktur : {faktur}</h1>
                </div>

                {/* FORM */}
                <form className="row g-3" onSubmit={handleCart}>
                  {/* Input Anggota */}
                  <div className="col-md-6">
                    <label className="form-label">Nama Anggota</label>
                    <input type="text" className="form-control" value={anggota} onChange={(e) => dispatch({ type: ActionType.SET_ANGGOTA_PENJUALAN, index: e.target.value })} onClick={() => setDisplayAnggota(!displayAnggota)} />

                    {displayAnggota && (
                      <div className="bodyAutoComplate">
                        <ul className="list-group list-group-flush">
                          {anggotas
                            .filter((v) => v.nama.toLowerCase().includes(anggota.toLowerCase()))
                            .map((v, i) => (
                              <li key={i} onClick={() => handleAutoAnggota(v.nama)} className="list-group-item listAutoComplate">
                                {v.nama}
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Type Pembayaran */}
                  <div className="col-md-6">
                    <label className="form-label">Type Pembayaran</label>
                    <select className="form-select" value={typePembayaran} onChange={(e) => dispatch({ type: ActionType.SET_TYPE_BAYAR_PENJUALAN, index: e.target.value })}>
                      <option value="">-- Pilih Type Pembayaran --</option>
                      <option value="Tunai">TUNAI</option>
                      <option value="QRIS">QRIS</option>
                    </select>
                  </div>

                  {/* Jenis Input */}
                  <div className="col-12">
                    <label className="form-label">Jenis Input</label>
                    <select className="form-select" onChange={handleVisiInput}>
                      <option value="manual">Manual</option>
                      <option value="scan">Scan Barcode</option>
                    </select>
                  </div>

                  {/* Input Barang */}
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

      {/* LIST */}
      <section className="section">
        <div className="row">
          <div className="col-lg-12">
            <div className="card">
              <div className="card-body">
                <CartList />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div style={{ height: 200 }} />
    </main>
  );
};

export default TransPenjualan;
