import React, { Component } from "react";
import ReactPaginate from "react-paginate";
import { Link } from "react-router-dom";
import getSearchBarang from "../../../utils/barang/getSearchBarang.jsx";

export default class Barang extends Component {
  state = {
    barang: [],
    search: "",
    page: 0,
    limit: 5,
    pages: 0,
    rows: 0,
  };

  componentDidMount() {
    getSearchBarang(this.state.search, this.state.limit, this.state.page).then((data) => {
      this.setState({ barang: data.result });
      this.setState({ page: data.page });
      this.setState({ rows: data.totalRows });
      this.setState({ pages: data.totalPage });
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.search != this.state.search || prevState.page != this.state.page) {
      getSearchBarang(this.state.search, this.state.limit, this.state.page).then((data) => {
        this.setState({ barang: data.result });
        this.setState({ page: data.page });
        this.setState({ rows: data.totalRows });
        this.setState({ pages: data.totalPage });
      });
    }
  }

  render() {
    const changePage = (selected) => {
      this.setState({ page: selected });
    };

    console.log(this.state);

    return (
      <main id="main" className="main">
        <div className="pagetitle">
          <h1 className="text-center fs-2 fw-bold">Data Barang</h1>
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
                            placeholder="Cari Barang"
                            title="Enter search keyword"
                            aria-label="Recipient's username"
                            aria-describedby="button-addon2"
                            onChange={(e) => this.setState({ search: e.target.value })}
                          />
                        </div>
                      </form>
                    </div>
                  </div>
                  <div className="col-md-1">
                    <Link to="/transPembelian">
                      <img src={"assets/img/add.svg"} alt="" id="add" />
                    </Link>
                  </div>
                  <table className="table">
                    <thead>
                      <tr>
                        <th scope="col">#</th>
                        <th scope="col">Nama Barang</th>
                        <th scope="col">Kode Barang</th>
                        <th scope="col">Supplier</th>
                        <th scope="col">Satuan</th>
                        <th scope="col">Jenis</th>
                        <th scope="col">Harga Beli</th>
                        <th scope="col">Harga Jual</th>
                        <th scope="col">Jumlah</th>
                      </tr>
                    </thead>
                    <tbody>
                      {this.state.barang.map((val, index) => (
                        <tr key={index}>
                          <th scope="row">{index + 1}</th>
                          <td>{val.nama}</td>
                          <td>{val.kodeBarang}</td>
                          <td>{val.supplier.nama}</td>
                          <td>{val.satuan}</td>
                          <td>{val.jenisBarang}</td>
                          <td>{val.hargaBeli}</td>
                          <td>{val.hargaJual}</td>
                          <td>{val.jumlah}</td>
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
