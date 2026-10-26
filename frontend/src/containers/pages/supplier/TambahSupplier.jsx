import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import axios from "../../../api/axios.jsx";
import { Link, useNavigate, useParams } from "react-router-dom";
import getSupplierId from "../../../utils/supplier/getSupplierId.jsx";

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

const TambahSupplier = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = id !== undefined;

  const [nama, setNama] = useState("");
  const [noHP, setNoHP] = useState("");
  const [alamat, setAlamat] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isEdit) {
      getSupplierId(id).then((data) => {
        setNama(data.nama || "");
        setNoHP(data.noHP || "");
        setAlamat(data.alamat || "");
      });
    } else {
      setNama("");
      setNoHP("");
      setAlamat("");
    }
  }, [id]);

  const simpan = async (e) => {
    e.preventDefault();
    if (!nama.trim()) {
      return Swal.fire("Gagal!", "Nama supplier tidak boleh kosong", "warning");
    }

    setSubmitting(true);
    try {
      const body = { nama: nama.trim(), noHP, alamat };
      if (isEdit) {
        await axios.put(`/supplier/${id}`, body);
      } else {
        await axios.post("/supplier", body);
      }
      Toast.fire({ icon: "success", title: isEdit ? "Data supplier berhasil diubah!" : "Supplier berhasil ditambahkan!" });
      navigate("/supplier");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Terjadi Kesalahan",
        text: error.response?.data?.msg || (isEdit ? "Gagal mengubah data!" : "Gagal menambahkan data!"),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main id="main" className="main app-page">
      <div className="pagetitle d-flex align-items-center gap-3 mb-4">
        <Link to="/supplier" className="btn btn-light btn-sm border" title="Kembali">
          <i className="bi bi-arrow-left" />
        </Link>
        <div>
          <h1 className="fs-2 fw-bold mb-0">{isEdit ? "Edit Supplier" : "Tambah Supplier"}</h1>
          <small className="text-muted">
            <Link to="/supplier" className="text-decoration-none">
              Data Supplier
            </Link>{" "}
            / {isEdit ? "Edit" : "Tambah"}
          </small>
        </div>
      </div>

      <section className="section">
        <div className="card border-0 shadow-sm" style={{ maxWidth: "720px" }}>
          <form className="card-body p-4" onSubmit={simpan}>
            <div className="d-flex align-items-center gap-3 mb-4">
              <div className="form-icon bg-primary bg-opacity-10 text-primary">
                <i className="bi bi-shop" />
              </div>
              <div>
                <h5 className="fw-bold mb-0">Data Supplier</h5>
                <small className="text-muted">Nama supplier harus unik</small>
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="nama" className="form-label fw-semibold">
                Nama Supplier <span className="text-danger">*</span>
              </label>
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <i className="bi bi-shop" />
                </span>
                <input type="text" className="form-control" id="nama" placeholder="Nama supplier / toko" value={nama} autoFocus required onChange={(e) => setNama(e.target.value)} />
              </div>
            </div>

            <div className="row g-3 mb-4">
              <div className="col-md-5">
                <label htmlFor="noHP" className="form-label fw-semibold">
                  Nomor Handphone
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-white">
                    <i className="bi bi-telephone" />
                  </span>
                  <input type="tel" className="form-control" id="noHP" placeholder="08xxxxxxxxxx" value={noHP} onChange={(e) => setNoHP(e.target.value.replace(/[^0-9+]/g, ""))} />
                </div>
              </div>
              <div className="col-md-7">
                <label htmlFor="alamat" className="form-label fw-semibold">
                  Alamat
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-white">
                    <i className="bi bi-geo-alt" />
                  </span>
                  <input type="text" className="form-control" id="alamat" placeholder="Alamat supplier" value={alamat} onChange={(e) => setAlamat(e.target.value)} />
                </div>
              </div>
              <div className="col-12">
                <small className="text-muted">Nomor HP dan alamat opsional</small>
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2">
              <Link to="/supplier" className="btn btn-light border">
                Batal
              </Link>
              <button type="submit" className="btn btn-primary px-4" disabled={submitting}>
                {submitting ? <span className="spinner-border spinner-border-sm me-2" /> : <i className="bi bi-save me-2" />}
                Simpan
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
};

export default TambahSupplier;
