// Enter di kolom edit keranjang pembelian = simpan.
import "@testing-library/jest-dom";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { createStore } from "redux";
import rootReducer from "../../../../../redux/reducer/globalReducer";
import ActionType from "../../../../../redux/reducer/globalActionType";
import CartList from "../cartList";
import getTransPembelianJoin from "../../../../../utils/transaksiPembelian/getTransPembelianJoin";
import editTransaksiCartListPembelian from "../../../../../utils/transaksiPembelian/editTransaksiCartListPembelian";

jest.mock("../../../../../utils/transaksiPembelian/getTransPembelianJoin", () => jest.fn());
jest.mock("../../../../../utils/transaksiPembelian/editTransaksiCartListPembelian", () => jest.fn());
jest.mock("../../../../../utils/transaksiPembelian/hapusTransaksiPembelian", () => jest.fn());
jest.mock("sweetalert2", () => ({ fire: jest.fn(), mixin: () => ({ fire: jest.fn() }) }));

const BARIS = [{ id: 1, faktur: "FKB-1", jumlah: 2, harga: 3000, hargaJual: 4000, statusPembelian: "onProcess", supplierId: 1, supplier: { nama: "Sumber" }, barang: { nama: "Teh", hargaJual: 4000 } }];

beforeEach(() => {
  getTransPembelianJoin.mockResolvedValue(BARIS);
  editTransaksiCartListPembelian.mockResolvedValue({});
});

const render_ = async () => {
  const store = createStore(rootReducer);
  store.dispatch({ type: ActionType.SET_FAKTUR_PEMBELIAN, index: "FKB-1" });
  render(
    <Provider store={store}>
      <CartList />
    </Provider>
  );
  await act(() => new Promise((r) => setTimeout(r, 20)));
  fireEvent.click(screen.getByTitle("Ubah"));
};

test("Enter di kolom jumlah menyimpan perubahan keranjang", async () => {
  await render_();
  const jumlah = document.querySelector("tbody input[type=number]");

  fireEvent.change(jumlah, { target: { value: "5" } });
  fireEvent.keyDown(jumlah, { key: "Enter", code: "Enter" });
  await act(() => new Promise((r) => setTimeout(r, 20)));

  expect(editTransaksiCartListPembelian).toHaveBeenCalledWith({ id: 1, jumlah: 5, harga: 3000, hargaJual: 4000 });
});

test("tombol Enter selain Enter tidak menyimpan", async () => {
  await render_();
  const jumlah = document.querySelector("tbody input[type=number]");

  fireEvent.keyDown(jumlah, { key: "a", code: "KeyA" });
  await act(() => new Promise((r) => setTimeout(r, 20)));

  expect(editTransaksiCartListPembelian).not.toHaveBeenCalled();
});
