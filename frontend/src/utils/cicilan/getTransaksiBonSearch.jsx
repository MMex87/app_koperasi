import axios from '../../api/axios'
import React from 'react'

const getTransaksiBonSearch = async (search) => {
    const response = await axios.get(`/penjualanBonSearch?search=${search}`)

    return response.data
}

export default getTransaksiBonSearch