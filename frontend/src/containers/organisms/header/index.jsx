import React from "react";
import { Link } from "react-router-dom";

const Header = () => {
  // Sidebar tersembunyi di bawah 1200px; kelas toggle-sidebar pada body memunculkannya (CSS template)
  const toggleSidebar = () => document.body.classList.toggle("toggle-sidebar");

  return (
    <header id="header" className="header fixed-top d-flex align-items-center">
      <div className="d-flex align-items-center justify-content-between">
        {/* Bukan .toggle-sidebar-btn agar tidak ikut di-bind assets/js/main.js (bisa toggle dua kali) */}
        <button type="button" className="btn btn-link d-xl-none p-0 me-2 lh-1 fs-2" style={{ color: "#012970" }} onClick={toggleSidebar} aria-label="Buka menu">
          <i className="bi bi-list" />
        </button>
        <Link to="/" className="logo d-flex align-items-center">
          <img src={"/assets/img/logo_koperasi.png"} alt="Logo koperasi" />
          <span className="d-none d-lg-block">Caffee</span>
        </Link>
      </div>
    </header>
  );
};

export default Header;
