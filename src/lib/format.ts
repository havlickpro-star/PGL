const nf = new Intl.NumberFormat("fr-FR");

/** Montant en FCFA, ex. « 1 350 000 FCFA » */
export function fcfa(n: number): string {
  return `${nf.format(Math.round(n))} FCFA`;
}

/** Nombre seul, ex. « 1 350 000 » */
export function num(n: number): string {
  return nf.format(Math.round(n));
}

/** ISO yyyy-mm-dd → jj/mm/aaaa */
export function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const p = iso.split("-");
  if (p.length !== 3) return iso;
  return `${p[2]}/${p[1]}/${p[0]}`;
}

export function todayISO(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const j = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${j}`;
}

/** Nombre de jours entre aujourd'hui et la date (négatif = dépassée). */
export function daysFromToday(iso: string): number {
  const t = new Date(todayISO() + "T00:00:00").getTime();
  const d = new Date(iso + "T00:00:00").getTime();
  return Math.round((d - t) / 86400000);
}

/** Libellé relatif : « dépassée de 12 j », « aujourd'hui », « dans 3 j ». */
export function relativeLabel(iso: string): string {
  const d = daysFromToday(iso);
  if (d < 0) return `dépassée de ${-d} j`;
  if (d === 0) return "aujourd'hui";
  return `dans ${d} j`;
}

export function dateLongue(): string {
  return new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function pct(part: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((part / total) * 100);
}
