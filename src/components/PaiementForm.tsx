import { useState } from "react";
import type { FormEvent } from "react";
import type { Creance } from "../types";
import { solde } from "../types";
import { fcfa, todayISO } from "../lib/format";
import { Modal } from "./ui";
import { IconBanknote, IconCheck } from "./icons";

export default function PaiementForm({
  creance,
  onPayer,
  onClose,
}: {
  creance: Creance;
  onPayer: (montant: number, date: string, remarque: string) => void;
  onClose: () => void;
}) {
  const reste = solde(creance);
  const [montant, setMontant] = useState("");
  const [date, setDate] = useState(todayISO());
  const [remarque, setRemarque] = useState("");
  const [err, setErr] = useState("");

  function submit(e: FormEvent) {
    e.preventDefault();
    const m = Number(montant);
    if (montant.trim() === "" || !Number.isFinite(m) || m <= 0) {
      setErr("Saisissez un montant valide, supérieur à 0.");
      return;
    }
    if (m > reste) {
      setErr(
        `Montant trop élevé : le solde restant dû est de ${fcfa(reste)}. Le paiement est bloqué (pas de solde négatif).`
      );
      return;
    }
    onPayer(Math.round(m), date || todayISO(), remarque.trim());
  }

  return (
    <Modal
      title={`Enregistrer un paiement — ${creance.ref}`}
      subtitle={`${creance.nomClient} · le solde et le statut seront mis à jour automatiquement.`}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose} type="button">
            Annuler
          </button>
          <button className="btn btn-primary" onClick={submit} type="button">
            <IconCheck className="w-4 h-4" />
            Enregistrer le paiement
          </button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        {/* Rappel des montants */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2.5">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
              Total accordé
            </p>
            <p className="font-mono text-[13px] font-semibold text-slate-800 mt-0.5">
              {fcfa(creance.montantTotal)}
            </p>
          </div>
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2.5">
            <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-600/80">
              Déjà réglé
            </p>
            <p className="font-mono text-[13px] font-semibold text-emerald-700 mt-0.5">
              {fcfa(creance.montantRegle)}
            </p>
          </div>
          <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2.5">
            <p className="text-[10px] font-bold uppercase tracking-wide text-red-600/80">
              Reste dû
            </p>
            <p className="font-mono text-[13px] font-semibold text-red-700 mt-0.5">
              {fcfa(reste)}
            </p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
            Montant payé (FCFA) <span className="text-red-600">*</span>
          </label>
          <div className="relative">
            <IconBanknote className="w-4.5 h-4.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="number"
              min={1}
              max={reste}
              step={1}
              inputMode="numeric"
              autoFocus
              className={`field font-mono pl-9.5 ${err ? "field-error" : ""}`}
              placeholder={`Ex. : ${reste}`}
              value={montant}
              onChange={(e) => {
                setMontant(e.target.value);
                setErr("");
              }}
            />
          </div>
          <div className="flex items-center justify-between gap-2 mt-1.5">
            {err ? (
              <p className="text-xs font-medium text-red-600">{err}</p>
            ) : (
              <p className="text-[11px] text-slate-400">
                Maximum : {fcfa(reste)} — au-delà, le paiement est refusé.
              </p>
            )}
            <button
              type="button"
              className="btn btn-ghost btn-sm shrink-0"
              onClick={() => {
                setMontant(String(reste));
                setErr("");
              }}
            >
              Tout solder ({fcfa(reste)})
            </button>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Date du paiement
            </label>
            <input
              type="date"
              className="field"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Remarque (optionnelle)
            </label>
            <input
              type="text"
              className="field"
              placeholder="Ex. : versement espèces, virement…"
              value={remarque}
              onChange={(e) => setRemarque(e.target.value)}
            />
          </div>
        </div>

        <p className="text-[11px] text-slate-400 leading-relaxed border-t border-slate-100 pt-3">
          Dès validation : le montant réglé est incrémenté, le solde recalculé,
          et le statut passe automatiquement en « Paiement partiel » — ou «
          Soldé » si le solde atteint 0. L'opération est tracée dans
          l'historique de la créance {creance.ref}.
        </p>
      </form>
    </Modal>
  );
}
