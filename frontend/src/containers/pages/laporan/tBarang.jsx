import { useEffect, useState } from "react";
import axios from "axios";
import convertRupiah from "rupiah-format";
import ReactPaginate from "react-paginate";
import jsPDF from "jspdf";

const tBarang = () => {
  const [dataBarang, setDataBarang] = useState([]);
  const [dataDownload, setDataDownload] = useState([]);
  const [totalHarga, setTotalHarga] = useState("");
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [pages, setPages] = useState(0);
  const [rows, setRows] = useState(0);

  useEffect(() => {
    getData();
  }, [page]);

  const getData = async () => {
    const response = await axios.get(`http://localhost:8800/lapBarang?page=${page}&limit=${limit}`);
    setDataBarang(response.data.result);
    setPage(response.data.page);
    setPages(response.data.totalPage);
    setRows(response.data.totalRows);

    const p = await axios.get("http://localhost:8800/lapBarangDownload");
    setDataDownload(p.data.dataArray);

    const Qty = p.data.total.reduce((e, item) => {
      return e + parseInt(item.total, 10);
    }, 0);
    setTotalHarga(Qty);
  };

  const changePage = ({ selected }) => {
    setPage(selected);
  };

  const currentDate = new Date();

  // Dapatkan nama bulan dari tanggal saat ini
  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const currentMonth = monthNames[currentDate.getMonth()];
  const currentYear = currentDate.getFullYear();

  const download = async () => {
    const pdf = new jsPDF();
    pdf.setFontSize(20);
    pdf.setFont("helvetica", "bold");
    pdf.text("DATA BARANG", 105, 15, { align: "center", fontWeight: "bold" });
    pdf.setFont("helvetica", "normal");

    /// Tanggal & Tahun
    pdf.setFontSize(12);
    pdf.text(`${currentMonth} ${currentYear}`, 105, 20, { align: "center" });
    pdf.setFont("helvetica", "normal");

    /// Total Barang
    pdf.setFontSize(12);
    pdf.text(`Total Barang : ${rows}`, 30, 25, { align: "center" });
    pdf.setFont("helvetica", "normal");

    /// Total Harga
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.text(`Total Harga : ${convertRupiah.convert(totalHarga)}`, 165, 25, { align: "center" });

    const Data = dataDownload.map((item) => {
      return [item.nama, item.jumlah, convertRupiah.convert(item.hargaJual), convertRupiah.convert(item.jumlah * item.hargaJual)];
    });

    // Tabel (Contoh)
    const totalRows = ["", "", "", convertRupiah.convert(totalHarga)];
    const headers = [["Nama", "Jumlah", "Harga", "Total"]];
    pdf.autoTable({
      startY: 30,
      head: headers,
      body: [...Data, totalRows],
      theme: "grid",
      margin: { top: 10 },
    });

    // Simpan File PDF
    pdf.save(`Laporan Barang ${currentMonth}`);
  };

  return (
    <main id="main">
      <div className="text-center pagetitle">
        <h1 className="fs-2 fw-bold"> Laporan Barang </h1>
      </div>

      <section className="section">
        <div className="card">
          <div className="card-body">
            <div className="col-lg-12">
              <div class="row">
                <div className="col-md-8"></div>
                <div class="container text-center">
                  <div class="col-lg-10"></div>
                  <div className="text-end mt-3 me-3">
                    <button className="btn btn-success" onClick={download}>
                      Simpan
                    </button>
                  </div>
                </div>
              </div>

              <table className="table mt-2">
                <thead>
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">Barang</th>
                    <th scope="col">Jumlah</th>
                    <th scope="col">Harga</th>
                    <th scope="col">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {dataBarang.map((data, index) => (
                    <tr key={data.id}>
                      <th>{index + 1}</th>
                      <td>{data.nama}</td>
                      <td>{data.jumlah}</td>
                      <td>{convertRupiah.convert(data.hargaJual)}</td>
                      <td>{convertRupiah.convert(data.hargaJual * data.jumlah)}</td>
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
      </section>
    </main>
  );
};

export default tBarang;
