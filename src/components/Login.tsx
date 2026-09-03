import { useState } from "react";
import type { FormEvent } from "react";
import { PASS, USER } from "../lib/store";
import { useT } from "../lib/i18n";
import {
  IconBell,
  IconEye,
  IconEyeOff,
  IconLock,
  IconPie,
  IconSpinner,
  IconTrendUp,
  IconUser,
  LogoClover,
} from "./icons";
import { LangPicker } from "./ui";

export default function Login({ onSuccess }: { onSuccess: () => void }) {
  const { t } = useT();
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (loading) return;
    setErr(false);
    setLoading(true);
    window.setTimeout(() => {
      if (user.trim() === USER && pass === PASS) {
        onSuccess();
      } else {
        setErr(true);
        setLoading(false);
        setShakeKey((k) => k + 1);
      }
    }, 550);
  }

  return (
    <div className="min-h-screen app-bg lg:grid lg:grid-cols-[1.05fr_1fr]">
      {/* Panneau de marque (desktop) */}
      <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-brand-950 text-white p-12">
        <div className="absolute inset-0 opacity-[0.16]">
          <div className="absolute inset-0 grid-overlay" />
        </div>
        <LogoClover className="absolute -right-20 -bottom-24 w-[26rem] h-[26rem] text-brand-800/60 rotate-12" />
        <LogoClover className="absolute -left-10 -top-16 w-56 h-56 text-brand-900/80 -rotate-6" />

        <div className="relative flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-xl bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-950/60">
              <LogoClover className="w-6 h-6 text-white" />
            </span>
            <div>
              <p className="font-display font-bold text-xl leading-none tracking-tight">
                {t("login.brandName")}
              </p>
              <p className="text-brand-300 text-xs mt-1 font-medium">
                {t("login.tagline")}
              </p>
            </div>
          </div>
          <div className="w-36 shrink-0">
            <LangPicker dark />
          </div>
        </div>

        <div className="relative max-w-md">
          <h1 className="font-display text-4xl font-bold leading-[1.1] tracking-tight">
            {t("login.hero1")}
            <br />
            {t("login.hero2")}
          </h1>
          <p className="text-brand-200/90 mt-4 leading-relaxed">{t("login.heroDesc")}</p>
          <ul className="mt-8 space-y-4">
            <li className="flex items-center gap-3.5">
              <span className="w-9 h-9 rounded-lg bg-brand-800/80 ring-1 ring-brand-700 flex items-center justify-center text-brand-200">
                <IconTrendUp className="w-4.5 h-4.5" />
              </span>
              <div>
                <p className="font-semibold text-sm">{t("login.f1t")}</p>
                <p className="text-brand-300 text-xs">{t("login.f1d")}</p>
              </div>
            </li>
            <li className="flex items-center gap-3.5">
              <span className="w-9 h-9 rounded-lg bg-brand-800/80 ring-1 ring-brand-700 flex items-center justify-center text-brand-200">
                <IconBell className="w-4.5 h-4.5" />
              </span>
              <div>
                <p className="font-semibold text-sm">{t("login.f2t")}</p>
                <p className="text-brand-300 text-xs">{t("login.f2d")}</p>
              </div>
            </li>
            <li className="flex items-center gap-3.5">
              <span className="w-9 h-9 rounded-lg bg-brand-800/80 ring-1 ring-brand-700 flex items-center justify-center text-brand-200">
                <IconPie className="w-4.5 h-4.5" />
              </span>
              <div>
                <p className="font-semibold text-sm">{t("login.f3t")}</p>
                <p className="text-brand-300 text-xs">{t("login.f3d")}</p>
              </div>
            </li>
          </ul>
        </div>

        <p className="relative text-brand-400 text-xs">{t("login.footer")}</p>
      </aside>

      {/* Formulaire */}
      <main className="flex flex-col items-center justify-center p-6 sm:p-10 min-h-screen lg:min-h-0">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center justify-between gap-3 mb-8">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-brand-950 flex items-center justify-center">
                <LogoClover className="w-5.5 h-5.5 text-brand-300" />
              </span>
              <div>
                <p className="font-display font-bold text-lg leading-none text-brand-950">
                  {t("login.brandName")}
                </p>
                <p className="text-slate-500 text-[11px] mt-0.5 font-medium">
                  {t("login.brandSubMobile")}
                </p>
              </div>
            </div>
            <div className="w-32 shrink-0">
              <LangPicker />
            </div>
          </div>

          <div
            key={shakeKey}
            className={`card p-7 sm:p-8 ${err ? "animate-shake" : "animate-fade-up"}`}
          >
            <div className="flex items-center gap-2 text-brand-700 mb-5">
              <IconLock className="w-4 h-4" />
              <span className="text-[11px] font-bold tracking-[0.14em] uppercase">
                {t("login.access")}
              </span>
            </div>
            <h2 className="font-display text-2xl font-bold text-slate-900 tracking-tight">
              {t("login.title")}
            </h2>
            <p className="text-sm text-slate-500 mt-1">{t("login.subtitle")}</p>

            <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
              <div>
                <label htmlFor="gl-user" className="block text-xs font-semibold text-slate-600 mb-1.5">
                  {t("login.username")}
                </label>
                <div className="relative">
                  <IconUser className="w-4.5 h-4.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="gl-user"
                    type="text"
                    autoComplete="username"
                    className={`field pl-9.5 ${err ? "field-error" : ""}`}
                    placeholder={t("login.usernamePh")}
                    value={user}
                    onChange={(e) => setUser(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>
              <div>
                <label htmlFor="gl-pass" className="block text-xs font-semibold text-slate-600 mb-1.5">
                  {t("login.password")}
                </label>
                <div className="relative">
                  <IconLock className="w-4.5 h-4.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="gl-pass"
                    type={show ? "text" : "password"}
                    autoComplete="current-password"
                    className={`field pl-9.5 pr-10 ${err ? "field-error" : ""}`}
                    placeholder="••••••••••"
                    value={pass}
                    onChange={(e) => setPass(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 icon-btn w-7.5 h-7.5"
                    onClick={() => setShow((s) => !s)}
                    aria-label={show ? t("login.hidePass") : t("login.showPass")}
                  >
                    {show ? <IconEyeOff className="w-4 h-4" /> : <IconEye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {err && (
                <p role="alert" className="text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 animate-fade-in">
                  {t("login.error")}
                </p>
              )}

              <button type="submit" className="btn btn-primary w-full py-2.5" disabled={loading}>
                {loading ? (
                  <>
                    <IconSpinner className="w-4.5 h-4.5" />
                    {t("login.checking")}
                  </>
                ) : (
                  t("login.submit")
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">{t("login.localNote")}</p>
        </div>
      </main>
    </div>
  );
}
