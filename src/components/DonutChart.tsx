import { useEffect, useState } from "react";
import type { Statut } from "../types";
import { STATUTS, STATUT_META } from "../types";

interface Props {
  counts: Record<Statut, number>;
  total: number;
}

/** Anneau de répartition du nombre de créances par statut. */
export default function DonutChart({ counts, total }: Props) {
  const [on, setOn] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setOn(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const R = 62;
  const C = 2 * Math.PI * R;
  let acc = 0;
  const segs = STATUTS.filter((s) => counts[s] > 0).map((s, i) => {
    const frac = total > 0 ? counts[s] / total : 0;
    const seg = { s, frac, off: acc, i };
    acc += frac;
    return seg;
  });

  return (
    <svg
      viewBox="0 0 160 160"
      className="w-40 h-40 sm:w-44 sm:h-44 shrink-0"
      role="img"
      aria-label="Répartition des créances par statut"
    >
      <circle cx="80" cy="80" r={R} fill="none" stroke="#e7edf6" strokeWidth="20" />
      <g transform="rotate(-90 80 80)">
        {segs.map(({ s, frac, off, i }) => (
          <circle
            key={s}
            className="donut-seg"
            cx="80"
            cy="80"
            r={R}
            fill="none"
            stroke={STATUT_META[s].chart}
            strokeWidth="20"
            strokeDasharray={on ? `${Math.max(frac * C - 1.5, 0.5)} ${C}` : `0.5 ${C}`}
            strokeDashoffset={-(off * C)}
            style={{ transitionDelay: `${i * 110}ms` }}
          >
            <title>{`${s} : ${counts[s]} créance${counts[s] > 1 ? "s" : ""}`}</title>
          </circle>
        ))}
      </g>
      <text
        x="80"
        y="76"
        textAnchor="middle"
        className="font-display"
        style={{
          font: "700 30px 'Space Grotesk', sans-serif",
          fill: "#0c2140",
        }}
      >
        {total}
      </text>
      <text
        x="80"
        y="96"
        textAnchor="middle"
        style={{
          font: "500 11px 'IBM Plex Sans', sans-serif",
          fill: "#64748b",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        créances
      </text>
    </svg>
  );
}
