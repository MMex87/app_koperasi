import axios from "../../api/axios";

const getTransPembelian = async () => {
  const response = await axios.get("/transPembelian");

  return response.data;
};
export const cariTransaksi = async (faktur, barangId) => {
  let res = await axios.get(
    `cariPembelian?faktur=${faktur}&barangId=${barangId}`
  );

  return res.data;
};

export default getTransPembelian;