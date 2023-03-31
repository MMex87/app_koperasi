import React, { Component } from "react";
import axios from "../../../api/axios.jsx";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";
import ReactPaginate from "react-paginate";
import getSearchSupplier from "../../../utils/supplier/getSearchSupplier.jsx";

export default class Supplier extends Component {
  state = {
    supplier: [],
    page: 0,
    search: "",
    limit: 5,
    pages: 0,
    rows: 0,
  };

  componentDidMount() {
    getSearchSupplier(this.state.search, this.state.limit, this.state.page).then((data) => {
      this.setState({ pages: data.totalPage });
      this.setState({ rows: data.totalRows });
      this.setState({ page: data.page });
      this.setState({ supplier: data.result });
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.search != this.state.search || prevState.page != this.state.page) {
      getSearchSupplier(this.state.search, this.state.limit, this.state.page).then((data) => {
        this.setState({ pages: data.totalPage });
        this.setState({ rows: data.totalRows });
        this.setState({ page: data.page });
        this.setState({ supplier: data.result });
      });
    }
  }

  render() {
    const Toast = Swal.mixin({
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger",
      },
      buttonsStyling: false,
    });

    // handel page
    const changePage = (selected) => {
      this.setState({ page: selected.selected });
    };

    const handleHapus = (val) => {
      try {
        Toast.fire({
          title: "Hapus Data?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Hapus!",
          cancelButtonText: "Batal!",
          reverseButtons: true,
        }).then((result) => {
          if (result.isConfirmed) {
            axios.delete(`/supplier/${val}`);
            Toast.fire("Berhasil!", "Data Supplier Terhapus.", "success");
            getSearchSupplier(this.state.search, this.state.limit, this.state.page).then((data) => {
              this.setState({ pages: data.totalPage });
              this.setState({ rows: data.totalRows });
              this.setState({ page: data.page });
              this.setState({ supplier: data.result });
            });
          } else if (
            /* Read more about handling dismissals below */
            result.dismiss === Swal.DismissReason.cancel
          ) {
            Toast.fire("Gagal", "Data Supplier Aman", "error");
          }
        });
      } catch (error) {
        console.error(error);
      }
    };

    return (
      <main id="main" className="main">
        <div className="pagetitle">
          <h1 className="text-center fs-2 fw-bold">Data Supplier</h1>
        </div>
        <section className="section">
          <div className="card">
            <div className="card-body">
              <div className="col-lg-12">
                <div className="row">
                  <div className="col-md-8"></div>
                  <div className="col-md-3">
                    <div className="search-bar text-center mt-3">
                      <form className="search-form d-flex align-items-center" method="POST" action="#">
                        <div className="input-group mb-3">
                          <input
                            type="text"
                            className="form-control"
                            name="query"
                            placeholder="Cari Supplier"
                            title="Enter search keyword"
                            aria-label="Recipient's username"
                            aria-describedby="button-addon2"
                            onChange={ (e) => this.setState({ search: e.target.value }) }
                          />
                        </div>
                      </form>
                    </div>
                  </div>

                  <div className="col-md-1">
                    <Link to="/supplier/tambah">
                      <img src={ "assets/img/add.svg" } alt="" id="add" />
                    </Link>
                  </div>
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
                      { this.state.supplier.map((val, index) => (
                        <tr key={ index }>
                          <th>{ index + 1 }</th>
                          <td>{ val.nama }</td>
                          <td>{ val.noHP }</td>
                          <td>{ val.alamat }</td>
                          <td>
                            <Link className="btn btn-warning bx bx-edit-alt text-black-50 me-2" to={ `edit/${val.id}` } />
                            {/* <button className="bx bx-trash btn btn-danger " onClick={ () => handleHapus(val.id) } /> */ }
                          </td>
                        </tr>
                      )) }
                    </tbody>
                  </table>
                  <div className="p-3">
                    <div className="d-flex justify-content-between">
                      <p className="text-center">
                        Total Anggota: { this.state.rows } Page: { this.state.rows ? this.state.page + 1 : 0 } of { this.state.pages }
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
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }
}
