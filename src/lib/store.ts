import { useEffect, useState } from "react";
import type { Creance } from "../types";
import { seedCreances } from "../data/seed";
import { todayISO } from "./format";

const KEY_CREANCES = "goodluck.creances.v1";
const KEY_SESSION = "goodluck.session.v1";
const KEY_SEED_VERSION = "goodluck.seedVersion.v1";

/**
 * À incrémenter chaque fois que le jeu de données initial évolue
 * (nouvelle créance importée, correction d'un montant, etc.).
 * v2 : ajout de la créance supplémentaire de Mr Tushar (731 850 FCFA).
 * v3 : annulation — suppression du doublon gl-21 (retour au jeu d'origine).
 */
const SEED_VERSION = 3;

/** Identifiants de créances retirées du jeu initial (migrations de suppression). */
const SUPPRIMEES: Record<number, string[]> = { 3: ["gl-21"] };

function writeSeedVersion(v: number) {
  try {
    localStorage.setItem(KEY_SEED_VERSION, String(v));
  } catch {
    /* stockage indisponible */
  }
}

export const USER = "EtsGoodluck";
export const PASS = "CG86965555";

export function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return "id-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function load(): Creance[] {
  let saved: Creance[] | null = null;
  let version = 0;
  try {
    const raw = localStorage.getItem(KEY_CREANCES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) saved = parsed as Creance[];
    }
    version = Number(localStorage.getItem(KEY_SEED_VERSION)) || 0;
  } catch {
    /* données corrompues → on repart du jeu initial */
    saved = null;
  }

  // Premier lancement : on charge l'intégralité du jeu initial.
  if (saved === null) {
    writeSeedVersion(SEED_VERSION);
    return seedCreances;
  }

  // Mise à jour du jeu de données : les nouvelles créances initiales
  // absentes sont réinjectées, sans toucher aux fiches déjà présentes
  // (ni aux créances ajoutées/modifiées par l'utilisateur).
  if (version < SEED_VERSION) {
    // Suppressions liées aux migrations (ex. doublon retiré).
    const aRetirer = new Set<string>();
    for (const v of Object.keys(SUPPRIMEES)) {
      if (version < Number(v)) {
        SUPPRIMEES[Number(v)].forEach((id) => aRetirer.add(id));
      }
    }
    if (aRetirer.size > 0) {
      saved = saved.filter((c) => !aRetirer.has(c.id));
    }

    const ids = new Set(saved.map((c) => c.id));
    const manquantes = seedCreances.filter((c) => !ids.has(c.id));
    if (manquantes.length > 0) saved = [...manquantes, ...saved];
    writeSeedVersion(SEED_VERSION);
  }
  return saved;
}

export function useCreances() {
  const [creances, setCreances] = useState<Creance[]>(load);

  useEffect(() => {
    try {
      localStorage.setItem(KEY_CREANCES, JSON.stringify(creances));
    } catch {
      /* stockage indisponible */
    }
  }, [creances]);

  const add = (c: Creance) => setCreances((p) => [c, ...p]);

  const update = (c: Creance) =>
    setCreances((p) => p.map((x) => (x.id === c.id ? c : x)));

  const remove = (id: string) =>
    setCreances((p) => p.filter((x) => x.id !== id));

  /** Incrémente le nombre de relances et date la dernière relance à aujourd'hui. */
  const relancer = (id: string) =>
    setCreances((p) =>
      p.map((x) =>
        x.id === id
          ? {
              ...x,
              nombreRelances: x.nombreRelances + 1,
              dateDerniereRelance: todayISO(),
            }
          : x
      )
    );

  return { creances, add, update, remove, relancer };
}

export function isLogged(): boolean {
  try {
    return localStorage.getItem(KEY_SESSION) === "1";
  } catch {
    return false;
  }
}

export function setLogged(v: boolean) {
  try {
    if (v) localStorage.setItem(KEY_SESSION, "1");
    else localStorage.removeItem(KEY_SESSION);
  } catch {
    /* ignore */
  }
}
