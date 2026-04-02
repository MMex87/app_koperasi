import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import ActionType from "../../../../redux/reducer/globalActionType";
import Swal from "sweetalert2";
import { generateFaktur } from "../../../../components/faktur/generateFaktur";
import convertRupiah from "rupiah-format";
import getTransPembelianJoin from "../../../../utils/transaksiPembelian/getTransPembelianJoin";
import hapusTransaksiPembelian from "../../../../utils/transaksiPembelian/hapusTransaksiPembelian";
import editTransaksiCartListPembelian from "../../../../utils/transaksiPembelian/editTransaksiCartListPembelian";
import axios from "../../../../api/axios";

const CartList = (props) => {
  /* ================= ALERT ================= */
  const Toast = Swal.mixin({
    customClass: {
      confirmButton: "btn btn-success",
      cancelButton: "btn btn-danger",
    },
    buttonsStyling: false,
  });

  /* ================= STATE ================= */
  const [transaksi, setTransaksi] = useState([]);
  const [refresh, setRefresh] = useState(false);

  // edit state
  const [displayEdit, setDisplayEdit] = useState(false);
  const [idEdit, setIdEdit] = useState(null);
  const [jumlah, setJumlah] = useState(0);
  const [editHargaBeli, setEditHargaBeli] = useState(0);
  const [editHargaJual, setEditHargaJual] = useState(0);

  // search faktur
  const [displaySearch, setDisplaySearch] = useState(false);
  const [displayAutoFaktur, setDisplayAutoFaktur] = useState(false);
  const [searchFaktur, setSearchFaktur] = useState("");
  const [dataFilterFaktur, setDataFilterFaktur] = useState([]);

  /* ================= EFFECT ================= */
  useEffect(() => {
    getTransPembelianJoin().then((data) => {
      setTransaksi(data);

      // remove duplicate faktur
      const uniqueFaktur = data.filter((v, i, self) => i === self.findIndex((t) => t.faktur === v.faktur));
      setDataFilterFaktur(uniqueFaktur);

      const onProcess = data.find((v) => v.statusPembelian === "onProcess");

      if (!onProcess) {
        setDisplaySearch(true);

        if (!data.find((v) => v.faktur === searchFaktur)) {
          props.handleFakturPembelian(generateFaktur("FKB"));
        }
      } else {
        setDisplaySearch(false);
        props.handleFakturPembelian(onProcess.faktur);
        props.handleSupplier(onProcess.supplier.nama);
      }
    });
  }, [props.harga, props.jumlah, refresh, searchFaktur, props.supplier]);

  /* ================= HANDLER ================= */
  const handleEditJumlah = (id, qty, hargaBeli, hargaJual) => {
    setDisplayEdit(true);
    setIdEdit(id);
    setJumlah(qty);
    setEditHargaBeli(hargaBeli);
    setEditHargaJual(hargaJual);
  };

  const handleAutoFaktur = (val) => {
    setDisplayAutoFaktur(false);
    setSearchFaktur(val);
    props.handleFakturPembelian(val);
  };

  const batal = () => {
    setDisplayEdit(false);
    setIdEdit(null);
    setJumlah(0);
    setEditHargaBeli(0);
    setEditHargaJual(0);
  };

  const save = async () => {
    editTransaksiCartListPembelian({
      harga: editHargaBeli,
      jumlah,
      id: idEdit,
    });

    const resTrans = await axios.get(`/transPembelian/${idEdit}`);
    const resBarang = await axios.get(`/barang/${resTrans.data.barangId}`);

    const selisih = jumlah - resTrans.data.jumlah;
    // console.log(idEdit);

    await axios.put(`/barang/${resTrans.data.barangId}`, {
      hargaBeli: editHargaBeli,
      hargaJual: editHargaJual,
      jumlah: resBarang.data.jumlah + selisih,
    });

    batal();
    setTimeout(() => setRefresh(!refresh), 100);
  };

  const handleHapusTransaksi = (idTrans, barangId, qty) => {
    Toast.fire({
      title: "Apa Kamu Yakin?",
      text: "Kamu akan Menghapus Data Pembelian!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ok, Hapus!",
      cancelButtonText: "Tidak, Batal!",
      reverseButtons: true,
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      await hapusTransaksiPembelian(idTrans);
      const resBarang = await axios.get(`/barang/${barangId}`);

      await axios.put(`/barang/${barangId}`, {
        jumlah: resBarang.data.jumlah - qty,
      });

      setRefresh(!refresh);
      Toast.fire("Terhapus!", "Data Pembelian Sudah Terhapus.", "success");
    });
  };

  /* ================= JSX ================= */
  return (
    <>
      <div className="row mb-3">
        <div className="col-md-8">
          <h1 className="card-title fw-bold">Faktur : {props.faktur}</h1>
        </div>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Supplier</th>
            <th>Barang</th>
            <th>Jumlah</th>
            <th>Harga Beli</th>
            <th>Harga Jual</th>
            <th>Aksi</th>
          </tr>
        </thead>

        <tbody>
          {transaksi
            .filter((v) => v.faktur === props.faktur)
            .map((v, i) => (
              <tr key={v.id}>
                <td>{i + 1}</td>
                <td>{v.supplier.nama}</td>
                <td>{v.barang.nama}</td>

                {displayEdit && v.id === idEdit ? (
                  <>
                    <td>
                      <input type="number" className="form-control" value={jumlah} onChange={(e) => setJumlah(+e.target.value)} />
                    </td>
                    <td>
                      <input type="number" className="form-control" value={editHargaBeli} onChange={(e) => setEditHargaBeli(+e.target.value)} />
                    </td>
                    <td>
                      <input type="number" className="form-control" value={editHargaJual} onChange={(e) => setEditHargaJual(+e.target.value)} />
                    </td>
                  </>
                ) : (
                  <>
                    <td>{v.jumlah}</td>
                    <td>{convertRupiah.convert(v.barang.hargaBeli)}</td>
                    <td>{convertRupiah.convert(v.barang.hargaJual)}</td>
                  </>
                )}

                <td>
                  {displayEdit && v.id === idEdit ? (
                    <>
                      <button className="btn btn-success me-2" onClick={save}>
                        Save
                      </button>
                      <button className="btn btn-warning" onClick={batal}>
                        Batal
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="btn btn-warning me-2" onClick={() => handleEditJumlah(v.id, v.jumlah, v.harga, v.barang.hargaJual)}>
                        Edit
                      </button>
                      <button className="btn btn-danger" onClick={() => handleHapusTransaksi(v.id, v.barangId, v.jumlah)}>
                        Hapus
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </>
  );
};

/* ================= REDUX ================= */
const mapStateToProps = (state) => ({
  supplier: state.supplier,
  kodeBarang: state.kodeBarang_beli,
  namaBarang: state.namaBarang_beli,
  jumlah: state.jumlah_beli,
  jenis: state.jenis_beli,
  harga: state.harga_beli,
  harga_jual: state.harga_jual,
  faktur: state.faktur_beli,
});

const mapDispatchToProps = (dispatch) => ({
  handleSupplier: (v) => dispatch({ type: ActionType.SET_SUPPLIER_PEMBELIAN, index: v }),
  handleFakturPembelian: (v) => dispatch({ type: ActionType.SET_FAKTUR_PEMBELIAN, index: v }),
});

export default connect(mapStateToProps, mapDispatchToProps)(CartList);
