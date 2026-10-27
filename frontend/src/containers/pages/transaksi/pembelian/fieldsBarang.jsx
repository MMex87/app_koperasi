import React from "react";

// Field barang yang sama untuk input manual & scan (props dari komponen yang terhubung ke redux)
const FieldsBarang = (props) => {
  const hargaBeli = parseInt(props.harga) || 0;
  const hargaJual = parseInt(props.harga_jual) || 0;
  const jumlah = parseInt(props.jumlah) || 0;
  const margin = hargaJual - hargaBeli;

  return (
    <>
      <div className="col-6 col-md-2">
        <label htmlFor="jumlah" className="form-label fw-semibold">
          Jumlah
        </label>
        <input type="number" min="1" className="form-control" id="jumlah" placeholder="0" value={props.jumlah} onChange={(e) => props.handleJumlah(e.target.value)} />
      </div>
      <div className="col-6 col-md-2">
        <label htmlFor="jenis" className="form-label fw-semibold">
          Jenis
        </label>
        <select id="jenis" className="form-select" value={props.jenis || ""} onChange={(e) => props.handlejenisBarang(e.target.value)}>
          <option value="">-- Pilih --</option>
          <option value="Makanan">Makanan</option>
          <option value="Minuman">Minuman</option>
          <option value="Barang">Barang</option>
        </select>
      </div>
      <div className="col-6 col-md-2">
        <label htmlFor="satuan" className="form-label fw-semibold">
          Satuan
        </label>
        <select id="satuan" className="form-select" value={props.satuan || ""} onChange={(e) => props.handleSatuanBarang(e.target.value)}>
          <option value="">-- Pilih --</option>
          <option value="Pcs">Pcs</option>
          <option value="Box">Box</option>
        </select>
      </div>
      <div className="col-6 col-md-3">
        <label htmlFor="hargaBeli" className="form-label fw-semibold">
          Harga Beli
        </label>
        <div className="input-group">
          <span className="input-group-text">Rp</span>
          <input type="number" min="1" className="form-control" id="hargaBeli" value={props.harga} onChange={(e) => props.handleHargaBarang(e.target.value)} />
        </div>
      </div>
      <div className="col-md-3">
        <label htmlFor="hargaJual" className="form-label fw-semibold">
          Harga Jual
        </label>
        <div className="input-group">
          <span className="input-group-text">Rp</span>
          <input type="number" min="1" className={`form-control ${hargaJual && hargaJual < hargaBeli ? "border-warning" : ""}`} id="hargaJual" value={props.harga_jual} onChange={(e) => props.handleHargaJualBarang(e.target.value)} />
        </div>
      </div>

      {(hargaBeli > 0 || hargaJual > 0) && (
        <div className="col-12">
          <div className="d-flex flex-wrap gap-3 small bg-light rounded px-3 py-2">
            <span>
              Margin/unit:{" "}
              <b className={margin < 0 ? "" : "text-success"} style={margin < 0 ? { color: "#997404" } : undefined}>
                Rp {margin.toLocaleString("id-ID")}
                {hargaBeli > 0 && ` (${((margin / hargaBeli) * 100).toFixed(1)}%)`}
              </b>
            </span>
            {jumlah > 0 && (
              <span>
                Subtotal beli: <b>Rp {(hargaBeli * jumlah).toLocaleString("id-ID")}</b>
              </span>
            )}
            {margin < 0 && hargaJual > 0 && (
              <span style={{ color: "#997404" }}>
                <i className="bi bi-exclamation-triangle me-1" />
                Harga jual di bawah harga beli (dijual rugi)
              </span>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default FieldsBarang;
