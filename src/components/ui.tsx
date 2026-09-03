import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { Statut } from "../types";
import { STATUT_META } from "../types";
import { LANG_META, useT } from "../lib/i18n";
import type { Lang } from "../lib/i18n";
import { IconAlert, IconCheck, IconGlobe, IconInfo, IconX } from "./icons";

/* ----------------------------- Sélecteur de langue ----------------------------- */

export function LangPicker({
  dark = false,
  showLabel = true,
}: {
  dark?: boolean;
  showLabel?: boolean;
}) {
  const { lang, setLang, t } = useT();
  const langs = Object.keys(LANG_META) as Lang[];
  return (
    <div>
      <p
        className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] mb-1.5 ${
          dark ? "text-brand-300" : "text-slate-400"
        } ${showLabel ? "" : "sr-only"}`}
      >
        <IconGlobe className="w-3 h-3" />
        {t("lang.label")}
      </p>
      <div
        className={`grid grid-cols-3 gap-1 rounded-lg p-1 ring-1 ${
          dark ? "bg-white/5 ring-white/10" : "bg-slate-100 ring-slate-200"
        }`}
      >
        {langs.map((l) => {
          const active = lang === l;
          return (
            <button
              key={l}
              type="button"
              title={LANG_META[l].label}
              onClick={() => setLang(l)}
              className={`rounded-md px-1 py-1.5 text-xs font-semibold transition-all duration-150 ${
                active
                  ? "bg-brand-600 text-white shadow-md shadow-brand-900/30"
                  : dark
                    ? "text-brand-200 hover:bg-white/10 hover:text-white"
                    : "text-slate-500 hover:bg-white hover:text-brand-700"
              }`}
            >
              {LANG_META[l].short}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------------------------- Badges --------------------------------- */

export function StatutBadge({
  statut,
  className = "",
}: {
  statut: Statut;
  className?: string;
}) {
  const { statut: tStatut } = useT();
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${STATUT_META[statut].badge} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${STATUT_META[statut].dot}`} />
      {tStatut(statut)}
    </span>
  );
}

export function TypeChip({ type }: { type: string }) {
  const { type: tType } = useT();
  return (
    <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-200/70 whitespace-nowrap">
      {tType(type)}
    </span>
  );
}

/* ------------------------------ Count-up animé ------------------------------ */

export function useCountUp(target: number, duration = 850): number {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const e = 1 - Math.pow(1 - p, 3);
      setVal(target * e);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

/* ---------------------------------- Modale ---------------------------------- */

interface ModalProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

export function Modal({ title, subtitle, onClose, children, footer }: ModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6">
      <div
        className="absolute inset-0 bg-brand-950/55 animate-fade-in"
        onClick={onClose}
      />
      <div className="relative w-full sm:max-w-2xl bg-white sm:rounded-xl rounded-t-2xl shadow-2xl animate-scale-in max-h-[92vh] flex flex-col">
        <div className="flex items-start justify-between gap-4 px-5 sm:px-6 py-4 border-b border-slate-200">
          <div>
            <h2 className="font-display text-lg font-semibold text-slate-900">{title}</h2>
            {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          <button className="icon-btn shrink-0" onClick={onClose} aria-label="Fermer">
            <IconX className="w-5 h-5" />
          </button>
        </div>
        <div className="px-5 sm:px-6 py-5 overflow-y-auto scroll-thin grow">{children}</div>
        {footer && (
          <div className="px-5 sm:px-6 py-4 border-t border-slate-200 bg-slate-50/70 sm:rounded-b-xl flex justify-end gap-2 flex-wrap">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------- Dialogue de confirmation ------------------------- */

interface ConfirmProps {
  title: string;
  children: ReactNode;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  title,
  children,
  confirmLabel,
  onConfirm,
  onCancel,
}: ConfirmProps) {
  const { t } = useT();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-brand-950/55 animate-fade-in" onClick={onCancel} />
      <div className="relative card w-full max-w-md p-5 sm:p-6 animate-scale-in">
        <div className="flex items-start gap-3.5">
          <span className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <IconAlert className="w-5 h-5" />
          </span>
          <div className="min-w-0">
            <h3 className="font-display font-semibold text-slate-900 text-lg leading-tight">
              {title}
            </h3>
            <div className="text-sm text-slate-600 mt-1.5 leading-relaxed">{children}</div>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button className="btn btn-ghost" onClick={onCancel} autoFocus>
            {t("confirm.cancel")}
          </button>
          <button className="btn btn-danger" onClick={onConfirm}>
            {confirmLabel ?? t("confirm.delete")}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------- Toasts ---------------------------------- */

export type ToastKind = "success" | "error" | "info";

export interface ToastItem {
  id: number;
  kind: ToastKind;
  msg: string;
}

const TOAST_STYLE: Record<ToastKind, { border: string; icon: ReactNode }> = {
  success: {
    border: "border-l-emerald-500",
    icon: (
      <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
        <IconCheck className="w-3.5 h-3.5" />
      </span>
    ),
  },
  error: {
    border: "border-l-red-500",
    icon: (
      <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
        <IconAlert className="w-3.5 h-3.5" />
      </span>
    ),
  },
  info: {
    border: "border-l-brand-500",
    icon: (
      <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center shrink-0">
        <IconInfo className="w-3.5 h-3.5" />
      </span>
    ),
  },
};

export function ToastStack({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: number) => void;
}) {
  return (
    <div className="fixed bottom-20 lg:bottom-4 right-4 z-[70] flex flex-col gap-2 w-[min(92vw,380px)]">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`card border-l-4 ${TOAST_STYLE[t.kind].border} px-3.5 py-3 flex items-center gap-3 shadow-lg animate-slide-in`}
        >
          {TOAST_STYLE[t.kind].icon}
          <p className="text-sm font-medium text-slate-800 grow">{t.msg}</p>
          <button
            className="icon-btn w-7 h-7"
            onClick={() => onDismiss(t.id)}
            aria-label="Fermer la notification"
          >
            <IconX className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

/* -------------------------------- État vide --------------------------------- */

export function EmptyState({
  title,
  hint,
  action,
}: {
  title: string;
  hint: string;
  action?: ReactNode;
}) {
  return (
    <div className="card border-dashed border-slate-300 px-6 py-12 text-center animate-fade-up">
      <span className="mx-auto w-12 h-12 rounded-full bg-brand-50 text-brand-500 flex items-center justify-center mb-3">
        <IconInfo className="w-6 h-6" />
      </span>
      <h3 className="font-display font-semibold text-slate-800">{title}</h3>
      <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">{hint}</p>
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}
