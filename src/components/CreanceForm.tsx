import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import type { Creance, Reaction, Statut, TypeEtablissement } from "../types";
import { REACTIONS, STATUTS, TYPES_ETABLISSEMENT } from "../types";
import { uid } from "../lib/store";
import { fcfa } from "../lib/format";
import { Modal } from "./ui";
import { IconCheck } from "./icons";

interface FormState {
  nomClient: string;
  typeEtab: TypeEtablissement;
  adresse: string;
  telephone: string;
  responsableClient: string;
  agent: string;
  dateAchat: string;
  montantTotal: string;
  montantRegle: string;
  dateEcheance: string;
  dateDerniereRelance: string;
  nombreRelances: number;
  reaction: Reaction;
  statut: Statut;
  prochaineActionTexte: string;
  prochaineActionDate: string;
  remarques: string;
}

function Field({
  label,
  required,
  error,
  hint,
  children,
  className = "",
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-xs font-semibold text-slate-600 mb-1.5">
        {label}
        {required && <span className="text-red-600"> *</span>}
      </span>
      {children}
      {hint && !error && (
        <span className="block text-[11px] text-slate-400 mt-1">{hint}</span>
      )}
      {error && (
        <span className="block text-xs font-medium text-red-600 mt-1">
          {error}
        </span>
      )}
    </label>
  );
}

function SectionTitle({ n, children }: { n: string; children: ReactNode }) {
  return (
    <h3 className="flex items-center gap-2.5 font-display font-semibold text-slate-900 text-sm">
      <span className="w-6 h-6 rounded-md bg-brand-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
        {n}
      </span>
      {children}
    </h3>
  );
}

export default function CreanceForm({
  initial,
  onSave,
  onClose,
}: {
  initial: Creance | null;
  onSave: (c: Creance) => void;
  onClose: () => void;
}) {
  const [f, setF] = useState<FormState>(() => ({
    nomClient: initial?.nomClient ?? "",
    typeEtab: initial?.typeEtab ?? "Particulier",
    adresse: initial?.adresse ?? "",
    telephone: initial?.telephone ?? "",
    responsableClient: initial?.responsableClient ?? "",
    agent: initial?.agent ?? "",
    dateAchat: initial?.dateAchat ?? "",
    montantTotal: initial ? String(initial.montantTotal) : "",
    montantRegle: initial ? String(initial.montantRegle) : "0",
    dateEcheance: initial?.dateEcheance ?? "",
    dateDerniereRelance: initial?.dateDerniereRelance ?? "",
    nombreRelances: initial?.nombreRelances ?? 0,
    reaction: initial?.reaction ?? "",
    statut: initial?.statut ?? "Non échu",
    prochaineActionTexte: initial?.prochaineActionTexte ?? "",
    prochaineActionDate: initial?.prochaineActionDate ?? "",
    remarques: initial?.remarques ?? "",
  }));
  const [errors, setErrors] = useState<{ nom?: string; montants?: string }>(
    {}
  );

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setF((p) => ({ ...p, [k]: v }));
  }

  const totalNum = Number(f.montantTotal);
  const regleNum = f.montantRegle === "" ? 0 : Number(f.montantRegle);
  const soldeCalc =
    (Number.isFinite(totalNum) ? totalNum : 0) -
    (Number.isFinite(regleNum) ? regleNum : 0);

  function submit(e: FormEvent) {
    e.preventDefault();
    const errs: { nom?: string; montants?: string } = {};
    if (!f.nomClient.trim())
      errs.nom = "Le nom de l'établissement / du client est obligatoire.";
    const total = Number(f.montantTotal);
    const regle = f.montantRegle === "" ? 0 : Number(f.montantRegle);
    if (f.montantTotal === "" || !Number.isFinite(total) || total < 0) {
      errs.montants = "Saisissez un montant total valide (en FCFA).";
    } else if (!Number.isFinite(regle) || regle < 0) {
      errs.montants = "Saisissez un montant réglé valide (en FCFA).";
    } else if (regle > total) {
      errs.montants =
        "Le montant déjà réglé ne peut pas dépasser le montant total.";
    }
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    onSave({
      id: initial?.id ?? uid(),
      nomClient: f.nomClient.trim(),
      typeEtab: f.typeEtab,
      adresse: f.adresse.trim(),
      telephone: f.telephone.trim(),
      responsableClient: f.responsableClient.trim(),
      agent: f.agent.trim(),
      dateAchat: f.dateAchat || null,
      montantTotal: total,
      montantRegle: regle,
      dateEcheance: f.dateEcheance || null,
      dateDerniereRelance: f.dateDerniereRelance || null,
      nombreRelances: Math.max(0, Math.floor(Number(f.nombreRelances) || 0)),
      reaction: f.reaction,
      statut: f.statut,
      prochaineActionTexte: f.prochaineActionTexte.trim(),
      prochaineActionDate: f.prochaineActionDate || null,
      remarques: f.remarques.trim(),
    });
  }

  return (
    <Modal
      title={initial ? "Modifier la créance" : "Nouvelle créance"}
      subtitle={
        initial
          ? `${initial.nomClient} — achat du ${initial.dateAchat ? initial.dateAchat.split("-").reverse().join("/") : "date inconnue"}`
          : "Consignez une nouvelle vente à crédit. Le solde est calculé automatiquement."
      }
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose} type="button">
            Annuler
          </button>
          <button className="btn btn-primary" onClick={submit} type="button">
            <IconCheck className="w-4 h-4" />
            {initial ? "Enregistrer les modifications" : "Ajouter la créance"}
          </button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-6" noValidate>
        {/* ---------- Client ---------- */}
        <section>
          <SectionTitle n="1">Client &amp; établissement</SectionTitle>
          <div className="grid sm:grid-cols-2 gap-4 mt-3.5">
            <Field
              label="Nom de l'établissement / client"
              required
              error={errors.nom}
            >
              <input
                type="text"
                className={`field ${errors.nom ? "field-error" : ""}`}
                placeholder="Ex. : ESENGO, Mr Tushar…"
                value={f.nomClient}
                onChange={(e) => set("nomClient", e.target.value)}
              />
            </Field>
            <Field label="Type d'établissement">
              <select
                className="field"
                value={f.typeEtab}
                onChange={(e) =>
                  set("typeEtab", e.target.value as TypeEtablissement)
                }
              >
                {TYPES_ETABLISSEMENT.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Adresse">
              <input
                type="text"
                className="field"
                placeholder="Ex. : La Corniche"
                value={f.adresse}
                onChange={(e) => set("adresse", e.target.value)}
              />
            </Field>
            <Field label="Téléphone">
              <input
                type="tel"
                className="field"
                placeholder="Ex. : 06 978 16 12"
                value={f.telephone}
                onChange={(e) => set("telephone", e.target.value)}
              />
            </Field>
            <Field
              label="Responsable (validation côté client)"
              className="sm:col-span-2"
            >
              <input
                type="text"
                className="field"
                placeholder="Personne ayant validé l'achat à crédit chez le client"
                value={f.responsableClient}
                onChange={(e) => set("responsableClient", e.target.value)}
              />
            </Field>
          </div>
        </section>

        {/* ---------- Crédit ---------- */}
        <section className="border-t border-slate-100 pt-5">
          <SectionTitle n="2">Crédit accordé</SectionTitle>
          <div className="grid sm:grid-cols-2 gap-4 mt-3.5">
            <Field label="Agent GoodLuck">
              <input
                type="text"
                className="field"
                placeholder="Agent ayant accordé le crédit"
                value={f.agent}
                onChange={(e) => set("agent", e.target.value)}
              />
            </Field>
            <Field label="Date de l'achat à crédit">
              <input
                type="date"
                className="field"
                value={f.dateAchat}
                onChange={(e) => set("dateAchat", e.target.value)}
              />
            </Field>
            <Field label="Montant total (FCFA)" required>
              <input
                type="number"
                min={0}
                step={1}
                inputMode="numeric"
                className={`field font-mono ${errors.montants ? "field-error" : ""}`}
                placeholder="Ex. : 150000"
                value={f.montantTotal}
                onChange={(e) => set("montantTotal", e.target.value)}
              />
            </Field>
            <Field
              label="Montant déjà réglé (FCFA)"
              error={errors.montants}
            >
              <input
                type="number"
                min={0}
                step={1}
                inputMode="numeric"
                className={`field font-mono ${errors.montants ? "field-error" : ""}`}
                placeholder="0"
                value={f.montantRegle}
                onChange={(e) => set("montantRegle", e.target.value)}
              />
            </Field>
            <div className="sm:col-span-2">
              <div className="rounded-lg bg-brand-50 border border-brand-200/80 px-3.5 py-2.5 flex items-center justify-between gap-3">
                <span className="text-xs font-semibold text-brand-800">
                  Solde restant dû
                  <span className="block text-[11px] font-normal text-brand-600/80">
                    calculé automatiquement — non modifiable
                  </span>
                </span>
                <span
                  className={`font-mono font-semibold text-base ${
                    soldeCalc < 0 ? "text-red-600" : "text-brand-950"
                  }`}
                >
                  {fcfa(Math.max(0, soldeCalc))}
                </span>
              </div>
            </div>
            <Field
              label="Date d'échéance convenue"
              hint="Au-delà de cette date, la créance est considérée comme échue."
            >
              <input
                type="date"
                className="field"
                value={f.dateEcheance}
                onChange={(e) => set("dateEcheance", e.target.value)}
              />
            </Field>
          </div>
        </section>

        {/* ---------- Suivi ---------- */}
        <section className="border-t border-slate-100 pt-5">
          <SectionTitle n="3">Suivi &amp; relances</SectionTitle>
          <div className="grid sm:grid-cols-2 gap-4 mt-3.5">
            <Field label="Statut d'avancement">
              <select
                className="field"
                value={f.statut}
                onChange={(e) => set("statut", e.target.value as Statut)}
              >
                {STATUTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Réaction du client">
              <select
                className="field"
                value={f.reaction}
                onChange={(e) => set("reaction", e.target.value as Reaction)}
              >
                <option value="">— Non renseignée —</option>
                {REACTIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Date de dernière relance">
              <input
                type="date"
                className="field"
                value={f.dateDerniereRelance}
                onChange={(e) => set("dateDerniereRelance", e.target.value)}
              />
            </Field>
            <Field label="Nombre de relances">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="btn btn-ghost btn-sm px-3"
                  onClick={() =>
                    set("nombreRelances", Math.max(0, f.nombreRelances - 1))
                  }
                  aria-label="Diminuer le nombre de relances"
                >
                  −
                </button>
                <input
                  type="number"
                  min={0}
                  className="field font-mono text-center w-20"
                  value={f.nombreRelances}
                  onChange={(e) =>
                    set(
                      "nombreRelances",
                      Math.max(0, Math.floor(Number(e.target.value) || 0))
                    )
                  }
                />
                <button
                  type="button"
                  className="btn btn-ghost btn-sm px-3"
                  onClick={() => set("nombreRelances", f.nombreRelances + 1)}
                  aria-label="Augmenter le nombre de relances"
                >
                  +
                </button>
              </div>
            </Field>
            <Field label="Prochaine action (description)">
              <input
                type="text"
                className="field"
                placeholder="Ex. : Relancer, Rappeler…"
                value={f.prochaineActionTexte}
                onChange={(e) => set("prochaineActionTexte", e.target.value)}
              />
            </Field>
            <Field label="Prochaine action (date)">
              <input
                type="date"
                className="field"
                value={f.prochaineActionDate}
                onChange={(e) => set("prochaineActionDate", e.target.value)}
              />
            </Field>
            <Field label="Remarques" className="sm:col-span-2">
              <textarea
                className="field min-h-[76px] resize-y"
                placeholder="Notes libres sur cette créance…"
                value={f.remarques}
                onChange={(e) => set("remarques", e.target.value)}
              />
            </Field>
          </div>
        </section>
      </form>
    </Modal>
  );
}
