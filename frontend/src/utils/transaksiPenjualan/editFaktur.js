import axios from "../../api/axios";
import { jalankanAdmin } from "../adminSession";

// Kirim keadaan akhir faktur ke backend. items: [{ id?, barangId, jumlah }]; id = baris yang sudah ada.
// Mengembalikan response, atau null jika PIN admin dibatalkan.
export const kirimEditFaktur = (faktur, alasan, items) =>
  jalankanAdmin((headers) => axios.post("/editFakturPenjualan", { faktur, alasan, items }, { headers }), { keterangan: "Edit faktur memerlukan PIN admin." });
