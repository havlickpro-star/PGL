import type { Creance, Statut } from "../types";
import { solde } from "../types";
import { todayISO } from "./format";

export interface Totaux {
  accorde: number;
  regle: number;
  du: number;
}

export function calcTotaux(list: Creance[]): Totaux {
  return list.reduce(
    (acc, c) => ({
      accorde: acc.accorde + c.montantTotal,
      regle: acc.regle + c.montantRegle,
      du: acc.du + solde(c),
    }),
    { accorde: 0, regle: 0, du: 0 }
  );
}

/**
 * Statut réel et toujours cohérent d'une créance, dérivé de ses montants,
 * relances et dates — jamais en contradiction avec le solde.
 *
 * Règles :
 *  - solde à 0                    → « Soldé »
 *  - « Contentieux »              → conservé (dossier juridique)
 *  - « En retard » ou échéance
 *    dépassée avec solde > 0      → « En retard »
 *  - « Relance »                  → conservé
 *  - paiements partiels           → « Paiement partiel »
 *  - sinon                        → « Non échu »
 */
export function effectiveStatut(c: Creance, today = todayISO()): Statut {
  const s = solde(c);
  if (s === 0) return "Soldé";
  if (c.statut === "Contentieux") return "Contentieux";
  if (c.statut === "En retard") return "En retard";
  if (c.dateEcheance && c.dateEcheance < today) return "En retard";
  if (c.statut === "Relance") return "Relance";
  if (c.montantRegle > 0) return "Paiement partiel";
  return "Non échu";
}

/** Statut à appliquer après un paiement, en préservant retard / contentieux. */
export function statutApresPaiement(c: Creance, nouveauRegle: number): Statut {
  if (c.montantTotal - nouveauRegle <= 0) return "Soldé";
  if (c.statut === "Contentieux" || c.statut === "En retard") return c.statut;
  if (nouveauRegle > 0) return "Paiement partiel";
  return c.statut;
}

/** « Paiement partiel » affiché en information secondaire (retard / contentieux). */
export function estPartiel(c: Creance): boolean {
  const eff = effectiveStatut(c);
  return (
    c.montantRegle > 0 &&
    solde(c) > 0 &&
    (eff === "En retard" || eff === "Contentieux")
  );
}

/**
 * Une créance nécessite une action urgente si :
 *  - son statut réel est « En retard » ou « Contentieux »,
 *  - ou si sa date de prochaine action est dépassée (et qu'il reste un solde).
 */
export function isUrgente(c: Creance): boolean {
  const eff = effectiveStatut(c);
  if (eff === "En retard" || eff === "Contentieux") return true;
  return (
    !!c.prochaineActionDate &&
    c.prochaineActionDate < todayISO() &&
    solde(c) > 0
  );
}

export interface Entite {
  nom: string;
  type: string;
  adresse: string;
  telephone: string;
  count: number;
  total: number;
  regle: number;
  du: number;
}

/** Regroupe les créances par nom de client / établissement. */
export function grouperParEntite(list: Creance[]): Entite[] {
  const map = new Map<string, Entite>();
  for (const c of list) {
    const key = c.nomClient.trim();
    const e = map.get(key);
    if (e) {
      e.count += 1;
      e.total += c.montantTotal;
      e.regle += c.montantRegle;
      e.du += solde(c);
      if (!e.telephone && c.telephone) e.telephone = c.telephone;
      if (!e.adresse && c.adresse) e.adresse = c.adresse;
    } else {
      map.set(key, {
        nom: key,
        type: c.typeEtab,
        adresse: c.adresse,
        telephone: c.telephone,
        count: 1,
        total: c.montantTotal,
        regle: c.montantRegle,
        du: solde(c),
      });
    }
  }
  return [...map.values()].sort((a, b) => b.du - a.du || a.nom.localeCompare(b.nom));
}
