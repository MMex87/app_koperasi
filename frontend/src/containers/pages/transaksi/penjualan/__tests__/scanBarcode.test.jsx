// Simulasi scanner barcode di halaman kasir: scanner mengetik kode sangat cepat lalu mengirim Enter.
import "@testing-library/jest-dom";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { createStore } from "redux";
import rootReducer from "../../../../../redux/reducer/globalReducer";
import ActionType from "../../../../../redux/reducer/globalActionType";
import TransPenjualan from "../index";
import axios from "../../../../../api/axios";
import getBarangJoin from "../../../../../utils/barang/getBarangJoin";
import getBarangJoinAutoComplate from "../../../../../utils/barang/getBarangJoinAutoComplate";
import getAnggotaAutoComplate from "../../../../../utils/anggota/getAnggotaAutoComplate";
import getTransPenjualanJoin from "../../../../../utils/transaksiPenjualan/getTransPenjualanJoin";
import Swal from "sweetalert2";

jest.mock("../../../../../api/axios", () => ({ get: jest.fn(), post: jest.fn(), put: jest.fn() }));
jest.mock("../../../../../utils/barang/getBarangJoin", () => jest.fn());
jest.mock("../../../../../utils/barang/getBarangJoinAutoComplate", () => jest.fn());
jest.mock("../../../../../utils/anggota/getAnggotaAutoComplate", () => jest.fn());
jest.mock("../../../../../utils/transaksiPenjualan/getTransPenjualanJoin", () => jest.fn());
jest.mock("../cartList", () => () => null);
jest.mock("../addCartManual", () => () => null);
jest.mock("sweetalert2", () => ({ fire: jest.fn() }));

const BARANG = [
  { id: 1, nama: "Aqua 600ml", kodeBarang: "8991234567890", hargaJual: 4000, jumlah: 50, supplierId: 2 },
  { id: 2, nama: "Indomie Goreng", kodeBarang: "8998866200301", hargaJual: 3500, jumlah: 1, supplierId: 2 },
  // Barcode sama dipakai dua barang (ada di data nyata): yang stok 0 tidak boleh terpilih
  { id: 5, nama: "Potabee lama", kodeBarang: "8998866202664", hargaJual: 9000, jumlah: 0, supplierId: 1 },
  { id: 6, nama: "Potabee", kodeBarang: "8998866202664", hargaJual: 9000, jumlah: 4, supplierId: 1 },
  { id: 4, nama: "Obat Batuk", kodeBarang: "90MD267013011005912803", hargaJual: 12000, jumlah: 5, supplierId: 2 },
];

// Backend palsu: keranjang onProcess disimpan di memori, setiap request diberi jeda seperti jaringan
let keranjang;
let stok;
const jeda = (data) => new Promise((r) => setTimeout(() => r({ data }), 15));

beforeEach(() => {
  keranjang = [];
  stok = { 1: 50, 2: 1, 4: 5, 5: 0, 6: 4 };
  // CRA mengaktifkan resetMocks, jadi implementasi mock diisi ulang setiap test
  getBarangJoin.mockResolvedValue(BARANG);
  getBarangJoinAutoComplate.mockResolvedValue([]);
  getAnggotaAutoComplate.mockResolvedValue([{ id: 7, nama: "Budi" }]);
  getTransPenjualanJoin.mockResolvedValue([]);
  Swal.fire.mockResolvedValue({});
  axios.get.mockImplementation((url, cfg) => {
    if (url === "/transPenjualan/on-process") return jeda(keranjang.find((k) => k.barangId === cfg.params.barangId) || null);
    const m = url.match(/^\/barang\/(\d+)$/);
    if (m) return jeda({ jumlah: stok[m[1]] });
    return jeda(null);
  });
  axios.post.mockImplementation((url, body) => {
    keranjang.push({ id: keranjang.length + 1, ...body });
    return jeda({});
  });
  axios.put.mockImplementation((url, body) => {
    Object.assign(keranjang.find((k) => `/transPenjualan/${k.id}` === url), body);
    return jeda({});
  });
});

// Scanner = satu event input per karakter, diakhiri Enter (tanpa jeda, seperti scanner USB)
const scan = (input, kode) => {
  for (const ch of kode) fireEvent.change(input, { target: { value: input.value + ch } });
  fireEvent.keyDown(input, { key: "Enter", code: "Enter" });
};

const renderKasir = async ({ anggota = "Budi" } = {}) => {
  const store = createStore(rootReducer);
  store.dispatch({ type: ActionType.SET_ANGGOTA_PENJUALAN, index: anggota });
  store.dispatch({ type: ActionType.SET_TYPE_BAYAR_PENJUALAN, index: "Tunai" });
  render(
    <Provider store={store}>
      <TransPenjualan />
    </Provider>
  );
  fireEvent.click(screen.getByRole("button", { name: /scan/i }));
  const input = await screen.findByPlaceholderText("Scan barcode barang...");
  // Tunggu daftar anggota & barang selesai dimuat (kasir sudah memilih anggota sebelum scan)
  await act(() => new Promise((r) => setTimeout(r, 50)));
  return input;
};

test("satu kali scan langsung masuk keranjang dan kolom kode kosong lagi", async () => {
  const input = await renderKasir();

  scan(input, "8991234567890");

  expect(input.value).toBe("");
  await waitFor(() => expect(keranjang).toHaveLength(1));
  expect(keranjang[0]).toMatchObject({ barangId: 1, jumlah: 1, harga: 4000, anggotaId: 7, typePembayaran: "Tunai", statusPenjualan: "onProcess" });
  await waitFor(() => expect(document.querySelector(".alert-success")).toHaveTextContent("Aqua 600ml masuk keranjang"));
  expect(Swal.fire).not.toHaveBeenCalled();
});

test("scan beruntun barang yang sama: kode tidak menempel dan tidak ada baris ganda", async () => {
  const input = await renderKasir();

  // Tiga scan berturut-turut sebelum request pertama selesai
  scan(input, "8991234567890");
  scan(input, "8991234567890");
  scan(input, "8991234567890");

  expect(input.value).toBe("");
  await waitFor(() => expect(keranjang[0]?.jumlah).toBe(3));
  expect(keranjang).toHaveLength(1);
  expect(axios.post).toHaveBeenCalledTimes(1);
  expect(keranjang[0].harga).toBe(12000);
  expect(screen.queryByText(/tidak ada di data barang/)).not.toBeInTheDocument();
});

test("scan dua barang berbeda berurutan", async () => {
  const input = await renderKasir();

  scan(input, "8991234567890");
  scan(input, "8998866200301");

  await waitFor(() => expect(keranjang).toHaveLength(2));
  expect(keranjang.map((k) => k.barangId)).toEqual([1, 2]);
});

test("barcode GS1 dengan tanda kurung & karakter GS tetap dikenali", async () => {
  const input = await renderKasir();

  scan(input, "(90)MD267013011005\x1d(91)2803");

  await waitFor(() => expect(keranjang).toHaveLength(1));
  expect(keranjang[0]).toMatchObject({ barangId: 4, harga: 12000 });
});

test("barcode dipakai dua barang: pilih yang masih ada stok", async () => {
  const input = await renderKasir();

  scan(input, "8998866202664");

  await waitFor(() => expect(keranjang).toHaveLength(1));
  expect(keranjang[0].barangId).toBe(6);
  expect(Swal.fire).not.toHaveBeenCalled();
});

test("kode tidak dikenal tidak masuk keranjang", async () => {
  const input = await renderKasir();

  scan(input, "(90)MD267013011005(91)280307");

  expect(await screen.findByText("Kode (90)MD267013011005(91)280307 tidak ada di data barang")).toBeInTheDocument();
  expect(input.value).toBe("");
  expect(document.activeElement).toBe(input);
  expect(axios.post).not.toHaveBeenCalled();
  expect(Swal.fire).not.toHaveBeenCalled();
});

test("barang yang baru ditambahkan setelah halaman dibuka tetap dikenali", async () => {
  const input = await renderKasir();
  getBarangJoin.mockResolvedValue([...BARANG, { id: 3, nama: "Teh Botol", kodeBarang: "8886008101053", hargaJual: 5000, jumlah: 10, supplierId: 2 }]);
  stok[3] = 10;

  scan(input, "8886008101053");

  await waitFor(() => expect(keranjang).toHaveLength(1));
  expect(keranjang[0]).toMatchObject({ barangId: 3, harga: 5000 });
});

test("stok tidak cukup ditolak", async () => {
  const input = await renderKasir();

  // Stok Indomie hanya 1: scan kedua harus ditolak
  scan(input, "8998866200301");
  scan(input, "8998866200301");

  await waitFor(() => expect(Swal.fire).toHaveBeenCalledWith("Gagal menambahkan data!!", expect.stringContaining("tidak cukup"), "warning"));
  expect(keranjang).toHaveLength(1);
  expect(keranjang[0].jumlah).toBe(1);
});

test("anggota belum dipilih: scan ditolak dengan pesan jelas", async () => {
  const input = await renderKasir({ anggota: "" });

  scan(input, "8991234567890");

  await waitFor(() => expect(Swal.fire).toHaveBeenCalledWith("Gagal menambahkan data!!", expect.stringContaining("anggota"), "warning"));
  expect(keranjang).toHaveLength(0);
});

test("Enter dari scanner tidak men-submit form", async () => {
  const input = await renderKasir();
  const submit = jest.fn((e) => e.preventDefault());
  input.closest("form").addEventListener("submit", submit);

  scan(input, "8991234567890");

  await waitFor(() => expect(keranjang).toHaveLength(1));
  expect(submit).not.toHaveBeenCalled();
});
