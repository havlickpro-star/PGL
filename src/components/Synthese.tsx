import type { Creance } from "../types";
import { calcTotaux, grouperParEntite } from "../lib/selectors";
import { fcfa, pct } from "../lib/format";
import { EmptyState, TypeChip, useCountUp } from "./ui";
import { IconPie } from "./icons";

function MiniBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-24 rounded-full bg-slate-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-[width] duration-700 ease-out ${
            value >= 100 ? "bg-emerald-500" : value > 0 ? "bg-brand-500" : "bg-slate-300"
          }`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
      <span className="text-xs font-mono font-semibold text-slate-600 w-10">
        {value} %
      </span>
    </div>
  );
}

export default function Synthese({
  creances,
  onNew,
}: {
  creances: Creance[];
  onNew: () => void;
}) {
  const entites = grouperParEntite(creances);
  const t = calcTotaux(creances);
  const recouvrement = useCountUp(pct(t.regle, t.accorde));

  if (entites.length === 0) {
    return (
      <EmptyState
        title="Aucune entité pour le moment"
        hint="Ajoutez votre première créance : la synthèse par client se construira automatiquement."
        action={
          <button className="btn btn-primary" onClick={onNew}>
            Ajouter une créance
          </button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Bandeau de synthèse */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <div className="card px-4 py-3.5 animate-fade-up">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-slate-400">
            Entités suivies
          </p>
          <p className="font-display text-xl font-bold text-slate-900 mt-0.5">
            {entites.length}
          </p>
        </div>
        <div className="card px-4 py-3.5 animate-fade-up" style={{ animationDelay: "60ms" }}>
          <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-slate-400">
            Créances cumulées
          </p>
          <p className="font-display text-xl font-bold text-slate-900 mt-0.5">
            {creances.length}
          </p>
        </div>
        <div className="card px-4 py-3.5 animate-fade-up" style={{ animationDelay: "120ms" }}>
          <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-slate-400">
            Reste à encaisser
          </p>
          <p className="font-display text-xl font-bold text-red-700 mt-0.5">
            {fcfa(t.du)}
          </p>
        </div>
        <div className="card px-4 py-3.5 animate-fade-up" style={{ animationDelay: "180ms" }}>
          <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-slate-400">
            Taux de recouvrement
          </p>
          <p className="font-display text-xl font-bold text-emerald-700 mt-0.5">
            {Math.round(recouvrement)} %
          </p>
        </div>
      </div>

      {/* Tableau desktop */}
      <div
        className="hidden md:block card overflow-hidden animate-fade-up"
        style={{ animationDelay: "220ms" }}
      >
        <div className="overflow-x-auto scroll-thin">
          <table className="w-full text-sm min-w-[860px] border-separate border-spacing-0">
            <thead>
              <tr>
                {["Entité", "Créances", "Total accordé", "Déjà réglé", "Solde dû", "Recouvrement"].map(
                  (h, i) => (
                    <th
                      key={h}
                      className={`px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50 border-b border-slate-200 whitespace-nowrap ${
                        i >= 1 && i <= 4 ? "text-right" : "text-left"
                      }`}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {entites.map((e) => (
                <tr
                  key={e.nom}
                  className="hover:bg-brand-50/50 transition-colors"
                >
                  <td className="px-4 py-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <p className="font-semibold text-slate-900">{e.nom}</p>
                      <TypeChip type={e.type} />
                    </div>
                    {(e.adresse || e.telephone) && (
                      <p className="text-xs text-slate-400 mt-0.5">
                        {[e.adresse, e.telephone].filter(Boolean).join(" · ")}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 border-b border-slate-100 text-right font-mono font-semibold text-slate-700">
                    {e.count}
                  </td>
                  <td className="px-4 py-3 border-b border-slate-100 text-right font-mono text-slate-700">
                    {fcfa(e.total)}
                  </td>
                  <td className="px-4 py-3 border-b border-slate-100 text-right font-mono text-emerald-700">
                    {fcfa(e.regle)}
                  </td>
                  <td
                    className={`px-4 py-3 border-b border-slate-100 text-right font-mono font-semibold ${
                      e.du > 0 ? "text-red-700" : "text-slate-400"
                    }`}
                  >
                    {fcfa(e.du)}
                  </td>
                  <td className="px-4 py-3 border-b border-slate-100">
                    <MiniBar value={pct(e.regle, e.total)} />
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-brand-950 text-white">
                <td className="px-4 py-3.5 font-display font-bold text-sm tracking-wide">
                  TOTAL GÉNÉRAL
                </td>
                <td className="px-4 py-3.5 text-right font-mono font-bold">
                  {creances.length}
                </td>
                <td className="px-4 py-3.5 text-right font-mono font-bold">
                  {fcfa(t.accorde)}
                </td>
                <td className="px-4 py-3.5 text-right font-mono font-bold text-emerald-300">
                  {fcfa(t.regle)}
                </td>
                <td className="px-4 py-3.5 text-right font-mono font-bold text-red-300">
                  {fcfa(t.du)}
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-24 rounded-full bg-white/15 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-400 transition-[width] duration-700"
                        style={{ width: `${pct(t.regle, t.accorde)}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-300">
                      {pct(t.regle, t.accorde)} %
                    </span>
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Cartes mobile */}
      <div className="md:hidden space-y-3">
        {entites.map((e, i) => (
          <div
            key={e.nom}
            className="card p-4 animate-fade-up"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-display font-semibold text-slate-900">
                  {e.nom}
                </p>
                <TypeChip type={e.type} />
              </div>
              <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 rounded-full px-2 py-0.5">
                {e.count} créance{e.count > 1 ? "s" : ""}
              </span>
            </div>
            {(e.adresse || e.telephone) && (
              <p className="text-xs text-slate-400 mt-1">
                {[e.adresse, e.telephone].filter(Boolean).join(" · ")}
              </p>
            )}
            <div className="grid grid-cols-3 gap-2 mt-3">
              <div className="rounded-lg bg-slate-50 px-2.5 py-2">
                <p className="text-[10px] font-bold uppercase text-slate-400">
                  Accordé
                </p>
                <p className="font-mono text-[13px] font-semibold text-slate-800 mt-0.5">
                  {fcfa(e.total)}
                </p>
              </div>
              <div className="rounded-lg bg-emerald-50 px-2.5 py-2">
                <p className="text-[10px] font-bold uppercase text-emerald-600/70">
                  Réglé
                </p>
                <p className="font-mono text-[13px] font-semibold text-emerald-700 mt-0.5">
                  {fcfa(e.regle)}
                </p>
              </div>
              <div className="rounded-lg bg-red-50 px-2.5 py-2">
                <p className="text-[10px] font-bold uppercase text-red-600/70">
                  Reste dû
                </p>
                <p className="font-mono text-[13px] font-semibold text-red-700 mt-0.5">
                  {fcfa(e.du)}
                </p>
              </div>
            </div>
            <div className="mt-3">
              <MiniBar value={pct(e.regle, e.total)} />
            </div>
          </div>
        ))}

        {/* Total mobile */}
        <div className="rounded-xl bg-brand-950 text-white p-4 animate-fade-up shadow-lg">
          <div className="flex items-center gap-2">
            <IconPie className="w-4 h-4 text-brand-300" />
            <p className="font-display font-bold text-sm tracking-wide">
              TOTAL GÉNÉRAL
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-3">
            <div>
              <p className="text-[10px] font-bold uppercase text-brand-300">
                Accordé
              </p>
              <p className="font-mono text-[13px] font-semibold mt-0.5">
                {fcfa(t.accorde)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-emerald-300">
                Réglé
              </p>
              <p className="font-mono text-[13px] font-semibold text-emerald-300 mt-0.5">
                {fcfa(t.regle)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-red-300">
                Reste dû
              </p>
              <p className="font-mono text-[13px] font-semibold text-red-300 mt-0.5">
                {fcfa(t.du)}
              </p>
            </div>
          </div>
          <div className="mt-3 h-1.5 rounded-full bg-white/15 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-400 transition-[width] duration-700"
              style={{ width: `${pct(t.regle, t.accorde)}%` }}
            />
          </div>
          <p className="text-[11px] text-brand-300 mt-1.5 font-medium">
            {pct(t.regle, t.accorde)} % du total accordé déjà recouvré
          </p>
        </div>
      </div>
    </div>
  );
}
