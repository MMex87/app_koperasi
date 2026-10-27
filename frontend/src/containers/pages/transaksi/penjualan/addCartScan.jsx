import { useEffect, useRef, useState } from "react";
import getBarangJoin from "../../../../utils/barang/getBarangJoin";

// Buang spasi & karakter kontrol yang ikut dikirim sebagian scanner (GS pemisah GS1, CR, LF)
export const bersihkanKode = (v) => String(v ?? "").replace(/[\x00-\x1f\x7f]/g, "").trim();

// Input scan barcode kasir. Scanner mengetik kode lalu mengirim Enter:
// saat Enter barang langsung masuk keranjang (1 pcs) dan kolom dikosongkan untuk scan berikutnya.
const AddCartScan = ({ onScan }) => {
  const [barang, setBarang] = useState([]);
  const [kode, setKode] = useState("");
  const [hasil, setHasil] = useState(null); // { status: "ok" | "gagal" | "proses", pesan }
  const inputRef = useRef(null);

  const muatBarang = () =>
    getBarangJoin().then((data) => {
      setBarang(data || []);
      return data || [];
    });

  useEffect(() => {
    muatBarang();
  }, []);

  // Barcode GS1 seperti "(90)MD2670...(91)2803" bisa tersimpan dengan/tanpa tanda kurung
  const tanpaKurung = (v) => v.replace(/[()]/g, "");
  const cariBarang = (daftar, k) => {
    let cocok = daftar.filter(({ kodeBarang }) => bersihkanKode(kodeBarang) === k);
    if (!cocok.length) cocok = daftar.filter(({ kodeBarang }) => tanpaKurung(bersihkanKode(kodeBarang)) === tanpaKurung(k));
    // Ada barcode yang dipakai lebih dari satu barang: utamakan yang masih ada stoknya
    return cocok.find((b) => parseInt(b.jumlah) > 0) || cocok[0];
  };

  const handleKeyDown = async (e) => {
    if (e.key !== "Enter") return;
    // Jangan submit form; kosongkan kolom segera agar scan berikutnya tidak menempel ke kode ini
    e.preventDefault();
    const k = bersihkanKode(kode);
    setKode("");
    if (!k) return;

    let item = cariBarang(barang, k);
    // Barang mungkin baru ditambahkan setelah halaman dibuka
    if (!item) item = cariBarang(await muatBarang(), k);

    if (!item) {
      // Hanya info; kolom sudah kosong, fokus langsung kembali agar scan berikutnya bisa langsung diproses
      setHasil({ status: "gagal", pesan: `Kode ${k} tidak ada di data barang` });
      inputRef.current?.focus();
      return;
    }

    setHasil({ status: "proses", pesan: `Menambahkan ${item.nama}...` });
    const berhasil = await onScan(item);
    setHasil(berhasil ? { status: "ok", pesan: item.nama, harga: item.hargaJual } : { status: "gagal", pesan: `${item.nama} gagal ditambahkan` });
    inputRef.current?.focus();
  };

  const kelasHasil = { ok: "alert-success", gagal: "alert-warning", proses: "alert-secondary" };
  const ikonHasil = { ok: "bi-check-circle", gagal: "bi-exclamation-circle", proses: "bi-hourglass-split" };

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
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            className="form-control"
            id="kodeBarangScan"
            placeholder="Scan barcode barang..."
            value={kode}
            autoFocus={true}
            onChange={(e) => setKode(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <small className="text-muted">Barang langsung masuk keranjang (1 pcs) setiap kali di-scan. Ketik manual lalu tekan Enter juga bisa.</small>
      </div>
      <div className="col-md-6 d-flex align-items-start pt-md-4 mt-md-2">
        {hasil && (
          <div className={`alert ${kelasHasil[hasil.status]} py-2 px-3 mb-0 w-100 d-flex justify-content-between align-items-center`}>
            <span>
              <i className={`bi ${ikonHasil[hasil.status]} me-2`} />
              {hasil.status === "ok" ? (
                <>
                  <b>{hasil.pesan}</b> masuk keranjang
                </>
              ) : (
                hasil.pesan
              )}
            </span>
            {hasil.status === "ok" && <span>Rp {Number(hasil.harga || 0).toLocaleString("id-ID")}</span>}
          </div>
        )}
      </div>
    </>
  );
};

export default AddCartScan;
