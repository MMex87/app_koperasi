import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import convertRupiah from "rupiah-format";
import getBarangJoin from "../../../utils/barang/getBarangJoin";
import { bersihkanKode } from "../transaksi/penjualan/addCartScan";
import { exportPdf, exportExcel } from "../laporan/exportLaporan";
import {
  getDetailOpname,
  getTemplateBarang,
  simpanItemOpname,
  hapusItemOpname,
  importItemOpname,
  buatUlangOpname,
  hapusOpname,
  finalkanOpname,
  namaPeriode,
  pesanError,
} from "../../../utils/stokOpname/api";
import { bacaTemplateExcel, unduhTemplateExcel, unduhTemplatePdf } from "./template";
import { mintaPetugas } from "./dialog";

const angka = (v) => (v === null || v === undefined ? "-" : Number(v).toLocaleString("id-ID"));
const rupiah = (v) => convertRupiah.convert(v || 0);
const formatWaktu = (v) => (v ? new Date(v).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "-");
const escapeHtml = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const Selisih = ({ v }) => {
  if (v === null || v === undefined) return <span className="text-muted">-</span>;
  if (v > 0) return <span className="fw-semibold text-success">+{angka(v)}</span>;
  if (v < 0) return <span className="fw-semibold text-danger">{angka(v)}</span>;
  return <span className="text-muted">0</span>;
};

// Barcode GS1 seperti "(90)MD2670...(91)2803" bisa tersimpan dengan/tanpa tanda kurung
const tanpaKurung = (v) => v.replace(/[()]/g, "");
const cariBarangKode = (daftar, k) =>
  daftar.find(({ kodeBarang }) => bersihkanKode(kodeBarang) === k) || daftar.find(({ kodeBarang }) => tanpaKurung(bersihkanKode(kodeBarang)) === tanpaKurung(k));

// Baris tabel yang bisa diedit: simpan saat fokus keluar / Enter, hanya bila nilainya berubah
const BarisItem = ({ item, bisaDiubah, onSimpan, onHapus }) => {
  const [fisik, setFisik] = useState(String(item.stokFisik));
  const [ket, setKet] = useState(item.keterangan || "");

  useEffect(() => {
    setFisik(String(item.stokFisik));
    setKet(item.keterangan || "");
  }, [item.stokFisik, item.keterangan]);

  const simpan = async () => {
    if (fisik === String(item.stokFisik) && ket === (item.keterangan || "")) return;
    const ok = await onSimpan(item, fisik, ket);
    if (!ok) {
      setFisik(String(item.stokFisik));
      setKet(item.keterangan || "");
    }
  };
  const enter = (e) => {
    if (e.key === "Enter") e.target.blur();
  };

  const selisihPreview = bisaDiubah && item.stokSistem !== null && /^\d+$/.test(fisik) ? Number(fisik) - item.stokSistem : item.selisih;

  return (
    <tr className={item.barangDihapus ? "table-secondary" : ""}>
      <td>
        <span className="fw-semibold">{item.namaBarang}</span>{" "}
        <span className="text-muted">
          {item.kodeBarang}
          {item.satuan && ` · ${item.satuan}`}
          {item.barangDihapus && " · barang sudah dihapus"}
        </span>
      </td>
      <td className="text-end">{angka(item.stokSistem)}</td>
      <td className="text-end" style={{ width: 96 }}>
        {bisaDiubah ? (
          <input type="number" min={0} step={1} className="form-control form-control-sm text-end py-0" value={fisik} onChange={(e) => setFisik(e.target.value)} onBlur={simpan} onKeyDown={enter} onFocus={(e) => e.target.select()} />
        ) : (
          <b>{angka(item.stokFisik)}</b>
        )}
      </td>
      <td className="text-end">
        <Selisih v={selisihPreview} />
      </td>
      <td className="text-end">{selisihPreview ? rupiah(selisihPreview * item.hargaBeli) : "-"}</td>
      <td style={{ minWidth: 140 }}>
        {bisaDiubah ? (
          <input type="text" className="form-control form-control-sm py-0" placeholder="Catatan…" value={ket} onChange={(e) => setKet(e.target.value)} onBlur={simpan} onKeyDown={enter} />
        ) : (
          <small>{item.keterangan || "-"}</small>
        )}
      </td>
      {bisaDiubah && (
        <td className="text-end">
          <button className="btn btn-sm btn-link text-danger p-0" title="Hapus dari hitungan" onClick={() => onHapus(item)}>
            <i className="bi bi-x-lg" />
          </button>
        </td>
      )}
    </tr>
  );
};

export default function HitungStokOpname() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [barang, setBarang] = useState([]);
  const [kode, setKode] = useState("");
  const [qtyScan, setQtyScan] = useState("1");
  const [hasilScan, setHasilScan] = useState(null);
  const [cariManual, setCariManual] = useState("");
  const [filter, setFilter] = useState("");
  const [filterSelisih, setFilterSelisih] = useState("");
  const [proses, setProses] = useState(false);
  const scanRef = useRef(null);
  const fileRef = useRef(null);

  const muat = async () => {
    try {
      setData(await getDetailOpname(id));
      setError("");
    } catch (err) {
      console.error(err);
      setError(pesanError(err, "Gagal memuat stok opname"));
    }
  };

  // Termasuk barang arsip: barangnya mungkin masih ada secara fisik (stok naik otomatis mengaktifkan lagi)
  const muatBarang = async () => {
    const d = (await getBarangJoin(true)) || [];
    setBarang(d);
    return d;
  };

  useEffect(() => {
    muat();
    muatBarang().catch(() => setBarang([]));
  }, [id]);

  const opname = data?.opname;
  const items = useMemo(() => data?.items || [], [data]);
  const bisaDiubah = !!opname?.bisaDiubah;
  const draftLewat = opname && opname.status === "draft" && !bisaDiubah;
  const itemPerBarang = useMemo(() => new Map(items.map((i) => [i.barangId, i])), [items]);

  const ringkasan = useMemo(() => {
    const r = { item: items.length, plus: 0, minus: 0, nilai: 0, beda: 0 };
    items.forEach((i) => {
      if (!i.selisih) return;
      r.beda += 1;
      if (i.selisih > 0) r.plus += i.selisih;
      else r.minus += i.selisih;
      r.nilai += i.selisih * i.hargaBeli;
    });
    return r;
  }, [items]);

  const tampil = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return items.filter((i) => {
      if (q && !`${i.namaBarang} ${i.kodeBarang}`.toLowerCase().includes(q)) return false;
      if (filterSelisih === "beda") return !!i.selisih;
      if (filterSelisih === "sesuai") return i.selisih === 0;
      return true;
    });
  }, [items, filter, filterSelisih]);

  const hasilManual = useMemo(() => {
    const q = cariManual.trim().toLowerCase();
    if (q.length < 2) return [];
    return barang.filter((b) => `${b.nama} ${b.kodeBarang}`.toLowerCase().includes(q)).slice(0, 8);
  }, [barang, cariManual]);

  // ---------- scan ----------
  const scan = async (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const k = bersihkanKode(kode);
    setKode("");
    if (!k) return;

    let item = cariBarangKode(barang, k);
    if (!item) item = cariBarangKode(await muatBarang(), k);
    if (!item) {
      setHasilScan({ status: "gagal", pesan: `Kode ${k} tidak ada di data barang` });
      scanRef.current?.focus();
      return;
    }

    const qty = /^\d+$/.test(qtyScan) && Number(qtyScan) > 0 ? Number(qtyScan) : 1;
    setHasilScan({ status: "proses", pesan: `Menghitung ${item.nama}…` });
    try {
      const res = await simpanItemOpname(id, { barangId: item.id, stokFisik: qty, tambah: true });
      setHasilScan({ status: "ok", pesan: item.nama, total: res.item?.stokFisik, qty });
      muat();
    } catch (err) {
      setHasilScan({ status: "gagal", pesan: pesanError(err, `${item.nama} gagal disimpan`) });
    }
    scanRef.current?.focus();
  };

  // ---------- input manual ----------
  const pilihManual = async (b) => {
    const ada = itemPerBarang.get(b.id);
    const { value, isConfirmed } = await Swal.fire({
      title: b.nama,
      text: ada ? `Sudah dihitung ${angka(ada.stokFisik)}. Isi jumlah fisik terbaru.` : "Isi jumlah stok fisik barang ini.",
      input: "number",
      inputValue: ada ? ada.stokFisik : "",
      inputAttributes: { min: 0, step: 1 },
      inputLabel: `Stok fisik${b.satuan ? ` (${b.satuan})` : ""}`,
      showCancelButton: true,
      confirmButtonText: "Simpan",
      cancelButtonText: "Batal",
      reverseButtons: true,
      inputValidator: (v) => (!/^\d+$/.test(String(v).trim()) ? "Isi bilangan bulat 0 atau lebih" : undefined),
    });
    if (!isConfirmed) return;
    try {
      await simpanItemOpname(id, { barangId: b.id, stokFisik: Number(value) });
      setCariManual("");
      muat();
    } catch (err) {
      Swal.fire("Gagal", pesanError(err, "Hitungan gagal disimpan"), "error");
    }
  };

  // ---------- edit & hapus baris ----------
  const simpanBaris = async (item, fisik, ket) => {
    if (!/^\d+$/.test(String(fisik).trim())) {
      Swal.fire("Tidak valid", "Stok fisik harus bilangan bulat 0 atau lebih", "warning");
      return false;
    }
    try {
      await simpanItemOpname(id, { barangId: item.barangId, stokFisik: Number(fisik), keterangan: ket });
      muat();
      return true;
    } catch (err) {
      Swal.fire("Gagal", pesanError(err, "Hitungan gagal disimpan"), "error");
      return false;
    }
  };

  const hapusBaris = async (item) => {
    const { isConfirmed } = await Swal.fire({
      title: `Hapus ${item.namaBarang} dari hitungan?`,
      text: "Barang ini tidak akan disesuaikan saat opname diselesaikan.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
      reverseButtons: true,
    });
    if (!isConfirmed) return;
    try {
      await hapusItemOpname(id, item.id);
      muat();
    } catch (err) {
      Swal.fire("Gagal", pesanError(err, "Baris gagal dihapus"), "error");
    }
  };

  // ---------- upload template Excel ----------
  const uploadExcel = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    let baris;
    try {
      baris = await bacaTemplateExcel(file);
    } catch (err) {
      console.error(err);
      Swal.fire("File tidak bisa dibaca", err.message || "Pastikan file adalah template stok opname (.xlsx).", "error");
      return;
    }

    const daftar = barang.length ? barang : await muatBarang();
    const perId = new Map(daftar.map((b) => [b.id, b]));
    const terisi = [];
    const tidakDikenal = [];
    let kosong = 0;
    baris.forEach((r) => {
      if (r.stokFisik === "") {
        kosong += 1;
        return;
      }
      const b = (r.barangId && perId.get(r.barangId)) || (r.kodeBarang && cariBarangKode(daftar, bersihkanKode(r.kodeBarang)));
      if (!b) tidakDikenal.push(r);
      else terisi.push({ ...r, barangId: b.id, nama: b.nama });
    });
    const tidakValid = terisi.filter((r) => !/^\d+$/.test(String(r.stokFisik).trim()));
    const valid = terisi.filter((r) => /^\d+$/.test(String(r.stokFisik).trim()));
    const menimpa = valid.filter((r) => itemPerBarang.has(r.barangId));

    if (!valid.length) {
      const alasan = !baris.length
        ? "Tidak ada baris barang di bawah judul kolom."
        : kosong === baris.length
          ? `Semua ${angka(baris.length)} baris kolom Stok Fisik masih kosong. Pastikan file yang dipilih adalah file yang sudah diisi dan sudah disimpan (cek nama folder & waktu simpan file).`
          : `${angka(baris.length)} baris terbaca: ${angka(kosong)} kosong, ${angka(tidakDikenal.length)} barang tidak dikenali, ${angka(tidakValid.length)} isian tidak valid.`;
      Swal.fire({ icon: "info", title: "Tidak ada data untuk diimpor", html: `<div class="small">${escapeHtml(alasan)}<br/><span class="text-muted">File: ${escapeHtml(file.name)}</span></div>` });
      return;
    }

    const daftarMasalah = [
      ...tidakValid.map((r) => `Baris ${r.baris}: stok fisik "${escapeHtml(r.stokFisik)}" tidak valid (${escapeHtml(r.nama)})`),
      ...tidakDikenal.map((r) => `Baris ${r.baris}: barang ${escapeHtml(r.kodeBarang || r.barangId)} tidak dikenali`),
    ];
    const { isConfirmed } = await Swal.fire({
      title: "Impor hitungan dari Excel?",
      icon: "question",
      html:
        `<div class="text-start small">` +
        `<div><b>${valid.length}</b> barang akan disimpan` +
        (menimpa.length ? ` (<b>${menimpa.length}</b> menimpa hitungan yang sudah ada)` : "") +
        `</div>` +
        `<div><b>${kosong}</b> baris kosong dilewati</div>` +
        (daftarMasalah.length
          ? `<div class="text-danger mt-2"><b>${daftarMasalah.length}</b> baris bermasalah dan tidak disimpan:</div>` +
            `<ul class="text-danger mb-0" style="max-height:160px;overflow:auto">${daftarMasalah
              .slice(0, 50)
              .map((m) => `<li>${m}</li>`)
              .join("")}${daftarMasalah.length > 50 ? `<li>…dan ${daftarMasalah.length - 50} lainnya</li>` : ""}</ul>`
          : "") +
        `</div>`,
      showCancelButton: true,
      confirmButtonText: "Impor",
      cancelButtonText: "Batal",
      reverseButtons: true,
    });
    if (!isConfirmed) return;

    setProses(true);
    try {
      const res = await importItemOpname(
        id,
        valid.map((r) => ({ baris: r.baris, barangId: r.barangId, stokFisik: Number(r.stokFisik), keterangan: r.keterangan })),
      );
      await muat();
      const galat = res.galat || [];
      Swal.fire({
        icon: galat.length ? "warning" : "success",
        title: res.msg,
        html: galat.length ? `<div class="text-start small text-danger">${galat.map((g) => `Baris ${g.baris}: ${escapeHtml(g.pesan)}`).join("<br/>")}</div>` : undefined,
      });
    } catch (err) {
      Swal.fire("Gagal", pesanError(err, "Impor gagal"), "error");
    } finally {
      setProses(false);
    }
  };

  // ---------- aksi sesi ----------
  const buatUlang = async () => {
    const { isConfirmed } = await Swal.fire({
      icon: "warning",
      title: "Buat ulang stok opname?",
      html: `Semua hitungan (<b>${angka(items.length)} barang</b>) akan dihapus dan opname dimulai dari kosong.<br/>Stok barang tidak berubah.`,
      showCancelButton: true,
      confirmButtonText: "Ya, buat ulang",
      cancelButtonText: "Batal",
      confirmButtonColor: "#d33",
      reverseButtons: true,
    });
    if (!isConfirmed) return;
    setProses(true);
    try {
      await buatUlangOpname(id);
      await muat();
      scanRef.current?.focus();
    } catch (err) {
      Swal.fire("Gagal", pesanError(err, "Stok opname gagal dibuat ulang"), "error");
    } finally {
      setProses(false);
    }
  };

  const hapusDraft = async () => {
    const { isConfirmed } = await Swal.fire({
      icon: "warning",
      title: `Hapus draft ${opname.nomor}?`,
      text: "Stok barang tidak berubah.",
      showCancelButton: true,
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#d33",
      reverseButtons: true,
    });
    if (!isConfirmed) return;
    try {
      await hapusOpname(id);
      navigate("/stok-opname");
    } catch (err) {
      Swal.fire("Gagal", pesanError(err, "Draft gagal dihapus"), "error");
    }
  };

  const selesaikan = async () => {
    if (!items.length) {
      Swal.fire("Belum ada hitungan", "Scan atau input minimal satu barang sebelum menyelesaikan opname.", "info");
      return;
    }
    const petugas = await mintaPetugas({
      icon: "warning",
      title: "Selesaikan stok opname?",
      html:
        `<div class="text-start small">` +
        `<div>${angka(ringkasan.item)} barang dihitung, <b>${angka(ringkasan.beda)}</b> berbeda dari stok sistem saat ini.</div>` +
        `<div>Selisih: <span class="text-success">+${angka(ringkasan.plus)}</span> / <span class="text-danger">${angka(ringkasan.minus)}</span> · nilai ${rupiah(ringkasan.nilai)}</div>` +
        `<div class="mt-2">Stok setiap barang akan <b>disetel ke stok fisik</b>. Selisih dihitung ulang dari stok pada saat ini dan tercatat di riwayat stok sebagai "Stok Opname ${escapeHtml(opname.nomor)}".</div>` +
        `<div class="text-danger mt-1">Setelah selesai, opname bulan ini terkunci dan tidak bisa diubah.</div>` +
        `</div>`,
      confirmButtonText: "Selesaikan",
      confirmButtonColor: "#198754",
    });
    if (!petugas) return;

    setProses(true);
    try {
      const res = await finalkanOpname(id, { petugas });
      await muat();
      const r = res.ringkasan || {};
      Swal.fire({
        icon: "success",
        title: "Stok opname selesai",
        html: `${angka(r.disesuaikan)} barang disesuaikan (+${angka(r.totalPlus)} / ${angka(r.totalMinus)})${r.dilewati ? `<br/>${r.dilewati} barang dilewati karena sudah dihapus` : ""}`,
      });
    } catch (err) {
      Swal.fire("Gagal", pesanError(err, "Stok opname gagal diselesaikan"), "error");
    } finally {
      setProses(false);
    }
  };

  // ---------- export hasil ----------
  const kolomHasil = [
    { label: "Kode", type: "text", get: (r) => r.kodeBarang },
    { label: "Nama Barang", type: "text", get: (r) => r.namaBarang },
    { label: "Satuan", type: "text", get: (r) => r.satuan },
    { label: "Stok Sistem", type: "number", get: (r) => r.stokSistem },
    { label: "Stok Fisik", type: "number", get: (r) => r.stokFisik },
    { label: "Selisih", type: "number", get: (r) => r.selisih },
    { label: "Nilai Selisih", type: "rupiah", get: (r) => (r.selisih || 0) * r.hargaBeli },
    { label: "Keterangan", type: "text", get: (r) => r.keterangan },
  ];
  const exportHasil = (format) => {
    const opsi = {
      judul: `Hasil Stok Opname ${namaPeriode(opname.periode)}`,
      info: [
        { label: "Nomor", value: opname.nomor },
        { label: "Status", value: opname.status === "final" ? `Selesai ${formatWaktu(opname.finalAt)}` : "Draft (stok sistem saat ini)" },
        { label: "Petugas", value: opname.petugas || "-" },
      ],
      ringkasan: [
        { label: "Barang dihitung", value: angka(ringkasan.item) },
        { label: "Selisih", value: `+${angka(ringkasan.plus)} / ${angka(ringkasan.minus)}` },
        { label: "Nilai selisih", value: rupiah(ringkasan.nilai) },
      ],
      columns: kolomHasil,
      rows: tampil,
      namaFile: `Stok_Opname_${opname.nomor}`,
    };
    if (format === "excel") exportExcel(opsi);
    else exportPdf(opsi);
  };

  // Template lembar hitung semua barang aktif (filter supplier/jenis tersedia di halaman Stok Opname)
  const unduhTemplate = async (format) => {
    try {
      const { barang: daftar, periode } = await getTemplateBarang();
      if (format === "excel") await unduhTemplateExcel({ barang: daftar, periode });
      else unduhTemplatePdf({ barang: daftar, periode });
    } catch (err) {
      Swal.fire("Gagal", pesanError(err, "Template gagal dibuat"), "error");
    }
  };

  if (error && !data) {
    return (
      <main id="main" className="main app-page">
        <div className="alert alert-danger">{error}</div>
        <Link to="/stok-opname">Kembali</Link>
      </main>
    );
  }

  const warnaScan = { ok: "text-success", gagal: "text-danger", proses: "text-muted" };
  const ikonScan = { ok: "bi-check-circle-fill", gagal: "bi-exclamation-circle-fill", proses: "bi-hourglass-split" };

  return (
    <main id="main" className="main app-page">
      {/* Judul + aksi dalam satu baris */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div className="d-flex align-items-center gap-2" style={{ minWidth: 0 }}>
          <Link to="/stok-opname" className="btn btn-light btn-sm border" title="Kembali">
            <i className="bi bi-arrow-left" />
          </Link>
          <h1 className="fs-4 fw-bold mb-0 text-truncate">Stok Opname {opname ? namaPeriode(opname.periode) : ""}</h1>
          {opname && (
            <small className="text-muted text-nowrap d-none d-md-inline">
              {opname.nomor}
              {opname.petugas && ` · ${opname.petugas}`}
              {opname.status === "final" && ` · selesai ${formatWaktu(opname.finalAt)}`}
            </small>
          )}
        </div>
        {opname && (
          <div className="d-flex flex-wrap gap-2">
            <div className="dropdown">
              <button type="button" className="btn btn-outline-secondary btn-sm dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                <i className="bi bi-download me-1" />
                Unduh
              </button>
              <ul className="dropdown-menu dropdown-menu-end shadow-sm">
                <li>
                  <h6 className="dropdown-header">Hasil hitung</h6>
                </li>
                <li>
                  <button type="button" className="dropdown-item" disabled={!items.length} onClick={() => exportHasil("pdf")}>
                    <i className="bi bi-file-earmark-pdf me-2 text-danger" />
                    Hasil PDF
                  </button>
                </li>
                <li>
                  <button type="button" className="dropdown-item" disabled={!items.length} onClick={() => exportHasil("excel")}>
                    <i className="bi bi-file-earmark-excel me-2 text-success" />
                    Hasil Excel
                  </button>
                </li>
                {bisaDiubah && (
                  <>
                    <li>
                      <hr className="dropdown-divider" />
                    </li>
                    <li>
                      <h6 className="dropdown-header">Template (tanpa stok sistem)</h6>
                    </li>
                    <li>
                      <button type="button" className="dropdown-item" onClick={() => unduhTemplate("pdf")}>
                        <i className="bi bi-file-earmark-pdf me-2 text-danger" />
                        Template PDF
                      </button>
                    </li>
                    <li>
                      <button type="button" className="dropdown-item" onClick={() => unduhTemplate("excel")}>
                        <i className="bi bi-file-earmark-excel me-2 text-success" />
                        Template Excel
                      </button>
                    </li>
                  </>
                )}
              </ul>
            </div>
            {bisaDiubah && (
              <>
                <button type="button" className="btn btn-outline-danger btn-sm" onClick={buatUlang} disabled={proses} title="Kosongkan semua hitungan bulan ini">
                  <i className="bi bi-arrow-counterclockwise" />
                  <span className="d-none d-sm-inline ms-1">Buat Ulang</span>
                </button>
                <button type="button" className="btn btn-success btn-sm" onClick={selesaikan} disabled={proses || !items.length}>
                  <i className="bi bi-check2-circle me-1" />
                  Selesaikan
                </button>
              </>
            )}
            {draftLewat && (
              <button type="button" className="btn btn-outline-danger btn-sm" onClick={hapusDraft}>
                <i className="bi bi-trash me-1" />
                Hapus Draft
              </button>
            )}
          </div>
        )}
      </div>

      <section className="section">
        {!data && <div className="text-muted">Memuat…</div>}

        {opname?.status === "final" && (
          <div className="alert alert-success py-2 small mb-3">
            <i className="bi bi-lock me-1" />
            Opname sudah selesai — stok barang sudah disetel ke stok fisik dan selisih tercatat di riwayat stok.
          </div>
        )}
        {draftLewat && (
          <div className="alert alert-secondary py-2 small mb-3">
            <i className="bi bi-info-circle me-1" />
            Draft {namaPeriode(opname.periode)} tidak diselesaikan dan tidak bisa diubah lagi. Hapus lalu mulai opname bulan berjalan.
          </div>
        )}

        {/* Scan, input manual, dan upload dalam satu baris */}
        {bisaDiubah && (
          <div className="card border-0 shadow-sm mb-3">
            <div className="card-body p-3">
              <div className="row g-2 align-items-center">
                <div className="col-md-5">
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-white">
                      <i className="bi bi-upc-scan" />
                    </span>
                    <input
                      ref={scanRef}
                      id="scanOpname"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      autoFocus
                      className="form-control"
                      placeholder="Scan barcode…"
                      title="Setiap scan menambah hitungan sebanyak jumlah di kanan"
                      value={kode}
                      onChange={(e) => setKode(e.target.value)}
                      onKeyDown={scan}
                    />
                    <span className="input-group-text bg-white">+</span>
                    <input type="number" min={1} className="form-control" style={{ maxWidth: 64 }} title="Jumlah per scan" value={qtyScan} onChange={(e) => setQtyScan(e.target.value)} onFocus={(e) => e.target.select()} />
                  </div>
                </div>
                <div className="col-md-4 position-relative">
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-white">
                      <i className="bi bi-search" />
                    </span>
                    <input id="cariOpname" type="text" autoComplete="off" className="form-control" placeholder="Input manual: cari nama / kode…" value={cariManual} onChange={(e) => setCariManual(e.target.value)} />
                  </div>
                  {hasilManual.length > 0 && (
                    <div className="list-group position-absolute shadow-sm mt-1" style={{ zIndex: 10, left: "calc(var(--bs-gutter-x) * .5)", right: "calc(var(--bs-gutter-x) * .5)" }}>
                      {hasilManual.map((b) => (
                        <button key={b.id} type="button" className="list-group-item list-group-item-action d-flex justify-content-between py-1 small" onClick={() => pilihManual(b)}>
                          <span>
                            {b.nama} <span className="text-muted">{b.kodeBarang}</span>
                          </span>
                          {itemPerBarang.has(b.id) && <span className="text-success">dihitung {angka(itemPerBarang.get(b.id).stokFisik)}</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="col-md-3 d-grid">
                  <input ref={fileRef} type="file" accept=".xlsx" className="d-none" onChange={uploadExcel} />
                  <button type="button" className="btn btn-sm btn-outline-success" onClick={() => fileRef.current?.click()} disabled={proses} title="Upload template Excel yang kolom Stok Fisik-nya sudah diisi">
                    <i className="bi bi-upload me-1" />
                    Upload Excel
                  </button>
                </div>
              </div>
              {hasilScan && (
                <div className={`small mt-2 ${warnaScan[hasilScan.status]}`}>
                  <i className={`bi ${ikonScan[hasilScan.status]} me-1`} />
                  {hasilScan.status === "ok" ? (
                    <>
                      <b>{hasilScan.pesan}</b> +{hasilScan.qty} → total {angka(hasilScan.total)}
                    </>
                  ) : (
                    hasilScan.pesan
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {data && (
          <div className="card border-0 shadow-sm">
            <div className="card-body p-3">
              {/* Ringkasan + filter dalam satu baris */}
              <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                <div className="d-flex flex-wrap align-items-center gap-3 small me-auto">
                  <span>
                    <span className="text-muted">Dihitung</span> <b>{angka(ringkasan.item)}</b>
                  </span>
                  <span>
                    <span className="text-muted">Berbeda</span> <b>{angka(ringkasan.beda)}</b>
                  </span>
                  <span>
                    <span className="text-muted">Selisih</span> <b className="text-success">+{angka(ringkasan.plus)}</b> / <b className="text-danger">{angka(ringkasan.minus)}</b>
                  </span>
                  <span>
                    <span className="text-muted">Nilai</span> <b className={ringkasan.nilai < 0 ? "text-danger" : ringkasan.nilai > 0 ? "text-success" : ""}>{rupiah(ringkasan.nilai)}</b>
                  </span>
                  {bisaDiubah && <i className="bi bi-info-circle text-muted" title="Stok sistem & selisih adalah pratinjau dari stok saat ini; nilai final dihitung ulang saat opname diselesaikan." />}
                </div>
                <input type="text" className="form-control form-control-sm" style={{ maxWidth: 200 }} placeholder="Cari di hasil…" value={filter} onChange={(e) => setFilter(e.target.value)} />
                <select className="form-select form-select-sm" style={{ width: "auto" }} value={filterSelisih} onChange={(e) => setFilterSelisih(e.target.value)}>
                  <option value="">Semua ({angka(items.length)})</option>
                  <option value="beda">Ada selisih</option>
                  <option value="sesuai">Sesuai</option>
                </select>
              </div>

              <div className="table-responsive" style={{ maxHeight: "68vh" }}>
                <table className="table table-sm table-hover align-middle mb-0 small">
                  <thead className="table-light" style={{ position: "sticky", top: 0, zIndex: 1 }}>
                    <tr>
                      <th>Barang</th>
                      <th className="text-end">Sistem</th>
                      <th className="text-end">Fisik</th>
                      <th className="text-end">Selisih</th>
                      <th className="text-end">Nilai</th>
                      <th>Keterangan</th>
                      {bisaDiubah && <th />}
                    </tr>
                  </thead>
                  <tbody>
                    {!tampil.length && (
                      <tr>
                        <td colSpan={7} className="text-center text-muted py-4">
                          {items.length ? "Tidak ada barang yang cocok" : bisaDiubah ? "Belum ada barang dihitung — scan barcode atau upload Excel" : "Tidak ada data"}
                        </td>
                      </tr>
                    )}
                    {tampil.map((item) => (
                      <BarisItem key={item.id} item={item} bisaDiubah={bisaDiubah} onSimpan={simpanBaris} onHapus={hapusBaris} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
