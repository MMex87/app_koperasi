import axios from "../../api/axios";

const getTransPenjualanJoinLaporan = async (supplier) => {
    const response = await axios.get(`/transPenjualanJoinLaporan?supplier=${supplier}`);

    return response.data;
}

export default getTransPenjualanJoinLaporan