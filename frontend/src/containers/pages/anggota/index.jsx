import React, { Component, useEffect } from "react";
import axios from "../../../api/axios.jsx";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";
import getAnggota from "../../../utils/anggota/getAnggota.jsx";

export class Anggota extends Component {
  constructor(props) {
    super(props);
    this.state = {
      anggota: [],
    };
  }

  componentDidMount() {
    getAnggota().then((data) => {
      this.setState({ anggota: data });
    });
  }

  render() {
    const Toast = Swal.mixin({
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger",
      },
      buttonsStyling: false,
    });

    const handleDelete = (val) => {
      try {
        Toast.fire({
          title: "Apa Kamu Yakin?",
          text: "Kamu akan Menghapus Data Anggota!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Ok, Hapus!",
          cancelButtonText: "Tidak, Batal!",
          reverseButtons: true,
        }).then((result) => {
          if (result.isConfirmed) {
            axios.delete(`/anggota/${val}`);
            Toast.fire("Terhapus!", "Data Anggota Sudah Terhapus.", "success");
            this.getAnggota();
          } else if (
            /* Read more about handling dismissals below */
            result.dismiss === Swal.DismissReason.cancel
          ) {
            Toast.fire("Dibatalkan", "Data Anggota tetap aman :)", "error");
          }
        });
      } catch (error) {
        console.error(error);
      }
    };

    return (
      <main id="main" className="main">
        <div className="pagetitle text-center">
          <h1 className="fw-bold fs-2">Data Anggota</h1>
        </div>
        <section className="section">
          <div className="card">
            <div className="card-body">
              <div className="col-lg-12">
                <div className="row">
                  <div className="col-md-7"></div>
                  <div className="col-md-4">
                    <div className="search-bar text-center mt-3">
                      <form className="search-form d-flex align-items-center" method="POST" action="#">
                        <div className="input-group mb-3">
                          <input type="text" className="form-control" name="query" placeholder="Cari Anggota" title="Enter search keyword" aria-label="Recipient's username" aria-describedby="button-addon2" />
                        </div>
                      </form>
                    </div>
                  </div>
                  <div className="col-1">
                    <Link to="/anggota/tambah">
                      <img src={"assets/img/add.svg"} alt="" id="add" />
                    </Link>
                  </div>
                  <table className="table">
                    <thead>
                      <tr>
                        <th scope="col">#</th>
                        <th scope="col">Nama Anggota</th>
                        <th scope="col">Nomor Handphone</th>
                        <th scope="col">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {this.state.anggota.map((val, index) => (
                        <tr key={index}>
                          <th>{index + 1}</th>
                          <td>{val.nama}</td>
                          <td>{val.noHP}</td>
                          <td>
                            <Link className="btn btn-warning bx bx-edit-alt text-black-50" to={`edit/${val.id}`} />
                            <button className="bx bx-trash btn btn-danger " onClick={() => handleDelete(val.id)} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <nav aria-label="...">
                    <ul className="pagination justify-content-center">
                      <li className="page-item disabled">
                        <a className="page-link" href="#" aria-label="Previous">
                          <span aria-hidden="true">«</span>
                        </a>
                      </li>
                      <li className="page-item">
                        <a className="page-link" href="#">
                          1
                        </a>
                      </li>
                      <li className="page-item active">
                        <a className="page-link" href="#">
                          2
                        </a>
                      </li>
                      <li className="page-item">
                        <a className="page-link" href="#">
                          3
                        </a>
                      </li>
                      <li className="page-item">
                        <a className="page-link" href="#" aria-label="Next">
                          <span aria-hidden="true">»</span>
                        </a>
                      </li>
                    </ul>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }
}

export default Anggota;
