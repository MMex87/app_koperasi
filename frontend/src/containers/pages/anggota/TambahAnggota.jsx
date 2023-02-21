import React, { Component } from 'react'
import axios from '../../../api/axios.jsx'
import Swal from 'sweetalert2'
import withRouter from '../../../config/withRouter.jsx'
import { Link } from 'react-router-dom'
import getAnggotaId from '../../../utils/anggota/getAnggotaId.jsx'

class TambahAnggota extends Component {
    constructor(props) {
        super(props)
        this.state = {
            nama: '',
            noHP: ''
        }
    }


    componentDidMount() {
        if (this.props.params.id) {
            getAnggotaId(this.props.params.id).then((data) => {
                this.setState({
                    nama: data.nama,
                    nik: data.nik,
                    noHP: data.noHP
                })
            })
        }
    }



    render() {
        // alert
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
        })
        // Definition params dan navigate
        const params = this.props.params
        const navigate = this.props.navigate

        // Params Judul
        const jenis = params.jenis
        const tempJenis = jenis.charAt(0).toUpperCase();
        const tempJenis2 = jenis.slice(1)
        const judul = tempJenis + tempJenis2

        // params id
        const id = params.id



        const tambahAnggota = async (e) => {
            e.preventDefault()
            if (id == undefined)
                try {
                    await axios.post('/anggota', {
                        nama: this.state.nama,
                        noHP: this.state.noHP
                    })
                    Toast.fire({
                        icon: 'success',
                        title: 'Data Berhasil di Tambahkan!',
                    })
                    navigate('/anggota')

                } catch (error) {
                    console.error(error)
                }
            else {
                try {
                    await axios.put(`/anggota/${id}`, {
                        nama: this.state.nama,
                        noHP: this.state.noHP
                    })
                    Toast.fire({
                        icon: 'success',
                        title: 'Data Berhasil di Ubah!',

                    })
                    this.setState({
                        nama: '',
                        noHP: ''
                    })
                    navigate('/anggota')
                } catch (error) {
                    console.error(error)
                }
            }
        }



        return (
            <main id="main" className="main">
                <div className="pagetitle">
                    <h1>Input Anggota</h1>
                    <nav>
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item"> <Link to="/anggota">Data Anggota</Link> </li>
                            {
                                judul == 'Tambah'
                                    ?
                                    <li className="breadcrumb-item"> Input Anggota </li>
                                    :
                                    <li className="breadcrumb-item"> <Link to="/anggota/tambah" onClick={ () => this.setState({
                                        nama: '',
                                        noHP: ''
                                    }) }>Input Anggota</Link> </li>
                            }
                            {
                                judul == 'Edit'
                                &&
                                <li className="breadcrumb-item"> Edit Anggota</li>
                            }
                        </ol>
                    </nav>
                </div>
                <section className="section">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="card">
                                <div className="card-body">
                                    <h5 className="card-title text-center ">{ judul } Anggota</h5>
                                    <form onSubmit={ tambahAnggota }>
                                        <div className="row mb-3">
                                            <label htmlFor="nama" className="col-sm-2 col-form-label">Nama Anggota</label>
                                            <div className="col-sm-10">
                                                <input type="text" value={ this.state.nama } className="form-control" id="nama" onChange={ (e) => this.setState({ nama: e.target.value }) } />
                                            </div>
                                        </div>
                                        <div className="row mb-3">
                                            <label htmlFor="noHP" className="col-sm-2 col-form-label">Nomor Handphone</label>
                                            <div className="col-sm-10">
                                                <input type="number" value={ this.state.noHP } className="form-control" id="noHP" onChange={ (e) => this.setState({ noHP: e.target.value }) } />
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <button type="submit" className="btn btn-primary">{ judul }</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        )
    }
}


export default withRouter(TambahAnggota)