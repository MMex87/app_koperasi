import axios from "../../api/axios";

const getTransPenjualanJoin = async () => {
  const response = await axios.get("/transPenjualanJoin");

  return response.data;
};

export default getTransPenjualanJoin;