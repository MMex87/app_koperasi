import React from 'react'
import axios from '../../api/axios'

const hapusBarang = async (val) => {
    const response = await axios.delete(`/barang/${val}`)

    return response.data
}

export default hapusBarang