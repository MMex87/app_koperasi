import React, { useEffect, useRef, useState } from 'react'
import { connect } from 'react-redux';
import { jsPDF } from "jspdf"
import 'jspdf-autotable'
import barangTerjual from '../../../../utils/barang/barangTerjual';
import axios from '../../../../api/axios';
import ActionType from '../../../../redux/reducer/globalActionType';
import Swal from 'sweetalert2';

const ModalCheckout = (props) => {
    const [pembayaran, setPembayaran] = useState('')
    const inputRef = useRef(null);

    const print = (e) => {
        e.preventDefault()
        try {
            if (props.transaksiProps.find(({ faktur }) => faktur == props.faktur) == undefined) {
                Swal.fire(
                    'Gagal Print data!!',
                    'Tolong isi CartList Terlebih Dahulu!',
                    'warning'
                )
            } else {
                // Save Data
                for (let trans of props.transaksiProps) {
                    if (trans.faktur == props.faktur) {
                        barangTerjual(trans.barangId, trans.jumlah)
                        if (props.typePembayaran == 'Bon') {
                            axios.put(`/transPenjualan/${trans.id}`, {
                                statusPenjualan: "Bon"
                            })
                        } else {
                            axios.put(`/transPenjualan/${trans.id}`, {
                                statusPenjualan: "Selesai"
                            })
                        }
                    }
                }

                // Deklarasi Pdf
                const doc = new jsPDF("p", "mm", [48, 120])

                // deklarasi tanggal sekarang
                let today = new Date();
                const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Augustus", "September", "Oktober", "November", "Desember"];
                let dd = String(today.getDate()).padStart(2, '0');
                let mm = String(months[today.getMonth()]).padStart(2, '0');
                let yyyy = today.getFullYear();
                today = dd + ' - ' + mm + ' - ' + yyyy;

                doc.setFontSize(12)
                doc.line(1, 3.5, 4, 3.5)
                doc.text(`KANTIN`, 5, 5)
                doc.line(22, 3.5, 46, 3.5)
                doc.setFontSize(7)
                doc.text(`Faktur`, 1, 11)
                doc.text(`:`, 16, 11)
                doc.text(`${props.faktur}`, 18, 11)
                doc.text(`Tanggal`, 1, 15)
                doc.text(`:`, 16, 15)
                doc.text(`${today}`, 18, 15)
                doc.text(`Pembayaran`, 1, 19)
                doc.text(`:`, 16, 19)
                doc.text(`${props.typePembayaran}`, 18, 19)
                doc.text(`Anggota`, 1, 23)
                doc.text(`:`, 16, 23)
                doc.text(`${props.anggota}`, 18, 23)
                doc.line(1, 26, 46, 26)

                doc.autoTable(
                    {
                        // head: [['Nama barang', 'Harga', 'Jumlah', 'Total']],
                        body: props.transaksiProps
                            .filter(({ faktur }) => faktur == props.faktur)
                            .map((val) => [val.barang.nama, val.barang.hargaJual, val.jumlah, val.jumlah * val.barang.hargaJual]),
                        styles: { fontSize: 7 },
                        startY: 28,
                        margin: { left: 0, right: 3 },
                        theme: 'plain'
                    }
                )


                let heightTable = doc.lastAutoTable.finalY

                const total = props.totalHarga;
                const bayar = parseInt(pembayaran)
                const kembali = bayar - total

                const pageWidth = doc.internal.pageSize.getWidth();

                // total
                const totalWidth = doc.getTextWidth(`${total.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}`);
                const totalX = pageWidth - totalWidth - 4;

                // bayar
                const bayarWidth = doc.getTextWidth(`${bayar.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}`);
                const bayarX = pageWidth - bayarWidth - 4;

                // kembali
                const kembaliWidth = doc.getTextWidth(`${kembali.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}`);
                const kembaliX = pageWidth - kembaliWidth - 4;

                doc.line(1, heightTable + 1, 46, heightTable + 1)

                doc.text('Total', 14, heightTable + 6)
                doc.text(`:`, 23, heightTable + 6)
                doc.text(total.toLocaleString("id-ID", { style: "currency", currency: "IDR" }), totalX, heightTable + 6)
                doc.text('Bayar', 14, heightTable + 10)
                doc.text(`:`, 23, heightTable + 10)
                doc.text(bayar.toLocaleString("id-ID", { style: "currency", currency: "IDR" }), bayarX, heightTable + 10)
                doc.text('Kembali', 14, heightTable + 14)
                doc.text(`:`, 23, heightTable + 14)
                doc.text(kembali.toLocaleString("id-ID", { style: "currency", currency: "IDR" }), kembaliX, heightTable + 14)


                doc.autoPrint();
                // window.open(doc.output("bloburl"));

                // Menghasilkan dokumen PDF dalam bentuk data URL
                const pdf = doc.output('datauristring');

                // Membuat elemen iframe untuk memuat dokumen PDF
                const iframe = document.createElement('iframe');
                iframe.style.display = 'none';
                iframe.src = pdf;

                // Memasukkan elemen iframe ke dalam dokumen
                document.body.appendChild(iframe);

                // Mengatur waktu tunda agar iframe selesai dimuat
                setTimeout(function () {
                    // Memanggil fungsi print pada elemen iframe
                    iframe.contentWindow.print();

                    // Menghapus elemen iframe setelah selesai mencetak
                    document.body.removeChild(iframe);
                }, 100);

            }
        } catch (error) {
            console.error(error)
        }
    }

    const reset = (e) => {
        e.preventDefault()
        props.handleAnggota('')
        props.handleTypeBayar('')
        props.handleKodeBarang('')
        props.handleNamaBarang('')
        props.handleJumlah('')
        props.handlejenisBarang('')
        props.handleHargaBarang('')
        props.handleFakturPenjualan('')
        props.refreshAutoFokus()
        setPembayaran('')
    }

    useEffect(() => {
        setTimeout(() => {
            inputRef.current.focus();
        }, 500)
    }, [props.refresh]);
    return (
        <>
            <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h1 class="modal-title fs-5" id="exampleModalLabel">LIST CHECKOUT</h1>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <form onSubmit={ print }>
                            <div class="modal-body">
                                <div className="overflow-auto" style={ { height: 300 } }>
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Nama Anggota</th>
                                                <th>Nama Barang</th>
                                                <th>Jenis Barang</th>
                                                <th>Jumlah</th>
                                                <th>Harga</th>
                                                <th>Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            { props.transaksiProps
                                                .filter(({ faktur }) => faktur == props.faktur)
                                                .map((val, index) => (
                                                    <tr key={ index }>
                                                        <th>{ index + 1 }</th>
                                                        <td>{ val.anggota.nama }</td>
                                                        <td>{ val.barang.nama }</td>
                                                        <td>{ val.barang.jenisBarang }</td>
                                                        <td>{ val.jumlah }</td>
                                                        <td>{ val.barang.hargaJual }</td>
                                                        <td>{ val.jumlah * val.barang.hargaJual }</td>
                                                    </tr>
                                                )) }
                                        </tbody>
                                    </table>
                                </div>
                                <div className='mt-3 d-flex justify-content-end'>
                                    <h3>Total Harga: { props.totalHarga }</h3>
                                </div>
                                <div className="mt-3 row d-flex">
                                    <div className="col-6">
                                        <label htmlFor="bayar" className="form-label">
                                            Nominal Pembayaran
                                        </label>
                                        <input type="text" className="form-control" id="bayar" value={ pembayaran } onChange={ (e) => setPembayaran(e.target.value) }
                                            ref={ inputRef } />
                                    </div>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                <button type="submit" class="btn btn-primary"
                                    data-bs-target={ props.transaksiProps.find(({ faktur }) => faktur == props.faktur) == undefined ? '' : "#exampleModalToggle2" }
                                    data-bs-toggle={ props.transaksiProps.find(({ faktur }) => faktur == props.faktur) == undefined ? '' : "modal" }
                                    data-bs-dismiss={ props.transaksiProps.find(({ faktur }) => faktur == props.faktur) == undefined ? "modal" : '' }>Print</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div >
            <div class="modal fade" id="exampleModalToggle2" data-bs-backdrop="static" aria-hidden="true" aria-labelledby="exampleModalToggleLabel2" tabindex="-1">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h1 class="modal-title fs-5" id="exampleModalToggleLabel2">Total Kembalian</h1>
                        </div>
                        <div class="modal-body">
                            <h1>{ (parseInt(pembayaran) - props.totalHarga).toLocaleString("id-ID", { style: "currency", currency: "IDR" }) }</h1>
                        </div>
                        <form onSubmit={ reset }>
                            <div class="modal-footer">
                                <button type='submit' class="btn btn-primary" data-bs-dismiss="modal">Oke</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}

const mapStateToProps = (state) => {
    return {
        anggota: state.anggota,
        typePembayaran: state.typePembayaran,
        kodeBarang: state.kodeBarang,
        namaBarang: state.namaBarang,
        jumlah: state.jumlah,
        jenis: state.jenis,
        harga: state.harga,
        faktur: state.faktur,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        handleAnggota: (anggota) => dispatch({ type: ActionType.SET_ANGGOTA_PENJUALAN, index: anggota }),
        handleTypeBayar: (typeBayar) => dispatch({ type: ActionType.SET_TYPE_BAYAR_PENJUALAN, index: typeBayar }),
        handleKodeBarang: (kodeBarang) => dispatch({ type: ActionType.SET_KODE_BARANG_PENJUALAN, index: kodeBarang }),
        handleNamaBarang: (namaBarang) => dispatch({ type: ActionType.SET_NAMA_BARANG_PENJUALAN, index: namaBarang }),
        handleJumlah: (jumlah) => dispatch({ type: ActionType.SET_JUMLAH_PENJUALAN, index: jumlah }),
        handlejenisBarang: (jenisBarang) => dispatch({ type: ActionType.SET_JENIS_PENJUALAN, index: jenisBarang }),
        handleHargaBarang: (hargaBarang) => dispatch({ type: ActionType.SET_HARGA_PENJUALAN, index: hargaBarang }),
        handleFakturPenjualan: (faktur) => dispatch({ type: ActionType.SET_FAKTUR_PENJUALAN, index: faktur }),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ModalCheckout)