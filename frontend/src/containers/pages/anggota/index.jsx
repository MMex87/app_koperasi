import React, { Component } from "react";
import axios from "../../../api/axios.jsx";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";
import ReactPaginate from "react-paginate";
import getAnggota from "../../../utils/anggota/getAnggota.jsx";
import getSearchAnggota from "../../../utils/anggota/getSearchAnggota.jsx";

export class Anggota extends Component {
  constructor(props) {
    super(props);
    this.state = {
      anggota: [],
      search: "",
      page: 0,
      limit: 5,
      pages: 0,
      rows: 0,
    };
  }

  componentDidMount() {
    getSearchAnggota(this.state.search, this.state.limit, this.state.page).then((data) => {
      this.setState({ anggota: data.result });
      this.setState({ page: data.page });
      this.setState({ pages: data.totalPage });
      this.setState({ rows: data.totalRows });
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.page != prevState.page || this.state.search != prevState.search) {
      getSearchAnggota(this.state.search, this.state.limit, this.state.page).then((data) => {
        this.setState({ anggota: data.result });
        this.setState({ page: data.page });
        this.setState({ pages: data.totalPage });
        this.setState({ rows: data.totalRows });
      });
    }
  }

  render() {
    console.log(this.state.anggota);

    const Toast = Swal.mixin({
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger",
      },
      buttonsStyling: false,
    });

    // handle Pagination
    const changePage = ({ selected }) => {
      this.setState({ page: selected });
    };

    const handleDelete = (val) => {
      try {
        Toast.fire({
          title: "Hapus Data ?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Hapus!",
          cancelButtonText: "Tidak!",
          reverseButtons: true,
        }).then((result) => {
          if (result.isConfirmed) {
            axios.delete(`/anggota/${val}`);
            Toast.fire("Berhasil", "Data Anggota Dihapus", "success");
            getSearchAnggota(this.state.search, this.state.limit, this.state.page).then((data) => {
              this.setState({ anggota: data.result });
              this.setState({ page: data.page });
              this.setState({ pages: data.totalPage });
              this.setState({ rows: data.totalRows });
            });
          } else if (
            /* Read more about handling dismissals below */
            result.dismiss === Swal.DismissReason.cancel
          ) {
            Toast.fire("Gagal", "Data Aggota Aman", "error");
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
                  <div className="col-md-8"></div>
                  <div className="col-md-3">
                    <div className="search-bar text-center mt-3">
                      <form className="search-form d-flex align-items-center" method="POST" action="#">
                        <div className="input-group mb-3">
                          <input
                            type="text"
                            className="form-control"
                            name="query"
                            placeholder="Cari Anggota"
                            title="Enter search keyword"
                            aria-label="Recipient's username"
                            aria-describedby="button-addon2"
                            onChange={(e) => this.setState({ search: e.target.value })}
                          />
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
                            <Link className="btn btn-warning bx bx-edit-alt text-black-50 me-2" to={`edit/${val.id}`} />
                            <button className="bx bx-trash btn btn-danger " onClick={() => handleDelete(val.id)} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="p-3">
                    <div className="d-flex justify-content-between">
                      <p className="text-center">
                        Total Anggota: {this.state.rows} Page: {this.state.rows ? this.state.page + 1 : 0} of {this.state.pages}
                      </p>
                      <nav aria-label="Page navigate example justify-content-end">
                        <ReactPaginate
                          previousLabel={"< Prev"}
                          nextLabel={"Next >"}
                          pageCount={this.state.pages}
                          onPageChange={changePage}
                          containerClassName={"pagination"}
                          pageLinkClassName={"page-link"}
                          pageClassName={"page-item"}
                          previousLinkClassName={"page-link"}
                          previousClassName={"page-item"}
                          nextClassName={"page-item"}
                          nextLinkClassName={"page-link"}
                          activeClassName={"active"}
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

export default Anggota;
