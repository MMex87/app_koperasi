// Enter di kolom jumlah keranjang penjualan = simpan (sama dengan tombol centang).
import "@testing-library/jest-dom";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { createStore } from "redux";
import rootReducer from "../../../../../redux/reducer/globalReducer";
import ActionType from "../../../../../redux/reducer/globalActionType";
import CartList from "../cartList";
import axios from "../../../../../api/axios";
import getTransPenjualanJoin from "../../../../../utils/transaksiPenjualan/getTransPenjualanJoin";
import editTransaksiCartListPenjualan from "../../../../../utils/transaksiPenjualan/editTransaksiCartListPenjualan";
import getTotalHarga from "../../../../../utils/transaksiPenjualan/getTotalHarga";

jest.mock("../../../../../api/axios", () => ({ get: jest.fn(), post: jest.fn(), put: jest.fn() }));
jest.mock("../../../../../utils/transaksiPenjualan/getTransPenjualanJoin", () => jest.fn());
jest.mock("../../../../../utils/transaksiPenjualan/editTransaksiCartListPenjualan", () => jest.fn());
jest.mock("../../../../../utils/transaksiPenjualan/hapusTransaksiPenjualan", () => jest.fn());
jest.mock("../../../../../utils/transaksiPenjualan/getTotalHarga", () => jest.fn());
jest.mock("../ModalCheckout", () => () => null);
jest.mock("sweetalert2", () => ({ fire: jest.fn(), mixin: () => ({ fire: jest.fn() }) }));

const BARIS = [{ id: 1, faktur: "FKJ-1", jumlah: 2, harga: 8000, statusPenjualan: "onProcess", anggota: { nama: "Budi" }, typePembayaran: "Tunai", barang: { id: 3, nama: "Aqua", hargaJual: 4000 } }];

beforeEach(() => {
  getTransPenjualanJoin.mockResolvedValue(BARIS);
  getTotalHarga.mockResolvedValue(8000);
  editTransaksiCartListPenjualan.mockResolvedValue({});
  axios.get.mockResolvedValue({ data: { jumlah: 10 } });
});

const render_ = async () => {
  const store = createStore(rootReducer);
  store.dispatch({ type: ActionType.SET_FAKTUR_PENJUALAN, index: "FKJ-1" });
  render(
    <Provider store={store}>
      <CartList />
    </Provider>
  );
  await act(() => new Promise((r) => setTimeout(r, 20)));
  fireEvent.click(screen.getByTitle("Ubah jumlah"));
  await act(() => new Promise((r) => setTimeout(r, 20)));
};

test("Enter di kolom jumlah menyimpan perubahan keranjang", async () => {
  await render_();
  const jumlah = document.querySelector("tbody input[type=number]");

  fireEvent.change(jumlah, { target: { value: "4" } });
  fireEvent.keyDown(jumlah, { key: "Enter", code: "Enter" });
  await act(() => new Promise((r) => setTimeout(r, 20)));

  expect(editTransaksiCartListPenjualan).toHaveBeenCalledWith({ id: 1, jumlah: 4, harga: 16000 });
});

test("Enter ditolak jika jumlah melebihi stok", async () => {
  await render_();
  const jumlah = document.querySelector("tbody input[type=number]");

  fireEvent.change(jumlah, { target: { value: "99" } });
  fireEvent.keyDown(jumlah, { key: "Enter", code: "Enter" });
  await act(() => new Promise((r) => setTimeout(r, 20)));

  expect(editTransaksiCartListPenjualan).not.toHaveBeenCalled();
});
