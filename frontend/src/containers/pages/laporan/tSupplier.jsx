import { Component } from "react";
import getTransPenjualanJoin from "../../../utils/transaksiPenjualan/getTransPenjualanJoin";
import moment from "moment";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

class tSupplier extends Component {
  constructor(props) {
    super(props);
    this.state = {
      penjualan: [],
      search: "",
    };
  }

  componentDidMount() {
    getTransPenjualanJoin(this.state.penjualan).then((data) => {
      this.setState({ penjualan: data });
    });
    this.setState({ search: moment().format("YYYY-MM-D") });
  }

  render() {
    const simpan = () => {
      // Deklarasi Pdf
      const doc = new jsPDF("l", "pt", "a4");

      doc.setFontSize(20);
      const pageWidth = doc.internal.pageSize.getWidth();

      const totalWidthLaporan = doc.getTextWidth(`Laporan Harian Pemasok`);
      const totalXLaporan = pageWidth / 2 - totalWidthLaporan / 2;

      const tanggal = "Tanggal : " + moment(this.state.search).format("D MMM YYYY");
      const totalWidthTanggal = doc.getTextWidth(tanggal);
      const totalXTanggal = pageWidth / 2 - (totalWidthTanggal / 2 - 10);

      doc.text("Laporan Harian Penjualan", totalXLaporan, 25);
      doc.setFontSize(16);
      doc.text(tanggal, totalXTanggal, 45);

      doc.autoTable({
        head: [["#", "Faktur", "Supplier", "Barang", "Jumlah", "Harga", "Tanggal"]],
        body: this.state.penjualan
          .filter(({ waktuBeli }) => moment(waktuBeli).format("YYYY-MM-D") == moment(this.state.search).format("YYYY-MM-D"))
          .map((val, index) => [index + 1, val.faktur, val.barang.supplier.nama, val.barang.nama, val.jumlah, val.barang.hargaJual.toLocaleString("id-ID", { style: "currency", currency: "IDR" }), moment(val.waktuBeli).format("D MMMM YYYY")]),
        styles: { fontSize: 12 },
        startY: 70,
        margin: { left: 3, right: 3 },
      });

      // window.open(doc.output("bloburl"));
      doc.save("Laporan Harian Pemasok " + moment(this.state.search).format("D-MM-YYYY") + ".pdf");
    };

    return (
      <main id="main">
        <div className="text-center pagetitle">
          <h1 className="fs-2 fw-bold"> Laporan Supplier </h1>
        </div>

        <section className="section">
          <div className="card">
            <div className="card-body">
              <div className="col-lg-12">
                <div className="row">
                  <div className="col-md-8"></div>
                  <div className="text-end col-md-2 pt-3">
                    <input type="date" className=" form-control" placeholder={ this.state.search } value={ this.state.search } onChange={ (e) => this.setState({ search: e.target.value }) } />
                  </div>
                  <div className="text-end col-md-2 pt-3">
                    <button className="btn btn-success me-3" onClick={ simpan }>
                      { " " }
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
                        <th>Harga</th>
                        <th>Tanggal</th>
                      </tr>
                    </thead>
                    <tbody>
                      { this.state.penjualan
                        .filter(({ waktuBeli }) => moment(waktuBeli).format("YYYY-MM-D") == moment(this.state.search).format("YYYY-MM-D"))
                        .map((val, index) => (
                          <tr key={ index }>
                            <th>{ index + 1 }</th>
                            <td>{ val.faktur }</td>
                            <td>{ val.barang.supplier.nama }</td>
                            <td>{ val.barang.nama }</td>
                            <td>{ val.jumlah }</td>
                            <td>{ val.barang.hargaJual.toLocaleString("id-ID", { style: "currency", currency: "IDR" }) }</td>
                            <td>{ moment(val.waktuBeli).format("D MMMM YYYY") }</td>
                          </tr>
                        )) }
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }
}

export default tSupplier;
