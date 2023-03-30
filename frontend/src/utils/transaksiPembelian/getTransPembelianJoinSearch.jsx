import React from 'react'
import axios from '../../api/axios';

const getTransPembelianJoinSearch = async (search, limit, page) => {
    const response = await axios.get(`/transPembelianJoinSearch?search=${search}&limit=${limit}&page=${page}`);

    return response.data;
};

export default getTransPembelianJoinSearch