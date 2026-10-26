import axios from "../../../../api/axios";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import convertRupiah from "rupiah-format";
import ProsesRetur from "../ProsesRetur";

const formatTanggal = (v) => new Date(v).toLocaleString("id-ID", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });

const RPenjualan = () => {
  const [dataPenjualan, setDataPenjualan] = useState(null);
  const [retur, setRetur] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    getData();
  }, [id]);

  const getData = async () => {
    try {
      const response = await axios.get(`/returnPenjualan/${id}`);
      setDataPenjualan(response.data);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Gagal mengambil data penjualan", "error");
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

    if (!returInt || returInt <= 0) {
      return Swal.fire("Peringatan", "Jumlah retur harus lebih dari 0", "warning");
    }

    const trans = dataPenjualan;

    if (trans.jumlah - returInt < 0) {
      return Swal.fire("Retur Gagal!", "Jumlah retur melebihi jumlah penjualan", "warning");
    }

    const konfirmasi = await Swal.fire({
      title: "Proses retur?",
      html: `<b>${returInt} ${trans.barang?.satuan || ""}</b> ${trans.barang?.nama} dikembalikan dan stok bertambah.<br/>Retur tidak dapat dibatalkan.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, proses",
      cancelButtonText: "Batal",
      reverseButtons: true,
    });
    if (!konfirmasi.isConfirmed) return;

    setSubmitting(true);
    try {
      // Catat retur, kurangi jumlah transaksi, tambah stok, dan simpan log
      // diproses backend dalam satu DB transaction.
      await axios.post("/prosesReturPenjualan", {
        transPenjualanId: trans.id,
        jumlah: returInt,
      });

      Toast.fire({
        icon: "success",
        title: "Retur Berhasil!",
      });

      navigate("/retrunPenjualan");
    } catch (error) {
      console.error(error);
      Swal.fire("Error", error.response?.data?.msg || "Retur gagal diproses", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (!dataPenjualan) return null;

  const d = dataPenjualan;
  const jumlah = parseInt(d.jumlah) || 0;
  // harga transaksi penjualan = total baris
  const hargaSatuan = jumlah ? Math.round((parseInt(d.harga) || 0) / jumlah) : 0;

  return (
    <ProsesRetur
      title="Proses Retur Penjualan"
      subtitle="Barang dikembalikan oleh pembeli — stok akan bertambah"
      backTo="/retrunPenjualan"
      barang={d.barang || {}}
      info={[
        { label: "Faktur", value: d.faktur },
        { label: "Tanggal", value: formatTanggal(d.createdAt) },
        { label: "Pembeli", value: d.anggota?.nama || "-" },
        { label: "Pembayaran", value: d.typePembayaran || "-" },
        { label: "Harga Satuan", value: convertRupiah.convert(hargaSatuan) },
        { label: "Jumlah Terjual", value: `${jumlah} ${d.barang?.satuan || ""}` },
        { label: "Total Transaksi", value: convertRupiah.convert(d.harga) },
      ]}
      maks={["onProcess", "Batal"].includes(d.statusPenjualan) ? 0 : jumlah}
      catatan={d.statusPenjualan === "onProcess" ? "Transaksi masih di keranjang dan belum dibayar." : d.statusPenjualan === "Batal" ? "Faktur ini sudah dibatalkan, stok sudah dikembalikan." : ""}
      stokSaatIni={parseInt(d.barang?.jumlah) || 0}
      arahStok={1}
      hargaSatuan={hargaSatuan}
      labelNilai="Nilai dikembalikan ke pembeli"
      retur={retur}
      setRetur={setRetur}
      onSubmit={save}
      submitting={submitting}
    />
  );
};

export default RPenjualan;
