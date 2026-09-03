import type { ReactNode } from "react";
import { dateLongue } from "../lib/format";
import {
  IconDashboard,
  IconList,
  IconLogout,
  IconPie,
  IconPlus,
  LogoClover,
} from "./icons";

export type View = "dashboard" | "creances" | "synthese";

const NAV: { id: View; label: string; icon: (p: { className?: string }) => ReactNode }[] = [
  { id: "dashboard", label: "Tableau de bord", icon: (p) => <IconDashboard {...p} /> },
  { id: "creances", label: "Suivi des créances", icon: (p) => <IconList {...p} /> },
  { id: "synthese", label: "Synthèse par entité", icon: (p) => <IconPie {...p} /> },
];

const VIEW_META: Record<View, { title: string; desc: string }> = {
  dashboard: {
    title: "Tableau de bord",
    desc: "Vue d'ensemble des créances et des actions à mener aujourd'hui.",
  },
  creances: {
    title: "Suivi des créances",
    desc: "Toutes vos ventes à crédit, du premier jour jusqu'au solde final.",
  },
  synthese: {
    title: "Synthèse par entité",
    desc: "Encours regroupés automatiquement par client / établissement.",
  },
};

interface ShellProps {
  view: View;
  onNavigate: (v: View) => void;
  onLogout: () => void;
  onNew: () => void;
  children: ReactNode;
}

export default function Shell({
  view,
  onNavigate,
  onLogout,
  onNew,
  children,
}: ShellProps) {
  const meta = VIEW_META[view];

  return (
    <div className="min-h-screen relative">
      {/* Fond ambiant */}
      <div className="fixed inset-0 -z-10 app-bg">
        <div className="absolute inset-0 grid-overlay" />
      </div>

      {/* Barre latérale (desktop) */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 z-40 flex-col bg-brand-950 text-white">
        <div className="relative overflow-hidden">
          <LogoClover className="absolute -right-8 -top-10 w-32 h-32 text-brand-900/70 rotate-12" />
          <div className="relative flex items-center gap-3 px-5 h-[76px] border-b border-white/10">
            <span className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-950/50">
              <LogoClover className="w-5.5 h-5.5 text-white" />
            </span>
            <div>
              <p className="font-display font-bold text-lg leading-none tracking-tight">
                GoodLuck
              </p>
              <p className="text-brand-300 text-[11px] mt-1 font-medium">
                Suivi des créances
              </p>
            </div>
          </div>
        </div>

        <nav className="p-3 space-y-1">
          {NAV.map((n) => (
            <button
              key={n.id}
              className={`nav-item ${view === n.id ? "active" : ""}`}
              onClick={() => onNavigate(n.id)}
            >
              {n.icon({ className: "w-5 h-5" })}
              {n.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto p-3 border-t border-white/10 space-y-2">
          <div className="flex items-center gap-3 px-2 py-1.5">
            <span className="w-9 h-9 rounded-full bg-brand-700 ring-1 ring-brand-500/60 flex items-center justify-center font-display font-bold text-sm">
              GL
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-tight truncate">
                Ets GoodLuck
              </p>
              <p className="text-brand-300 text-[11px]">Compte unique</p>
            </div>
          </div>
          <button
            className="nav-item text-brand-200 hover:text-white"
            onClick={onLogout}
          >
            <IconLogout className="w-5 h-5" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Barre supérieure (mobile) */}
      <header className="lg:hidden sticky top-0 z-40 bg-brand-950 text-white flex items-center justify-between px-4 h-14 shadow-md">
        <div className="flex items-center gap-2.5">
          <span className="w-8.5 h-8.5 rounded-lg bg-brand-600 flex items-center justify-center">
            <LogoClover className="w-4.5 h-4.5 text-white" />
          </span>
          <p className="font-display font-bold tracking-tight">GoodLuck</p>
        </div>
        <button
          className="flex items-center gap-1.5 text-brand-200 hover:text-white text-sm font-medium px-2 py-1.5 rounded-lg transition-colors"
          onClick={onLogout}
        >
          <IconLogout className="w-4.5 h-4.5" />
          Quitter
        </button>
      </header>

      {/* Contenu */}
      <div className="lg:pl-64">
        <div className="max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-10">
          <div className="flex flex-wrap items-end justify-between gap-4 pt-6 lg:pt-9 pb-5">
            <div className="animate-fade-up">
              <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-brand-600">
                GoodLuck · {meta.title}
              </p>
              <h1 className="font-display text-2xl sm:text-[1.7rem] font-bold text-slate-900 tracking-tight mt-1">
                {meta.title}
              </h1>
              <p className="text-sm text-slate-500 mt-1">{meta.desc}</p>
            </div>
            <div className="flex items-center gap-3 animate-fade-up">
              <span className="hidden md:inline-flex items-center rounded-lg bg-white border border-slate-200 px-3 py-2 text-xs font-medium text-slate-500 capitalize shadow-sm">
                {dateLongue()}
              </span>
              <button className="btn btn-primary" onClick={onNew}>
                <IconPlus className="w-4.5 h-4.5" />
                <span className="hidden sm:inline">Nouvelle créance</span>
                <span className="sm:hidden">Créance</span>
              </button>
            </div>
          </div>

          <main className="pb-24 lg:pb-14">{children}</main>
        </div>
      </div>

      {/* Navigation basse (mobile) */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-slate-200 grid grid-cols-3 px-2 py-1.5 pb-[max(0.4rem,env(safe-area-inset-bottom))]">
        {NAV.map((n) => {
          const active = view === n.id;
          return (
            <button
              key={n.id}
              onClick={() => onNavigate(n.id)}
              className={`flex flex-col items-center gap-0.5 py-1.5 rounded-lg transition-colors ${
                active ? "text-brand-700 bg-brand-50" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {n.icon({ className: "w-5 h-5" })}
              <span className="text-[10.5px] font-semibold leading-tight text-center">
                {n.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
