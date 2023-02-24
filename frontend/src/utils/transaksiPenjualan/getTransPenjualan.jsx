import React from 'react'
import axios from "../../api/axios"

const getTransPenjualan = async () => {
    const response = await axios.get('/transPenjualan')
    return response.data
}

export default getTransPenjualan