import { useCallback, useState } from "react";
import type { Creance } from "./types";
import { solde } from "./types";
import { isLogged, setLogged, useCreances } from "./lib/store";
import { fcfa, fmtDate } from "./lib/format";
import Login from "./components/Login";
import Shell from "./components/Layout";
import type { View } from "./components/Layout";
import Dashboard from "./components/Dashboard";
import Creances from "./components/Creances";
import Synthese from "./components/Synthese";
import CreanceForm from "./components/CreanceForm";
import {
  ConfirmDialog,
  ToastStack,
} from "./components/ui";
import type { ToastItem, ToastKind } from "./components/ui";

export default function App() {
  const [authed, setAuthed] = useState(isLogged);
  const { creances, add, update, remove, relancer } = useCreances();
  const [view, setView] = useState<View>("dashboard");
  const [form, setForm] = useState<{ open: boolean; creance: Creance | null }>(
    { open: false, creance: null }
  );
  const [toDelete, setToDelete] = useState<Creance | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const notify = useCallback((kind: ToastKind, msg: string) => {
    const id = Date.now() + Math.random();
    setToasts((p) => [...p, { id, kind, msg }]);
    window.setTimeout(
      () => setToasts((p) => p.filter((t) => t.id !== id)),
      4200
    );
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

  const handleSave = (c: Creance) => {
    const isNew = form.creance === null;
    if (isNew) add(c);
    else update(c);
    closeForm();
    notify(
      "success",
      isNew
        ? `Créance « ${c.nomClient} » ajoutée (${fcfa(c.montantTotal)}).`
        : `Créance « ${c.nomClient} » mise à jour.`
    );
  };

  const handleRelancer = (c: Creance) => {
    relancer(c.id);
    notify(
      "info",
      `Relance n° ${c.nombreRelances + 1} enregistrée pour « ${c.nomClient} » (datée du jour).`
    );
  };

  const handleDelete = () => {
    if (!toDelete) return;
    remove(toDelete.id);
    notify("success", `Créance « ${toDelete.nomClient} » supprimée.`);
    setToDelete(null);
  };

  const handleLogout = () => {
    setLogged(false);
    setAuthed(false);
    setView("dashboard");
  };

  return (
    <>
      <Shell
        view={view}
        onNavigate={setView}
        onLogout={handleLogout}
        onNew={openNew}
      >
        {view === "dashboard" && (
          <Dashboard
            creances={creances}
            onEdit={openEdit}
            onRelancer={handleRelancer}
            onGoCreances={() => setView("creances")}
            onGoSynthese={() => setView("synthese")}
          />
        )}
        {view === "creances" && (
          <Creances
            creances={creances}
            onNew={openNew}
            onEdit={openEdit}
            onDelete={setToDelete}
            onRelancer={handleRelancer}
          />
        )}
        {view === "synthese" && (
          <Synthese creances={creances} onNew={openNew} />
        )}
      </Shell>

      {form.open && (
        <CreanceForm
          initial={form.creance}
          onSave={handleSave}
          onClose={closeForm}
        />
      )}

      {toDelete && (
        <ConfirmDialog
          title="Supprimer cette créance ?"
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
        >
          <p>
            <strong className="text-slate-800">{toDelete.nomClient}</strong> —{" "}
            achat du {fmtDate(toDelete.dateAchat)} ·{" "}
            <span className="font-mono">{fcfa(toDelete.montantTotal)}</span>{" "}
            (solde dû :{" "}
            <span className="font-mono font-semibold text-red-700">
              {fcfa(solde(toDelete))}
            </span>
            ).
          </p>
          <p className="mt-2 text-red-600 font-medium">
            Cette suppression est définitive et ne peut pas être annulée.
          </p>
        </ConfirmDialog>
      )}

      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}
