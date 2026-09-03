import type { Creance } from "../types";
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
 * Une créance nécessite une action urgente si :
 *  - son statut est « En retard » ou « Contentieux »,
 *  - ou si sa date de prochaine action est dépassée (et qu'il reste un solde).
 */
export function isUrgente(c: Creance): boolean {
  if (c.statut === "En retard" || c.statut === "Contentieux") return true;
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
