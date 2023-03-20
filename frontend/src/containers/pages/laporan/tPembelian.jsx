import { Component } from "react";
import moment from "moment";
import { jsPDF } from "jspdf"
import 'jspdf-autotable'
import getTransPembelianJoin from "../../../utils/transaksiPembelian/getTransPembelianJoin";

class tPembelian extends Component {
  state = {
    transPembelian: [],
    search: ''
  };

  componentDidMount() {
    getTransPembelianJoin(this.state.transPembelian).then((data) => {
      this.setState({ transPembelian: data });
    });
    this.setState({ search: moment().format("YYYY-MM-D") })
  }

  render() {
    const simpan = () => {
      // Deklarasi Pdf
      const doc = new jsPDF("l", "pt", "a4")

      doc.setFontSize(20)
      const pageWidth = doc.internal.pageSize.getWidth();

      const totalWidthLaporan = doc.getTextWidth(`Laporan Harian Pembelian`);
      const totalXLaporan = (pageWidth / 2) - (totalWidthLaporan / 2);


      const tanggal = "Tanggal : " + moment(this.state.search).format("D MMM YYYY")
      const totalWidthTanggal = doc.getTextWidth(tanggal);
      const totalXTanggal = (pageWidth / 2) - ((totalWidthTanggal / 2) - 10)

      doc.text("Laporan Harian Pembelian", totalXLaporan, 25)
      doc.setFontSize(16)
      doc.text(tanggal, totalXTanggal, 45)

      doc.autoTable(
        {
          head: [['#', 'Faktur', 'Supplier', 'Barang', 'Jumlah', 'Harga Beli', 'Total Harga', 'Tanggal']],
          body: this.state.transPembelian.filter(({ waktuBeli }) => moment(waktuBeli).format("YYYY-MM-D") == moment(this.state.search).format("YYYY-MM-D"))
            .map((val, index) => [
              index + 1,
              val.faktur,
              val.supplier.nama,
              val.barang.nama,
              val.jumlah,
              val.harga.toLocaleString("id-ID", { style: "currency", currency: "IDR" }),
              (val.jumlah * val.harga).toLocaleString("id-ID", { style: "currency", currency: "IDR" }),
              moment(val.waktuBeli).format("D MMM YYYY")
            ]),
          styles: { fontSize: 12 },
          startY: 70,
          margin: { left: 3, right: 3 },
        }
      )

      // window.open(doc.output("bloburl"));
      doc.save('Laporan Harian Pembelian' + moment(this.state.search).format("D-MM-YYYY") + '.pdf')

    }
    return (
      <main id="main">
        <div className="text-center pagetitle">
          <h1 className="fs-2 fw-bold"> Laporan Pembelian </h1>
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
                    <button className="btn btn-success me-3" onClick={ simpan }> Simpan</button>
                  </div>
                  <table className="table mt-2">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Faktur</th>
                        <th>Supplier</th>
                        <th>Barang</th>
                        <th>Jumlah</th>
                        <th>Harga Beli</th>
                        <th>Total Harga</th>
                        <th>Tanggal</th>
                      </tr>
                    </thead>
                    <tbody>
                      { this.state.transPembelian.filter(({ waktuBeli }) => moment(waktuBeli).format("D-MM-YYYY") == moment(this.state.search).format("D-MM-YYYY")).map((val, index) => (
                        <tr key={ index }>
                          <th>{ index + 1 }</th>
                          <td>{ val.faktur }</td>
                          <td>{ val.supplier.nama }</td>
                          <td>{ val.barang.nama }</td>
                          <td>{ val.jumlah }</td>
                          <td>{ val.harga.toLocaleString("id-ID", { style: "currency", currency: "IDR" }) }</td>
                          <td>{ (val.jumlah * val.harga).toLocaleString("id-ID", { style: "currency", currency: "IDR" }) }</td>
                          <td>{ moment(val.waktuBeli).format("D MMM YYYY") }</td>
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

export default tPembelian;
