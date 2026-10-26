import axios from "../../../../api/axios";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import convertRupiah from "rupiah-format";
import ProsesRetur from "../ProsesRetur";

const formatTanggal = (v) => new Date(v).toLocaleString("id-ID", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });

const RPembelian = () => {
  const [dataPembelian, setDataPembelian] = useState(null);
  const [retur, setRetur] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    getData();
  }, [id]);

  const getData = async () => {
    try {
      const response = await axios.get(`/returnPembelian/${id}`);
      setDataPembelian(response.data);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Gagal mengambil data pembelian", "error");
    }
  };

  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });

  const save = async (e) => {
    e.preventDefault();

    const returInt = parseInt(retur);
    const jumlah = parseInt(dataPembelian.jumlah) || 0;
    const jumlahBarang = parseInt(dataPembelian.barang?.jumlah) || 0;

    if (!returInt || returInt <= 0) {
      return Swal.fire("Gagal", "Jumlah retur tidak valid", "warning");
    }

    if (returInt > jumlah) {
      return Swal.fire("Melebihi Jumlah Pembelian", `Jumlah Retur : ${returInt} / Jumlah Pembelian : ${jumlah}`, "warning");
    }

    if (returInt > jumlahBarang) {
      return Swal.fire("Stok Kurang", `Jumlah Retur : ${returInt} / Stok Barang : ${jumlahBarang}`, "warning");
    }

    const konfirmasi = await Swal.fire({
      title: "Proses retur?",
      html: `<b>${returInt} ${dataPembelian.barang?.satuan || ""}</b> ${dataPembelian.barang?.nama} dikembalikan ke supplier dan stok berkurang.<br/>Retur tidak dapat dibatalkan.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, proses",
      cancelButtonText: "Batal",
      reverseButtons: true,
    });
    if (!konfirmasi.isConfirmed) return;

    setSubmitting(true);
    try {
      // Catat retur, kurangi jumlah transaksi, kurangi stok, dan simpan log
      // diproses backend dalam satu DB transaction (dicek ulang dengan stok terkini).
      await axios.post("/prosesReturPembelian", {
        transPembelianId: dataPembelian.id,
        jumlah: returInt,
      });

      Toast.fire({
        icon: "success",
        title: "Retur berhasil",
      });

      navigate("/retrunPembelian");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", err.response?.data?.msg || "Terjadi kesalahan sistem", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (!dataPembelian) return null;

  const d = dataPembelian;
  const jumlah = parseInt(d.jumlah) || 0;
  const stok = parseInt(d.barang?.jumlah) || 0;
  // Retur pembelian mengurangi stok: dibatasi jumlah pembelian dan stok yang tersisa
  const maks = ["onProcess", "Batal"].includes(d.statusPembelian) ? 0 : Math.min(jumlah, stok);
  const catatan =
    d.statusPembelian === "onProcess"
      ? "Pembelian belum disimpan, stok belum bertambah."
      : d.statusPembelian === "Batal"
      ? "Faktur ini sudah dibatalkan, stok sudah disesuaikan."
      : stok < jumlah
      ? `dibatasi stok tersisa (${stok})`
      : "";

  return (
    <ProsesRetur
      title="Proses Retur Pembelian"
      subtitle="Barang dikembalikan ke supplier — stok akan berkurang"
      backTo="/retrunPembelian"
      barang={d.barang || {}}
      info={[
        { label: "Faktur", value: d.faktur },
        { label: "Tanggal", value: formatTanggal(d.createdAt) },
        { label: "Supplier", value: d.barang?.supplier?.nama || "-" },
        { label: "Harga Beli", value: convertRupiah.convert(d.harga) },
        { label: "Jumlah Dibeli", value: `${jumlah} ${d.barang?.satuan || ""}` },
        { label: "Total Pembelian", value: convertRupiah.convert((parseInt(d.harga) || 0) * jumlah) },
        { label: "Stok Saat Ini", value: `${stok} ${d.barang?.satuan || ""}` },
      ]}
      maks={maks}
      catatan={catatan}
      stokSaatIni={stok}
      arahStok={-1}
      hargaSatuan={parseInt(d.harga) || 0}
      labelNilai="Nilai klaim ke supplier"
      retur={retur}
      setRetur={setRetur}
      onSubmit={save}
      submitting={submitting}
    />
  );
};

export default RPembelian;
