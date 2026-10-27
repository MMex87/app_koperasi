import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ambilSesiAdmin, keluarAdmin, EVENT_SESI_ADMIN } from "../../../utils/adminSession";

const formatTanggal = (d) => d.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
const formatJam = (d) => d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

const Header = () => {
  const [sekarang, setSekarang] = useState(new Date());
  const [sesiAdmin, setSesiAdmin] = useState(ambilSesiAdmin);

  useEffect(() => {
    // Jam diperbarui tiap 15 detik; sekalian cek sesi admin yang kedaluwarsa
    const timer = setInterval(() => {
      setSekarang(new Date());
      setSesiAdmin(ambilSesiAdmin());
    }, 15000);
    const perbaruiSesi = () => setSesiAdmin(ambilSesiAdmin());
    window.addEventListener(EVENT_SESI_ADMIN, perbaruiSesi);
    return () => {
      clearInterval(timer);
      window.removeEventListener(EVENT_SESI_ADMIN, perbaruiSesi);
    };
  }, []);

  // Sidebar tersembunyi di bawah 1200px; kelas toggle-sidebar pada body memunculkannya (CSS template)
  const toggleSidebar = () => document.body.classList.toggle("toggle-sidebar");

  return (
    <header id="header" className="header fixed-top d-flex align-items-center app-header">
      {/* Bukan .toggle-sidebar-btn agar tidak ikut di-bind assets/js/main.js (bisa toggle dua kali) */}
      <button type="button" className="btn btn-link d-xl-none p-0 me-2 lh-1 header-menu-btn" onClick={toggleSidebar} aria-label="Buka menu">
        <i className="bi bi-list" />
      </button>

      <Link to="/" className="header-brand d-flex align-items-center text-decoration-none">
        <img src={"/assets/img/logo_koperasi.png"} alt="Logo koperasi" />
        <div className="lh-sm">
          <div className="brand-nama">Caffee</div>
          <div className="brand-sub d-none d-sm-block">Koperasi Karyawan Harta Wijaya</div>
        </div>
      </Link>

      <div className="ms-auto d-flex align-items-center gap-3 pe-3">
        {sesiAdmin && (
          <button type="button" className="btn btn-sm admin-pill d-flex align-items-center gap-2" title="Klik untuk keluar dari mode admin" onClick={keluarAdmin}>
            <i className="bi bi-shield-lock-fill" />
            <span className="d-none d-md-inline">Mode Admin · {sesiAdmin.operator}</span>
            <i className="bi bi-box-arrow-right" />
          </button>
        )}
        <div className="header-waktu text-end d-none d-md-block">
          <div className="jam">{formatJam(sekarang)}</div>
          <div className="tanggal">{formatTanggal(sekarang)}</div>
        </div>
      </div>

      <style>{`
        .app-header { padding-left: 16px; border-bottom: 1px solid #eef1f7; box-shadow: 0 2px 12px rgba(1, 41, 112, .06); }
        .app-header .header-menu-btn { font-size: 1.9rem; color: #012970; }
        .app-header .header-brand { gap: 10px; }
        @media (min-width: 1200px) {
          .app-header .header-brand { width: 204px; }
        }
        .app-header .header-brand img { height: 38px; width: auto; }
        .app-header .brand-nama { font-family: "Nunito", sans-serif; font-weight: 800; font-size: 1.35rem; color: #012970; letter-spacing: .2px; }
        .app-header .brand-sub { font-size: .7rem; color: #6c7a96; white-space: nowrap; }
        .app-header .header-waktu .jam { font-weight: 700; font-size: 1.05rem; color: #012970; line-height: 1.1; }
        .app-header .header-waktu .tanggal { font-size: .72rem; color: #6c7a96; }
        .app-header .admin-pill {
          background: rgba(220, 53, 69, .1); color: #b02a37; border: 1px solid rgba(220, 53, 69, .25);
          border-radius: 999px; padding: .3rem .8rem; font-weight: 600;
        }
        .app-header .admin-pill:hover { background: rgba(220, 53, 69, .18); color: #b02a37; }
      `}</style>
    </header>
  );
};

export default Header;
