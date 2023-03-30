import React, { Component } from "react";
import getTransPenjualanJoin from "../../../utils/transaksiPenjualan/getTransPenjualanJoin";
import moment from "moment";
import { jsPDF } from "jspdf"
import 'jspdf-autotable'

class tPenjualan extends Component {
  constructor(props) {
    super(props);
    this.state = {
      penjualan: [],
      search: '',
      tahun: '',
      bulan: '',
      dataTahun: [],
      dataBulan: [],
    };
  }

  componentDidMount() {
    getTransPenjualanJoin().then((data) => {
      this.setState({ penjualan: data });
      let arrayFilterTahunPenjualan = [];
      let dataTahunPenjualan = [];
      dataTahunPenjualan = data;

      let arrayFilterBulanPenjualan = [];
      let dataBulanPenjualan = [];
      dataBulanPenjualan = data;

      // sortir Data Double
      const filteredTahunPenjualan = dataTahunPenjualan.filter((value, index, self) => index === self.findIndex((t) => moment(t.waktuJual).format("YYYY") === moment(value.waktuJual).format("YYYY")));
      arrayFilterTahunPenjualan = filteredTahunPenjualan;


      const filteredBulanPenjualan = dataBulanPenjualan.filter((value, index, self) => index === self.findIndex((t) => moment(t.waktuJual).format("M") === moment(value.waktuJual).format("M")));
      arrayFilterBulanPenjualan = filteredBulanPenjualan;

      if (this.state.tahun != '') {
        this.setState({
          dataTahun: arrayFilterTahunPenjualan,
          dataBulan: arrayFilterBulanPenjualan
        })
      } else {
        this.setState({
          dataTahun: arrayFilterTahunPenjualan,
        })
      }
    });
    this.setState({
      search: moment().format("YYYY-MM-D")
    })
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.bulan != prevState.bulan || this.state.search != prevState.search || this.state.tahun != prevState.tahun) {
      getTransPenjualanJoin().then((data) => {
        this.setState({ penjualan: data });

        let arrayFilterTahunPenjualan = [];
        let dataTahunPenjualan = [];
        dataTahunPenjualan = data;

        let arrayFilterBulanPenjualan = [];
        let dataBulanPenjualan = [];
        dataBulanPenjualan = data;

        // sortir Data Double
        const filteredTahunPenjualan = dataTahunPenjualan.filter((value, index, self) => index === self.findIndex((t) => moment(t.waktuJual).format("YYYY") === moment(value.waktuJual).format("YYYY")));
        arrayFilterTahunPenjualan = filteredTahunPenjualan;


        const filteredBulanPenjualan = dataBulanPenjualan.filter((value, index, self) => index === self.findIndex((t) => moment(t.waktuJual).format("M") === moment(value.waktuJual).format("M")));
        arrayFilterBulanPenjualan = filteredBulanPenjualan;

        if (this.state.bulan != '') {
          this.setState({ search: '' })
        } else if (this.state.tahun != '') {
          this.setState({
            dataTahun: arrayFilterTahunPenjualan,
            dataBulan: arrayFilterBulanPenjualan,
            search: '',
            bulan: ''
          })
        } else {
          this.setState({
            dataTahun: arrayFilterTahunPenjualan,
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

        const totalWidthLaporan = doc.getTextWidth(`Laporan Harian Penjualan`);
        const totalXLaporan = (pageWidth / 2) - (totalWidthLaporan / 2);

        const tanggal = "Tanggal : " + moment(this.state.search).format("D MMM YYYY")
        const totalWidthTanggal = doc.getTextWidth(tanggal);
        const totalXTanggal = (pageWidth / 2) - ((totalWidthTanggal / 2) - 10)
        doc.text("Laporan Harian Penjualan", totalXLaporan, 25)
        doc.setFontSize(16)
        doc.text(tanggal, totalXTanggal, 45)
      } else {
        doc.setFontSize(20)
        const pageWidth = doc.internal.pageSize.getWidth();

        const totalWidthLaporan = doc.getTextWidth(`Laporan Harian Penjualan`);
        const totalXLaporan = (pageWidth / 2) - (totalWidthLaporan / 2);

        const tanggal = "Bulan : " + moment(this.state.bulan).format("MMMM")
        const totalWidthTanggal = doc.getTextWidth(tanggal);
        const totalXTanggal = (pageWidth / 2) - ((totalWidthTanggal / 2) - 10)
        doc.text("Laporan Bulanan Penjualan", totalXLaporan, 25)
        doc.setFontSize(16)
        doc.text(tanggal, totalXTanggal, 45)
      }

      doc.autoTable(
        {
          head: [['#', 'Faktur', 'Anggota', 'Pembayaran', 'Barang', 'Jumlah', 'Harga', 'Tanggal']],
          body: this.state.penjualan.filter(({ waktuJual }) =>
            (this.state.bulan != '')
              ?
              moment(this.state.bulan).format("M") == moment(waktuJual).format("M")
              :
              moment(waktuJual).format("D-MM-YYYY") == moment(this.state.search).format("D-MM-YYYY")
          ).map((val, index) => [
            index + 1,
            val.faktur,
            val.anggota.nama,
            val.typePembayaran,
            val.barang.nama,
            val.jumlah,
            val.harga.toLocaleString("id-ID", { style: "currency", currency: "IDR" }),
            moment(val.waktuJual).format("D MMM YYYY")
          ]),
          styles: { fontSize: 12 },
          startY: 70,
          margin: { left: 3, right: 3 },
        }
      )

      // window.open(doc.output("bloburl"));
      if (this.state.bulan == '') {
        doc.save('Laporan Harian Penjualan ' + moment(this.state.search).format("D-MM-YYYY") + '.pdf')
      } else {
        doc.save('Laporan Bulanan Penjualan Per ' + moment(this.state.bulan).format("MMMM") + '.pdf')
      }
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
                  <div className="col-md-4"></div>
                  <div className="text-end col-md-6 pt-3 d-flex justify-content-end">
                    <select class="form-select" style={ { width: 150, marginRight: 20 } } aria-label="Default select example"
                      onChange={ (e) => this.setState({ tahun: e.target.value }) }>
                      <option value="" selected>Tahun</option>
                      {
                        this.state.dataTahun.map((val, index) => (
                          <option
                            value={ moment(val.waktuJual).format("YYYY") }
                            key={ index }
                            selected={ moment(val.waktuJual).format("YYYY") == this.state.tahun ? true : false }>{ moment(val.waktuJual).format('YYYY') }</option>
                        ))
                      }
                    </select>
                    <select class="form-select" style={ { width: 150, marginRight: 20 } } aria-label="Default select example"
                      onChange={ (e) => this.setState({ bulan: e.target.value }) }>
                      <option value="" selected={ this.state.bulan == '' ? true : false }>Bulan</option>
                      {
                        this.state.dataBulan.map((val, index) => (
                          <option
                            value={ moment(val.waktuJual).format("M") } key={ index }
                            selected={ moment(val.waktuJual).format("M") == this.state.bulan ? true : false } >{ moment(val.waktuJual).format("MMMM") }</option>
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
                        <th scope="col">#</th>
                        <th scope="col">Faktur</th>
                        <th scope="col">Anggota</th>
                        <th scope="col">Pembayaran</th>
                        <th scope="col">Barang</th>
                        <th scope="col">Jumlah</th>
                        <th scope="col">Harga</th>
                        <th scope="col">Tanggal</th>
                      </tr>
                    </thead>
                    <tbody>
                      { this.state.penjualan.filter(({ waktuJual }) =>
                        (this.state.bulan != '')
                          ?
                          moment(this.state.bulan).format("M") == moment(waktuJual).format("M")
                          :
                          moment(waktuJual).format("D-MM-YYYY") == moment(this.state.search).format("D-MM-YYYY")
                      ).map((val, index) => (
                        <tr key={ index }>
                          <th>{ index + 1 }</th>
                          <td>{ val.faktur }</td>
                          <td>{ val.anggota.nama }</td>
                          <td>{ val.typePembayaran }</td>
                          <td>{ val.barang.nama }</td>
                          <td>{ val.jumlah }</td>
                          <td>{ val.harga.toLocaleString("id-ID", { style: "currency", currency: "IDR" }) }</td>
                          <td>{ moment(val.waktuJual).format("D MMM YYYY") }</td>
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

export default tPenjualan;
