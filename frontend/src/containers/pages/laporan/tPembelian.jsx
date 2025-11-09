import { useEffect, useState } from "react";
import axios from "axios";
import convertRupiah from "rupiah-format";
import ReactPaginate from "react-paginate";
import moment from "moment";
import { jsPDF } from "jspdf"
import 'jspdf-autotable';
import { Link } from "react-router-dom";


const tPembelian = () => {
  const [dataBarangPdf, setDataBarangPdf] = useState([]);
  const [dataBarang, setDataBarang] = useState([]);
  const [dataSupplier, setDataSupllier] = useState([]);
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(0);
  const [rows, setRows] = useState(0);
  const [tanggal, setTanggal] = useState(moment().format("YYYY-MM-DD"))
  const [supplier, setSupplier] = useState("")

  useEffect(() => {
    getData();
    getDataPdf();
    getDataSupplier();
  }, [page,tanggal,supplier]);

  const getDataSupplier = async () => {
    const dataSupplier = await axios.get("http://localhost:8800/supplier")
    setDataSupllier(dataSupplier.data) 
  }

  const getData = async () => {
    const response = await axios.get(`http://localhost:8800/transPembelianJoinSearch?supplier=${supplier}&date=${tanggal}&page=${page}&limit=10`);
    setDataBarang(response.data.result);
    setPage(response.data.page);
    setPages(response.data.totalPage);
    setRows(response.data.totalRows);
  };
  const getDataPdf = async () => {
    const response = await axios.get(`http://localhost:8800/transPembelianJoinSearch?supplier=${supplier}&date=${tanggal}&page=${page}&limit=0`);
    setDataBarangPdf(response.data.result);
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

      const totalWidthLaporan = doc.getTextWidth(`Laporan Harian Pembelian`);
      const totalXLaporan = (pageWidthpdf / 2) - (totalWidthLaporan / 2);

      doc.text("Laporan Harian Pembelian", totalXLaporan, 25)
      doc.setFontSize(16)

      doc.autoTable(
        {
          head: [['#', 'Faktur', 'Supplier', 'Barang', 'Jumlah', 'Total', 'Tanggal']],
          body: dataBarangPdf.map((val, index) => [
            index + 1,
            val.faktur,
            val.supplier.nama,
            val.barang.nama,
            val.jumlah,
            convertRupiah.convert(Math.round((val.harga * val.jumlah) / 100 ) * 100),
            moment(val.waktuBeli).format("D MMMM YYYY")
          ]),
          styles: { fontSize: 12 },
          startY: 70,
          margin: { left: 3, right: 3 },
        }
      )

      let totalText

      let total = 0
      for (let val of dataBarangPdf) {
        total = total + (val.hargaJual * val.jumlah)
      }

      totalText = "Total: " + total.toLocaleString("id-ID", { style: "currency", currency: "IDR" })

      let heightTable = doc.lastAutoTable.finalY
      const pageWidth = doc.internal.pageSize.getWidth();

      const totalWidth = doc.getTextWidth(`${total.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}`);
      const totalX = pageWidth - totalWidth - 70;

      doc.setFont("times", 'bold')
      doc.text(totalText, totalX, heightTable + 50)

      // window.open(doc.output("bloburl"));
      
        doc.save('Laporan Harian Pembelian ' + moment(tanggal).format("DD-MM-YYYY") + '.pdf')
    }
    console.log(dataBarang)
    console.log(supplier)

  return (
    <main id="main">
      <div className="text-center pagetitle">
        <h1 className="fs-2 fw-bold"> Laporan Pembelian Harian </h1>
      </div>
      <section className="section">
        <div className="card">
          <div className="card-body">
            <div className="col-lg-12">
              <div className="row">
                <div className="col-md-2">
                <div className="text-end col-md-2 pt-3">
                  <Link to={"/reportPembelianBulan"} className="btn btn-info me-3" > Bulan</Link>
                </div>
                </div>
                <div className="text-end col-md-8 pt-3 d-flex justify-content-end">
                <select class="form-select" value={supplier}  style={{ width: 180,  marginRight: 20}} onChange={(e) => setSupplier(e.target.value)}>
                    <option value="" >- - Pilih Supplier --</option>
                      {dataSupplier.map((supplier) => (
                        <option value={supplier.id}>{supplier.nama}</option>
                      ))}
                  </select>
                  <input type="date" className=" form-control" onChange={changeTanggal} value={tanggal} style={{ width: 180 }} />
                </div>
                <div className="text-end col-md-2 pt-3">
                  <button className="btn btn-success me-3" onClick={simpan}>
                    Simpan
                  </button>
                </div>
                <table className="table mt-2">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Faktur</th>
                      <th>Supplier</th>
                      <th>Barang</th>
                      <th>Jumlah</th>
                      <th>Total</th>
                      <th>Tanggal</th>
                    </tr>
                  </thead>
                  <tbody>
                  {dataBarang.map((data, index) => (
                      <tr key={data.id}>
                        <th>{index + 1}</th>
                        <td>{data.faktur}</td>
                        <td>{data.supplier.nama}</td>
                        <td>{data.barang.nama}</td>
                        <td>{data.jumlah}</td>
                        <td>{convertRupiah.convert(Math.round((data.harga * data.jumlah)/ 100)* 100)}</td>
                        <td>{moment(data.waktuBeli).format("D MMMM YYYY")}</td>
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

export default tPembelian;