import React from 'react'
import { Link } from 'react-router-dom'

const Header = () => {
    return (
        <header id="header" className="header fixed-top d-flex align-items-center">
            <div className="d-flex align-items-center justify-content-between">
                <Link to="/" className="logo d-flex align-items-center">
                    <img src={ "http://localhost:7700/assets/img/logo.png" } />
                    <span className="d-none d-lg-block">Koperasi</span>
                </Link>
                <i className="bi bi-list toggle-sidebar-btn" />
            </div>
            <div className="search-bar">
                <form className="search-form d-flex align-items-center" method="POST" action="#">
                    <input type="text" name="query" placeholder="Search" title="Enter search keyword" />
                    <button type="submit" title="Search"><i className="bi bi-search" /></button>
                </form>
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

    )
}

export default Header