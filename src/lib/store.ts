import { useEffect, useState } from "react";
import type { Creance, DonneesCreance, Evenement } from "../types";
import { solde } from "../types";
import { seedCreances } from "../data/seed";
import { fmtRef, nowISO, refNum, todayISO } from "./format";
import { effectiveStatut, statutApresPaiement } from "./selectors";

const KEY_CREANCES = "goodluck.creances.v1";
const KEY_SESSION = "goodluck.session.v1";
const KEY_SEED_VERSION = "goodluck.seedVersion.v1";

/**
 * v2 : ajout de la créance supplémentaire de Mr Tushar (731 850 FCFA).
 * v3 : annulation — suppression du doublon gl-21.
 * v4 : références uniques (#001…), historique et statuts automatiques.
 */
const SEED_VERSION = 4;

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

let evSeq = 0;
function eid(): string {
  return `ev-${Date.now()}-${++evSeq}`;
}
function ev(data: Omit<Evenement, "id" | "date"> & { date?: string }): Evenement {
  return { id: eid(), date: data.date ?? nowISO(), ...data };
}

type Brut = Omit<Creance, "ref" | "historique"> & {
  ref?: string;
  historique?: Evenement[];
};

/** Attribue une référence (#001…) et un historique aux fiches qui en manquent. */
function normalize(list: Brut[]): Creance[] {
  let next = list.reduce((m, c) => Math.max(m, refNum(c.ref ?? "")), 0) + 1;
  return list.map((c) => {
    const out: Creance = { ...(c as Creance) };
    if (!out.ref) out.ref = fmtRef(next++);
    if (!Array.isArray(out.historique)) {
      const base = (out.dateAchat ?? todayISO()) + "T09:00";
      const h: Evenement[] = [
        ev({
          type: "creation",
          excel: true,
          montantTotal: out.montantTotal,
          date: base,
        }),
      ];
      if (out.montantRegle > 0) {
        h.push(
          ev({ type: "paiement", montant: out.montantRegle, reprise: true, date: base })
        );
      }
      out.historique = h;
    }
    return out;
  });
}

function load(): Creance[] {
  let saved: Brut[] | null = null;
  let version = 0;
  try {
    const raw = localStorage.getItem(KEY_CREANCES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) saved = parsed as Brut[];
    }
    version = Number(localStorage.getItem(KEY_SEED_VERSION)) || 0;
  } catch {
    saved = null;
  }

  if (saved === null) {
    writeSeedVersion(SEED_VERSION);
    return normalize(seedCreances);
  }

  if (version < SEED_VERSION) {
    // Suppressions liées aux migrations (ex. doublon retiré).
    const aRetirer = new Set<string>();
    for (const v of Object.keys(SUPPRIMEES)) {
      if (version < Number(v)) SUPPRIMEES[Number(v)].forEach((id) => aRetirer.add(id));
    }
    if (aRetirer.size > 0) saved = saved.filter((c) => !aRetirer.has(c.id));

    const ids = new Set(saved.map((c) => c.id));
    const manquantes = seedCreances.filter((c) => !ids.has(c.id));
    if (manquantes.length > 0) saved = [...saved, ...manquantes];
    writeSeedVersion(SEED_VERSION);
  }
  return normalize(saved);
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

  const touch = (id: string, fn: (c: Creance) => Creance) =>
    setCreances((p) => p.map((c) => (c.id === id ? fn(c) : c)));

  /** Crée une créance : référence unique + événement de création. */
  const ajouter = (d: DonneesCreance) => {
    setCreances((p) => {
      const next = p.reduce((m, c) => Math.max(m, refNum(c.ref)), 0) + 1;
      const c: Creance = {
        ...d,
        id: uid(),
        ref: fmtRef(next),
        historique: [
          ev({
            type: "creation",
            montantTotal: d.montantTotal,
            agent: d.agent || undefined,
          }),
        ],
      };
      return [c, ...p];
    });
  };

  /** Modifie la fiche : force la cohérence du statut et journalise. */
  const modifier = (d: DonneesCreance & { id: string }) => {
    setCreances((p) =>
      p.map((old) => {
        if (old.id !== d.id) return old;
        let statut = d.statut;
        const s = d.montantTotal - d.montantRegle;
        if (s <= 0) statut = "Soldé";
        else if (d.montantRegle > 0 && statut === "Non échu") statut = "Paiement partiel";
        const events: Evenement[] = [];
        if (statut !== old.statut) {
          events.push(
            ev({ type: "statut", from: old.statut, to: statut, cause: "modification" })
          );
        } else {
          events.push(ev({ type: "modification" }));
        }
        return { ...old, ...d, statut, historique: [...old.historique, ...events] };
      })
    );
  };

  const supprimer = (id: string) => setCreances((p) => p.filter((x) => x.id !== id));

  /** Relance : incrémente le compteur, date à aujourd'hui, passe le statut en « Relance ». */
  const relancer = (id: string) =>
    touch(id, (c) => {
      const eff = effectiveStatut(c);
      const events: Evenement[] = [
        ev({ type: "relance", relanceNum: c.nombreRelances + 1 }),
      ];
      let statut = c.statut;
      if (eff !== "Soldé" && eff !== "Contentieux" && statut !== "Relance") {
        events.push(ev({ type: "statut", from: statut, to: "Relance", cause: "relance" }));
        statut = "Relance";
      }
      return {
        ...c,
        nombreRelances: c.nombreRelances + 1,
        dateDerniereRelance: todayISO(),
        statut,
        historique: [...c.historique, ...events],
      };
    });

  /**
   * Paiement : incrémente le montant réglé, recalcule le solde et le statut,
   * journalise l'opération. Plafonné au solde restant (jamais de solde négatif).
   */
  const payer = (id: string, montant: number, datePaiement: string, remarque?: string) =>
    touch(id, (c) => {
      const reste = solde(c);
      const m = Math.min(Math.max(0, Math.round(montant)), reste);
      const nouveauRegle = c.montantRegle + m;
      const statut = statutApresPaiement(c, nouveauRegle);
      const events: Evenement[] = [
        ev({
          type: "paiement",
          montant: m,
          payDate: datePaiement,
          note: remarque || undefined,
        }),
      ];
      if (statut !== c.statut) {
        events.push(ev({ type: "statut", from: c.statut, to: statut, cause: "paiement" }));
      }
      return {
        ...c,
        montantRegle: nouveauRegle,
        statut,
        historique: [...c.historique, ...events],
      };
    });

  return { creances, ajouter, modifier, supprimer, relancer, payer };
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
