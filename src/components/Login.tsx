import { useState } from "react";
import type { FormEvent } from "react";
import { PASS, USER } from "../lib/store";
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

export default function Login({ onSuccess }: { onSuccess: () => void }) {
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

        <div className="relative flex items-center gap-3">
          <span className="w-11 h-11 rounded-xl bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-950/60">
            <LogoClover className="w-6 h-6 text-white" />
          </span>
          <div>
            <p className="font-display font-bold text-xl leading-none tracking-tight">
              GoodLuck
            </p>
            <p className="text-brand-300 text-xs mt-1 font-medium">
              Vente à crédit · Suivi des créances
            </p>
          </div>
        </div>

        <div className="relative max-w-md">
          <h1 className="font-display text-4xl font-bold leading-[1.1] tracking-tight">
            Vos créances,
            <br />
            sous contrôle.
          </h1>
          <p className="text-brand-200/90 mt-4 leading-relaxed">
            Consignez chaque vente à crédit, suivez les règlements en FCFA et
            relancez au bon moment — sans rien laisser filer.
          </p>
          <ul className="mt-8 space-y-4">
            <li className="flex items-center gap-3.5">
              <span className="w-9 h-9 rounded-lg bg-brand-800/80 ring-1 ring-brand-700 flex items-center justify-center text-brand-200">
                <IconTrendUp className="w-4.5 h-4.5" />
              </span>
              <div>
                <p className="font-semibold text-sm">Recouvrement en temps réel</p>
                <p className="text-brand-300 text-xs">
                  Totaux accordés, réglés et restants calculés automatiquement.
                </p>
              </div>
            </li>
            <li className="flex items-center gap-3.5">
              <span className="w-9 h-9 rounded-lg bg-brand-800/80 ring-1 ring-brand-700 flex items-center justify-center text-brand-200">
                <IconBell className="w-4.5 h-4.5" />
              </span>
              <div>
                <p className="font-semibold text-sm">Relances organisées</p>
                <p className="text-brand-300 text-xs">
                  Prochaines actions et retards mis en évidence chaque jour.
                </p>
              </div>
            </li>
            <li className="flex items-center gap-3.5">
              <span className="w-9 h-9 rounded-lg bg-brand-800/80 ring-1 ring-brand-700 flex items-center justify-center text-brand-200">
                <IconPie className="w-4.5 h-4.5" />
              </span>
              <div>
                <p className="font-semibold text-sm">Synthèse par entité</p>
                <p className="text-brand-300 text-xs">
                  L'encours de chaque client regroupé en un coup d'œil.
                </p>
              </div>
            </li>
          </ul>
        </div>

        <p className="relative text-brand-400 text-xs">
          © 2026 Ets GoodLuck — Espace de gestion interne
        </p>
      </aside>

      {/* Formulaire */}
      <main className="flex flex-col items-center justify-center p-6 sm:p-10 min-h-screen lg:min-h-0">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <span className="w-10 h-10 rounded-xl bg-brand-950 flex items-center justify-center">
              <LogoClover className="w-5.5 h-5.5 text-brand-300" />
            </span>
            <div>
              <p className="font-display font-bold text-lg leading-none text-brand-950">
                GoodLuck
              </p>
              <p className="text-slate-500 text-[11px] mt-0.5 font-medium">
                Suivi des créances clients
              </p>
            </div>
          </div>

          <div key={shakeKey} className={`card p-7 sm:p-8 ${err ? "animate-shake" : "animate-fade-up"}`}>
            <div className="flex items-center gap-2 text-brand-700 mb-5">
              <IconLock className="w-4 h-4" />
              <span className="text-[11px] font-bold tracking-[0.14em] uppercase">
                Accès sécurisé
              </span>
            </div>
            <h2 className="font-display text-2xl font-bold text-slate-900 tracking-tight">
              Connexion
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Espace réservé à l'établissement. Identifiant unique, sans
              inscription.
            </p>

            <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
              <div>
                <label
                  htmlFor="gl-user"
                  className="block text-xs font-semibold text-slate-600 mb-1.5"
                >
                  Nom d'utilisateur
                </label>
                <div className="relative">
                  <IconUser className="w-4.5 h-4.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="gl-user"
                    type="text"
                    autoComplete="username"
                    className={`field pl-9.5 ${err ? "field-error" : ""}`}
                    placeholder="Votre identifiant"
                    value={user}
                    onChange={(e) => setUser(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="gl-pass"
                  className="block text-xs font-semibold text-slate-600 mb-1.5"
                >
                  Mot de passe
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
                    aria-label={show ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    {show ? (
                      <IconEyeOff className="w-4 h-4" />
                    ) : (
                      <IconEye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {err && (
                <p
                  role="alert"
                  className="text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 animate-fade-in"
                >
                  Identifiants incorrects. Veuillez réessayer.
                </p>
              )}

              <button
                type="submit"
                className="btn btn-primary w-full py-2.5"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <IconSpinner className="w-4.5 h-4.5" />
                    Vérification…
                  </>
                ) : (
                  "Se connecter"
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            Les données sont enregistrées localement sur cet appareil.
          </p>
        </div>
      </main>
    </div>
  );
}
