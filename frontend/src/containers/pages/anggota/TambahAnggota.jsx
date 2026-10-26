import React, { useEffect, useState } from "react";
import axios from "../../../api/axios.jsx";
import Swal from "sweetalert2";
import { Link, useNavigate, useParams } from "react-router-dom";
import getAnggotaId from "../../../utils/anggota/getAnggotaId.jsx";

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

const TambahAnggota = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = id !== undefined;

  const [nama, setNama] = useState("");
  const [noHP, setNoHP] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isEdit) {
      getAnggotaId(id).then((data) => {
        setNama(data.nama || "");
        setNoHP(data.noHP || "");
      });
    } else {
      setNama("");
      setNoHP("");
    }
  }, [id]);

  const simpan = async (e) => {
    e.preventDefault();
    if (!nama.trim()) {
      return Swal.fire("Gagal!", "Nama anggota tidak boleh kosong", "warning");
    }

    setSubmitting(true);
    try {
      const body = { nama: nama.trim(), noHP };
      if (isEdit) {
        await axios.put(`/anggota/${id}`, body);
      } else {
        await axios.post("/anggota", body);
      }
      Toast.fire({ icon: "success", title: isEdit ? "Data anggota berhasil diubah!" : "Anggota berhasil ditambahkan!" });
      navigate("/anggota");
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
        <Link to="/anggota" className="btn btn-light btn-sm border" title="Kembali">
          <i className="bi bi-arrow-left" />
        </Link>
        <div>
          <h1 className="fs-2 fw-bold mb-0">{isEdit ? "Edit Anggota" : "Tambah Anggota"}</h1>
          <small className="text-muted">
            <Link to="/anggota" className="text-decoration-none">
              Data Anggota
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
                <i className="bi bi-person-badge" />
              </div>
              <div>
                <h5 className="fw-bold mb-0">Data Anggota</h5>
                <small className="text-muted">Nama anggota harus unik</small>
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="nama" className="form-label fw-semibold">
                Nama Anggota <span className="text-danger">*</span>
              </label>
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <i className="bi bi-person" />
                </span>
                <input type="text" className="form-control" id="nama" placeholder="Nama lengkap anggota" value={nama} autoFocus required onChange={(e) => setNama(e.target.value)} />
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="noHP" className="form-label fw-semibold">
                Nomor Handphone
              </label>
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <i className="bi bi-telephone" />
                </span>
                <input type="tel" className="form-control" id="noHP" placeholder="08xxxxxxxxxx" value={noHP} onChange={(e) => setNoHP(e.target.value.replace(/[^0-9+]/g, ""))} />
              </div>
              <small className="text-muted">Opsional</small>
            </div>

            <div className="d-flex justify-content-end gap-2">
              <Link to="/anggota" className="btn btn-light border">
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

export default TambahAnggota;
