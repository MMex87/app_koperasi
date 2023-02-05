import React from 'react'
import { Link } from 'react-router-dom'

const SideBar = () => {
    return (
        <aside id="sidebar" className="sidebar">
            <ul className="sidebar-nav" id="sidebar-nav">
                <li className="nav-item">
                    <Link className="nav-link collapsed" to={ '/' }>
                        <i className="bi bi-grid" />
                        <span>Dashboard</span>
                    </Link>
                </li>
                <li className="nav-heading">Mastering</li>
                <li className="nav-item">
                    <Link className="nav-link collapsed" to="/barang">
                        <i className="bi bi-grid" />
                        <span> Barang </span>
                    </Link>
                </li>
                <li className="nav-item">
                    <Link className="nav-link collapsed" data-bs-target="#anggota-nav" data-bs-toggle="collapse" to="/anggota"> <i className="bi bi-journal-text" /><span>Anggota</span><i className="bi bi-chevron-down ms-auto" /> </Link>
                    <ul id="anggota-nav" className="nav-content collapse" data-bs-parent="#sidebar-nav">
                        <li>
                            <Link to="/anggota/tambah"> <i className="bi bi-circle" /><span>Anggota</span> </Link>
                        </li>
                        <li>
                            <Link to="/anggota"> <i className="bi bi-circle" /><span>Data Anggota</span> </Link>
                        </li>
                    </ul>
                </li>
                <li className="nav-item">
                    <Link className="nav-link collapsed" data-bs-target="#supplier-nav" data-bs-toggle="collapse" to="/supplier"> <i className="bi bi-journal-text" /><span>Supplier</span><i className="bi bi-chevron-down ms-auto" /> </Link>
                    <ul id="supplier-nav" className="nav-content collapse" data-bs-parent="#sidebar-nav">
                        <li>
                            <Link to="/supplier/tambah"> <i className="bi bi-circle" /><span>Supplier</span> </Link>
                        </li>
                        <li>
                            <Link to="/supplier"> <i className="bi bi-circle" /><span>Data Supplier</span> </Link>
                        </li>
                    </ul>
                </li>
                <li className="nav-heading">Transaksi</li>
                <li className="nav-item">
                    <Link className="nav-link collapsed" data-bs-target="#penjualan-nav" data-bs-toggle="collapse" to="/transPenjualan"> <i className="bi bi-journal-text" /><span>Penjualan</span><i className="bi bi-chevron-down ms-auto" /> </Link>
                    <ul id="penjualan-nav" className="nav-content collapse" data-bs-parent="#sidebar-nav">
                        <li>
                            <Link to="/transPenjualan"> <i className="bi bi-circle" /><span>Penjualan</span> </Link>
                        </li>
                        <li>
                            <Link to="#"> <i className="bi bi-circle" /><span>Return Penjualan</span> </Link>
                        </li>
                    </ul>
                </li>
                <li className="nav-item">
                    <Link className="nav-link collapsed" data-bs-target="#pembelian-nav" data-bs-toggle="collapse" to="/transPembelian"> <i className="bi bi-journal-text" /><span>Pembelian</span><i className="bi bi-chevron-down ms-auto" /> </Link>
                    <ul id="pembelian-nav" className="nav-content collapse" data-bs-parent="#sidebar-nav">
                        <li>
                            <Link to="/transPembelian"> <i className="bi bi-circle" /><span>Pembelian</span> </Link>
                        </li>
                        <li>
                            <Link to="#"> <i className="bi bi-circle" /><span>Return Pembelian</span> </Link>
                        </li>
                    </ul>
                </li>
                <li className="nav-heading">Laporan</li>
                <li className="nav-item">
                    <Link className="nav-link collapsed" data-bs-target="#laporan-nav" data-bs-toggle="collapse" to="#"> <i className="bi bi-journal-text" /><span>Laporan</span><i className="bi bi-chevron-down ms-auto" /> </Link>
                    <ul id="laporan-nav" className="nav-content collapse" data-bs-parent="#sidebar-nav">
                        <li>
                            <Link to="#"> <i className="bi bi-circle" /><span>L Barang</span> </Link>
                        </li>
                        <li>
                            <Link to="#"> <i className="bi bi-circle" /><span>L Anggota</span> </Link>
                        </li>
                        <li>
                            <Link to="#"> <i className="bi bi-circle" /><span>L Supplier</span> </Link>
                        </li>
                        <li>
                            <Link to="#"> <i className="bi bi-circle" /><span>L Laba Rugi</span> </Link>
                        </li>
                        <li>
                            <Link to="#"> <i className="bi bi-circle" /><span>L Tutup Buku</span> </Link>
                        </li>
                    </ul>
                </li>
            </ul>
        </aside>

    )
}

export default SideBar