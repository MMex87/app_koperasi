import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header id="header" className="header fixed-top d-flex align-items-center">
      <div className="d-flex align-items-center justify-content-between">
        <Link to="/" className="logo d-flex align-items-center">
          <img src={"assets/img/logo_koperasi.png"} />
          <span className="d-none d-lg-block">Kantin</span>
        </Link>
        <i className="bi bi-list toggle-sidebar-btn" />
      </div>
      <nav className="header-nav ms-auto">
        <ul className="d-flex align-items-center">
          <li className="nav-item d-block d-lg-none">
            <a className="nav-link nav-icon search-bar-toggle" href="#">
              <i className="bi bi-search" />
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
