import type { ReactNode } from "react";
import type { Creance, Statut } from "../types";
import { STATUT_META, STATUTS, solde } from "../types";
import {
  calcTotaux,
  effectiveStatut,
  grouperParEntite,
  isUrgente,
} from "../lib/selectors";
import { daysFromToday, fcfa, fmtDate, pct, relativeLabel } from "../lib/format";
import DonutChart from "./DonutChart";
import type { StatutStats } from "./DonutChart";
import { StatutBadge, useCountUp } from "./ui";
import {
  IconAlert,
  IconArrowRight,
  IconBanknote,
  IconBell,
  IconCheck,
  IconInfo,
  IconList,
  IconPie,
  IconTrendUp,
  IconWallet,
} from "./icons";

/* ------------------------------- Carte KPI ------------------------------- */

const TONES = {
  blue: {
    bar: "#2560b0",
    chip: "bg-brand-100 text-brand-700",
    value: "text-brand-950",
    progress: "#2560b0",
    link: "text-brand-600",
  },
  green: {
    bar: "#059669",
    chip: "bg-emerald-100 text-emerald-700",
    value: "text-emerald-700",
    progress: "#059669",
    link: "text-emerald-700",
  },
  red: {
    bar: "#dc2626",
    chip: "bg-red-100 text-red-700",
    value: "text-red-700",
    progress: "#dc2626",
    link: "text-red-700",
  },
} as const;

function KpiCard({
  label,
  value,
  sub,
  hint,
  icon,
  tone,
  delay,
  progress,
  onClick,
}: {
  label: string;
  value: number;
  sub: string;
  hint: string;
  icon: ReactNode;
  tone: keyof typeof TONES;
  delay: number;
  progress?: number;
  onClick: () => void;
}) {
  const v = useCountUp(value);
  const t = TONES[tone];
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${label} — ${hint}`}
      className="card card-hover p-5 relative overflow-hidden animate-fade-up text-left w-full group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
      style={{ animationDelay: `${delay}ms` }}
    >
      <span className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: t.bar }} />
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-slate-500">{label}</p>
        <span
          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110 ${t.chip}`}
        >
          {icon}
        </span>
      </div>
      <p className={`font-display text-[1.55rem] leading-tight font-bold tracking-tight mt-1.5 ${t.value}`}>
        {fcfa(v)}
      </p>
      <p className="text-xs text-slate-500 mt-1.5 font-medium">{sub}</p>
      {progress !== undefined && (
        <div className="mt-3 h-1.5 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full rounded-full transition-[width] duration-1000 ease-out"
            style={{ width: `${progress}%`, background: t.progress }}
          />
        </div>
      )}
      <p
        className={`text-[11px] font-semibold mt-2.5 flex items-center gap-1 opacity-75 group-hover:opacity-100 transition-opacity ${t.link}`}
      >
        {hint}
        <IconArrowRight className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-0.5" />
      </p>
    </button>
  );
}

function CardTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 mb-4">
      <h2 className="font-display font-semibold text-slate-900 text-[15px]">{children}</h2>
      {right}
    </div>
  );
}

/* ------------------------------ Tableau de bord ------------------------------ */

interface Props {
  creances: Creance[];
  onEdit: (c: Creance) => void;
  onRelancer: (c: Creance) => void;
  onPayer: (c: Creance) => void;
  onGoCreances: () => void;
  onGoSynthese: () => void;
  onKpiAccordees: () => void;
  onKpiRegle: () => void;
  onKpiRestantDu: () => void;
}

export default function Dashboard({
  creances,
  onEdit,
  onRelancer,
  onPayer,
  onGoCreances,
  onGoSynthese,
  onKpiAccordees,
  onKpiRegle,
  onKpiRestantDu,
}: Props) {
  const t = calcTotaux(creances);

  const parStatut = STATUTS.reduce(
    (acc, s) => ({ ...acc, [s]: { count: 0, accorde: 0, du: 0 } }),
    {} as Record<Statut, StatutStats>
  );
  creances.forEach((c) => {
    const s = effectiveStatut(c);
    parStatut[s].count += 1;
    parStatut[s].accorde += c.montantTotal;
    parStatut[s].du += solde(c);
  });

  const urgentes = creances
    .filter(isUrgente)
    .sort((a, b) => {
      const da = a.prochaineActionDate
        ? daysFromToday(a.prochaineActionDate)
        : Number.POSITIVE_INFINITY;
      const db = b.prochaineActionDate
        ? daysFromToday(b.prochaineActionDate)
        : Number.POSITIVE_INFINITY;
      return da - db;
    });

  const top = grouperParEntite(creances).filter((e) => e.du > 0).slice(0, 5);
  const maxDu = top.length > 0 ? top[0].du : 1;
  const nbEntites = new Set(creances.map((c) => c.nomClient.trim())).size;
  const avecSolde = creances.filter((c) => solde(c) > 0).length;
  const recouvrement = pct(t.regle, t.accorde);

  return (
    <div className="space-y-5">
      {/* Cartes de synthèse — cliquables */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <KpiCard
          label="Créances accordées"
          value={t.accorde}
          sub={`${creances.length} créance${creances.length > 1 ? "s" : ""} · ${nbEntites} entité${nbEntites > 1 ? "s" : ""}`}
          hint="Voir toutes les créances"
          icon={<IconWallet className="w-4.5 h-4.5" />}
          tone="blue"
          delay={0}
          onClick={onKpiAccordees}
        />
        <KpiCard
          label="Déjà réglé"
          value={t.regle}
          sub={`${recouvrement} % du total accordé`}
          hint="Voir les créances soldées"
          icon={<IconTrendUp className="w-4.5 h-4.5" />}
          tone="green"
          delay={80}
          progress={recouvrement}
          onClick={onKpiRegle}
        />
        <KpiCard
          label="Restant dû"
          value={t.du}
          sub={`${avecSolde} créance${avecSolde > 1 ? "s" : ""} avec un solde ouvert`}
          hint="Trier par solde restant dû"
          icon={<IconAlert className="w-4.5 h-4.5" />}
          tone="red"
          delay={160}
          onClick={onKpiRestantDu}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {/* Répartition par statut */}
        <div className="card p-5 lg:col-span-2 animate-fade-up" style={{ animationDelay: "220ms" }}>
          <CardTitle>Répartition par statut</CardTitle>
          <DonutChart stats={parStatut} total={creances.length} />
          <p className="text-[11px] text-slate-400 mt-3 flex items-center gap-1.5">
            <IconInfo className="w-3.5 h-3.5 shrink-0" />
            Survolez un segment — ou touchez-le — pour afficher le détail ;
            les infos disparaissent dès que le pointeur se retire.
          </p>
        </div>

        {/* Actions urgentes */}
        <div className="card p-5 lg:col-span-3 animate-fade-up" style={{ animationDelay: "280ms" }}>
          <CardTitle
            right={
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600 text-white px-2.5 py-0.5 text-xs font-bold">
                {urgentes.length}
              </span>
            }
          >
            <span className="flex items-center gap-2.5">
              <span className="relative flex w-2.5 h-2.5">
                <span
                  className={`absolute inline-flex h-full w-full rounded-full bg-red-500 ${
                    urgentes.length > 0 ? "animate-pulse-soft" : ""
                  }`}
                />
              </span>
              Actions urgentes
            </span>
          </CardTitle>

          {urgentes.length === 0 ? (
            <div className="flex flex-col items-center text-center py-8">
              <span className="w-11 h-11 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2.5">
                <IconCheck className="w-5 h-5" />
              </span>
              <p className="font-semibold text-slate-800 text-sm">Aucune action urgente</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Aucun retard, aucun contentieux, aucune échéance dépassée.
              </p>
            </div>
          ) : (
            <ul className="space-y-2.5 max-h-[380px] overflow-y-auto scroll-thin pr-1">
              {urgentes.map((c) => {
                const overdue =
                  c.prochaineActionDate && daysFromToday(c.prochaineActionDate) < 0;
                return (
                  <li
                    key={c.id}
                    className="border border-red-200 bg-red-50/80 rounded-lg p-3.5 flex flex-wrap items-center gap-x-3 gap-y-2 hover:border-red-300 hover:shadow-sm transition-all"
                  >
                    <span className="w-9 h-9 rounded-lg bg-red-600 text-white flex items-center justify-center shrink-0">
                      <IconAlert className="w-4.5 h-4.5" />
                    </span>
                    <div className="grow min-w-[170px]">
                      <p className="font-semibold text-slate-900 text-sm flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[11px] text-slate-400">{c.ref}</span>
                        {c.nomClient}
                        <StatutBadge statut={effectiveStatut(c)} />
                      </p>
                      <p className="text-xs text-slate-600 mt-1">
                        {c.prochaineActionDate ? (
                          <>
                            {c.prochaineActionTexte && (
                              <span className="font-semibold">{c.prochaineActionTexte} · </span>
                            )}
                            {fmtDate(c.prochaineActionDate)}
                            {overdue && (
                              <span className="text-red-700 font-semibold">
                                {" "}
                                — {relativeLabel(c.prochaineActionDate)}
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="font-medium text-red-700">
                            Statut critique — action à planifier
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-mono text-sm font-semibold text-red-700">{fcfa(solde(c))}</p>
                      <p className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold">
                        restant dû
                      </p>
                    </div>
                    <div className="flex gap-1.5 shrink-0 flex-wrap">
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => onPayer(c)}
                        title="Enregistrer un paiement"
                      >
                        <IconBanknote className="w-3.5 h-3.5" />
                        Payer
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => onRelancer(c)}
                        title="Incrémenter les relances et dater à aujourd'hui"
                      >
                        <IconBell className="w-3.5 h-3.5" />
                        Relancer +1
                      </button>
                      <button className="btn btn-primary btn-sm" onClick={() => onEdit(c)}>
                        Modifier
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {/* Plus gros soldes */}
        <div className="card p-5 lg:col-span-3 animate-fade-up" style={{ animationDelay: "340ms" }}>
          <CardTitle
            right={
              <button className="btn btn-ghost btn-sm" onClick={onGoSynthese}>
                <IconPie className="w-3.5 h-3.5" />
                Synthèse complète
              </button>
            }
          >
            Plus gros soldes par client
          </CardTitle>
          {top.length === 0 ? (
            <p className="text-sm text-slate-500 py-6 text-center">Toutes les créances sont soldées.</p>
          ) : (
            <ul>
              {top.map((e, i) => (
                <li key={e.nom} className="py-2.5 border-b border-slate-100 last:border-0">
                  <div className="flex justify-between gap-3 items-baseline">
                    <p className="font-semibold text-sm text-slate-800 truncate">
                      <span className="text-slate-400 font-mono text-xs mr-1.5">{i + 1}.</span>
                      {e.nom}
                    </p>
                    <p className="font-mono text-sm font-semibold text-slate-900 whitespace-nowrap">
                      {fcfa(e.du)}
                    </p>
                  </div>
                  <div className="mt-1.5 flex items-center gap-2.5">
                    <div className="h-1.5 grow rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-brand-500 rounded-full transition-[width] duration-700 ease-out"
                        style={{ width: `${Math.max((e.du / maxDu) * 100, 3)}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">
                      {e.count} créance{e.count > 1 ? "s" : ""}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Raccourcis */}
        <div className="card p-5 lg:col-span-2 animate-fade-up" style={{ animationDelay: "400ms" }}>
          <CardTitle>Raccourcis</CardTitle>
          <div className="space-y-2.5">
            <button
              className="w-full flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3.5 py-3 text-left hover:border-brand-300 hover:bg-brand-50/60 transition-all group"
              onClick={onGoCreances}
            >
              <span className="w-9 h-9 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center group-hover:bg-brand-600 group-hover:text-white transition-colors">
                <IconList className="w-4.5 h-4.5" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-slate-800">
                  Ouvrir le suivi des créances
                </span>
                <span className="block text-xs text-slate-500">
                  Paiements, relances, filtres et historique des fiches
                </span>
              </span>
            </button>
            <button
              className="w-full flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3.5 py-3 text-left hover:border-brand-300 hover:bg-brand-50/60 transition-all group"
              onClick={onGoSynthese}
            >
              <span className="w-9 h-9 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center group-hover:bg-brand-600 group-hover:text-white transition-colors">
                <IconPie className="w-4.5 h-4.5" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-slate-800">
                  Voir la synthèse par entité
                </span>
                <span className="block text-xs text-slate-500">
                  Encours consolidés client par client
                </span>
              </span>
            </button>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed mt-4 border-t border-slate-100 pt-3.5">
            Les paiements, relances et statuts sont journalisés sur chaque
            créance. Données enregistrées automatiquement sur cet appareil —
            montants en FCFA.
          </p>
        </div>
      </div>
    </div>
  );
}
