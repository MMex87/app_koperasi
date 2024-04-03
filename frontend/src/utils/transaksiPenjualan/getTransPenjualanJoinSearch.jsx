import axios from "../../api/axios";

const getTransPenjualanJoinSearch = async (tanggal, limit, page) => {
    const response = await axios.get(`/transPenjualanJoinSearch?tanggal=${tanggal}&limit=${limit}&page=${page}`);

    return response.data;
};

export default getTransPenjualanJoinSearch;
