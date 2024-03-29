import React from "react";
import { Link } from "react-router-dom";

const SideBar = () => {
  return (
    <aside id="sidebar" className="sidebar fixed-top">
      <ul className="sidebar-nav" id="sidebar-nav">
        <li className="nav-item">
          <Link className="nav-link collapsed" to={ "/" }>
            <i className="bi bi-grid" />
            <span>Dashboard</span>
          </Link>
        </li>
        <li className="nav-heading">Mastering</li>
        <li className="nav-item">
          <Link className="nav-link collapsed" to="/barang">
            <i className="bx bx-box" />
            <span> Barang </span>
          </Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link collapsed" data-bs-target="#anggota-nav" data-bs-toggle="collapse" to="/anggota">
            { " " }
            <i className="bi bi-person" />
            <span>Anggota</span>
            <i className="bi bi-chevron-down ms-auto" />{ " " }
          </Link>
          <ul id="anggota-nav" className="nav-content collapse" data-bs-parent="#sidebar-nav">
            <li>
              <Link to="/anggota/tambah">
                { " " }
                <i className="bi bi-person-plus" />
                <span>Anggota</span>{ " " }
              </Link>
            </li>
            <li>
              <Link to="/anggota">
                { " " }
                <i className="bi bi-people" />
                <span>Data Anggota</span>{ " " }
              </Link>
            </li>
          </ul>
        </li>
        <li className="nav-item">
          <Link className="nav-link collapsed" data-bs-target="#supplier-nav" data-bs-toggle="collapse" to="/supplier">
            { " " }
            <i className="bi bi-shop" />
            <span>Supplier</span>
            <i className="bi bi-chevron-down ms-auto" />{ " " }
          </Link>
          <ul id="supplier-nav" className="nav-content collapse" data-bs-parent="#sidebar-nav">
            <li>
              <Link to="/supplier/tambah">
                { " " }
                <i className="bi bi-shop-window" />
                <span>Supplier</span>{ " " }
              </Link>
            </li>
            <li>
              <Link to="/supplier">
                { " " }
                <i className="bx bx-coffee-togo" />
                <span>Data Supplier</span>{ " " }
              </Link>
            </li>
          </ul>
        </li>
        <li className="nav-heading">Transaksi</li>
        <li className="nav-item">
          <Link className="nav-link collapsed" data-bs-target="#penjualan-nav" data-bs-toggle="collapse" to="/transPenjualan">
            { " " }
            <i className="ri-shopping-cart-2-line" />
            <span>Penjualan</span>
            <i className="bi bi-chevron-down ms-auto" />{ " " }
          </Link>
          <ul id="penjualan-nav" className="nav-content collapse" data-bs-parent="#sidebar-nav">
            <li>
              <Link to="/transPenjualan">
                { " " }
                <i className="bi bi-circle" />
                <span>Penjualan</span>{ " " }
              </Link>
            </li>
            <li>
              <Link to="/retrunPenjualan">
                { " " }
                <i className="bi bi-circle" />
                <span>Retur Penjualan</span>{ " " }
              </Link>
            </li>
          </ul>
        </li>
        <li className="nav-item">
          <Link className="nav-link collapsed" data-bs-target="#pembelian-nav" data-bs-toggle="collapse" to="/transPembelian">
            { " " }
            <i className="bx bxl-shopify" />
            <span>Pembelian</span>
            <i className="bi bi-chevron-down ms-auto" />{ " " }
          </Link>
          <ul id="pembelian-nav" className="nav-content collapse" data-bs-parent="#sidebar-nav">
            <li>
              <Link to="/transPembelian">
                { " " }
                <i className="bi bi-circle" />
                <span>Pembelian</span>{ " " }
              </Link>
            </li>
            <li>
              <Link to="retrunPembelian">
                { " " }
                <i className="bi bi-circle" />
                <span>Retur Pembelian</span>{ " " }
              </Link>
            </li>
          </ul>
          <li className="nav-item">
            <Link className="nav-link collapsed" to={ "/cicilan" }>
              <i className="ri-wallet-line" />
              <span>Cicilan</span>
            </Link>
          </li>
        </li>
        <li className="nav-heading">Laporan</li>
        <li className="nav-item">
          <Link className="nav-link collapsed" data-bs-target="#laporan-nav" data-bs-toggle="collapse" to="#">
            { " " }
            <i className="bx bx-book-bookmark" />
            <span>Laporan</span>
            <i className="bi bi-chevron-down ms-auto" />{ " " }
          </Link>
          <ul id="laporan-nav" className="nav-content collapse" data-bs-parent="#sidebar-nav">
            <li>
              <Link to="/reportPenjualan">
                { " " }
                <i className="bx bx-cube" />
                <span>Penjualan</span>{ " " }
              </Link>
            </li>
            <li>
              <Link to="/reportPembelian">
                { " " }
                <i className="bx bx-run" />
                <span>Pembelian</span>{ " " }
              </Link>
            </li>
            <li>
              <Link to="/reportAnggota">
                { " " }
                <i className="bx bx-store" />
                <span>Anggota</span>{ " " }
              </Link>
            </li>
            <li>
              <Link to="/reportSupplier">
                { " " }
                <i className="bx bx-store" />
                <span>Supplier</span>{ " " }
              </Link>
            </li>
            <li>
              <Link to="/reportBarang">
                <i className="bx bx-store" />
                <span>Barang</span>
              </Link>
            </li>
          </ul>
        </li>
      </ul>
    </aside>
  );
};

export default SideBar;
