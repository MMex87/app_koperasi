import moment from "moment";
import ReactPaginate from "react-paginate";
import convertRupiah from "rupiah-format";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { useEffect, useState } from "react";
import axios from "axios";

const tCustomer = () => {
  const [dataCustomer, setDataCustomer] = useState([]);
  const [dataCustomerPdf, setDataCustomerPdf] = useState([]);
  const [tanggal, setTanggal] = useState(moment().format("YYYY-MM-DD"));
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(0);
  const [rows, setRows] = useState(0);

  useEffect(() => {
    getData();
    getDataPDF();
  }, [tanggal, page]);

  const getData = async () => {
    const response = await axios.get(`http://localhost:8800/transPenjualanJoinSearchCustomer?date=${tanggal}&page=${page}&limit=10`);
    setDataCustomer(response.data.result);
    setPage(response.data.page);
    setPages(response.data.totalPage);
    setRows(response.data.totalRows);
  };

  const getDataPDF = async () => {
    const response = await axios.get(`http://localhost:8800/transPenjualanJoinSearchCustomer?date=${tanggal}&page=${page}&limit=0`);
    setDataCustomerPdf(response.data.result);
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
    doc.text(`Tanggal :`, 30, 40);
    doc.text(moment(tanggal).format("D MMMM YYYY"), 100, 40);

    doc.setFontSize(20);
    const pageWidthpdf = doc.internal.pageSize.getWidth();

    const totalWidthLaporan = doc.getTextWidth(`Laporan Anggota`);
    const totalXLaporan = pageWidthpdf / 2 - totalWidthLaporan / 2;

    doc.text("Laporan Harian Customer", totalXLaporan, 20);
    doc.setFontSize(16);

    doc.autoTable({
      head: [["#", "Faktur", "Barang", "Jumlah", "Total", "Pembayaran", "Tanggal"]],
      body: dataCustomerPdf.map((val, index) => [index + 1, val.faktur, val.barang.nama, val.jumlah, convertRupiah.convert(val.jumlah * val.barang.hargaJual), val.typePembayaran, moment(val.createdAt).format("D MMMM YYYY")]),
      styles: { fontSize: 12 },
      startY: 70,
      margin: { left: 3, right: 3 },
    });

    let totalText;

    let total = 0;
    for (let val of dataCustomerPdf) {
      total = total + val.harga;
    }

    totalText = "Total: " + total.toLocaleString("id-ID", { style: "currency", currency: "IDR" });

    let heightTable = doc.lastAutoTable.finalY;
    const pageWidth = doc.internal.pageSize.getWidth();

    const totalWidth = doc.getTextWidth(`${total.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}`);
    const totalX = pageWidth - totalWidth - 70;

    doc.setFont("times", "bold");
    doc.text(totalText, totalX, heightTable + 50);

    // window.open(doc.output("bloburl"));

    doc.save("Laporan Customer Per " + moment(tanggal).format("D MMMM YYYY") + ".pdf");
  };

  return (
    <main id="main">
      <div className="text-center pagetitle">
        <h1 className="fs-2 fw-bold"> Laporan Customer </h1>
      </div>

      <section className="section">
        <div className="card shadow-sm">
          <div className="card-body">
            <div className="col-lg-12">
              <div className="row">
                <div className="col-md-8"></div>
                <div className="text-end col-md-2 pt-3 mb-2">
                  <input type="date" className=" form-control" onChange={changeTanggal} value={tanggal} style={{ width: 180 }} />
                </div>
                <div className="text-end col-md-2 pt-3">
                  <button className="btn btn-sm btn-success mb-2" onClick={simpan}>
                    Simpan
                  </button>
                </div>
                <table className="table table-striped table-hover align-middle">
                  <thead className="table-dark">
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">Faktur</th>
                      <th scope="col">Barang</th>
                      <th scope="col">Jumlah</th>
                      <th scope="col">Total</th>
                      <th scope="col">Pembayaran</th>
                      <th scope="col">Tanggal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataCustomer.map((data, index) => (
                      <tr key={data.id}>
                        <th>{index + 1}</th>
                        <td>{data.faktur}</td>
                        <td>{data.barang.nama}</td>
                        <td>{data.jumlah}</td>
                        <td>{convertRupiah.convert(data.harga * data.jumlah)}</td>
                        <td>{data.typePembayaran}</td>
                        <td>{moment(data.createdAt).format("D MMMM YYYY")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <p className="m-0">
                    Data <b>{rows}</b> — Halaman <b>{page + 1}</b> dari <b>{pages}</b>
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

export default tCustomer;
