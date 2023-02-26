import axios from 'axios'
import React from 'react'

const getSearchSupplier = async (search, limit, page) => {
    const response = await axios.get(`/supplierSearch?search=${search}&limit=${limit}&page=${page}`)

    return response.data
}

export default getSearchSupplier