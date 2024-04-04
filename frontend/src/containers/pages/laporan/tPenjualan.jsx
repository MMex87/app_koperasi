import { useEffect, useState } from "react";
import axios from "axios";
import convertRupiah from "rupiah-format";
import ReactPaginate from "react-paginate";
import moment from "moment";
import { jsPDF } from "jspdf"
import 'jspdf-autotable';

const tPenjualan = () => {
  const [dataPenjualan, setDataPenjualan] = useState([]);
  const [dataPenjualanPdf, setDataPenjualanPdf] = useState([]);
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(0);
  const [rows, setRows] = useState(0);
  const [tanggal, setTanggal] = useState(moment().format("YYYY-MM-DD"))

  useEffect(() => {
    getData();
    getDataPDF();
  }, [page,tanggal]);

  const getData = async () => {
    const response = await axios.get(`http://localhost:8800/transPenjualanJoinSearch?date=${tanggal}&page=${page}&limit=10`);
    setDataPenjualan(response.data.result);
    setPage(response.data.page);
    setPages(response.data.totalPage);
    setRows(response.data.totalRows);

  };

  const getDataPDF = async () => {
    const response = await axios.get(`http://localhost:8800/transPenjualanJoinSearch?date=${tanggal}&page=${page}&limit=0`);
    setDataPenjualanPdf(response.data.result);
  };

  const changePage = ({ selected }) => {
    setPage(selected);
  };

  const changeTanggal = async (e) => {
    setTanggal(e.target.value)
  }

  const simpan = () => {
      // Deklarasi Pdf
      const doc = new jsPDF("l", "pt", "a4")
      doc.setFont("times")

      doc.setFontSize(20)
      const pageWidthpdf = doc.internal.pageSize.getWidth();

      const totalWidthLaporan = doc.getTextWidth(`Laporan Harian Penjualan`);
      const totalXLaporan = (pageWidthpdf / 2) - (totalWidthLaporan / 2);

      doc.text("Laporan Harian Penjualan", totalXLaporan, 25)
      doc.setFontSize(16)

      doc.autoTable(
        {
          head: [['#', 'Faktur', 'Anggota', 'Pembayaran', 'Barang', 'Jumlah', 'Total', 'Tanggal']],
          body: dataPenjualanPdf.map((val, index) => [
            index + 1,
            val.faktur,
            val.anggota.nama,
            val.typePembayaran,
            val.barang.nama,
            val.jumlah,
            val.harga.toLocaleString("id-ID", { style: "currency", currency: "IDR" }),
            moment(val.waktuJual).format("D MMMM YYYY")
          ]),
          styles: { fontSize: 12 },
          startY: 70,
          margin: { left: 3, right: 3 },
        }
      )

      let totalText

      let total = 0
      for (let val of dataPenjualanPdf) {
        total = total + val.harga
      }

      totalText = "Total: " + total.toLocaleString("id-ID", { style: "currency", currency: "IDR" })

      let heightTable = doc.lastAutoTable.finalY
      const pageWidth = doc.internal.pageSize.getWidth();

      const totalWidth = doc.getTextWidth(`${total.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}`);
      const totalX = pageWidth - totalWidth - 70;

      doc.setFont("times", 'bold')
      doc.text(totalText, totalX, heightTable + 50)

      // window.open(doc.output("bloburl"));
      
        doc.save('Laporan Bulanan Penjualan Per ' + moment(tanggal).format("DD-MM-YYYY") + '.pdf')
    }

  return (
    <main id="main">
      <div className="text-center pagetitle">
        <h1 className="fs-2 fw-bold"> Laporan Penjualan </h1>
      </div>
      <section className="section">
        <div className="card">
          <div className="card-body">
            <div className="col-lg-12">
              <div className="row">
                <div className="col-md-2"></div>
                <div className="text-end col-md-8 pt-3 d-flex justify-content-end">
                  <input type="date" className=" form-control" onChange={changeTanggal} value={tanggal} style={{ width: 180 }} />
                </div>
                <div className="text-end col-md-2 pt-3">
                  <button className="btn btn-success me-3" onClick={ simpan }> Simpan</button>
                </div>
                <table className="table mt-2">
                  <thead>
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">Faktur</th>
                      <th scope="col">Anggota</th>
                      <th scope="col">Barang</th>
                      <th scope="col">Jumlah</th>
                      <th scope="col">Total</th>
                      <th scope="col">Tanggal</th>
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
                        <td>{convertRupiah.convert(data.harga * data.jumlah)}</td>
                        <td>{moment(data.waktuJual).format("D MMMM YYYY")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="p-3">
                  <div className="d-flex justify-content-between">
                    <p className="text-center">
                      Total Rows : {rows} Page: {rows ? page + 1 : 0} of {pages}
                    </p>
                    <nav aria-label="Page navigate example justify-content-end">
                      <ReactPaginate
                        previousLabel={"< Prev"}
                        nextLabel={"Next >"}
                        pageCount={pages}
                        onPageChange={changePage}
                        containerClassName={"pagination"}
                        pageLinkClassName={"page-link"}
                        pageClassName={"page-item"}
                        previousLinkClassName={"page-link"}
                        previousClassName={"page-item"}
                        nextClassName={"page-item"}
                        nextLinkClassName={"page-link"}
                        activeClassName={"active"}
                      />
                    </nav>
                  </div>
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
