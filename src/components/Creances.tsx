import { useEffect, useMemo, useState } from "react";
import type { Creance, Statut } from "../types";
import { STATUT_META, STATUTS, solde } from "../types";
import { fcfa, fmtDate, relativeLabel, todayISO } from "../lib/format";
import { calcTotaux, effectiveStatut, estPartiel } from "../lib/selectors";
import { EmptyState, StatutBadge, TypeChip } from "./ui";
import {
  IconArrowDown,
  IconArrowUp,
  IconArrowUpDown,
  IconBanknote,
  IconBell,
  IconCalendar,
  IconChevronDown,
  IconEye,
  IconFilterX,
  IconPencil,
  IconPhone,
  IconPlus,
  IconSearch,
  IconTrash,
  IconUser,
  IconX,
} from "./icons";

export type SortKey = "dateAchat" | "montantTotal" | "solde" | "dateEcheance";
export type SortDir = "asc" | "desc";

/** Filtre/tri pré-appliqués (ex. clic sur une carte du tableau de bord). */
export interface Preset {
  statut?: "Tous" | Statut;
  sortKey?: SortKey;
  sortDir?: SortDir;
}

const DEFAULT_DIR: Record<SortKey, SortDir> = {
  dateAchat: "desc",
  montantTotal: "desc",
  solde: "desc",
  dateEcheance: "asc",
};

const SORT_LABELS: Record<SortKey, string> = {
  dateAchat: "Date d'achat",
  montantTotal: "Montant total",
  solde: "Solde restant dû",
  dateEcheance: "Date d'échéance",
};

interface Props {
  creances: Creance[];
  onNew: () => void;
  onEdit: (c: Creance) => void;
  onDelete: (c: Creance) => void;
  onRelancer: (c: Creance) => void;
  onPayer: (c: Creance) => void;
  onDetail: (c: Creance) => void;
  preset?: Preset | null;
}

function SortableTh({
  label,
  k,
  sortKey,
  sortDir,
  onSort,
  alignRight,
}: {
  label: string;
  k: SortKey;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (k: SortKey) => void;
  alignRight?: boolean;
}) {
  const active = sortKey === k;
  return (
    <th
      className={`px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider bg-slate-50 border-b border-slate-200 whitespace-nowrap ${
        alignRight ? "text-right" : "text-left"
      }`}
    >
      <button
        className={`inline-flex items-center gap-1 transition-colors hover:text-brand-700 ${
          active ? "text-brand-700" : "text-slate-500"
        }`}
        onClick={() => onSort(k)}
        title={`Trier par ${label.toLowerCase()}`}
      >
        {label}
        {active ? (
          sortDir === "asc" ? (
            <IconArrowUp className="w-3 h-3" />
          ) : (
            <IconArrowDown className="w-3 h-3" />
          )
        ) : (
          <IconArrowUpDown className="w-3 h-3 opacity-40" />
        )}
      </button>
    </th>
  );
}

function PartielChip() {
  return (
    <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold bg-slate-200 text-slate-600 whitespace-nowrap">
      Paiement partiel
    </span>
  );
}

export default function Creances({
  creances,
  onNew,
  onEdit,
  onDelete,
  onRelancer,
  onPayer,
  onDetail,
  preset,
}: Props) {
  const [q, setQ] = useState("");
  const [fStatut, setFStatut] = useState<"Tous" | Statut>("Tous");
  const [fEtab, setFEtab] = useState("Tous");
  const [fAgent, setFAgent] = useState("Tous");
  const [sortKey, setSortKey] = useState<SortKey>("dateAchat");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [expanded, setExpanded] = useState<string | null>(null);

  const today = todayISO();

  const etabs = useMemo(
    () =>
      [...new Set(creances.map((c) => c.nomClient.trim()))].sort((a, b) =>
        a.localeCompare(b)
      ),
    [creances]
  );
  const agents = useMemo(
    () =>
      [...new Set(creances.map((c) => c.agent.trim()).filter((a) => a.length > 0))].sort(
        (a, b) => a.localeCompare(b)
      ),
    [creances]
  );

  const hasFilters =
    q.trim() !== "" || fStatut !== "Tous" || fEtab !== "Tous" || fAgent !== "Tous";

  function resetFilters() {
    setQ("");
    setFStatut("Tous");
    setFEtab("Tous");
    setFAgent("Tous");
  }

  function toggleSort(k: SortKey) {
    if (sortKey === k) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(k);
      setSortDir(DEFAULT_DIR[k]);
    }
  }

  const sorted = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const filtered = creances.filter((c) => {
      if (needle && !c.nomClient.toLowerCase().includes(needle)) return false;
      if (fStatut !== "Tous" && effectiveStatut(c) !== fStatut) return false;
      if (fEtab !== "Tous" && c.nomClient.trim() !== fEtab) return false;
      if (fAgent !== "Tous" && c.agent.trim() !== fAgent) return false;
      return true;
    });
    const dir = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      if (sortKey === "solde") return (solde(a) - solde(b)) * dir;
      if (sortKey === "montantTotal") return (a.montantTotal - b.montantTotal) * dir;
      if (sortKey === "dateEcheance") {
        if (!a.dateEcheance && !b.dateEcheance) return 0;
        if (!a.dateEcheance) return 1;
        if (!b.dateEcheance) return -1;
        return a.dateEcheance.localeCompare(b.dateEcheance) * dir;
      }
      if (!a.dateAchat && !b.dateAchat) return 0;
      if (!a.dateAchat) return 1;
      if (!b.dateAchat) return -1;
      return a.dateAchat.localeCompare(b.dateAchat) * dir;
    });
  }, [creances, q, fStatut, fEtab, fAgent, sortKey, sortDir]);

  const tFiltered = useMemo(() => calcTotaux(sorted), [sorted]);

  // Filtre/tri demandés depuis le tableau de bord (cartes cliquables).
  useEffect(() => {
    if (!preset) return;
    if (preset.statut) setFStatut(preset.statut);
    if (preset.sortKey) {
      setSortKey(preset.sortKey);
      setSortDir(preset.sortDir ?? DEFAULT_DIR[preset.sortKey]);
    }
  }, [preset]);

  if (creances.length === 0) {
    return (
      <EmptyState
        title="Aucune créance enregistrée"
        hint="Consignez votre première vente à crédit : elle apparaîtra ici, dans le tableau de bord et dans la synthèse."
        action={
          <button className="btn btn-primary" onClick={onNew}>
            <IconPlus className="w-4 h-4" />
            Ajouter une créance
          </button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Barre d'outils */}
      <div className="card p-3 flex flex-wrap items-center gap-2.5 animate-fade-up">
        <div className="relative grow basis-[220px]">
          <IconSearch className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            className="field pl-9 pr-8"
            placeholder="Rechercher par nom de client ou référence (#001)…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          {q && (
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 icon-btn w-6 h-6"
              onClick={() => setQ("")}
              aria-label="Effacer la recherche"
            >
              <IconX className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <select
          className="field w-auto"
          value={fStatut}
          onChange={(e) => setFStatut(e.target.value as "Tous" | Statut)}
          aria-label="Filtrer par statut"
        >
          <option value="Tous">Tous les statuts</option>
          {STATUTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          className="field w-auto max-w-[190px]"
          value={fEtab}
          onChange={(e) => setFEtab(e.target.value)}
          aria-label="Filtrer par établissement"
        >
          <option value="Tous">Tous les établissements</option>
          {etabs.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>

        <select
          className="field w-auto"
          value={fAgent}
          onChange={(e) => setFAgent(e.target.value)}
          aria-label="Filtrer par agent"
        >
          <option value="Tous">Tous les agents</option>
          {agents.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>

        {hasFilters && (
          <button className="btn btn-ghost btn-sm" onClick={resetFilters}>
            <IconFilterX className="w-3.5 h-3.5" />
            Réinitialiser
          </button>
        )}

        <div className="flex md:hidden items-center gap-1.5 basis-full sm:basis-auto sm:ml-auto">
          <select
            className="field w-auto grow"
            value={sortKey}
            onChange={(e) => {
              const k = e.target.value as SortKey;
              setSortKey(k);
              setSortDir(DEFAULT_DIR[k]);
            }}
            aria-label="Trier la liste"
          >
            {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
              <option key={k} value={k}>
                Tri : {SORT_LABELS[k]}
              </option>
            ))}
          </select>
          <button
            className="btn btn-ghost btn-sm px-2.5"
            onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
            aria-label="Inverser l'ordre de tri"
          >
            {sortDir === "asc" ? (
              <IconArrowUp className="w-4 h-4" />
            ) : (
              <IconArrowDown className="w-4 h-4" />
            )}
            {sortDir === "asc" ? "Croiss." : "Décroiss."}
          </button>
        </div>
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          title="Aucun résultat"
          hint="Aucune créance ne correspond à ces critères. Modifiez la recherche ou réinitialisez les filtres."
          action={
            <button className="btn btn-ghost" onClick={resetFilters}>
              <IconFilterX className="w-4 h-4" />
              Réinitialiser les filtres
            </button>
          }
        />
      ) : (
        <>
          {/* Tableau (desktop) */}
          <div
            className="hidden md:block card overflow-hidden animate-fade-up"
            style={{ animationDelay: "80ms" }}
          >
            <div className="overflow-x-auto scroll-thin">
              <table className="w-full text-sm min-w-[1260px] border-separate border-spacing-0">
                <thead>
                  <tr>
                    <th className="px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50 border-b border-slate-200">
                      N°
                    </th>
                    <th className="px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50 border-b border-slate-200">
                      Client
                    </th>
                    <th className="px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50 border-b border-slate-200">
                      Contact
                    </th>
                    <th className="px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50 border-b border-slate-200">
                      Agent
                    </th>
                    <SortableTh label="Achat" k="dateAchat" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                    <SortableTh label="Échéance" k="dateEcheance" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                    <SortableTh label="Total" k="montantTotal" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} alignRight />
                    <th className="px-3 py-2.5 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50 border-b border-slate-200">
                      Réglé
                    </th>
                    <SortableTh label="Solde dû" k="solde" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} alignRight />
                    <th className="px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50 border-b border-slate-200">
                      Relances
                    </th>
                    <th className="px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50 border-b border-slate-200">
                      Statut
                    </th>
                    <th className="px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50 border-b border-slate-200">
                      Proch. action
                    </th>
                    <th className="px-3 py-2.5 bg-slate-50 border-b border-slate-200">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((c) => {
                    const s = solde(c);
                    const eff = effectiveStatut(c);
                    const meta = STATUT_META[eff];
                    const partiel = estPartiel(c);
                    const actionDepassee =
                      !!c.prochaineActionDate && c.prochaineActionDate < today && s > 0;
                    const echeanceDepassee =
                      !!c.dateEcheance && c.dateEcheance < today && s > 0;
                    return (
                      <tr key={c.id} className={`${meta.row} transition-colors`}>
                        <td className="relative px-3 py-3 border-b border-slate-100 align-top">
                          <span
                            className="absolute left-0 top-0 bottom-0 w-[3px]"
                            style={{ background: meta.accent }}
                          />
                          <button
                            className="font-mono text-[12.5px] font-semibold text-brand-700 hover:text-brand-900 hover:underline"
                            onClick={() => onDetail(c)}
                            title="Ouvrir la fiche détaillée et l'historique"
                          >
                            {c.ref}
                          </button>
                        </td>
                        <td className="px-3 py-3 border-b border-slate-100 align-top">
                          <p className="font-semibold text-slate-900 leading-snug">{c.nomClient}</p>
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            <TypeChip type={c.typeEtab} />
                            {c.adresse && (
                              <span className="text-[11px] text-slate-400 truncate max-w-[160px]">
                                {c.adresse}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-3 border-b border-slate-100 align-top">
                          {c.telephone ? (
                            <p className="flex items-center gap-1.5 text-slate-700 font-medium whitespace-nowrap">
                              <IconPhone className="w-3.5 h-3.5 text-slate-400" />
                              {c.telephone}
                            </p>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                          {c.responsableClient && (
                            <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                              <IconUser className="w-3 h-3" />
                              {c.responsableClient}
                            </p>
                          )}
                        </td>
                        <td className="px-3 py-3 border-b border-slate-100 align-top text-slate-600">
                          {c.agent || <span className="text-slate-300">—</span>}
                        </td>
                        <td className="px-3 py-3 border-b border-slate-100 align-top text-slate-600 whitespace-nowrap">
                          {c.dateAchat ? fmtDate(c.dateAchat) : <span className="text-slate-400 italic">inconnue</span>}
                        </td>
                        <td className="px-3 py-3 border-b border-slate-100 align-top whitespace-nowrap">
                          {c.dateEcheance ? (
                            <span className={echeanceDepassee ? "text-red-700 font-semibold" : "text-slate-600"}>
                              {fmtDate(c.dateEcheance)}
                            </span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                        <td className="px-3 py-3 border-b border-slate-100 align-top text-right font-mono text-[12.5px] text-slate-700 whitespace-nowrap">
                          {fcfa(c.montantTotal)}
                        </td>
                        <td className="px-3 py-3 border-b border-slate-100 align-top text-right font-mono text-[12.5px] text-emerald-700 whitespace-nowrap">
                          {fcfa(c.montantRegle)}
                        </td>
                        <td
                          className={`px-3 py-3 border-b border-slate-100 align-top text-right font-mono text-[12.5px] font-semibold whitespace-nowrap ${
                            s > 0 ? "text-red-700" : "text-slate-400"
                          }`}
                        >
                          {fcfa(s)}
                        </td>
                        <td className="px-3 py-3 border-b border-slate-100 align-top">
                          <div className="flex items-center gap-1.5">
                            <span className="inline-flex items-center justify-center min-w-[1.7rem] h-6 px-1 rounded-md bg-slate-100 text-slate-700 font-mono text-xs font-semibold">
                              {c.nombreRelances}
                            </span>
                            <button
                              className="btn btn-ghost btn-sm px-2"
                              onClick={() => onRelancer(c)}
                              title="Enregistrer une relance aujourd'hui"
                              disabled={eff === "Soldé"}
                            >
                              <IconBell className="w-3.5 h-3.5" />
                              +1
                            </button>
                          </div>
                          {c.dateDerniereRelance && (
                            <p className="text-[10.5px] text-slate-400 mt-1 whitespace-nowrap">
                              dern. : {fmtDate(c.dateDerniereRelance)}
                            </p>
                          )}
                        </td>
                        <td className="px-3 py-3 border-b border-slate-100 align-top">
                          <div className="flex flex-col items-start gap-1">
                            <StatutBadge statut={eff} />
                            {partiel && <PartielChip />}
                          </div>
                        </td>
                        <td className="px-3 py-3 border-b border-slate-100 align-top max-w-[170px]">
                          {c.prochaineActionDate ? (
                            <>
                              <p
                                className={`flex items-center gap-1.5 whitespace-nowrap ${
                                  actionDepassee ? "text-red-700 font-semibold" : "text-slate-700"
                                }`}
                              >
                                <IconCalendar className="w-3.5 h-3.5 shrink-0" />
                                {fmtDate(c.prochaineActionDate)}
                              </p>
                              <p
                                className={`text-[11px] mt-0.5 ${
                                  actionDepassee ? "text-red-600 font-semibold" : "text-slate-400"
                                }`}
                              >
                                {c.prochaineActionTexte
                                  ? `${c.prochaineActionTexte} · ${relativeLabel(c.prochaineActionDate)}`
                                  : relativeLabel(c.prochaineActionDate)}
                              </p>
                            </>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                        <td className="px-3 py-3 border-b border-slate-100 align-top">
                          <div className="flex items-center gap-0.5">
                            <button
                              className={`icon-btn ${s === 0 ? "opacity-35 cursor-not-allowed" : "icon-btn-pay"}`}
                              onClick={() => s > 0 && onPayer(c)}
                              title={s === 0 ? "Créance soldée — rien à encaisser" : "Enregistrer un paiement"}
                              aria-label={`Enregistrer un paiement pour ${c.nomClient}`}
                            >
                              <IconBanknote className="w-4 h-4" />
                            </button>
                            <button
                              className="icon-btn"
                              onClick={() => onDetail(c)}
                              title="Fiche détaillée & historique"
                              aria-label={`Voir la fiche de ${c.nomClient}`}
                            >
                              <IconEye className="w-4 h-4" />
                            </button>
                            <button
                              className="icon-btn"
                              onClick={() => onEdit(c)}
                              title="Modifier"
                              aria-label={`Modifier la créance de ${c.nomClient}`}
                            >
                              <IconPencil className="w-4 h-4" />
                            </button>
                            <button
                              className="icon-btn icon-btn-danger"
                              onClick={() => onDelete(c)}
                              title="Supprimer"
                              aria-label={`Supprimer la créance de ${c.nomClient}`}
                            >
                              <IconTrash className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-slate-200 bg-slate-50/80">
              <p className="text-xs text-slate-500 font-medium">
                {sorted.length} créance{sorted.length > 1 ? "s" : ""} affichée
                {sorted.length > 1 ? "s" : ""}
                {hasFilters && ` (sur ${creances.length})`}
              </p>
              <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
                <span>
                  Accordé :{" "}
                  <b className="font-mono text-slate-800">{fcfa(tFiltered.accorde)}</b>
                </span>
                <span>
                  Réglé :{" "}
                  <b className="font-mono text-emerald-700">{fcfa(tFiltered.regle)}</b>
                </span>
                <span>
                  Reste dû :{" "}
                  <b className="font-mono text-red-700">{fcfa(tFiltered.du)}</b>
                </span>
              </div>
            </div>
          </div>

          {/* Cartes (mobile) */}
          <div className="md:hidden space-y-3">
            {sorted.map((c, i) => {
              const s = solde(c);
              const eff = effectiveStatut(c);
              const meta = STATUT_META[eff];
              const partiel = estPartiel(c);
              const open = expanded === c.id;
              const actionDepassee =
                !!c.prochaineActionDate && c.prochaineActionDate < today && s > 0;
              return (
                <div
                  key={c.id}
                  className={`card overflow-hidden animate-fade-up ${meta.row}`}
                  style={{ animationDelay: `${Math.min(i * 40, 400)}ms` }}
                >
                  <div className="h-[3px]" style={{ background: meta.accent }} />
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-display font-semibold text-slate-900 leading-snug">
                          <button
                            className="font-mono text-xs font-bold text-brand-700 mr-1.5 hover:underline"
                            onClick={() => onDetail(c)}
                            title="Fiche détaillée & historique"
                          >
                            {c.ref}
                          </button>
                          {c.nomClient}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <TypeChip type={c.typeEtab} />
                          {c.adresse && (
                            <span className="text-[11px] text-slate-400">{c.adresse}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <StatutBadge statut={eff} />
                        {partiel && <PartielChip />}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-3">
                      <div className="rounded-lg bg-white/70 border border-slate-100 px-2.5 py-2">
                        <p className="text-[10px] font-bold uppercase text-slate-400">Total</p>
                        <p className="font-mono text-[12.5px] font-semibold text-slate-800 mt-0.5">
                          {fcfa(c.montantTotal)}
                        </p>
                      </div>
                      <div className="rounded-lg bg-white/70 border border-slate-100 px-2.5 py-2">
                        <p className="text-[10px] font-bold uppercase text-emerald-600/70">Réglé</p>
                        <p className="font-mono text-[12.5px] font-semibold text-emerald-700 mt-0.5">
                          {fcfa(c.montantRegle)}
                        </p>
                      </div>
                      <div className="rounded-lg bg-white/70 border border-slate-100 px-2.5 py-2">
                        <p className="text-[10px] font-bold uppercase text-red-600/70">Reste dû</p>
                        <p
                          className={`font-mono text-[12.5px] font-semibold mt-0.5 ${
                            s > 0 ? "text-red-700" : "text-slate-400"
                          }`}
                        >
                          {fcfa(s)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                      <p className="flex items-center gap-1.5">
                        <IconCalendar className="w-3.5 h-3.5 text-slate-400" />
                        Achat : {c.dateAchat ? fmtDate(c.dateAchat) : "inconnue"}
                        {c.dateEcheance && (
                          <span className="text-slate-400">· Échéance : {fmtDate(c.dateEcheance)}</span>
                        )}
                      </p>
                      {c.prochaineActionDate && (
                        <p
                          className={`flex items-center gap-1.5 ${
                            actionDepassee ? "text-red-700 font-semibold" : ""
                          }`}
                        >
                          <IconBell className="w-3.5 h-3.5" />
                          {c.prochaineActionTexte ? `${c.prochaineActionTexte} · ` : ""}
                          {fmtDate(c.prochaineActionDate)}
                          <span className="font-medium">({relativeLabel(c.prochaineActionDate)})</span>
                        </p>
                      )}
                    </div>

                    {open && (
                      <dl className="mt-3 pt-3 border-t border-slate-200/70 grid grid-cols-2 gap-x-3 gap-y-2 text-xs animate-fade-in">
                        {[
                          ["Téléphone", c.telephone],
                          ["Responsable client", c.responsableClient],
                          ["Agent GoodLuck", c.agent],
                          ["Dernière relance", c.dateDerniereRelance ? fmtDate(c.dateDerniereRelance) : ""],
                          ["Nombre de relances", String(c.nombreRelances)],
                          ["Réaction client", c.reaction],
                          ["Remarques", c.remarques],
                        ]
                          .filter(([, v]) => v !== "" && v !== "—")
                          .map(([k, v]) => (
                            <div key={k} className={k === "Remarques" ? "col-span-2" : ""}>
                              <dt className="font-bold text-slate-400 text-[10px] uppercase tracking-wide">
                                {k}
                              </dt>
                              <dd className="text-slate-700 mt-0.5">{v}</dd>
                            </div>
                          ))}
                      </dl>
                    )}

                    <div className="flex flex-wrap items-center gap-2 mt-3.5 pt-3 border-t border-slate-200/70">
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => onPayer(c)}
                        disabled={s === 0}
                        title={s === 0 ? "Créance soldée" : "Enregistrer un paiement"}
                      >
                        <IconBanknote className="w-3.5 h-3.5" />
                        Payer
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => onRelancer(c)}
                        disabled={eff === "Soldé"}
                      >
                        <IconBell className="w-3.5 h-3.5" />
                        Relancer +1
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setExpanded(open ? null : c.id)}
                      >
                        <IconChevronDown
                          className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`}
                        />
                        {open ? "Moins" : "Détails"}
                      </button>
                      <div className="flex items-center gap-1 ml-auto">
                        <button className="icon-btn" onClick={() => onDetail(c)} aria-label="Fiche détaillée">
                          <IconEye className="w-4 h-4" />
                        </button>
                        <button className="icon-btn" onClick={() => onEdit(c)} aria-label="Modifier">
                          <IconPencil className="w-4 h-4" />
                        </button>
                        <button className="icon-btn icon-btn-danger" onClick={() => onDelete(c)} aria-label="Supprimer">
                          <IconTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <p className="text-center text-xs text-slate-400 font-medium pt-1">
              {sorted.length} créance{sorted.length > 1 ? "s" : ""} affichée
              {sorted.length > 1 ? "s" : ""}
              {hasFilters && ` (sur ${creances.length})`} · Reste dû :{" "}
              <span className="font-mono font-semibold text-red-700">{fcfa(tFiltered.du)}</span>
            </p>
          </div>
        </>
      )}
    </div>
  );
}
