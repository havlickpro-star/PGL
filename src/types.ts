export const TYPES_ETABLISSEMENT = [
  "Restaurant",
  "Particulier",
  "Boutique",
  "Hôtel",
  "Autre",
] as const;
export type TypeEtablissement = (typeof TYPES_ETABLISSEMENT)[number];

export const STATUTS = [
  "Non échu",
  "En retard",
  "Relance",
  "Paiement partiel",
  "Soldé",
  "Contentieux",
] as const;
export type Statut = (typeof STATUTS)[number];

export const REACTIONS = [
  "Positive - promesse de paiement",
  "Négative",
  "Pas de réponse",
  "Autre",
] as const;
export type Reaction = (typeof REACTIONS)[number] | "";

export interface Creance {
  id: string;
  /** Nom de l'établissement / du client */
  nomClient: string;
  typeEtab: TypeEtablissement;
  adresse: string;
  telephone: string;
  /** Responsable ayant validé l'achat à crédit côté client */
  responsableClient: string;
  /** Agent GoodLuck ayant accordé le crédit */
  agent: string;
  /** Date de l'achat à crédit (ISO yyyy-mm-dd) */
  dateAchat: string | null;
  montantTotal: number;
  montantRegle: number;
  /** Date d'échéance convenue */
  dateEcheance: string | null;
  dateDerniereRelance: string | null;
  nombreRelances: number;
  reaction: Reaction;
  statut: Statut;
  prochaineActionTexte: string;
  prochaineActionDate: string | null;
  remarques: string;
}

export interface StatutMeta {
  /** classes du badge */
  badge: string;
  /** teinte de fond de la ligne */
  row: string;
  /** couleur d'accent (bordure gauche, liseré) */
  accent: string;
  /** pastille légende */
  dot: string;
  /** couleur du segment dans le graphique */
  chart: string;
}

export const STATUT_META: Record<Statut, StatutMeta> = {
  "Non échu": {
    badge: "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-300/70",
    row: "bg-white",
    accent: "#94a3b8",
    dot: "bg-slate-400",
    chart: "#94a3b8",
  },
  "En retard": {
    badge: "bg-red-100 text-red-700 ring-1 ring-inset ring-red-300/70",
    row: "bg-red-50/80 hover:bg-red-50",
    accent: "#dc2626",
    dot: "bg-red-500",
    chart: "#dc2626",
  },
  Relance: {
    badge: "bg-amber-100 text-amber-800 ring-1 ring-inset ring-amber-300/70",
    row: "bg-amber-50/80 hover:bg-amber-50",
    accent: "#f59e0b",
    dot: "bg-amber-500",
    chart: "#f59e0b",
  },
  "Paiement partiel": {
    badge: "bg-slate-200 text-slate-700 ring-1 ring-inset ring-slate-400/50",
    row: "bg-slate-50 hover:bg-slate-100/70",
    accent: "#64748b",
    dot: "bg-slate-500",
    chart: "#3f7ccb",
  },
  Soldé: {
    badge: "bg-emerald-100 text-emerald-700 ring-1 ring-inset ring-emerald-300/70",
    row: "bg-emerald-50/80 hover:bg-emerald-50",
    accent: "#059669",
    dot: "bg-emerald-500",
    chart: "#10b981",
  },
  Contentieux: {
    badge: "bg-red-700 text-white ring-1 ring-inset ring-red-800",
    row: "bg-red-100/80 hover:bg-red-100",
    accent: "#991b1b",
    dot: "bg-red-800",
    chart: "#7f1d1d",
  },
};

/** Solde restant dû — toujours calculé, jamais saisi. */
export const solde = (c: Creance): number =>
  Math.max(0, c.montantTotal - c.montantRegle);
