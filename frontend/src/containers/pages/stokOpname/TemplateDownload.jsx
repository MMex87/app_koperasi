import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import getSupplier from "../../../utils/supplier/getSupplier";
import getBarangJoin from "../../../utils/barang/getBarangJoin";
import { getTemplateBarang, pesanError } from "../../../utils/stokOpname/api";
import { unduhTemplateExcel, unduhTemplatePdf } from "./template";

// Panel unduh lembar hitung stok opname (PDF / Excel) dengan filter supplier & jenis barang opsional
const TemplateDownload = () => {
  const [supplier, setSupplier] = useState([]);
  const [jenisList, setJenisList] = useState([]);
  const [supplierId, setSupplierId] = useState("");
  const [jenisBarang, setJenisBarang] = useState("");
  const [proses, setProses] = useState("");

  useEffect(() => {
    getSupplier()
      .then((d) => setSupplier(Array.isArray(d) ? d : []))
      .catch(() => setSupplier([]));
    getBarangJoin()
      .then((d) => setJenisList([...new Set((d || []).map((b) => (b.jenisBarang || "").trim()).filter(Boolean))].sort()))
      .catch(() => setJenisList([]));
  }, []);

  const keteranganFilter = useMemo(() => {
    const s = supplier.find((x) => String(x.id) === String(supplierId));
    return [s && `Supplier ${s.nama}`, jenisBarang && `Jenis ${jenisBarang}`].filter(Boolean).join(", ");
  }, [supplier, supplierId, jenisBarang]);

  const unduh = async (format) => {
    setProses(format);
    try {
      const { barang, periode } = await getTemplateBarang({ supplierId: supplierId || undefined, jenisBarang: jenisBarang || undefined });
      if (!barang.length) {
        Swal.fire("Tidak ada barang", "Tidak ada barang aktif yang cocok dengan filter.", "info");
        return;
      }
      const opsi = { barang, periode, keteranganFilter };
      if (format === "excel") await unduhTemplateExcel(opsi);
      else unduhTemplatePdf(opsi);
    } catch (err) {
      console.error(err);
      Swal.fire("Gagal", pesanError(err, "Template gagal dibuat"), "error");
    } finally {
      setProses("");
    }
  };

  return (
    <div className="d-flex flex-wrap align-items-end gap-2">
      <div>
        <label className="form-label small text-muted mb-1">Supplier</label>
        <select className="form-select form-select-sm" value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
          <option value="">Semua supplier</option>
          {supplier.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nama}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="form-label small text-muted mb-1">Jenis barang</label>
        <select className="form-select form-select-sm" value={jenisBarang} onChange={(e) => setJenisBarang(e.target.value)}>
          <option value="">Semua jenis</option>
          {jenisList.map((j) => (
            <option key={j} value={j}>
              {j}
            </option>
          ))}
        </select>
      </div>
      <button type="button" className="btn btn-sm btn-outline-danger" disabled={!!proses} onClick={() => unduh("pdf")}>
        <i className={`bi ${proses === "pdf" ? "bi-hourglass-split" : "bi-file-earmark-pdf"} me-1`} />
        Template PDF
      </button>
      <button type="button" className="btn btn-sm btn-outline-success" disabled={!!proses} onClick={() => unduh("excel")}>
        <i className={`bi ${proses === "excel" ? "bi-hourglass-split" : "bi-file-earmark-excel"} me-1`} />
        Template Excel
      </button>
    </div>
  );
};

export default TemplateDownload;
