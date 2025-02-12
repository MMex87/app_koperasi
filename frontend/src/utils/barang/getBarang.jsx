import axios from "../../api/axios";

const getBarang = async () => {
  const response = await axios.get("/barang");
  return response.data;
};
export const findBarang = async (kodeBarang, idSupplier) => {
  const response = await axios.get(
    "/cariBarang?supplierId=" + idSupplier + "&kodeBarang=" + kodeBarang
  );
  return response.data;
};

export default getBarang;