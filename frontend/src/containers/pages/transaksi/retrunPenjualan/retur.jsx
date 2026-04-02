import axios from "../../../../api/axios";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import barangTerbeli from "../../../../utils/barang/barangTerbeli";
import Swal from "sweetalert2";

const RPenjualan = () => {
  const [dataPenjualan, setDataPenjualan] = useState(null);
  const [retur, setRetur] = useState(0);

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

    if (!retur || retur <= 0) {
      return Swal.fire("Peringatan", "Jumlah retur harus lebih dari 0", "warning");
    }

    const trans = dataPenjualan;

    if (trans.jumlah - retur < 0) {
      return Swal.fire("Retur Gagal!", "Jumlah retur melebihi jumlah penjualan", "warning");
    }

    try {
      // 1. Ambil stok barang saat ini
      const barangRes = await axios.get(`/barang/${trans.barangId}`);
      const stokAwal = barangRes.data.jumlah;
      const stokAkhir = stokAwal + retur;

      console.log(barangRes);

      // 2. Simpan retur
      await axios.post("/returnPenjualan", {
        jumlah: retur,
        faktur: trans.faktur,
        transPenjualanId: trans.id,
        anggotaId: trans.anggotaId,
        barangId: trans.barangId,
      });

      // 3. Update transaksi penjualan
      await axios.put(`/transPenjualan/${id}`, {
        statusPenjualan: "Retur",
        jumlah: trans.jumlah - retur,
      });

      // 4. Update stok barang
      await axios.put(`/barang/${trans.barangId}`, {
        jumlah: stokAkhir,
      });

      // 5. Simpan LOG stok
      await axios.post("/logPenjualan", {
        qty: retur,
        qty_awal: stokAwal,
        qty_baru: stokAkhir,
        keterangan: "Retur Penjualan (+)",
        barangId: trans.barangId,
        faktur: trans.faktur,
      });

      Toast.fire({
        icon: "success",
        title: "Retur Berhasil!",
      });

      navigate("/retrunPenjualan");
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Retur gagal diproses", "error");
    }
  };

  if (!dataPenjualan) return null;

  return (
    <main id="main">
      <div className="pagetitle text-center">
        <h1 className="fw-bold fs-2">Retur Penjualan</h1>
      </div>

      <section className="section">
        <div className="card p-3">
          <form onSubmit={save}>
            <div className="row pt-4">
              <div className="col-md-2">
                <label className="col-form-label">Nama</label>
              </div>
              <div className="col-md-10">
                <h4>{dataPenjualan.barang?.nama}</h4>
              </div>

              <div className="col-md-2">
                <label className="col-form-label">Jumlah</label>
              </div>
              <div className="col-md-10">
                <h4>{dataPenjualan.jumlah}</h4>
              </div>

              <div className="col-md-2">
                <label className="col-form-label">Retur</label>
              </div>
              <div className="col-md-10">
                <input className="form-control" type="number" min="1" value={retur} onChange={(e) => setRetur(Number(e.target.value))} />
              </div>
            </div>

            <div className="d-flex justify-content-end mt-3 me-4">
              <button className="btn btn-warning me-3" type="button" onClick={() => navigate("/retrunPenjualan")}>
                Batal
              </button>

              <button className="btn btn-success" type="submit">
                Retur
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
};

export default RPenjualan;
