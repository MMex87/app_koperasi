import axios from "axios";

const getPembelian = async () => {
  const response = await axios.get("/transPembelian");
  return response.data;
};

export default getPembelian;
