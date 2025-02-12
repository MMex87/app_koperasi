import axios from "../../../../api/axios";
import {useState, useEffect} from "react";
import {useParams, useNavigate,Link } from "react-router-dom";
import barangTerjual from "../../../../utils/barang/barangTerjual";
import Swal from "sweetalert2";

const RPembelian = () => {
  const [dataPembelian, setDataPembelian] = useState([]);
  const [barang, setBarang] = useState(0);
  const [jumlah, setJumlah] = useState(0);
  const [retur, setRetur] = useState("");
  const navigate = useNavigate();
  const {id} = useParams()

  useEffect(() => {
    getData();
  },[]);

  const getData = async () => {
    const response = await axios.get(`http://localhost:8800/returnPembelian/${id}`);
    setBarang(response.data.barang.nama);
    setJumlah(response.data.jumlah);
    setDataPembelian(response.data);
  };

  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });


  const save = async (e) => {
    e.preventDefault()
    const response = await axios.get(`/returnPembelian/${id}`)
    const trans = response.data
    try {
      if ((trans.jumlah - retur) < 0) {
        return Swal.fire(
          'Retur Gagal!!',
          'Retur yang dikembalikan terlalu besar!!',
          'warning'
        )
      } else {
        await axios.post('/returnPembelian', {
          jumlah: retur,
          faktur: trans.faktur,
          transPembelianId: trans.id,
          supplierId: trans.supplierId,
          barangId: trans.barangId
        })
        let jumlahRetur = retur
        await axios.put(`/transPembelian/${id}`, {
          statusPembelian: 'Retur',
          jumlah: trans.jumlah - retur
        })
        barangTerjual(trans.barangId, jumlahRetur)
        Toast.fire({
            icon: "success",
            title: "Retur Berhasil!",
          });
          navigate('/retrunPembelian')
      }
    } catch (error) {
      console.error(error)
    }
  }


//   console.log(jumlahRetur)

    return (
      <main id="main">
        <div className="pagetitle text-center">
          <h1 className="fw-bold fs-2">Retur Pembelian</h1>
        </div>
        <section className="section">
          <div className="card p-3">
            <div className="col-lg-12">
              <div className="col-md-12">
                <div className="mt-3">
                    <form onSubmit={save}>
                        <div className="row pt-4">
                            <div className="row col-md-12 pt-3">
                            <div className="col-md-2">
                                <label className="col-form-label">Nama</label>
                            </div>
                            <div className="col-md-10">
                                <h4>
                                    {barang}
                                </h4>
                            </div>
                            <div className="col-md-2">
                                <label className="col-form-label">Jumlah</label>
                            </div>
                            <div className="col-md-10">
                                <h4>
                                    {jumlah}
                                </h4>
                            </div>
                            <div className="col-md-2">
                                <label className="col-form-label">Retur</label>
                            </div>
                            <div className="col-md-10">
                                <input className="form-control" type="text" value={retur} 
                                 onChange={(e) => setRetur(e.target.value)}/>
                            </div>
                            </div>
                        </div>
                        <div className="d-flex justify-content-end mt-3 me-4">
                          <Link to={`/retrunPembelian`}>
                            <button className="btn btn-warning me-3" type="button" >Batal</button>
                          </Link>
                            <button className="btn btn-success" type="submit">Retur</button>
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

export default RPembelian;