// Scan di pembelian membuka modal: barang terdaftar (isi jumlah) atau barang baru (isi data barang).
import "@testing-library/jest-dom";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { createStore } from "redux";
import rootReducer from "../../../../../redux/reducer/globalReducer";
import Swal from "sweetalert2";
import AddCartScan from "../addCartScan";
import getBarang from "../../../../../utils/barang/getBarang";

jest.mock("../../../../../utils/barang/getBarang", () => jest.fn());
jest.mock("sweetalert2", () => ({ fire: jest.fn() }));

const BARANG = [{ id: 1, nama: "Aqua 600ml", kodeBarang: "8991234567890", hargaBeli: 3000, hargaJual: 4000, jenisBarang: "Minuman", satuan: "Pcs", jumlah: 50 }];

let modal;

beforeEach(() => {
  getBarang.mockResolvedValue({ barang: BARANG, count: BARANG.length });
  modal = { show: jest.fn(), hide: jest.fn() };
  window.bootstrap = { Modal: { getOrCreateInstance: jest.fn(() => modal) } };
});

const renderScan = async (onTambah = jest.fn(), supplierTerpilih = true) => {
  const store = createStore(rootReducer);
  render(
    <Provider store={store}>
      <AddCartScan onTambah={onTambah} supplierTerpilih={supplierTerpilih} />
    </Provider>
  );
  await act(() => new Promise((r) => setTimeout(r, 0)));
  return document.getElementById("kodeBarangScan");
};

// Scanner = satu event input per karakter, diakhiri Enter
const scan = (input, kode) => {
  for (const ch of kode) fireEvent.change(input, { target: { value: input.value + ch } });
  fireEvent.keyDown(input, { key: "Enter", code: "Enter" });
};

test("barang terdaftar: modal dibuka dengan info restock dan tanpa field nama", async () => {
  const input = await renderScan();

  scan(input, "8991234567890");

  expect(modal.show).toHaveBeenCalledTimes(1);
  expect(await screen.findByText(/Barang terdaftar/)).toBeInTheDocument();
  expect(screen.queryByLabelText("Nama Barang")).not.toBeInTheDocument();
  expect(document.getElementById("jumlah")).toBeInTheDocument();
});

test("barang baru: modal dibuka dengan field nama untuk data barang baru", async () => {
  const input = await renderScan();

  scan(input, "8886008101053");

  expect(modal.show).toHaveBeenCalledTimes(1);
  expect(await screen.findByText("Barang Baru")).toBeInTheDocument();
  expect(screen.getByLabelText("Nama Barang")).toBeInTheDocument();
  expect(document.getElementById("jumlah")).toBeInTheDocument();
});

// Scan tidak sengaja setelah modal terbuka tidak boleh men-submit barang (Enter dari scanner)
test("Enter di dalam modal tidak menambahkan barang ke daftar", async () => {
  const onTambah = jest.fn();
  const input = await renderScan(onTambah);
  scan(input, "8991234567890");

  const jumlah = await screen.findByLabelText("Jumlah");
  fireEvent.keyDown(jumlah, { key: "Enter", code: "Enter" });

  expect(onTambah).not.toHaveBeenCalled();
});

test("belum pilih supplier: scan menampilkan peringatan dan tidak membuka modal", async () => {
  const input = await renderScan(jest.fn(), false);

  scan(input, "8991234567890");

  expect(Swal.fire).toHaveBeenCalledWith("Pilih supplier dulu", expect.any(String), "warning");
  expect(modal.show).not.toHaveBeenCalled();
  expect(input.value).toBe("");
});

test("Enter dengan kolom kosong tidak membuka modal", async () => {
  const input = await renderScan();

  fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

  expect(modal.show).not.toHaveBeenCalled();
});
