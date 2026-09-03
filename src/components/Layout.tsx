import type { ReactNode } from "react";
import { dateLongue } from "../lib/format";
import { LANG_META, useT } from "../lib/i18n";
import {
  IconDashboard,
  IconList,
  IconLogout,
  IconPie,
  IconPlus,
  LogoClover,
} from "./icons";
import { LangPicker } from "./ui";

export type View = "dashboard" | "creances" | "synthese";

interface ShellProps {
  view: View;
  onNavigate: (v: View) => void;
  onLogout: () => void;
  onNew: () => void;
  children: ReactNode;
}

export default function Shell({ view, onNavigate, onLogout, onNew, children }: ShellProps) {
  const { t, lang } = useT();

  const NAV: { id: View; label: string; icon: (p: { className?: string }) => ReactNode }[] = [
    { id: "dashboard", label: t("nav.dashboard"), icon: (p) => <IconDashboard {...p} /> },
    { id: "creances", label: t("nav.creances"), icon: (p) => <IconList {...p} /> },
    { id: "synthese", label: t("nav.synthese"), icon: (p) => <IconPie {...p} /> },
  ];

  const VIEW_META: Record<View, { title: string; desc: string }> = {
    dashboard: { title: t("view.dashboard.title"), desc: t("view.dashboard.desc") },
    creances: { title: t("view.creances.title"), desc: t("view.creances.desc") },
    synthese: { title: t("view.synthese.title"), desc: t("view.synthese.desc") },
  };

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
                {t("app.subtitle")}
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

        <div className="mt-auto p-3 border-t border-white/10 space-y-2.5">
          <div className="px-2">
            <LangPicker dark />
          </div>
          <div className="flex items-center gap-3 px-2 py-1.5">
            <span className="w-9 h-9 rounded-full bg-brand-700 ring-1 ring-brand-500/60 flex items-center justify-center font-display font-bold text-sm">
              GL
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-tight truncate">Ets GoodLuck</p>
              <p className="text-brand-300 text-[11px]">{t("layout.account")}</p>
            </div>
          </div>
          <button className="nav-item text-brand-200 hover:text-white" onClick={onLogout}>
            <IconLogout className="w-5 h-5" />
            {t("layout.logout")}
          </button>
        </div>
      </aside>

      {/* Barre supérieure (mobile) */}
      <header className="lg:hidden sticky top-0 z-40 bg-brand-950 text-white flex items-center justify-between gap-2 px-4 h-14 shadow-md">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-8.5 h-8.5 rounded-lg bg-brand-600 flex items-center justify-center shrink-0">
            <LogoClover className="w-4.5 h-4.5 text-white" />
          </span>
          <p className="font-display font-bold tracking-tight truncate">GoodLuck</p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-28">
            <LangPicker dark showLabel={false} />
          </div>
          <button
            className="flex items-center gap-1.5 text-brand-200 hover:text-white text-sm font-medium px-2 py-1.5 rounded-lg transition-colors"
            onClick={onLogout}
          >
            <IconLogout className="w-4.5 h-4.5" />
            <span className="hidden sm:inline">{t("layout.logoutShort")}</span>
          </button>
        </div>
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
                {dateLongue(LANG_META[lang].num)}
              </span>
              <button className="btn btn-primary" onClick={onNew}>
                <IconPlus className="w-4.5 h-4.5" />
                <span className="hidden sm:inline">{t("layout.new")}</span>
                <span className="sm:hidden">{t("layout.newShort")}</span>
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
