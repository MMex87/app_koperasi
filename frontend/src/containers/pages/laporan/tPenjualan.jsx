import { useEffect, useState } from "react";
import axios from "axios";
import convertRupiah from "rupiah-format";
import ReactPaginate from "react-paginate";
import moment from "moment";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { Link } from "react-router-dom";

const tPenjualan = () => {
  const [dataPenjualan, setDataPenjualan] = useState([]);
  const [dataPenjualanPdf, setDataPenjualanPdf] = useState([]);
  const [dataSupplier, setDataSupllier] = useState([]);
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(0);
  const [rows, setRows] = useState(20);
  const [tanggal, setTanggal] = useState(moment().format("YYYY-MM-DD"));
  const [supplier, setSupplier] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [pembayaran, setPembayaran] = useState("");

  useEffect(() => {
    getDataSupplier();
    getData();
    getDataPDF();
  }, [page, tanggal, supplier, pembayaran]);

  const getData = async () => {
    const response = await axios.get(`http://localhost:8800/transPenjualanJoinSearch?supplier=${supplier}&date=${tanggal}&pembayaran=${pembayaran}&page=${page}&limit=10`);
    setDataPenjualan(response.data.result);
    setPage(response.data.page);
    setPages(response.data.totalPage);
    setRows(response.data.totalRows);

    const r = await axios.get(`http://localhost:8800/supplier/${supplier}`);
    setSupplierName(r.data.nama);
  };

  const getDataSupplier = async () => {
    const dataSupplier = await axios.get("http://localhost:8800/supplier");
    setDataSupllier(dataSupplier.data);
  };

  const getDataPDF = async () => {
    const response = await axios.get(`http://localhost:8800/transPenjualanJoinSearch?supplier=${supplier}&date=${tanggal}&pembayaran=${pembayaran}&page=${page}&limit=0`);
    setDataPenjualanPdf(response.data.result);
  };

  const changePage = ({ selected }) => {
    setPage(selected);
  };

  const changeTanggal = async (e) => {
    setTanggal(e.target.value);
  };

  const simpan = () => {
    // Deklarasi Pdf
    const doc = new jsPDF("l", "pt", "a4");
    doc.setFont("times");

    doc.setFontSize(20);
    const pageWidthpdf = doc.internal.pageSize.getWidth();

    const totalWidthLaporan = doc.getTextWidth(`Laporan Harian Penjualan`);
    const totalXLaporan = pageWidthpdf / 2 - totalWidthLaporan / 2;

    doc.text(`Laporan Harian Penjualan`, totalXLaporan, 25);
    doc.setFontSize(16);
    doc.setFont("times");
    doc.text(`Tanggal :`, 30, 40);
    doc.text(moment(tanggal).format("D MMMM YYYY"), 100, 40);
    doc.text(`Supplier :`, 30, 60);
    doc.text(supplierName, 100, 60);
    doc.text(`Pembayaran :`, 650, 60);
    doc.text(pembayaran, 750, 60);

    doc.autoTable({
      head: [["#", "Faktur", "Anggota", "Barang", "Jumlah", "Total", "Tanggal"]],
      body: dataPenjualanPdf.map((val, index) => [index + 1, val.faktur, val.anggota.nama, val.barang.nama, val.jumlah, convertRupiah.convert(val.jumlah * val.barang.hargaJual), moment(val.createdAt).format("D MMMM YYYY")]),
      styles: { fontSize: 12 },
      startY: 70,
      margin: { left: 3, right: 3 },
    });

    let totalText;

    let total = 0;
    for (let val of dataPenjualanPdf) {
      total = total + val.barang.hargaJual * val.jumlah;
    }

    totalText = "Total: " + total.toLocaleString("id-ID", { style: "currency", currency: "IDR" });

    let heightTable = doc.lastAutoTable.finalY;
    const pageWidth = doc.internal.pageSize.getWidth();

    const totalWidth = doc.getTextWidth(`${total.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}`);
    const totalX = pageWidth - totalWidth - 70;

    doc.setFont("times", "bold");
    doc.text(totalText, totalX, heightTable + 50);

    // window.open(doc.output("bloburl"));

    doc.save("Laporan Penjualan Per " + moment(tanggal).format("DD-MM-YYYY") + ".pdf");
  };

  const handlePrint = async (faktur) => {
    try {
      const data = await axios.get(`http://localhost:8800/getTransPenjualanByFaktur/${faktur}`);
      const transaksi = data.data;
      const header = transaksi[0];

      const doc = new jsPDF("p", "mm", [48, 120]);

      // ===== tanggal =====
      let today = new Date();
      const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
      today = String(today.getDate()).padStart(2, "0") + " - " + months[today.getMonth()] + " - " + today.getFullYear();

      // ===== header =====
      doc.setFontSize(12);
      doc.text("Cafe-Wijaya", 5, 5);

      doc.setFontSize(7);
      doc.text(`Faktur : ${faktur}`, 1, 11);
      doc.text(`Tanggal : ${moment(header.waktuJual).format("LLL")}`, 1, 15);
      doc.text(`Pembayaran : ${header.typePembayaran}`, 1, 19);
      doc.text(`Anggota : ${header.anggota?.nama}`, 1, 23);

      doc.line(1, 26, 46, 26);

      // ===== table =====
      doc.autoTable({
        body: transaksi.map((val) => [val.barang?.nama, val.barang?.hargaJual, val.jumlah, val.jumlah * val.barang?.hargaJual]),
        styles: { fontSize: 7 },
        startY: 28,
        margin: { left: 1, right: 1 },
        theme: "plain",
      });

      const heightTable = doc.lastAutoTable.finalY;

      // ===== total =====
      const total = transaksi.reduce((sum, val) => sum + val.jumlah * val.barang.hargaJual, 0);

      doc.line(1, heightTable + 1, 46, heightTable + 1);
      doc.text(`Total : ${convertRupiah.convert(total)}`, 1, heightTable + 6);

      // ===== auto print =====
      doc.autoPrint();

      const pdf = doc.output("bloburl");
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = pdf;

      iframe.onload = () => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      };

      document.body.appendChild(iframe);
    } catch (error) {
      console.error("Gagal cetak struk:", error);
    }
  };

  console.log(dataPenjualanPdf);

  return (
    <main id="main">
      <div className="text-center pagetitle">
        <h1 className="fs-2 fw-bold"> Laporan Penjualan Harian</h1>
      </div>

      <section className="section">
        <div className="card shadow-sm">
          <div className="card-body">
            <div className="col-lg-12">
              <div className="row">
                <div className="col-md-2">
                  <div className="text-end col-md-2 pt-3">
                    <Link to={"/reportPenjualanBulan"} className="btn btn-sm btn-success mb-2 ">
                      {" "}
                      Bulan
                    </Link>
                  </div>
                </div>
                <div className="text-end col-md-8 pt-3 d-flex justify-content-end mb-2">
                  <select class="form-select" value={pembayaran} style={{ width: 180, marginRight: 20 }} onChange={(e) => setPembayaran(e.target.value)}>
                    <option selected value="">
                      - - Pembayaran --
                    </option>
                    <option selected value={"Tunai"}>
                      {" "}
                      Tunai{" "}
                    </option>
                    <option selected value={"QRIS"}>
                      {" "}
                      QRIS{" "}
                    </option>
                  </select>
                  <select class="form-select" value={supplier} style={{ width: 180, marginRight: 20 }} onChange={(e) => setSupplier(e.target.value)}>
                    <option value="">- - Pilih Supplier --</option>
                    {dataSupplier.map((supplier) => (
                      <option value={supplier.id}>{supplier.nama}</option>
                    ))}
                  </select>
                  <input type="date" className=" form-control" onChange={changeTanggal} value={tanggal} style={{ width: 180 }} />
                </div>
                <div className="text-end col-md-2 pt-3">
                  <button className="btn btn-sm btn-success me-3" onClick={simpan}>
                    {" "}
                    Simpan
                  </button>
                </div>
                <table className="table table-striped table-hover align-middle">
                  <thead className="table-dark">
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">Faktur</th>
                      <th scope="col">Anggota</th>
                      <th scope="col">Barang</th>
                      <th scope="col">Jumlah</th>
                      <th scope="col">Total</th>
                      <th scope="col">Tanggal</th>
                      <th scope="col">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataPenjualan.map((data, index) => (
                      <tr key={data.id}>
                        <th>{index + 1}</th>
                        <td>{data.faktur}</td>
                        <td>{data.anggota.nama}</td>
                        <td>{data.barang.nama}</td>
                        <td>{data.jumlah}</td>
                        <td>{convertRupiah.convert(data.barang.hargaJual * data.jumlah)}</td>
                        <td>{moment(data.createdAt).format("D MMMM YYYY")}</td>
                        <td>
                          <button className="btn btn-sm btn-warning" onClick={() => handlePrint(data.faktur)}>
                            Print
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <p className="m-0">
                    Total Penjualan: <b>{rows}</b> — Halaman <b>{page + 1}</b> dari <b>{pages}</b>
                  </p>

                  <ReactPaginate
                    previousLabel={"‹"}
                    nextLabel={"›"}
                    pageCount={pages}
                    onPageChange={changePage}
                    containerClassName={"pagination pagination-sm m-0"}
                    pageClassName={"page-item"}
                    pageLinkClassName={"page-link"}
                    previousClassName={"page-item"}
                    previousLinkClassName={"page-link"}
                    nextClassName={"page-item"}
                    nextLinkClassName={"page-link"}
                    activeClassName={"active"}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default tPenjualan;
