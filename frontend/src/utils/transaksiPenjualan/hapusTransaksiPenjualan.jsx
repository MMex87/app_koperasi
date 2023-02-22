import React from 'react'
import axios from '../../api/axios'

const hapusTransaksiPenjualan = async (val) => {
    const response = await axios.delete(`/transPenjualan/${val}`)

    return response.data
}

export default hapusTransaksiPenjualan