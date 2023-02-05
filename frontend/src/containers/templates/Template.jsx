import React from 'react'
import { Outlet } from 'react-router-dom'
import Footer from '../organisms/footer'
import Header from '../organisms/header'
import SideBar from '../organisms/sidebar'


const Template = () => {
    return (
        <>
            <Header />
            <Outlet />
            <SideBar />
            <Footer />
        </>
    )
}


export default Template