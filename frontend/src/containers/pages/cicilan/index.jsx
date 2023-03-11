import getAnggota from "../../../utils/anggota/getAnggota";

const { Component } = require("react");

class Cicilan extends Component {
  state = {
    anggotas: [],
    anggota: "",
  };

  componentDidMount() {
    getAnggota().then((data) => {
      this.setState({ anggotas: data });
    });
  }

  render() {
    const handleAutoAnggota = (val) => {
      this.setState({ displayAnggota: false });
      this.setState({ anggota: val });
    };

    return (
      <main id="main">
        <div className="pagetitle">
          <h1 className="text-center fs-2 fw-bold">Cicilan</h1>
        </div>

        <section>
          <form action="">
            <div className="card p-3">
              <div className="card-body">
                <div className="col-md-12">
                  <div className="row pt-4">
                    <div className="row col-md-12">
                      <div className="col-md-2">
                        <label className="col-form-label">Nama Angota</label>
                      </div>
                      <div className="col-md-10">
                        <input
                          type="text"
                          className="form-control"
                          id="namaAnggota"
                          value={this.state.anggota}
                          onChange={(e) => this.setState({ anggota: e.target.value })}
                          onClick={() => this.setState({ displayAnggota: !this.state.displayAnggota })}
                        />
                        {this.state.displayAnggota && (
                          <div className="flex-container flex-column pos-rel bodyAutoComplate">
                            <ul className="list-group list-group-flush">
                              {this.state.anggotas
                                .filter(({ nama }) => nama.indexOf(this.state.anggota) > -1)
                                .map((v, i) => (
                                  <li
                                    key={i}
                                    onClick={() => {
                                      handleAutoAnggota(v.nama);
                                    }}
                                    className="list-group-item listAutoComplate"
                                  >
                                    {" "}
                                    {v.nama}
                                  </li>
                                ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="row col-md-12 pt-3">
                      <div className="col-md-2">
                        <label className="col-form-label"> Nominal</label>
                      </div>
                      <div className="col-md-10">
                        <input className="form-control" type="text" />
                      </div>
                    </div>
                  </div>
                  <div className="col-md-12 pt-4 pe-4 text-end">
                    <button className="btn btn-success">ADD</button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </section>
      </main>
    );
  }
}

export default Cicilan;
