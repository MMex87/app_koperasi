import React, { Component } from "react";
import Swal from "sweetalert2";
import withRouter from "../../../config/withRouter.jsx";
import axios from "../../../api/axios.jsx";
import { Link } from "react-router-dom";
import getSupplierId from "../../../utils/supplier/getSupplierId.jsx";

class TambahSupplier extends Component {
  state = {
    nama: "",
    noHP: "",
    alamat: "",
  };

  componentDidMount() {
    if (this.props.params.id) {
      getSupplierId(this.props.params.id).then((data) => {
        this.setState({
          nama: data.nama,
          noHP: data.noHP,
          alamat: data.alamat,
        });
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

    // define params dan navigate
    const navigate = this.props.navigate;
    const params = this.props.params;

    // Params Judul
    const jenis = params.jenis;
    const tempJenis = jenis.charAt(0).toUpperCase();
    const tempJenis2 = jenis.slice(1);
    const judul = tempJenis + tempJenis2;

    // params id
    const id = params.id;

    const tambah = async (e) => {
      e.preventDefault();
      if (id == undefined) {
        try {
          await axios.post("/supplier", {
            nama: this.state.nama,
            noHP: this.state.noHP,
            alamat: this.state.alamat,
          });
          Toast.fire({
            icon: "success",
            title: "Data Berhasil di Tambahkan!",
          });
          navigate("/supplier");
        } catch (error) {
          console.error(error);
        }
      } else {
        try {
          await axios.put(`/supplier/${id}`, {
            nama: this.state.nama,
            noHP: this.state.noHP,
            alamat: this.state.alamat,
          });
          Toast.fire({
            icon: "success",
            title: "Data Berhasil di Edit!",
          });
          navigate("/supplier");
        } catch (error) {
          console.error(error);
        }
      }
    };

    return (
      <main id="main" class="main">
        <div class="pagetitle">
          <h1>Input Supplier</h1>
          <nav>
            <ol class="breadcrumb">
              <li class="breadcrumb-item" id="li">
                {" "}
                <Link to="/supplier">Data Supplier</Link>{" "}
              </li>
              {judul == "Tambah" ? (
                <li className="breadcrumb-item"> Input Supplier </li>
              ) : (
                <li className="breadcrumb-item">
                  {" "}
                  <Link
                    to="/supplier/tambah"
                    onClick={() =>
                      this.setState({
                        nama: "",
                        alamat: "",
                        noHP: "",
                      })
                    }
                  >
                    Input Supplier
                  </Link>{" "}
                </li>
              )}
              {judul == "Edit" && <li className="breadcrumb-item"> Edit Supplier</li>}
            </ol>
          </nav>
        </div>
        <section class="section">
          <div class="row">
            <div class="col-lg-12">
              <div class="card">
                <div class="card-body">
                  <h5 class="card-title text-center "> {judul} Supplier</h5>
                  <form onSubmit={tambah}>
                    <div class="row mb-3">
                      <label for="nama" class="col-sm-2 col-form-label">
                        Nama Supplier
                      </label>
                      <div class="col-sm-10">
                        <input type="text" class="form-control" id="nama" value={this.state.nama} onChange={(e) => this.setState({ nama: e.target.value })} />
                      </div>
                    </div>
                    <div class="row mb-3">
                      <label for="noHP" class="col-sm-2 col-form-label">
                        Nomor Handphone
                      </label>
                      <div class="col-sm-10">
                        <input type="number" class="form-control" id="noHP" value={this.state.noHP} onChange={(e) => this.setState({ noHP: e.target.value })} />
                      </div>
                    </div>
                    <div class="row mb-3">
                      <label for="alamat" class="col-sm-2 col-form-label">
                        Alamat
                      </label>
                      <div class="col-sm-10">
                        <input type="text" class="form-control" id="alamat" value={this.state.alamat} onChange={(e) => this.setState({ alamat: e.target.value })} />
                      </div>
                    </div>
                    <div class="text-center">
                      <button type="submit" class="btn btn-primary">
                        {judul}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }
}

export default withRouter(TambahSupplier);
