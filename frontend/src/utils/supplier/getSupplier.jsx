import React from 'react'
import axios from '../../api/axios'

const getSupplier = async () => {
    const response = await axios.get('/supplier')
    return response.data
}

export default getSupplier