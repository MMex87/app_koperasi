import React from 'react'
import axios from '../../api/axios'

const getSearchBarang = async (search, limit, page) => {
    const response = await axios.get(`/barangSearch?search=${search}&limit=${limit}&page=${page}`)
    return response.data
}

export default getSearchBarang