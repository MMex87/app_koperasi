import axios from "../../api/axios";

const getTransPenjualanJoinLaporan = async (supplier, limit) => {
    const response = await axios.get(`/transPenjualanJoinLaporan?supplier=${supplier}&limit=${limit}`);

    return response.data;
}

export default getTransPenjualanJoinLaporan