import { useCallback, useState } from "react";
import type { Creance, DonneesCreance } from "./types";
import { solde } from "./types";
import { isLogged, setLogged, useCreances } from "./lib/store";
import { effectiveStatut } from "./lib/selectors";
import { fcfa, fmtDate } from "./lib/format";
import Login from "./components/Login";
import Shell from "./components/Layout";
import type { View } from "./components/Layout";
import Dashboard from "./components/Dashboard";
import Creances from "./components/Creances";
import type { Preset } from "./components/Creances";
import Synthese from "./components/Synthese";
import CreanceForm from "./components/CreanceForm";
import PaiementForm from "./components/PaiementForm";
import CreanceDetail from "./components/CreanceDetail";
import { ConfirmDialog, ToastStack } from "./components/ui";
import type { ToastItem, ToastKind } from "./components/ui";

export default function App() {
  const [authed, setAuthed] = useState(isLogged);
  const { creances, ajouter, modifier, supprimer, relancer, payer } = useCreances();
  const [view, setView] = useState<View>("dashboard");
  const [form, setForm] = useState<{ open: boolean; creance: Creance | null }>({
    open: false,
    creance: null,
  });
  const [toDelete, setToDelete] = useState<Creance | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [paiementFor, setPaiementFor] = useState<Creance | null>(null);
  const [preset, setPreset] = useState<Preset | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const notify = useCallback((kind: ToastKind, msg: string) => {
    const id = Date.now() + Math.random();
    setToasts((p) => [...p, { id, kind, msg }]);
    window.setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4600);
  }, []);

  const dismissToast = useCallback(
    (id: number) => setToasts((p) => p.filter((t) => t.id !== id)),
    []
  );

  if (!authed) {
    return (
      <Login
        onSuccess={() => {
          setLogged(true);
          setAuthed(true);
        }}
      />
    );
  }

  const openNew = () => setForm({ open: true, creance: null });
  const openEdit = (c: Creance) => setForm({ open: true, creance: c });
  const closeForm = () => setForm({ open: false, creance: null });

  /** Navigue vers le suivi des créances avec un filtre/tri pré-appliqué. */
  const goCreances = (p: Preset) => {
    setPreset({ ...p });
    setView("creances");
  };
  const detail = detailId ? creances.find((c) => c.id === detailId) ?? null : null;

  const handleSave = (d: DonneesCreance) => {
    if (d.id) {
      modifier({ ...d, id: d.id });
      notify("success", `Créance « ${d.nomClient} » mise à jour.`);
    } else {
      ajouter(d);
      notify("success", `Créance « ${d.nomClient} » ajoutée (${fcfa(d.montantTotal)}).`);
    }
    closeForm();
  };

  const handleRelancer = (c: Creance) => {
    const eff = effectiveStatut(c);
    const bascule =
      eff !== "Soldé" && eff !== "Contentieux" && c.statut !== "Relance";
    relancer(c.id);
    notify(
      "info",
      `Relance n° ${c.nombreRelances + 1} enregistrée pour « ${c.nomClient} »${
        bascule ? " · statut passé en « Relance »" : ""
      }.`
    );
  };

  const handlePayer = (montant: number, date: string, remarque: string) => {
    if (!paiementFor) return;
    const c = paiementFor;
    const m = Math.min(montant, solde(c));
    payer(c.id, m, date, remarque);
    const nouveauSolde = solde(c) - m;
    notify(
      "success",
      `Paiement de ${fcfa(m)} enregistré sur ${c.ref} « ${c.nomClient} » — nouveau solde : ${fcfa(nouveauSolde)}${
        nouveauSolde === 0 ? " · créance soldée" : ""
      }.`
    );
    setPaiementFor(null);
  };

  const handleDelete = () => {
    if (!toDelete) return;
    supprimer(toDelete.id);
    if (detailId === toDelete.id) setDetailId(null);
    notify("success", `Créance ${toDelete.ref} « ${toDelete.nomClient} » supprimée.`);
    setToDelete(null);
  };

  const handleLogout = () => {
    setLogged(false);
    setAuthed(false);
    setView("dashboard");
  };

  return (
    <>
      <Shell view={view} onNavigate={setView} onLogout={handleLogout} onNew={openNew}>
        {view === "dashboard" && (
          <Dashboard
            creances={creances}
            onEdit={openEdit}
            onRelancer={handleRelancer}
            onPayer={(c) => setPaiementFor(c)}
            onGoCreances={() => setView("creances")}
            onGoSynthese={() => setView("synthese")}
            onKpiAccordees={() =>
              goCreances({ statut: "Tous", sortKey: "montantTotal", sortDir: "desc" })
            }
            onKpiRegle={() => goCreances({ statut: "Soldé" })}
            onKpiRestantDu={() => goCreances({ sortKey: "solde", sortDir: "desc" })}
          />
        )}
        {view === "creances" && (
          <Creances
            creances={creances}
            onNew={openNew}
            onEdit={openEdit}
            onDelete={setToDelete}
            onRelancer={handleRelancer}
            onPayer={(c) => setPaiementFor(c)}
            onDetail={(c) => setDetailId(c.id)}
            preset={preset}
          />
        )}
        {view === "synthese" && <Synthese creances={creances} onNew={openNew} />}
      </Shell>

      {form.open && (
        <CreanceForm initial={form.creance} onSave={handleSave} onClose={closeForm} />
      )}

      {detail && (
        <CreanceDetail
          creance={detail}
          onClose={() => setDetailId(null)}
          onEdit={(c) => {
            setDetailId(null);
            openEdit(c);
          }}
          onPayer={(c) => setPaiementFor(c)}
          onRelancer={handleRelancer}
        />
      )}

      {paiementFor && (
        <PaiementForm
          creance={paiementFor}
          onPayer={handlePayer}
          onClose={() => setPaiementFor(null)}
        />
      )}

      {toDelete && (
        <ConfirmDialog
          title={`Supprimer la créance ${toDelete.ref} ?`}
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
        >
          <p>
            <strong className="text-slate-800">{toDelete.nomClient}</strong> — achat du{" "}
            {fmtDate(toDelete.dateAchat)} ·{" "}
            <span className="font-mono">{fcfa(toDelete.montantTotal)}</span> (solde dû :{" "}
            <span className="font-mono font-semibold text-red-700">{fcfa(solde(toDelete))}</span>).
          </p>
          <p className="mt-2 text-red-600 font-medium">
            Cette suppression est définitive : l'historique de la créance sera
            également effacé.
          </p>
        </ConfirmDialog>
      )}

      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}
