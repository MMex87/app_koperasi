import React, { useEffect, useState } from "react";
import Axios from "axios";
import convertRupiah from "rupiah-format";

const Dashboard = () => {
  const [dataBarang, setDataBarang] = useState([]);
  const [barang, setBarang] = useState("");
  const [anggota, setAnggota] = useState("");
  const [pendapatan, setPendapatan] = useState("");
  const [page, setPage] = useState(0);
  const [limit] = useState(5);
  const [pages, setPages] = useState(0);
  const [rows, setRows] = useState(0);

  useEffect(() => {
    loadData();
  }, [page]);

  const loadData = async () => {
    try {
      const barangRes = await Axios.get("http://localhost:8800/barang");
      setBarang(barangRes.data.count);

      const lap = await Axios.get(`http://localhost:8800/lapBarang?page=${page}&limit=${limit}`);

      setDataBarang(lap.data.result);
      setPage(lap.data.page);
      setPages(lap.data.totalPage);
      setRows(lap.data.totalRows);

      const anggotaRes = await Axios.get("http://localhost:8800/anggota");
      setAnggota(anggotaRes.data.count);

      const pendRes = await Axios.get("http://localhost:8800/lapBarangDownload");

      const totalPendapatan = pendRes.data.total.reduce((sum, item) => sum + parseInt(item.total, 10), 0);

      setPendapatan(totalPendapatan);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <main id="main" className="main bg-light">
      <div className="pagetitle mb-4">
        <h1 className="text-center fw-bold display-6">📊 Dashboard</h1>
      </div>

      <section className="section dashboard">
        <div className="row g-4">
          {/* CARD BARANG */}
          <div className="col-12 col-sm-6 col-lg-4 col-xl-4">
            <div className="card shadow-sm border-0 premium-card h-100">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-semibold">Total Barang</h5>
                  <div className="icon-box bg-primary bg-opacity-10 text-primary">
                    <i className="bi bi-box-seam" />
                  </div>
                </div>
                <h2 className="fw-bold mb-0">{barang}</h2>
              </div>
            </div>
          </div>

          {/* CARD PENDAPATAN */}
          <div className="col-12 col-sm-6 col-lg-4 col-xl-4">
            <div className="card shadow-sm border-0 premium-card h-100">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-semibold">Pendapatan</h5>
                  <div className="icon-box bg-success bg-opacity-10 text-success">
                    <i className="bi bi-cash-stack" />
                  </div>
                </div>
                <h2 className="fw-bold mb-0">{convertRupiah.convert(pendapatan)}</h2>
              </div>
            </div>
          </div>

          {/* CARD ANGGOTA */}
          <div className="col-12 col-sm-6 col-lg-4 col-xl-4">
            <div className="card shadow-sm border-0 premium-card h-100">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-semibold">Total Anggota</h5>
                  <div className="icon-box bg-warning bg-opacity-10 text-warning">
                    <i className="bi bi-people" />
                  </div>
                </div>
                <h2 className="fw-bold mb-0">{anggota}</h2>
              </div>
            </div>
          </div>

          {/* TABLE */}
          <div className="col-12">
            <div className="card shadow-sm border-0">
              <div className="card-body p-4">
                <h4 className="fw-bold mb-3">📦 Data Barang</h4>

                <div className="table-responsive">
                  <table className="table table-hover align-middle premium-table">
                    <thead className="table-light">
                      <tr>
                        <th>#</th>
                        <th>Nama</th>
                        <th>Jumlah</th>
                        <th>Harga Jual</th>
                        <th>Total</th>
                      </tr>
                    </thead>

                    <tbody>
                      {dataBarang.map((data, index) => (
                        <tr key={data.id}>
                          <td>{index + 1}</td>
                          <td className="fw-semibold">{data.nama}</td>
                          <td>{data.jumlah}</td>
                          <td>{convertRupiah.convert(data.hargaJual)}</td>
                          <td className="fw-bold text-primary">{convertRupiah.convert(data.hargaJual * data.jumlah)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
  .premium-card {
    border-radius: 15px;
    transition: 0.3s;
    min-height: 155px;   /* memastikan tinggi konsisten */
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .premium-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 25px rgba(0,0,0,0.08) !important;
  }
  .icon-box {
    width: 50px;
    height: 50px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.4rem;
  }
`}</style>
    </main>
  );
};

export default Dashboard;
