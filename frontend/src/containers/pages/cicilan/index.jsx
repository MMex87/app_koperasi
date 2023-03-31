import axios from "../../../api/axios";
import { connect } from "react-redux";
import ActionType from "../../../redux/reducer/globalActionType";
import getAnggota from "../../../utils/anggota/getAnggota";
import getTransaksiBon from "../../../utils/cicilan/getTransaksiBon";
import TableCicilan from "./tableCicilan";
import Swal from "sweetalert2";
import getTransPenjualanJoin from "../../../utils/transaksiPenjualan/getTransPenjualanJoin";

const { Component } = require("react");

class Cicilan extends Component {
  state = {
    anggotas: [],
    anggota: "",
    transaksiBon: [],
    nominal: '',
    transaksiPenjualan: []
  };

  componentDidMount() {
    getAnggota().then((data) => {
      this.setState({ anggotas: data });
    });
    getTransaksiBon().then((data) => {
      this.setState({ transaksiBon: data })
    })
    getTransPenjualanJoin().then((data) => {
      this.setState({ transaksiPenjualan: data })
    })
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.cicilanId != this.props.cicilanId) {
      getTransaksiBon().then((data) => {
        this.setState({ transaksiBon: data })
      })
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

    const save = async (e) => {
      e.preventDefault()
      try {
        const cicilan = this.state.transaksiBon.find(({ id }) => id == this.props.cicilanId)
        const jumlahBon = this.state.transaksiBon.find(({ id }) => id == this.props.cicilanId).totalBayar

        if (jumlahBon == this.state.nominal) {
          await axios.post('/pembayaran', {
            jumlahBayar: this.state.nominal,
            anggotaId: cicilan.anggotaId,
            penjualanbonId: cicilan.id
          })
          await axios.put(`/penjualanBon/${cicilan.id}`, {
            totalBayar: jumlahBon - parseInt(this.state.nominal),
            statusBon: 'Lunas'
          })
          for (let val of this.state.transaksiPenjualan) {
            if (val.faktur == cicilan.transPenjualan.faktur)
              await axios.put(`/transPenjualan/${val.id}`, {
                statusPenjualan: "Lunas"
              })
          }
          Toast.fire({
            icon: "success",
            title: "Hutang Sudah Lunas!",
          });
        } else if (jumlahBon < this.state.nominal) {
          // ketika jumlah nominal lebih besar dari nominal yang harus dibayar
          return Swal.fire(
            'Pembayaran Gagal!!',
            'Nominal yang dibayar terlalu besar!!',
            'warning'
          )
        } else {
          await axios.put(`/penjualanBon/${cicilan.id}`, {
            totalBayar: jumlahBon - parseInt(this.state.nominal)
          })
          await axios.post('/pembayaran', {
            jumlahBayar: this.state.nominal,
            anggotaId: cicilan.anggotaId,
            penjualanbonId: cicilan.id
          })
          Toast.fire({
            icon: "success",
            title: "Hutang Berhasil Di Cicil!",
          });
        }

        this.props.handleCicilanId('')
        this.setState({ nominal: '' })

      } catch (error) {
        console.error(error)
      }
    }

    return (
      <main id="main">
        <div className="pagetitle">
          <h1 className="text-center fs-2 fw-bold">Cicilan</h1>
        </div>
        <section>
          <form onSubmit={ save }>
            <div className="card p-3">
              <div className="card-body">
                <div className="col-md-12">
                  {
                    this.props.cicilanId != ''
                      ?
                      <>
                        <div className="row pt-4">
                          <div className="row col-md-12 pt-3">
                            <div className="col-md-2">
                              <label className="col-form-label">Nominal</label>
                            </div>
                            <div className="col-md-10">
                              <h4>
                                {
                                  <p>{
                                    this.state.transaksiBon.find(({ id }) => id == this.props.cicilanId).totalBayar.toLocaleString("id-ID", { style: "currency", currency: "IDR" })
                                  }</p>
                                }
                              </h4>
                            </div>
                            <div className="col-md-2">
                              <label className="col-form-label">Bayar</label>
                            </div>
                            <div className="col-md-10">
                              <input className="form-control" type="text" onChange={ (e) => this.setState({ nominal: e.target.value }) } value={ this.state.nominal } />
                            </div>
                          </div>
                        </div>
                        <div className="d-flex justify-content-end mt-3 me-4">
                          <button className="btn btn-warning me-3" type="button" onClick={ () => this.props.handleCicilanId('') }>Batal</button>
                          <button className="btn btn-success" type="submit">Bayar</button>
                        </div>
                      </>
                      :
                      <TableCicilan />
                  }
                </div>
              </div>
            </div>
          </form>
        </section>
      </main>
    );
  }
}

const mapStateToProps = state => {
  return {
    cicilanId: state.cicilanId
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    handleCicilanId: (cicilan) => dispatch({ type: ActionType.SET_ID_CICILAN, index: cicilan }),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Cicilan);
