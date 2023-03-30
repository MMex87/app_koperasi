import { Component } from "react";
import moment from "moment";
import { jsPDF } from "jspdf"
import 'jspdf-autotable'
import getTransPembelianJoin from "../../../utils/transaksiPembelian/getTransPembelianJoin";

class tPembelian extends Component {
  constructor(props) {
    super(props);
    this.state = {
      transPembelian: [],
      search: '',
      tahun: '',
      bulan: '',
      dataTahun: [],
      dataBulan: [],
    };
  }

  componentDidMount() {
    getTransPembelianJoin().then((data) => {
      this.setState({ transPembelian: data });

      let arrayFilterTahunPembelian = [];
      let dataTahunPembelian = [];
      dataTahunPembelian = data;

      let arrayFilterBulanPembelian = [];
      let dataBulanPembelian = [];
      dataBulanPembelian = data;

      // sortir Data Double
      const filteredTahunPembelian = dataTahunPembelian.filter((value, index, self) => index === self.findIndex((t) => moment(t.waktuBeli).format("YYYY") === moment(value.waktuBeli).format("YYYY")));
      arrayFilterTahunPembelian = filteredTahunPembelian;


      const filteredBulanPembelian = dataBulanPembelian.filter((value, index, self) => index === self.findIndex((t) => moment(t.waktuBeli).format("M") === moment(value.waktuBeli).format("M")));
      arrayFilterBulanPembelian = filteredBulanPembelian;

      if (this.state.tahun != '') {
        this.setState({
          dataTahun: arrayFilterTahunPembelian,
          dataBulan: arrayFilterBulanPembelian
        })
      } else {
        this.setState({
          dataTahun: arrayFilterTahunPembelian,
        })
      }
    });
    this.setState({
      search: moment().format("YYYY-MM-D"),
    })
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.bulan != prevState.bulan || this.state.search != prevState.search || this.state.tahun != prevState.tahun) {
      getTransPembelianJoin().then((data) => {
        this.setState({ transPembelian: data });

        let arrayFilterTahunPembelian = [];
        let dataTahunPembelian = [];
        dataTahunPembelian = data;

        let arrayFilterBulanPembelian = [];
        let dataBulanPembelian = [];
        dataBulanPembelian = data;

        // sortir Data Double
        const filteredTahunPembelian = dataTahunPembelian.filter((value, index, self) => index === self.findIndex((t) => moment(t.waktuBeli).format("YYYY") === moment(value.waktuBeli).format("YYYY")));
        arrayFilterTahunPembelian = filteredTahunPembelian;


        const filteredBulanPembelian = dataBulanPembelian.filter((value, index, self) => index === self.findIndex((t) => moment(t.waktuBeli).format("M") === moment(value.waktuBeli).format("M")));
        arrayFilterBulanPembelian = filteredBulanPembelian;

        if (this.state.tahun != '') {
          this.setState({
            dataTahun: arrayFilterTahunPembelian,
            dataBulan: arrayFilterBulanPembelian,
            search: ''
          })
        } else if (this.state.bulan != '') {
          this.setState({ search: '' })
        }
        else {
          this.setState({
            dataTahun: arrayFilterTahunPembelian,
            dataBulan: [],
            search: moment().format("YYYY-MM-D")
          })
        }

      })
    }
  }

  render() {
    const simpan = () => {
      // Deklarasi Pdf
      const doc = new jsPDF("l", "pt", "a4")


      if (this.state.bulan == '') {
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
      } else {
        doc.setFontSize(20)
        const pageWidth = doc.internal.pageSize.getWidth();

        const totalWidthLaporan = doc.getTextWidth(`Laporan Harian Pembelian`);
        const totalXLaporan = (pageWidth / 2) - (totalWidthLaporan / 2);

        const tanggal = "Bulan : " + moment(this.state.bulan).format("MMMM")
        const totalWidthTanggal = doc.getTextWidth(tanggal);
        const totalXTanggal = (pageWidth / 2) - ((totalWidthTanggal / 2) - 10)
        doc.text("Laporan Bulanan Pembelian", totalXLaporan, 25)
        doc.setFontSize(16)
        doc.text(tanggal, totalXTanggal, 45)
      }

      doc.autoTable(
        {
          head: [['#', 'Faktur', 'Supplier', 'Barang', 'Jumlah', 'Harga Beli', 'Total Harga', 'Tanggal']],
          body: this.state.transPembelian.filter(({ waktuBeli }) =>
            (this.state.bulan != '')
              ?
              moment(this.state.bulan).format("M") == moment(waktuBeli).format("M")
              :
              moment(waktuBeli).format("D-MM-YYYY") == moment(this.state.search).format("D-MM-YYYY")
          ).map((val, index) => [
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
      if (this.state.bulan == '') {
        doc.save('Laporan Harian Pembelian ' + moment(this.state.search).format("D-MM-YYYY") + '.pdf')
      } else {
        doc.save('Laporan Bulanan Pembelian Per ' + moment(this.state.bulan).format("MMMM") + '.pdf')
      }

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
                  <div className="col-md-4"></div>
                  <div className="text-end col-md-6 pt-3 d-flex justify-content-end">
                    <select class="form-select" style={ { width: 150, marginRight: 20 } } aria-label="Default select example"
                      onChange={ (e) => this.setState({ tahun: e.target.value }) }>
                      <option value="" selected>Tahun</option>
                      {
                        this.state.dataTahun.map((val, index) => (
                          <option
                            value={ moment(val.waktuBeli).format("YYYY") }
                            key={ index }
                            selected={ moment(val.waktuBeli).format("YYYY") == this.state.tahun ? true : false }>{ moment(val.waktuBeli).format('YYYY') }</option>
                        ))
                      }
                    </select>
                    <select class="form-select" style={ { width: 150, marginRight: 20 } } aria-label="Default select example"
                      onChange={ (e) => this.setState({ bulan: e.target.value }) }>
                      <option value="" selected>Bulan</option>
                      {
                        this.state.dataBulan.map((val, index) => (
                          <option
                            value={ moment(val.waktuBeli).format("M") } key={ index }
                            selected={ moment(val.waktuBeli).format("M") == this.state.bulan && true } >{ moment(val.waktuBeli).format("MMMM") }</option>
                        ))
                      }
                    </select>
                    <input type="date" className=" form-control" style={ { width: 180 } } placeholder={ this.state.search } value={ this.state.search } onChange={ (e) => this.setState({ search: e.target.value }) } />
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
                      { this.state.transPembelian.filter(({ waktuBeli }) =>
                        (this.state.bulan != '')
                          ?
                          moment(this.state.bulan).format("M") == moment(waktuBeli).format("M")
                          :
                          moment(waktuBeli).format("D-MM-YYYY") == moment(this.state.search).format("D-MM-YYYY")
                      ).map((val, index) => (
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
