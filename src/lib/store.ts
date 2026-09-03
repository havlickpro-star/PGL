import { useEffect, useState } from "react";
import type { Creance } from "../types";
import { seedCreances } from "../data/seed";
import { todayISO } from "./format";

const KEY_CREANCES = "goodluck.creances.v1";
const KEY_SESSION = "goodluck.session.v1";

export const USER = "EtsGoodluck";
export const PASS = "CG86965555";

export function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return "id-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function load(): Creance[] {
  try {
    const raw = localStorage.getItem(KEY_CREANCES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as Creance[];
    }
  } catch {
    /* données corrompues → on repart du jeu initial */
  }
  return seedCreances;
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
