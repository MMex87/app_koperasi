// Modal edit faktur penjualan: simpan hanya aktif jika alasan & perubahan valid; payload sesuai.
import "@testing-library/jest-dom";
import { act, fireEvent, render, screen } from "@testing-library/react";
import axios from "../../../../api/axios";
import EditFakturModal from "../EditFakturModal";
import { kirimEditFaktur } from "../../../../utils/transaksiPenjualan/editFaktur";

jest.mock("../../../../api/axios", () => ({ get: jest.fn(), post: jest.fn(), put: jest.fn() }));
jest.mock("../../../../utils/barang/getBarangJoinAutoComplate", () => jest.fn(() => Promise.resolve([])));
jest.mock("../../../../utils/transaksiPenjualan/editFaktur", () => ({ kirimEditFaktur: jest.fn() }));
jest.mock("sweetalert2", () => ({ fire: jest.fn() }));

const ROWS = [{ id: 1, barangId: 1, jumlah: 2, harga: 6000, statusPenjualan: "Selesai", barang: { nama: "Kopi" } }];

beforeEach(() => {
  axios.get.mockResolvedValue({ data: ROWS });
  kirimEditFaktur.mockResolvedValue({ data: { msg: "Faktur berhasil diedit" } });
  window.bootstrap = { Modal: { getOrCreateInstance: jest.fn(() => ({ show: jest.fn(), hide: jest.fn() })), getInstance: jest.fn(() => null) } };
});

const render_ = async () => {
  const onSelesai = jest.fn();
  render(<EditFakturModal faktur="F1" onSelesai={onSelesai} />);
  await act(() => new Promise((r) => setTimeout(r, 20)));
  return onSelesai;
};

test("Simpan tidak aktif sebelum alasan diisi", async () => {
  await render_();
  expect(screen.getByRole("button", { name: /simpan perubahan/i })).toBeDisabled();
});

// Dialog PIN admin (SweetAlert) harus bisa diketik: fokus tidak boleh dijebak modal edit
test("modal dibuka tanpa jebakan fokus agar dialog PIN admin bisa diisi", async () => {
  await render_();
  expect(window.bootstrap.Modal.getOrCreateInstance).toHaveBeenCalledWith(expect.any(HTMLElement), { focus: false });
});

test("ubah jumlah + alasan valid: Simpan aktif dan mengirim keadaan akhir faktur", async () => {
  await render_();

  fireEvent.change(document.querySelector("tbody input[type=number]"), { target: { value: "3" } });
  fireEvent.change(document.querySelector("textarea"), { target: { value: "Qty salah input" } });

  const tombol = screen.getByRole("button", { name: /simpan perubahan/i });
  expect(tombol).not.toBeDisabled();
  fireEvent.click(tombol);
  await act(() => new Promise((r) => setTimeout(r, 20)));

  expect(kirimEditFaktur).toHaveBeenCalledWith("F1", "Qty salah input", [{ id: 1, barangId: 1, jumlah: 3 }]);
});

test("tanpa perubahan jumlah, Simpan tetap nonaktif walau alasan sudah diisi", async () => {
  await render_();

  fireEvent.change(document.querySelector("textarea"), { target: { value: "Qty salah input" } });

  expect(screen.getByRole("button", { name: /simpan perubahan/i })).toBeDisabled();
});
