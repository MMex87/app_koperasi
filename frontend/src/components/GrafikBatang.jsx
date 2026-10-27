import React, { useState } from "react";

const ringkasAngka = (v) => new Intl.NumberFormat("id-ID", { notation: "compact", maximumFractionDigits: 1 }).format(v || 0);

/*
 * Grafik batang satu seri (tanpa library) dengan tooltip saat hover. Mendukung nilai negatif:
 * batang negatif (mis. rugi) digambar di bawah garis nol dengan warna merah.
 * data: [{ label, labelPanjang, nilai, info }] — info = baris tambahan di tooltip (opsional)
 * format: fungsi format nilai untuk tooltip (mis. rupiah)
 */
const GrafikBatang = ({ data, format = (v) => v, kosong = "Belum ada data pada periode ini", tinggi = 220 }) => {
  const [aktif, setAktif] = useState(null);
  const maksPos = Math.max(0, ...data.map((d) => d.nilai));
  const maksNeg = Math.max(0, ...data.map((d) => -d.nilai));
  const rentang = (maksPos + maksNeg) * 1.1 || 1;
  const nol = (maksNeg * 1.05 * 100) / rentang; // posisi garis nol dari bawah (%)
  const persen = (v) => (Math.abs(v) * 100) / rentang;
  const garis = [maksPos, maksPos / 2, ...(maksNeg ? [-maksNeg] : [])].filter((v) => v !== 0);

  return (
    <div className="gb-wrap">
      <div className="gb-area" style={{ height: tinggi }}>
        {maksPos === 0 && maksNeg === 0 && <div className="gb-empty text-muted small">{kosong}</div>}
        {garis.map((g) => (
          <div key={g} className="gb-grid" style={{ bottom: `${nol + (g > 0 ? persen(g) : -persen(g))}%` }}>
            <span>{ringkasAngka(g)}</span>
          </div>
        ))}
        {maksNeg > 0 && <div className="gb-nol" style={{ bottom: `${nol}%` }} />}
        <div className="gb-bars">
          {data.map((d, i) => (
            <div key={d.label} className="gb-col" onMouseEnter={() => setAktif(i)} onMouseLeave={() => setAktif(null)}>
              {aktif === i && (
                <div className="gb-tooltip shadow-sm">
                  <div className="fw-semibold">{d.labelPanjang || d.label}</div>
                  <div className={d.nilai < 0 ? "text-danger" : ""}>{format(d.nilai)}</div>
                  {d.info && <div className="text-muted">{d.info}</div>}
                </div>
              )}
              <div
                className={`gb-bar ${d.nilai < 0 ? "negatif" : ""} ${aktif === i ? "active" : ""}`}
                style={d.nilai < 0 ? { top: `${100 - nol}%`, height: `${persen(d.nilai)}%` } : { bottom: `${nol}%`, height: `${persen(d.nilai)}%` }}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="gb-labels">
        {data.map((d) => (
          <span key={d.label}>{d.label}</span>
        ))}
      </div>

      <style>{`
        .gb-wrap { padding-left: 44px; }
        .gb-area { position: relative; border-bottom: 1px solid var(--bs-border-color); }
        .gb-grid { position: absolute; left: 0; right: 0; border-top: 1px dashed var(--bs-border-color); }
        .gb-grid span { position: absolute; left: -44px; top: -.6rem; width: 40px; text-align: right; font-size: .7rem; color: var(--bs-secondary-color); }
        .gb-nol { position: absolute; left: 0; right: 0; border-top: 1px solid #adb5bd; }
        .gb-bars { position: absolute; inset: 0; display: flex; gap: 2px; }
        .gb-col { position: relative; flex: 1; height: 100%; cursor: default; }
        .gb-bar {
          position: absolute; left: 20%; width: 60%; max-width: 44px; min-height: 2px;
          background: var(--bs-primary); opacity: .75; border-radius: 4px 4px 0 0;
          transition: height .4s ease, opacity .15s ease;
        }
        .gb-bar.negatif { background: var(--bs-danger); border-radius: 0 0 4px 4px; }
        .gb-bar.active { opacity: 1; }
        .gb-tooltip {
          position: absolute; left: 50%; transform: translate(-50%, 0); top: 0;
          background: var(--bs-body-bg); border: 1px solid var(--bs-border-color); border-radius: 8px;
          padding: .4rem .6rem; font-size: .75rem; white-space: nowrap; z-index: 2; pointer-events: none;
        }
        .gb-empty { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }
        .gb-labels { display: flex; gap: 2px; margin-top: .4rem; }
        .gb-labels span { flex: 1; text-align: center; font-size: .75rem; color: var(--bs-secondary-color); text-transform: capitalize; }
      `}</style>
    </div>
  );
};

export default GrafikBatang;
