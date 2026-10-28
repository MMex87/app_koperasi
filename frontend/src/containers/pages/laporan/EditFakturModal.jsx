import { useEffect, useRef, useState } from "react";
import axios from "../../../api/axios";
import Swal from "sweetalert2";
import convertRupiah from "rupiah-format";
import getBarangJoinAutoComplate from "../../../utils/barang/getBarangJoinAutoComplate";
import { kirimEditFaktur } from "../../../utils/transaksiPenjualan/editFaktur";

// Modal edit faktur penjualan (hanya faktur hari ini; aturan dicek ulang di backend).
// Dibuka dengan merender komponen ini. Saat ditutup, onSelesai(true) jika perubahan tersimpan.
const EditFakturModal = ({ faktur, onSelesai }) => {
  const ref = useRef(null);
  const berhasilRef = useRef(false);
  const [dimuat, setDimuat] = useState(true);
  const [awal, setAwal] = useState([]); // baris asli, untuk mendeteksi perubahan
  const [baris, setBaris] = useState([]); // keadaan yang sedang diedit
  const [alasan, setAlasan] = useState("");
  const [cari, setCari] = useState("");
  const [hasilCari, setHasilCari] = useState([]);
  const [menyimpan, setMenyimpan] = useState(false);

  // Buka modal saat komponen dimunculkan; laporkan hasil saat modal ditutup
  useEffect(() => {
    const el = ref.current;
    // focus: false = Bootstrap tidak menjebak fokus di modal ini, agar dialog PIN admin (SweetAlert) bisa diketik
    const modal = window.bootstrap.Modal.getOrCreateInstance(el, { focus: false });
    const tutup = () => onSelesai(berhasilRef.current);
    el.addEventListener("hidden.bs.modal", tutup);
    modal.show();
    return () => el.removeEventListener("hidden.bs.modal", tutup);
  }, []);

  // Muat baris faktur (tanpa yang sudah Batal)
  useEffect(() => {
    axios
      .get(`/getTransPenjualanByFaktur/${faktur}`)
      .then(({ data }) => {
        const aktif = data
          .filter((v) => v.statusPenjualan !== "Batal")
          .map((v) => ({
            key: `id-${v.id}`,
            id: v.id,
            barangId: v.barangId,
            nama: v.barang?.nama || "-",
            hargaSatuan: Math.round((parseInt(v.harga) || 0) / (parseInt(v.jumlah) || 1)),
            jumlahAwal: parseInt(v.jumlah) || 0,
            jumlah: parseInt(v.jumlah) || 0,
          }));
        setAwal(aktif);
        setBaris(aktif);
      })
      .catch((err) => {
        console.error(err);
        Swal.fire("Gagal", "Data faktur gagal dimuat", "error");
      })
      .finally(() => setDimuat(false));
  }, [faktur]);

  // Cari barang untuk ditambahkan (minimal 2 karakter)
  useEffect(() => {
    if (cari.trim().length < 2) {
      setHasilCari([]);
      return;
    }
    const t = setTimeout(() => {
      getBarangJoinAutoComplate(cari.trim())
        .then((data) => setHasilCari(data || []))
        .catch(() => setHasilCari([]));
    }, 250);
    return () => clearTimeout(t);
  }, [cari]);

  const ubahJumlah = (key, nilai) => setBaris((daftar) => daftar.map((x) => (x.key === key ? { ...x, jumlah: nilai } : x)));
  const hapusBaris = (key) => setBaris((daftar) => daftar.filter((x) => x.key !== key));

  const tambahBarang = (barang) => {
    if (baris.some((x) => x.barangId === barang.id)) {
      Swal.fire("Sudah ada", "Barang ini sudah ada di faktur. Ubah jumlahnya saja.", "info");
      return;
    }
    setBaris((daftar) => [
      ...daftar,
      { key: `baru-${barang.id}`, barangId: barang.id, nama: barang.nama, hargaSatuan: parseInt(barang.hargaJual) || 0, jumlahAwal: 0, jumlah: 1, stok: barang.jumlah },
    ]);
    setCari("");
    setHasilCari([]);
  };

  const totalAwal = awal.reduce((s, x) => s + x.hargaSatuan * x.jumlahAwal, 0);
  const totalBaru = baris.reduce((s, x) => s + x.hargaSatuan * (Number(x.jumlah) || 0), 0);

  const itemValid = baris.length > 0 && baris.every((x) => Number.isInteger(Number(x.jumlah)) && Number(x.jumlah) >= 1);
  const adaPerubahan =
    awal.some((a) => !baris.some((b) => b.key === a.key)) || // ada yang dihapus
    baris.some((b) => !b.id) || // ada yang ditambah
    baris.some((b) => b.id && Number(b.jumlah) !== b.jumlahAwal); // ada jumlah yang berubah
  const bisaSimpan = !menyimpan && itemValid && adaPerubahan && alasan.trim().length >= 5;

  const simpan = async () => {
    const items = baris.map((x) => (x.id ? { id: x.id, barangId: x.barangId, jumlah: Number(x.jumlah) } : { barangId: x.barangId, jumlah: Number(x.jumlah) }));
    setMenyimpan(true);
    try {
      const res = await kirimEditFaktur(faktur, alasan.trim(), items);
      if (!res) return;
      berhasilRef.current = true;
      await Swal.fire("Berhasil", res.data.msg, "success");
      window.bootstrap.Modal.getInstance(ref.current)?.hide();
    } catch (err) {
      console.error(err);
      Swal.fire("Gagal", err.response?.data?.msg || "Faktur gagal diedit", "error");
    } finally {
      setMenyimpan(false);
    }
  };

  return (
    <div className="modal fade" tabIndex="-1" ref={ref}>
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content border-0">
          <div className="modal-header">
            <div>
              <h1 className="modal-title fs-5 fw-bold">Edit Faktur {faktur}</h1>
              <small className="text-muted">Hanya faktur hari ini. Perubahan stok dan jejak admin dicatat otomatis.</small>
            </div>
            <button type="button" className="btn-close" data-bs-dismiss="modal" />
          </div>

          <div className="modal-body">
            {dimuat ? (
              <div className="text-muted">Memuat faktur...</div>
            ) : (
              <>
                <div className="table-responsive border rounded mb-3">
                  <table className="table table-sm align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="ps-3">Barang</th>
                        <th className="text-end">Harga</th>
                        <th className="text-center" style={{ width: 110 }}>Jumlah</th>
                        <th className="text-end">Subtotal</th>
                        <th className="text-center" style={{ width: 60 }} />
                      </tr>
                    </thead>
                    <tbody>
                      {baris.length === 0 && (
                        <tr>
                          <td colSpan="5" className="text-center text-muted py-3">Tidak ada item. Tambahkan barang atau batalkan faktur.</td>
                        </tr>
                      )}
                      {baris.map((x) => (
                        <tr key={x.key} className={!x.id ? "table-success" : ""}>
                          <td className="ps-3">
                            {x.nama}
                            {!x.id && <span className="badge bg-success bg-opacity-10 text-success ms-2">baru</span>}
                            {x.stok !== undefined && <small className="text-muted d-block">Stok: {x.stok}</small>}
                          </td>
                          <td className="text-end text-nowrap">{convertRupiah.convert(x.hargaSatuan)}</td>
                          <td className="text-center">
                            <input type="number" min="1" className={`form-control form-control-sm text-center ${Number(x.jumlah) < 1 ? "is-invalid" : ""}`} value={x.jumlah} onChange={(e) => ubahJumlah(x.key, parseInt(e.target.value) || 0)} />
                          </td>
                          <td className="text-end text-nowrap">{convertRupiah.convert(x.hargaSatuan * (Number(x.jumlah) || 0))}</td>
                          <td className="text-center">
                            <button type="button" className="btn btn-sm btn-outline-danger" title="Hapus dari faktur" onClick={() => hapusBaris(x.key)}>
                              <i className="bi bi-trash" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="position-relative mb-3">
                  <input type="text" className="form-control" placeholder="Tambah barang: ketik nama atau kode (min. 2 karakter)..." autoComplete="off" value={cari} onChange={(e) => setCari(e.target.value)} />
                  {hasilCari.length > 0 && (
                    <ul className="list-group autocomplete-menu shadow">
                      {hasilCari.map((b) => (
                        <li key={b.id} className="list-group-item list-group-item-action d-flex justify-content-between" style={{ cursor: "pointer" }} onClick={() => tambahBarang(b)}>
                          <span>{b.nama}</span>
                          <span className="badge bg-light text-dark border">Stok {b.jumlah}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="d-flex justify-content-between bg-light rounded p-3 mb-3">
                  <span className="text-muted">Total awal <b>{convertRupiah.convert(totalAwal)}</b></span>
                  <span className="fw-bold text-primary">Total baru (perkiraan) {convertRupiah.convert(totalBaru)}</span>
                </div>

                <label className="form-label fw-semibold">Alasan edit</label>
                <textarea className="form-control" rows="2" placeholder="Contoh: jumlah salah input" value={alasan} onChange={(e) => setAlasan(e.target.value)} />
                <small className="text-muted">Minimal 5 karakter. Setelah disimpan, PIN admin diminta.</small>
              </>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-light border" data-bs-dismiss="modal">
              Tutup
            </button>
            <button type="button" className="btn btn-primary px-4" disabled={!bisaSimpan} onClick={simpan}>
              Simpan Perubahan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditFakturModal;
