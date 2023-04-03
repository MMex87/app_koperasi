import axios from "../../../../api/axios";
import moment from "moment";
import { Component } from "react";
import ReactPaginate from "react-paginate";
import getTransPenjualanJoinSearch from "../../../../utils/transaksiPenjualan/getTransPenjualanJoinSearch";
import barangTerbeli from "../../../../utils/barang/barangTerbeli";
import Swal from "sweetalert2";

class RPenjualan extends Component {
  state = {
    penjualan: [],
    search: "",
    page: 0,
    limit: 10,
    pages: 0,
    rows: 0,
    transaksiId: '',
    jumlah: ''
  }

  componentDidMount() {
    getTransPenjualanJoinSearch(this.state.search, this.state.limit, this.state.page).then((data) => {
      this.setState({ penjualan: data.result });
      this.setState({ page: data.page });
      this.setState({ rows: data.totalRows });
      this.setState({ pages: data.totalPage });
    })
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.search != this.state.search || prevState.page != this.state.page || prevState.barangId != this.state.barangId || prevState.transaksiId != this.state.transaksiId) {
      getTransPenjualanJoinSearch(this.state.search, this.state.limit, this.state.page).then((data) => {
        this.setState({ penjualan: data.result });
        this.setState({ page: data.page });
        this.setState({ rows: data.totalRows });
        this.setState({ pages: data.totalPage });
      });
    }
  }

  render() {
    // alert
    const Toast = Swal.mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    });


    const changePage = (selected) => {
      this.setState({ page: selected.selected });
    };

    const save = async (e) => {
      e.preventDefault()
      const response = await axios.get(`/transPenjualan/${this.state.transaksiId}`)
      const trans = response.data
      try {
        if ((trans.jumlah - this.state.jumlah) < 0) {
          return Swal.fire(
            'Retur Gagal!!',
            'Retur yang dikembalikan terlalu besar!!',
            'warning'
          )
        } else {
          await axios.post('/returnPenjualan', {
            jumlah: this.state.jumlah,
            faktur: trans.faktur,
            transPenjualanId: trans.id,
            anggotaId: trans.anggotaId,
            barangId: trans.barangId
          })
          let jumlahRetur = this.state.jumlah
          await axios.put(`/transPenjualan/${this.state.transaksiId}`, {
            statusPenjualan: 'Retur',
            jumlah: trans.jumlah - this.state.jumlah
          })
          barangTerbeli(trans.barangId, jumlahRetur)

          this.setState({ transaksiId: '' })
          Toast.fire({
            icon: "success",
            title: "Retur Berhasil!",
          });

        }
      } catch (error) {
        console.error(error)
      }
    }

    return (
      <main id="main">
        <div className="pagetitle text-center">
          <h1 className="fw-bold fs-2">Retur Penjualan</h1>
        </div>

        <section className="section">
          <div className="card p-3">
            <div className="col-lg-12">
              <div className="col-md-12">
                {
                  this.state.transaksiId == ''
                  &&
                  <div className="row">
                    <div className="col-md-9"></div>
                    <div className="col-md-3 text-end">
                      <input
                        type="text"
                        className="form-control"
                        name="query"
                        placeholder="Cari Barang"
                        title="Enter search keyword"
                        aria-label="Recipient's username"
                        aria-describedby="button-addon2"
                        onChange={ (e) => this.setState({ search: e.target.value }) }
                      />
                    </div>
                  </div>
                }
                <div className="mt-3">
                  {
                    this.state.transaksiId != ''
                      ?
                      <>
                        <form onSubmit={ save }>
                          <div className="row pt-4">
                            <div className="row col-md-12 pt-3">
                              <div className="col-md-2">
                                <label className="col-form-label">Jumah Barang</label>
                              </div>
                              <div className="col-md-10">
                                <h4>
                                  {
                                    <p>{
                                      this.state.penjualan.find(({ id }) => id == this.state.transaksiId).jumlah
                                    }</p>
                                  }
                                </h4>
                              </div>
                              <div className="col-md-2">
                                <label className="col-form-label">Retur</label>
                              </div>
                              <div className="col-md-10">
                                <input className="form-control" type="text" onChange={ (e) => this.setState({ jumlah: e.target.value }) } value={ this.state.jumlah } />
                              </div>
                            </div>
                          </div>
                          <div className="d-flex justify-content-end mt-3 me-4">
                            <button className="btn btn-warning me-3" type="button" onClick={ () => this.setState({ transaksiId: '' }) }>Batal</button>
                            <button className="btn btn-success" type="submit">Retur</button>
                          </div>
                        </form>
                      </>
                      :
                      <>
                        <table className="table ">
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Faktur</th>
                              <th>Anggota</th>
                              <th>Barang</th>
                              <th>Jumlah</th>
                              <th>Total</th>
                              <th>Tanggal</th>
                              <th>Status</th>
                              <th>Aksi</th>
                            </tr>
                          </thead>
                          <tbody>
                            {
                              this.state.penjualan
                                .map((val, index) => (
                                  <tr key={ index }>
                                    <th>{ index + 1 }</th>
                                    <td>{ val.faktur }</td>
                                    <td>{ val.anggota.nama }</td>
                                    <td>{ val.barang.nama }</td>
                                    <td>{ val.jumlah }</td>
                                    <td>{ val.harga }</td>
                                    <td>{ moment(val.waktuBeli).format("D MMM YYYY") }</td>
                                    <td>{ val.statusPenjualan }</td>
                                    <td>
                                      <button className="btn btn-warning" onClick={ () => this.setState({ transaksiId: val.id }) }>Edit</button>
                                    </td>
                                  </tr>
                                ))
                            }
                          </tbody>
                        </table>
                        <div className="p-3">
                          <div className="d-flex justify-content-between">
                            <p className="text-center">
                              Total Transaksi: { this.state.rows } Page: { this.state.rows ? this.state.page + 1 : 0 } of { this.state.pages }
                            </p>
                            <nav aria-label="Page navigate example justify-content-end">
                              <ReactPaginate
                                previousLabel={ "< Prev" }
                                nextLabel={ "Next >" }
                                pageCount={ this.state.pages }
                                onPageChange={ changePage }
                                containerClassName={ "pagination" }
                                pageLinkClassName={ "page-link" }
                                pageClassName={ "page-item" }
                                previousLinkClassName={ "page-link" }
                                previousClassName={ "page-item" }
                                nextClassName={ "page-item" }
                                nextLinkClassName={ "page-link" }
                                activeClassName={ "active" }
                              />
                            </nav>
                          </div>
                        </div>
                      </>
                  }
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }
}

export default RPenjualan;
