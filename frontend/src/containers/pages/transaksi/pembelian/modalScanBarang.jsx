import React from "react";
import { createPortal } from "react-dom";
import FieldsBarang from "./fieldsBarang";

// Modal setelah scan di pembelian: barang terdaftar hanya perlu jumlah (data terisi otomatis),
// barang baru juga mengisi nama. Tidak memakai <form> agar tidak bersarang di form pembelian.
const ModalScanBarang = ({ modalRef, terdaftar, onTambah, ...props }) => {
  const hide = () => window.bootstrap.Modal.getOrCreateInstance(modalRef.current).hide();

  const tambah = async () => {
    const berhasil = await onTambah();
    if (berhasil) hide();
  };

  return createPortal(
    <div className="modal fade" tabIndex="-1" ref={modalRef}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content border-0">
          <div className="modal-header">
            <div>
              <h1 className="modal-title fs-5 fw-bold">{terdaftar ? props.namaBarang : "Barang Baru"}</h1>
              <small className="text-muted">Kode {props.kodeBarang}</small>
            </div>
            <button type="button" className="btn-close" data-bs-dismiss="modal" />
          </div>

          <div className="modal-body">
            {terdaftar ? (
              <div className="alert alert-info py-2 px-3">
                <i className="bi bi-check-circle me-2" />
                Barang terdaftar — data terisi otomatis (restock)
              </div>
            ) : (
              <div className="mb-3">
                <label htmlFor="namabarang" className="form-label fw-semibold">
                  Nama Barang
                </label>
                <input type="text" className="form-control" id="namabarang" placeholder="Min. 3 karakter" value={props.namaBarang} onChange={(e) => props.handleNamaBarang(e.target.value)} />
              </div>
            )}
            <div className="row g-3">
              <FieldsBarang {...props} />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-light border" data-bs-dismiss="modal">
              Batal
            </button>
            <button type="button" className="btn btn-primary px-4" onClick={tambah}>
              <i className="bi bi-plus-lg me-1" />
              Tambah ke Daftar
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ModalScanBarang;
