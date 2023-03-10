import React from 'react'
import axios from '../../api/axios'

const hapusTransaksiPembelian = async (val) => {
    const response = await axios.delete(`/transPembelian/${val}`)

    return response.data
}

export default hapusTransaksiPembelian