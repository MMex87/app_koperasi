import axios from '../../api/axios'
import React from 'react'

const getTransaksiBon = async () => {
    const response = await axios.get('/penjualanBonJoin')
    return response.data
}

export default getTransaksiBon