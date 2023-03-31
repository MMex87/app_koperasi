import getTransaksiBon from "../../../utils/cicilan/getTransaksiBon";
import { Component } from "react";
import moment from "moment";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import axios from "../../../api/axios";

class tAnggota extends Component {
  constructor(props) {
    super(props);
    this.state = {
      anggota: [],
      refresh: false,
      filterAnggota: []
    };
  }

  componentDidMount() {
    getTransaksiBon(this.state.anggota).then((data) => {
      this.setState({ anggota: data });

      let dataNamaPenjualan = [];
      let dataNamaFilterBonPenjualan = []
      dataNamaPenjualan = data;

      dataNamaFilterBonPenjualan = dataNamaPenjualan.filter(({ statusBon }) => statusBon == "Belum Lunas")

      const filterNamaPenjualan = dataNamaFilterBonPenjualan.filter((value, index, self) => index === self.findIndex((t) => t.anggotaId === value.anggotaId));

      // total
      this.setState({ filterAnggota: filterNamaPenjualan })
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.refresh != prevState.refresh) {
      getTransaksiBon(this.state.anggota).then((data) => {
        this.setState({ anggota: data });

        let dataNamaPenjualan = [];
        let dataNamaFilterBonPenjualan = []
        dataNamaPenjualan = data;

        dataNamaFilterBonPenjualan = dataNamaPenjualan.filter(({ statusBon }) => statusBon == "Belum Lunas")

        const filterNamaPenjualan = dataNamaFilterBonPenjualan.filter((value, index, self) => index === self.findIndex((t) => t.anggotaId === value.anggotaId));

        // total
        this.setState({ filterAnggota: filterNamaPenjualan })
      });
    }
  }

  render() {

    const getTotal = (nama) => {
      let total = 0
      for (let val of this.state.anggota) {
        if (val.anggota.nama == nama && val.statusBon == "Belum Lunas") {
          total = total + parseInt(val.totalBayar)
        }
      }
      return total
    }

    const simpan = async () => {
      // Deklarasi Pdf
      const doc = new jsPDF("l", "pt", "a4");

      doc.setFontSize(20);
      const pageWidth = doc.internal.pageSize.getWidth();

      const totalWidthLaporan = doc.getTextWidth(`Laporan BON Anggota`);
      const totalXLaporan = pageWidth / 2 - totalWidthLaporan / 2;

      const tanggal = "Tanggal : " + moment().format("D MMM YYYY");
      const totalWidthTanggal = doc.getTextWidth(tanggal);
      const totalXTanggal = pageWidth / 2 - (totalWidthTanggal / 2 - 10);

      doc.text("Laporan BON Anggota", totalXLaporan, 25);
      doc.setFontSize(16);
      doc.text(tanggal, totalXTanggal, 45);

      doc.autoTable({
        head: [["#", "Anggota", "Jumlah", "Tanggal"]],
        body: this.state.filterAnggota
          .filter(({ statusBon }) => statusBon == "Belum Lunas")
          .map((val, index) => [
            index + 1,
            val.anggota.nama,
            (getTotal(val.anggota.nama) + (getTotal(val.anggota.nama) * 0.02)).toLocaleString("id-ID", { style: "currency", currency: "IDR" }),
            moment(val.transPenjualan.createdAt).format("D MMMM YYYY")]),
        styles: { fontSize: 12 },
        startY: 70,
        margin: { left: 3, right: 3 },
      });

      // window.open(doc.output("bloburl"));
      doc.save("Laporan BON Anggota " + moment().format("D-MM-YYYY") + ".pdf");

      for (let val of this.state.anggota) {
        await axios.put(`/penjualanBon/${val.id}`, {
          totalBayar: 0,
          statusBon: "Lunas"
        })
      }

      this.setState({ refresh: true })
    };
    return (
      <main id="main">
        <div className="text-center pagetitle">
          <h1 className="fs-2 fw-bold"> Laporan Anggota </h1>
        </div>

        <section className="section">
          <div className="card">
            <div className="card-body">
              <div className="col-lg-12">
                <div className="row">
                  <div className="col-md-8"></div>
                  <div className="text-end col-md-2 pt-3">{/* <input type="text" className=" form-control" placeholder="Cari Anggota" value={this.state.search} onChange={(e) => this.setState({ search: e.target.value })} /> */ }</div>
                  <div className="text-end col-md-2 pt-3">
                    <button className="btn btn-success me-3" onClick={ simpan }>
                      Simpan
                    </button>
                  </div>
                  <table className="table mt-2">
                    <thead>
                      <tr>
                        <th scope="col">#</th>
                        <th scope="col">Angota</th>
                        <th scope="col">Jumlah</th>
                        <th scope="col">Tanggal</th>
                      </tr>
                    </thead>
                    <tbody>
                      { this.state.filterAnggota
                        .filter(({ statusBon }) => statusBon == "Belum Lunas")
                        .map((val, index) => (
                          <tr key={ index }>
                            <th>{ index + 1 }</th>
                            <td>{ val.anggota.nama }</td>
                            <td>{
                              getTotal(val.anggota.nama).toLocaleString("id-ID", { style: "currency", currency: "IDR" })
                            }</td>
                            <td>{ moment(val.transPenjualan.createdAt).format("D MMMM YYYY") }</td>
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

export default tAnggota;
