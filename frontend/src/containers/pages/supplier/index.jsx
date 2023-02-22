import React, { Component } from "react";
import axios from "../../../api/axios.jsx";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";
import getSupplier from "../../../utils/supplier/getSupplier.jsx";

export default class Supplier extends Component {
  state = {
    supplier: [],
  };

  componentDidMount() {
    getSupplier().then((data) => {
      this.setState({ supplier: data });
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

    const handleHapus = (val) => {
      try {
        Toast.fire({
          title: "Apa Kamu Yakin?",
          text: "Kamu akan Menghapus Data Supplier!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Ok, Hapus!",
          cancelButtonText: "Tidak, Batal!",
          reverseButtons: true,
        }).then((result) => {
          if (result.isConfirmed) {
            axios.delete(`/supplier/${val}`);
            Toast.fire("Terhapus!", "Data Supplier Sudah Terhapus.", "success");
            this.getSupplier();
          } else if (
            /* Read more about handling dismissals below */
            result.dismiss === Swal.DismissReason.cancel
          ) {
            Toast.fire("Dibatalkan", "Data Supplier tetap aman :)", "error");
          }
        });
      } catch (error) {
        console.error(error);
      }
    };

    return (
      <main id="main" className="main">
        <div className="pagetitle">
          <h1>Data Supplier</h1>
          <nav>
            <ol className="breadcrumb">
              <li className="breadcrumb-item" id="li">
                {" "}
                Data Supplier
              </li>
              <li className="breadcrumb-item">
                {" "}
                <Link to="/supplier/tambah">Input Supplier</Link>{" "}
              </li>
            </ol>
          </nav>
        </div>
        <section className="section">
          <div className="row">
            <div className="col-lg-12">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title text-center "> Data Supplier</h5>
                  <table className="table">
                    <thead>
                      <tr>
                        <th scope="col">#</th>
                        <th scope="col">Nama Supplier</th>
                        <th scope="col">Nomor Handphone</th>
                        <th scope="col">Alamat</th>
                        <th scope="col">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {this.state.supplier.map((val, index) => (
                        <tr key={index}>
                          <th>{index + 1}</th>
                          <td>{val.nama}</td>
                          <td>{val.noHP}</td>
                          <td>{val.alamat}</td>
                          <td>
                            <Link className="btn btn-warning bx bx-edit-alt text-black-50" to={`edit/${val.id}`} />
                            <button className="bx bx-trash btn btn-danger " onClick={() => handleHapus(val.id)} />
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
