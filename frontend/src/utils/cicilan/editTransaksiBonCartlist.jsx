import axios from '../../api/axios'
import React from 'react'

const editTransaksiBonCartlist = async (id, jumlah) => {
    const response = await axios.put(`/penjualanBonJoin/${id}`, {
        jumlah
    })
    return response.data.msg
}

export default editTransaksiBonCartlist