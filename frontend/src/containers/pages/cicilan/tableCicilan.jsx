import React, { useEffect, useState } from 'react'
import getTransaksiBonSearch from '../../../utils/cicilan/getTransaksiBonSearch'
import moment from 'moment'
import { connect } from 'react-redux'
import ActionType from '../../../redux/reducer/globalActionType'

const tableCicilan = (props) => {

    const [transaksiBon, setTransaksiBon] = useState([])
    const [transaksiAllBon, setTransaksiAllBon] = useState([])
    const [search, setSearch] = useState('')

    useEffect(() => {
        getTransaksiBonSearch(search).then((data) => {
            setTransaksiAllBon(data)
            let arrayFilter = [];
            let dataFaktur = [];
            dataFaktur = data;

            // sortir Data Double
            const filteredSearchFaktur = dataFaktur.filter((value, index, self) => index === self.findIndex((t) => t.transPenjualan.faktur === value.transPenjualan.faktur));
            arrayFilter = filteredSearchFaktur;

            setTransaksiBon(arrayFilter)

        })
    }, [search, props.cicilanId])

    return (
        <>
            <div className="col-lg-12">
                <div className="row">
                    <div className="col-md-9">
                    </div>
                    <div className="col-md-3">
                        <div className="search-bar text-center mt-3">
                            <form className="search-form d-flex align-items-center" method="POST" action="#">
                                <div className="input-group mb-3">
                                    <div>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="query"
                                            placeholder="Cari Faktur"
                                            value={ search }
                                            onChange={ (e) => setSearch(e.target.value) }
                                        />
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <table className="table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Nama Anggota</th>
                        <th>Faktur</th>
                        <th>Jumlah Bayar(2%)</th>
                        <th>Tanggal Transaksi</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        transaksiBon.filter(({ statusBon }) => statusBon == "Belum Lunas").map((val, index) => (
                            <tr key={ index }>
                                <td>{ index + 1 }</td>
                                <td>{ val.anggota.nama }</td>
                                <td>{ val.transPenjualan.faktur }</td>
                                <td>
                                    {
                                        val.totalBayar
                                    }
                                </td>
                                <td>{ moment(val.waktuBon).format("D MMM YYYY") }</td>
                                <td>
                                    <button className='btn btn-success' onClick={ () => props.handleCicilanId(val.id) } >Bayar</button>
                                </td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>
        </>
    )
}

const mapStateToProps = state => {
    return {
        cicilanId: state.cicilanId
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        handleCicilanId: (cicilan) => dispatch({ type: ActionType.SET_ID_CICILAN, index: cicilan }),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(tableCicilan)