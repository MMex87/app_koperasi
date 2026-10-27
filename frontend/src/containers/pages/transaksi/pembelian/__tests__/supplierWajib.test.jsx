// Halaman pembelian utuh: supplier harus dipilih dari daftar sebelum barang bisa ditambahkan.
import "@testing-library/jest-dom";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { createStore } from "redux";
import Swal from "sweetalert2";
import rootReducer from "../../../../../redux/reducer/globalReducer";
import TransaksiPembelian from "../index";
import getSupplier from "../../../../../utils/supplier/getSupplier";
import getBarang from "../../../../../utils/barang/getBarang";
import getBarangJoin from "../../../../../utils/barang/getBarangJoin";
import getTransPembelian from "../../../../../utils/transaksiPembelian/getTransaksiPembelian";
import getTransPembelianJoin from "../../../../../utils/transaksiPembelian/getTransPembelianJoin";
import getBarangJoinAutoComplate from "../../../../../utils/barang/getBarangJoinAutoComplate";

jest.mock("../../../../../api/axios", () => ({ get: jest.fn(), post: jest.fn(), put: jest.fn() }));
jest.mock("../../../../../utils/supplier/getSupplier", () => jest.fn());
jest.mock("../../../../../utils/barang/getBarang", () => ({ __esModule: true, default: jest.fn(), findBarang: jest.fn() }));
jest.mock("../../../../../utils/barang/getBarangJoin", () => jest.fn());
jest.mock("../../../../../utils/barang/getBarangJoinAutoComplate", () => jest.fn());
jest.mock("../../../../../utils/transaksiPembelian/getTransaksiPembelian", () => ({ __esModule: true, default: jest.fn(), cariTransaksi: jest.fn() }));
jest.mock("../../../../../utils/transaksiPembelian/getTransPembelianJoin", () => jest.fn());
jest.mock("../cartList", () => () => null);
jest.mock("sweetalert2", () => ({ fire: jest.fn(), mixin: () => ({ fire: jest.fn() }) }));

beforeEach(() => {
  getSupplier.mockResolvedValue([{ id: 1, nama: "Sumber Rejeki" }]);
  getBarang.mockResolvedValue({ barang: [], count: 0 });
  getBarangJoin.mockResolvedValue([]);
  getBarangJoinAutoComplate.mockResolvedValue([]);
  getTransPembelian.mockResolvedValue([]);
  getTransPembelianJoin.mockResolvedValue([]);
});

const renderHalaman = async () => {
  const store = createStore(rootReducer);
  render(
    <Provider store={store}>
      <TransaksiPembelian />
    </Provider>
  );
  await act(() => new Promise((r) => setTimeout(r, 20)));
};

const pilihSupplier = async (teks) => {
  const inputSupplier = screen.getByPlaceholderText("Ketik nama supplier...");
  fireEvent.click(inputSupplier);
  fireEvent.change(inputSupplier, { target: { value: teks } });
  fireEvent.click(await screen.findByText("Sumber Rejeki"));
};

test("tanpa supplier: Tambah ke Daftar menampilkan peringatan dan barang tidak diproses", async () => {
  await renderHalaman();

  fireEvent.click(screen.getByRole("button", { name: /tambah ke daftar/i }));

  expect(Swal.fire).toHaveBeenCalledWith("Pilih supplier dulu", expect.any(String), "warning");
});

test("supplier diketik sebagian (belum dipilih dari daftar): peringatan tetap muncul saat Tambah ke Daftar", async () => {
  await renderHalaman();

  fireEvent.change(screen.getByPlaceholderText("Ketik nama supplier..."), { target: { value: "Sumber" } });
  expect(screen.getByText(/Pilih supplier dari daftar dulu/)).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: /tambah ke daftar/i }));
  expect(Swal.fire).toHaveBeenCalledWith("Pilih supplier dulu", expect.any(String), "warning");
});

test("nama supplier diketik lengkap tanpa dipilih dari daftar tetap ditolak", async () => {
  await renderHalaman();

  fireEvent.change(screen.getByPlaceholderText("Ketik nama supplier..."), { target: { value: "Sumber Rejeki" } });
  expect(screen.getByText(/Pilih supplier dari daftar dulu/)).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: /tambah ke daftar/i }));
  expect(Swal.fire).toHaveBeenCalledWith("Pilih supplier dulu", expect.any(String), "warning");
});

test("setelah supplier dipilih dari daftar: keterangan hilang dan kolom barang bisa diisi", async () => {
  await renderHalaman();
  await pilihSupplier("Sumber");

  expect(screen.queryByText(/Pilih supplier dari daftar dulu/)).not.toBeInTheDocument();
  expect(document.getElementById("kodeBarang")).not.toBeDisabled();
  expect(document.getElementById("namabarang")).not.toBeDisabled();
});
