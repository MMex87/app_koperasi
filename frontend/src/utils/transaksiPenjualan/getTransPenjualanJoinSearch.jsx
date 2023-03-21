import axios from "../../api/axios";

const getTransPenjualanJoinSearch = async (search, limit, page) => {
    const response = await axios.get(`/transPenjualanJoinSearch?search=${search}&limit=${limit}&page=${page}`);

    return response.data;
};

export default getTransPenjualanJoinSearch;
