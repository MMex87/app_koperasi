import React from 'react'
import axios from '../../api/axios'

const getTotalHarga = async (val) => {
    const response = await axios.get(`/totalHargaPenjualan/${val}`)

    return response.data.total
}

export default getTotalHarga