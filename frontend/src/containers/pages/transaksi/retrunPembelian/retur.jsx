import axios from "../../../../api/axios";
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import barangTerjual from "../../../../utils/barang/barangTerjual";
import Swal from "sweetalert2";

const RPembelian = () => {
  const [dataPembelian, setDataPembelian] = useState([]);
  const [barang, setBarang] = useState(0);
  const [JumlahBarang, setJumlahBarang] = useState(0);
  const [jumlah, setJumlah] = useState(0);
  const [retur, setRetur] = useState("");
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    getData();
    getBarangById();
  }, []);

  const getData = async () => {
    const response = await axios.get(`http://localhost:8800/returnPembelian/${id}`);
    setBarang(response.data.barang.nama);
    setJumlahBarang(response.data.barang.jumlah);
    setJumlah(response.data.jumlah);
    setDataPembelian(response.data);
  };

  const getBarangById = async (id) => {
    const res = await axios.get(`/barang/${id}`);
    return res.data;
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

    if (retur <= 0) {
      return Swal.fire("Gagal", "Jumlah retur tidak valid", "warning");
    }

    if (retur > jumlah) {
      return Swal.fire("Melebihi Jumlah Pembelian", `Jumlah Retur : ${retur} / Jumlah Pembelian : ${jumlah}`, "warning");
    }

    if (retur > JumlahBarang) {
      return Swal.fire("Stok Kurang", `Jumlah Retur : ${retur} / Stok Barang : ${JumlahBarang}`, "warning");
    }

    try {
      // 🔹 ambil data barang TERKINI dari DB
      const barangDB = await getBarangById(dataPembelian.barangId);

      if (!barangDB) {
        return Swal.fire("Error", "Data barang tidak ditemukan", "error");
      }

      // simpan retur
      await axios.post("/returnPembelian", {
        jumlah: retur,
        faktur: dataPembelian.faktur,
        transPembelianId: dataPembelian.id,
        supplierId: dataPembelian.supplierId,
        barangId: barangDB.id,
      });

      const qtyAwal = dataPembelian.jumlah;
      const qtyBaru = qtyAwal - retur;

      // update transaksi pembelian
      await axios.put(`/transPembelian/${id}`, {
        statusPembelian: "Retur",
        jumlah: qtyBaru,
      });

      // 🧾 LOG PEMBELIAN (data valid dari DB)
      await axios.post("/logPembelian", {
        qty: retur,
        qty_awal: qtyAwal,
        qty_baru: qtyBaru,
        keterangan: "Retur Pembelian (-)",
        barangId: barangDB.id,
        faktur: dataPembelian.faktur,
      });

      // 📦 update stok barang (pakai data DB)
      barangTerjual(barangDB.id, retur);

      Toast.fire({
        icon: "success",
        title: "Retur berhasil",
      });

      navigate("/retrunPembelian");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Terjadi kesalahan sistem", "error");
    }
  };

  return (
    <main id="main">
      <div className="pagetitle text-center">
        <h1 className="fw-bold fs-2">Retur Pembelian</h1>
      </div>
      <section className="section">
        <div className="card p-3">
          <div className="col-lg-12">
            <div className="col-md-12">
              <div className="mt-3">
                <form onSubmit={save}>
                  <div className="row pt-4">
                    <div className="row col-md-12 pt-3">
                      <div className="col-md-2">
                        <label className="col-form-label">Nama</label>
                      </div>
                      <div className="col-md-10">
                        <h4>{barang}</h4>
                      </div>
                      <div className="col-md-2">
                        <label className="col-form-label">Jumlah</label>
                      </div>
                      <div className="col-md-10">
                        <h4>{jumlah}</h4>
                      </div>
                      <div className="col-md-2">
                        <label className="col-form-label">Retur</label>
                      </div>
                      <div className="col-md-10">
                        <input className="form-control" type="text" value={retur} onChange={(e) => setRetur(e.target.value)} />
                      </div>
                    </div>
                  </div>
                  <div className="d-flex justify-content-end mt-3 me-4">
                    <Link to={`/retrunPembelian`}>
                      <button className="btn btn-warning me-3" type="button">
                        Batal
                      </button>
                    </Link>
                    <button className="btn btn-success" type="submit">
                      Retur
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default RPembelian;
