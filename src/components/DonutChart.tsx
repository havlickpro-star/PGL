import { useEffect, useState } from "react";
import type { Statut } from "../types";
import { STATUTS, STATUT_META } from "../types";
import { fcfa, pct } from "../lib/format";

export interface StatutStats {
  count: number;
  accorde: number;
  du: number;
}

interface Props {
  stats: Record<Statut, StatutStats>;
  total: number;
}

/**
 * Donut de répartition par statut — interactif :
 * au survol (PC) ou au toucher (mobile), le détail du segment s'affiche
 * au centre et disparaît dès que le pointeur / le doigt se retire.
 */
export default function DonutChart({ stats, total }: Props) {
  const [on, setOn] = useState(false);
  const [settled, setSettled] = useState(false);
  const [active, setActive] = useState<Statut | null>(null);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setOn(true));
    const t = window.setTimeout(() => setSettled(true), 1400);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, []);

  const R = 62;
  const C = 2 * Math.PI * R;
  let acc = 0;
  const segs = STATUTS.filter((s) => stats[s].count > 0).map((s, i) => {
    const frac = total > 0 ? stats[s].count / total : 0;
    const seg = { s, frac, off: acc, i };
    acc += frac;
    return seg;
  });

  const info = active ? stats[active] : null;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-5 w-full">
      <div className="relative w-44 h-44 shrink-0 select-none">
        <svg
          viewBox="0 0 160 160"
          className="w-full h-full"
          role="img"
          aria-label="Répartition des créances par statut"
          onClick={() => setActive(null)}
        >
          <circle cx="80" cy="80" r={R} fill="none" stroke="#e7edf6" strokeWidth="20" />
          <g transform="rotate(-90 80 80)">
            {segs.map(({ s, frac, off, i }) => {
              const isActive = active === s;
              const dim = active !== null && !isActive;
              return (
                <circle
                  key={s}
                  className="donut-seg"
                  cx="80"
                  cy="80"
                  r={R}
                  fill="none"
                  stroke={STATUT_META[s].chart}
                  strokeWidth={isActive ? 27 : 20}
                  strokeDasharray={
                    on ? `${Math.max(frac * C - 1.5, 0.5)} ${C}` : `0.5 ${C}`
                  }
                  strokeDashoffset={-(off * C)}
                  style={{
                    transitionDelay: settled ? "0ms" : `${i * 110}ms`,
                    opacity: dim ? 0.28 : 1,
                  }}
                  onPointerEnter={() => setActive(s)}
                  onPointerLeave={() => setActive(null)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActive(s);
                  }}
                >
                  <title>{`${s} : ${stats[s].count} créance${stats[s].count > 1 ? "s" : ""}`}</title>
                </circle>
              );
            })}
          </g>
        </svg>

        {/* Lecture centrale : détail du segment actif, sinon total */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {active && info ? (
            <div key={active} className="text-center px-3 animate-fade-in">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 leading-tight">
                {active}
              </p>
              <p className="font-display font-bold text-[1.65rem] text-brand-950 leading-none mt-0.5">
                {info.count}
              </p>
              <p className="text-[10px] text-slate-400 font-medium">
                {pct(info.count, total)} % du total
              </p>
              <p className="text-[9px] uppercase tracking-wide text-slate-400 font-semibold mt-1">
                reste dû
              </p>
              <p className="font-mono text-[10.5px] font-semibold text-red-700 leading-tight">
                {fcfa(info.du)}
              </p>
            </div>
          ) : (
            <div className="text-center">
              <p className="font-display font-bold text-3xl text-brand-950 leading-none">
                {total}
              </p>
              <p className="text-[10px] uppercase tracking-[0.14em] text-slate-400 font-semibold mt-1">
                créances
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Légende synchronisée avec l'anneau */}
      <ul className="grow w-full space-y-1">
        {STATUTS.map((s) => {
          const st = stats[s];
          const isActive = active === s;
          return (
            <li key={s}>
              <button
                type="button"
                onPointerEnter={() => setActive(s)}
                onPointerLeave={() => setActive(null)}
                onClick={() => setActive(s)}
                onFocus={() => setActive(s)}
                onBlur={() => setActive(null)}
                className={`flex items-center gap-2.5 text-sm w-full rounded-md px-1.5 py-1 transition-colors ${
                  isActive
                    ? "bg-brand-50 ring-1 ring-inset ring-brand-200"
                    : "hover:bg-slate-50"
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${STATUT_META[s].dot}`} />
                <span className="text-slate-600 grow truncate text-left">{s}</span>
                <span className="font-mono font-semibold text-slate-900 text-[13px]">
                  {st.count}
                </span>
                <span className="text-[11px] text-slate-400 font-medium w-10 text-right">
                  {pct(st.count, total)} %
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
