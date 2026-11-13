// Tema tampilan (terang/gelap). Disimpan per browser; default mengikuti preferensi sistem.
const KUNCI_TEMA = "tema";
export const EVENT_TEMA = "tema-berubah";

export const ambilTema = () => {
  try {
    const tersimpan = localStorage.getItem(KUNCI_TEMA);
    if (tersimpan === "dark" || tersimpan === "light") return tersimpan;
  } catch (e) {
    // localStorage tidak tersedia
  }
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

export const terapkanTema = (tema) => {
  document.documentElement.setAttribute("data-theme", tema);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", tema === "dark" ? "#141a26" : "#012970");
};

export const setTema = (tema) => {
  try {
    localStorage.setItem(KUNCI_TEMA, tema);
  } catch (e) {
    // abaikan
  }
  terapkanTema(tema);
  window.dispatchEvent(new CustomEvent(EVENT_TEMA, { detail: tema }));
};
