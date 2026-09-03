import type { ReactNode } from "react";
import type { Creance, Statut } from "../types";
import { STATUT_META, STATUTS, solde } from "../types";
import {
  calcTotaux,
  effectiveStatut,
  grouperParEntite,
  isUrgente,
} from "../lib/selectors";
import { daysFromToday, fcfa, fmtDate, pct } from "../lib/format";
import { pl, useT } from "../lib/i18n";
import DonutChart from "./DonutChart";
import type { StatutStats } from "./DonutChart";
import { StatutBadge, useCountUp } from "./ui";
import {
  IconAlert,
  IconBanknote,
  IconBell,
  IconCheck,
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
  },
  green: {
    bar: "#059669",
    chip: "bg-emerald-100 text-emerald-700",
    value: "text-emerald-700",
    progress: "#059669",
  },
  red: {
    bar: "#dc2626",
    chip: "bg-red-100 text-red-700",
    value: "text-red-700",
    progress: "#dc2626",
  },
} as const;

function KpiCard({
  label,
  value,
  sub,
  icon,
  tone,
  delay,
  progress,
  actionLabel,
  onClick,
}: {
  label: string;
  value: number;
  sub: string;
  icon: ReactNode;
  tone: keyof typeof TONES;
  delay: number;
  progress?: number;
  actionLabel: string;
  onClick: () => void;
}) {
  const v = useCountUp(value);
  const t = TONES[tone];
  return (
    <button
      type="button"
      onClick={onClick}
      className="card card-hover p-5 relative overflow-hidden animate-fade-up text-left w-full group"
      style={{ animationDelay: `${delay}ms` }}
    >
      <span className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: t.bar }} />
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-slate-500">{label}</p>
        <span className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${t.chip}`}>
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
      <span className="mt-2.5 inline-flex items-center gap-1 text-[11.5px] font-bold text-brand-600 group-hover:text-brand-700">
        {actionLabel}
        <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1">→</span>
      </span>
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
  const i18n = useT();
  const { t, relLabel } = i18n;
  const tot = calcTotaux(creances);

  const stats = STATUTS.reduce(
    (acc, s) => ({ ...acc, [s]: { count: 0, accorde: 0, du: 0 } }),
    {} as Record<Statut, StatutStats>
  );
  creances.forEach((c) => {
    const st = stats[effectiveStatut(c)];
    st.count += 1;
    st.accorde += c.montantTotal;
    st.du += solde(c);
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
  const recouvrement = pct(tot.regle, tot.accorde);

  return (
    <div className="space-y-5">
      {/* Cartes de synthèse — cliquables */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <KpiCard
          label={t("kpi.granted")}
          value={tot.accorde}
          sub={`${creances.length} ${pl(creances.length, i18n, "w.credit", "w.credits")} · ${nbEntites} ${pl(nbEntites, i18n, "w.entity", "w.entities")}`}
          icon={<IconWallet className="w-4.5 h-4.5" />}
          tone="blue"
          delay={0}
          actionLabel={t("kpi.seeAll")}
          onClick={onKpiAccordees}
        />
        <KpiCard
          label={t("kpi.paid")}
          value={tot.regle}
          sub={t("kpi.paidSub", { pct: recouvrement })}
          icon={<IconTrendUp className="w-4.5 h-4.5" />}
          tone="green"
          delay={80}
          progress={recouvrement}
          actionLabel={t("kpi.seePaid")}
          onClick={onKpiRegle}
        />
        <KpiCard
          label={t("kpi.remaining")}
          value={tot.du}
          sub={`${avecSolde} ${pl(avecSolde, { t } as never, "w.credit", "w.credits")} ${t("kpi.remainingRest")}`}
          icon={<IconAlert className="w-4.5 h-4.5" />}
          tone="red"
          delay={160}
          actionLabel={t("kpi.seeRemaining")}
          onClick={onKpiRestantDu}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {/* Répartition par statut */}
        <div className="card p-5 lg:col-span-2 animate-fade-up" style={{ animationDelay: "220ms" }}>
          <CardTitle>{t("donut.title")}</CardTitle>
          <DonutChart stats={stats} total={creances.length} />
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
              {t("urgent.title")}
            </span>
          </CardTitle>

          {urgentes.length === 0 ? (
            <div className="flex flex-col items-center text-center py-8">
              <span className="w-11 h-11 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2.5">
                <IconCheck className="w-5 h-5" />
              </span>
              <p className="font-semibold text-slate-800 text-sm">{t("urgent.none")}</p>
              <p className="text-xs text-slate-500 mt-0.5">{t("urgent.noneDesc")}</p>
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
                                {" "}— {relLabel(daysFromToday(c.prochaineActionDate))}
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="font-medium text-red-700">{t("urgent.critical")}</span>
                        )}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-mono text-sm font-semibold text-red-700">{fcfa(solde(c))}</p>
                      <p className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold">
                        {t("urgent.remaining")}
                      </p>
                    </div>
                    <div className="flex gap-1.5 shrink-0 flex-wrap">
                      <button className="btn btn-ghost btn-sm" onClick={() => onPayer(c)} title={t("row.payTitle")}>
                        <IconBanknote className="w-3.5 h-3.5" />
                        {t("urgent.pay")}
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => onRelancer(c)} title={t("urgent.remindTitle")}>
                        <IconBell className="w-3.5 h-3.5" />
                        {t("urgent.remind")}
                      </button>
                      <button className="btn btn-primary btn-sm" onClick={() => onEdit(c)}>
                        {t("urgent.edit")}
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
                {t("top.synthese")}
              </button>
            }
          >
            {t("top.title")}
          </CardTitle>
          {top.length === 0 ? (
            <p className="text-sm text-slate-500 py-6 text-center">{t("top.allPaid")}</p>
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
                      {e.count} {pl(e.count, { t } as never, "w.credit", "w.credits")}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Raccourcis */}
        <div className="card p-5 lg:col-span-2 animate-fade-up" style={{ animationDelay: "400ms" }}>
          <CardTitle>{t("shortcuts.title")}</CardTitle>
          <div className="space-y-2.5">
            <button
              className="w-full flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3.5 py-3 text-left hover:border-brand-300 hover:bg-brand-50/60 transition-all group"
              onClick={onGoCreances}
            >
              <span className="w-9 h-9 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center group-hover:bg-brand-600 group-hover:text-white transition-colors">
                <IconList className="w-4.5 h-4.5" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-slate-800">{t("shortcuts.creances")}</span>
                <span className="block text-xs text-slate-500">{t("shortcuts.creancesDesc")}</span>
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
                <span className="block text-sm font-semibold text-slate-800">{t("shortcuts.synthese")}</span>
                <span className="block text-xs text-slate-500">{t("shortcuts.syntheseDesc")}</span>
              </span>
            </button>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed mt-4 border-t border-slate-100 pt-3.5">
            {t("shortcuts.note")}
          </p>
        </div>
      </div>
    </div>
  );
}
