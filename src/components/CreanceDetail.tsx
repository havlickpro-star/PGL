import type { ReactNode } from "react";
import type { Creance, EvenementType } from "../types";
import { solde } from "../types";
import { effectiveStatut, estPartiel } from "../lib/selectors";
import { daysFromToday, fcfa, fmtDate, fmtDateTime, relativeLabel } from "../lib/format";
import { Modal, StatutBadge, TypeChip } from "./ui";
import {
  IconBanknote,
  IconBell,
  IconFlag,
  IconHistory,
  IconPencil,
  IconPlus,
} from "./icons";

const EV_STYLE: Record<EvenementType, { chip: string; icon: ReactNode }> = {
  creation: {
    chip: "bg-brand-100 text-brand-700",
    icon: <IconPlus className="w-3.5 h-3.5" />,
  },
  paiement: {
    chip: "bg-emerald-100 text-emerald-700",
    icon: <IconBanknote className="w-3.5 h-3.5" />,
  },
  relance: {
    chip: "bg-amber-100 text-amber-700",
    icon: <IconBell className="w-3.5 h-3.5" />,
  },
  statut: {
    chip: "bg-sky-100 text-sky-700",
    icon: <IconFlag className="w-3.5 h-3.5" />,
  },
  modification: {
    chip: "bg-slate-200 text-slate-600",
    icon: <IconPencil className="w-3.5 h-3.5" />,
  },
};

function Info({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </dt>
      <dd className="text-sm text-slate-800 mt-0.5">{children}</dd>
    </div>
  );
}

export default function CreanceDetail({
  creance: c,
  onClose,
  onEdit,
  onPayer,
  onRelancer,
}: {
  creance: Creance;
  onClose: () => void;
  onEdit: (c: Creance) => void;
  onPayer: (c: Creance) => void;
  onRelancer: (c: Creance) => void;
}) {
  const eff = effectiveStatut(c);
  const s = solde(c);
  const partiel = estPartiel(c);
  const historique = [...c.historique].reverse();

  return (
    <Modal
      title={`Créance ${c.ref}`}
      subtitle={`${c.nomClient} · ${c.typeEtab}`}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-ghost" onClick={() => onEdit(c)}>
            <IconPencil className="w-4 h-4" />
            Modifier la fiche
          </button>
          <button
            className="btn btn-ghost"
            onClick={() => onRelancer(c)}
            disabled={eff === "Soldé"}
          >
            <IconBell className="w-4 h-4" />
            Relancer +1
          </button>
          <button
            className="btn btn-primary"
            onClick={() => onPayer(c)}
            disabled={s === 0}
            title={s === 0 ? "Créance soldée — aucun paiement à enregistrer" : undefined}
          >
            <IconBanknote className="w-4 h-4" />
            Enregistrer un paiement
          </button>
        </>
      }
    >
      <div className="space-y-5">
        {/* Bandeau statut + solde */}
        <div
          className={`rounded-xl border px-4 py-3.5 flex flex-wrap items-center justify-between gap-3 ${
            s === 0
              ? "bg-emerald-50 border-emerald-200"
              : eff === "En retard" || eff === "Contentieux"
                ? "bg-red-50 border-red-200"
                : "bg-brand-50 border-brand-200"
          }`}
        >
          <div className="flex items-center gap-2 flex-wrap">
            <StatutBadge statut={eff} />
            {partiel && (
              <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10.5px] font-semibold bg-slate-200 text-slate-600">
                Paiement partiel
              </span>
            )}
            {c.dateEcheance && s > 0 && daysFromToday(c.dateEcheance) < 0 && (
              <span className="text-[11px] font-semibold text-red-700">
                Échéance {relativeLabel(c.dateEcheance)}
              </span>
            )}
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
              {s === 0 ? "Créance soldée" : "Reste dû"}
            </p>
            <p
              className={`font-display text-xl font-bold ${
                s === 0 ? "text-emerald-700" : "text-red-700"
              }`}
            >
              {fcfa(s)}
            </p>
          </div>
        </div>

        {/* Montants */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2.5">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
              Total accordé
            </p>
            <p className="font-mono text-[13px] font-semibold text-slate-800 mt-0.5">
              {fcfa(c.montantTotal)}
            </p>
          </div>
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2.5">
            <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-600/80">
              Déjà réglé
            </p>
            <p className="font-mono text-[13px] font-semibold text-emerald-700 mt-0.5">
              {fcfa(c.montantRegle)}
            </p>
          </div>
          <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2.5">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
              Solde (auto)
            </p>
            <p className="font-mono text-[13px] font-semibold text-slate-800 mt-0.5">
              {fcfa(s)}
            </p>
          </div>
        </div>

        {/* Informations complètes */}
        <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3.5">
          <Info label="Type">{c.typeEtab}</Info>
          <Info label="Adresse">{c.adresse || "—"}</Info>
          <Info label="Téléphone">{c.telephone || "—"}</Info>
          <Info label="Responsable client">{c.responsableClient || "—"}</Info>
          <Info label="Agent GoodLuck">{c.agent || "—"}</Info>
          <Info label="Date d'achat">
            {c.dateAchat ? fmtDate(c.dateAchat) : "inconnue"}
          </Info>
          <Info label="Échéance convenue">
            {c.dateEcheance ? fmtDate(c.dateEcheance) : "—"}
          </Info>
          <Info label="Dernière relance">
            {c.dateDerniereRelance ? fmtDate(c.dateDerniereRelance) : "—"}
          </Info>
          <Info label="Nombre de relances">{c.nombreRelances}</Info>
          <Info label="Réaction du client">{c.reaction || "—"}</Info>
          <Info label="Prochaine action">
            {c.prochaineActionDate
              ? `${fmtDate(c.prochaineActionDate)}${
                  c.prochaineActionTexte ? ` — ${c.prochaineActionTexte}` : ""
                }`
              : "—"}
          </Info>
          <Info label="Remarques">{c.remarques || "—"}</Info>
        </dl>

        {/* Historique */}
        <div className="border-t border-slate-100 pt-4">
          <h3 className="flex items-center gap-2 font-display font-semibold text-slate-900 text-sm">
            <IconHistory className="w-4.5 h-4.5 text-brand-600" />
            Historique &amp; journal
            <span className="text-[11px] font-sans font-medium text-slate-400">
              {c.historique.length} événement{c.historique.length > 1 ? "s" : ""}
            </span>
          </h3>
          <ul className="mt-3.5 max-h-64 overflow-y-auto scroll-thin pr-1">
            {historique.map((e, i) => {
              const st = EV_STYLE[e.type];
              return (
                <li key={e.id} className="relative flex gap-3 pb-4 last:pb-0">
                  {i < historique.length - 1 && (
                    <span className="absolute left-[13px] top-7 bottom-0 w-px bg-slate-200" />
                  )}
                  <span
                    className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${st.chip}`}
                  >
                    {st.icon}
                  </span>
                  <div className="min-w-0 grow">
                    <p className="text-sm font-semibold text-slate-800 leading-snug">
                      {e.titre}
                    </p>
                    {e.detail && (
                      <p className="text-xs text-slate-500 mt-0.5">{e.detail}</p>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap pt-0.5">
                    {fmtDateTime(e.date)}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-400 border-t border-slate-100 pt-3">
          <TypeChip type={c.typeEtab} />
          <span>
            Référence {c.ref} — à citer dans toute relance ou correspondance.
          </span>
        </div>
      </div>
    </Modal>
  );
}
