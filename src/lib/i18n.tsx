import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import type { Evenement, Reaction, Statut, TypeEtablissement } from "../types";
import { fcfa, fmtDate, setNumLocale } from "./format";

export type Lang = "fr" | "en" | "hi";

export const LANG_META: Record<
  Lang,
  { label: string; short: string; html: string; num: string }
> = {
  fr: { label: "Français", short: "FR", html: "fr", num: "fr-FR" },
  en: { label: "English", short: "EN", html: "en", num: "en-IN" },
  hi: { label: "हिन्दी", short: "हिं", html: "hi", num: "hi-IN" },
};

const fr = {
  appTitle: "GoodLuck — Suivi des créances clients",
  "lang.label": "Langue",

  // ---- Connexion ----
  "login.brandName": "GoodLuck",
  "login.brandSub": "Suivi des créances",
  "login.brandSubMobile": "Suivi des créances clients",
  "login.access": "Accès sécurisé",
  "login.title": "Connexion",
  "login.subtitle":
    "Espace réservé à l'établissement. Identifiant unique, sans inscription.",
  "login.username": "Nom d'utilisateur",
  "login.usernamePh": "Votre identifiant",
  "login.password": "Mot de passe",
  "login.showPass": "Afficher le mot de passe",
  "login.hidePass": "Masquer le mot de passe",
  "login.error": "Identifiants incorrects. Veuillez réessayer.",
  "login.submit": "Se connecter",
  "login.checking": "Vérification…",
  "login.localNote": "Les données sont enregistrées localement sur cet appareil.",
  "login.tagline": "Vente à crédit · Suivi des créances",
  "login.hero1": "Vos créances,",
  "login.hero2": "sous contrôle.",
  "login.heroDesc":
    "Consignez chaque vente à crédit, suivez les règlements en FCFA et relancez au bon moment — sans rien laisser filer.",
  "login.f1t": "Recouvrement en temps réel",
  "login.f1d": "Totaux accordés, réglés et restants calculés automatiquement.",
  "login.f2t": "Relances organisées",
  "login.f2d": "Prochaines actions et retards mis en évidence chaque jour.",
  "login.f3t": "Synthèse par entité",
  "login.f3d": "L'encours de chaque client regroupé en un coup d'œil.",
  "login.footer": "© 2026 Ets GoodLuck — Espace de gestion interne",

  // ---- Navigation ----
  "nav.dashboard": "Tableau de bord",
  "nav.creances": "Suivi des créances",
  "nav.synthese": "Synthèse par entité",
  "app.subtitle": "Suivi des créances",
  "view.dashboard.title": "Tableau de bord",
  "view.dashboard.desc":
    "Vue d'ensemble des créances et des actions à mener aujourd'hui.",
  "view.creances.title": "Suivi des créances",
  "view.creances.desc":
    "Toutes vos ventes à crédit, du premier jour jusqu'au solde final.",
  "view.synthese.title": "Synthèse par entité",
  "view.synthese.desc":
    "Encours regroupés automatiquement par client / établissement.",
  "layout.new": "Nouvelle créance",
  "layout.newShort": "Créance",
  "layout.logout": "Déconnexion",
  "layout.logoutShort": "Quitter",
  "layout.account": "Compte unique",

  // ---- Tableau de bord ----
  "kpi.granted": "Créances accordées",
  "kpi.paid": "Déjà réglé",
  "kpi.remaining": "Restant dû",
  "kpi.paidSub": "{pct} % du total accordé",
  "kpi.remainingRest": "avec un solde ouvert",
  "kpi.seeAll": "Voir toutes les créances",
  "kpi.seePaid": "Voir les créances soldées",
  "kpi.seeRemaining": "Voir les soldes ouverts",
  "donut.title": "Répartition par statut",
  "donut.total": "créances",
  "donut.pctOf": "% du total",
  "donut.remainingLabel": "reste dû",
  "donut.hint": "Survolez ou touchez un segment pour afficher le détail",
  "urgent.title": "Actions urgentes",
  "urgent.none": "Aucune action urgente",
  "urgent.noneDesc": "Aucun retard, aucun contentieux, aucune échéance dépassée.",
  "urgent.critical": "Statut critique — action à planifier",
  "urgent.remaining": "restant dû",
  "urgent.pay": "Payer",
  "urgent.remind": "Relancer +1",
  "urgent.remindTitle": "Incrémenter les relances et dater à aujourd'hui",
  "urgent.edit": "Modifier",
  "top.title": "Plus gros soldes par client",
  "top.allPaid": "Toutes les créances sont soldées.",
  "top.synthese": "Synthèse complète",
  "shortcuts.title": "Raccourcis",
  "shortcuts.creances": "Ouvrir le suivi des créances",
  "shortcuts.creancesDesc": "Paiements, relances, filtres et historique des fiches",
  "shortcuts.synthese": "Voir la synthèse par entité",
  "shortcuts.syntheseDesc": "Encours consolidés client par client",
  "shortcuts.note":
    "Les paiements, relances et statuts sont journalisés sur chaque créance. Données enregistrées automatiquement sur cet appareil — montants en FCFA.",

  // ---- Suivi des créances ----
  "search.ph": "Rechercher par nom de client…",
  "search.clear": "Effacer la recherche",
  "filter.allStatus": "Tous les statuts",
  "filter.allEtab": "Tous les établissements",
  "filter.allAgent": "Tous les agents",
  "filter.reset": "Réinitialiser",
  "sort.list": "Trier la liste",
  "sort.by": "Tri :",
  "sort.asc": "Croiss.",
  "sort.desc": "Décroiss.",
  "sort.dateAchat": "Date d'achat",
  "sort.montantTotal": "Montant total",
  "sort.solde": "Solde restant dû",
  "sort.dateEcheance": "Date d'échéance",
  "th.client": "Client",
  "th.contact": "Contact",
  "th.agent": "Agent",
  "th.achat": "Achat",
  "th.echeance": "Échéance",
  "th.total": "Total",
  "th.regle": "Réglé",
  "th.solde": "Solde dû",
  "th.relances": "Relances",
  "th.statut": "Statut",
  "th.action": "Proch. action",
  "th.actions": "Actions",
  "row.unknownDate": "inconnue",
  "row.lastRemind": "dern. :",
  "row.remindTitle": "Enregistrer une relance aujourd'hui",
  "row.payTitle": "Enregistrer un paiement",
  "row.detailTitle": "Voir la fiche détaillée",
  "row.editTitle": "Modifier",
  "row.deleteTitle": "Supprimer",
  "card.total": "Total",
  "card.paid": "Réglé",
  "card.remaining": "Reste dû",
  "card.purchase": "Achat",
  "card.due": "Échéance",
  "card.details": "Détails",
  "card.lessDetails": "Moins de détails",
  "card.remind": "Relancer +1",
  "d.phone": "Téléphone",
  "d.responsable": "Responsable client",
  "d.agent": "Agent GoodLuck",
  "d.lastRemind": "Dernière relance",
  "d.reaction": "Réaction client",
  "d.remarks": "Remarques",
  "footer.granted": "Accordé :",
  "footer.paid": "Réglé :",
  "footer.remaining": "Reste dû :",
  "footer.displayed": "{n} {w} affichée(s)",
  "footer.of": "(sur {n})",
  "empty.title": "Aucune créance enregistrée",
  "empty.hint":
    "Consignez votre première vente à crédit : elle apparaîtra ici, dans le tableau de bord et dans la synthèse.",
  "empty.add": "Ajouter une créance",
  "empty.noResult": "Aucun résultat",
  "empty.noResultHint":
    "Aucune créance ne correspond à ces critères. Modifiez la recherche ou réinitialisez les filtres.",
  "empty.reset": "Réinitialiser les filtres",

  // ---- Synthèse ----
  "syn.entities": "Entités suivies",
  "syn.credits": "Créances cumulées",
  "syn.remaining": "Reste à encaisser",
  "syn.rate": "Taux de recouvrement",
  "syn.th.entity": "Entité",
  "syn.th.credits": "Créances",
  "syn.th.granted": "Total accordé",
  "syn.th.paid": "Déjà réglé",
  "syn.th.due": "Solde dû",
  "syn.th.rate": "Recouvrement",
  "syn.total": "TOTAL GÉNÉRAL",
  "syn.rateFoot": "{pct} % du total accordé déjà recouvré",
  "syn.emptyTitle": "Aucune entité pour le moment",
  "syn.emptyHint":
    "Ajoutez votre première créance : la synthèse par client se construira automatiquement.",

  // ---- Formulaire créance ----
  "form.newTitle": "Nouvelle créance",
  "form.editTitle": "Modifier la créance",
  "form.newSub":
    "Consignez une nouvelle vente à crédit. Le solde est calculé automatiquement.",
  "form.editSub": "{name} — achat du {date}",
  "form.cancel": "Annuler",
  "form.save": "Ajouter la créance",
  "form.saveEdit": "Enregistrer les modifications",
  "form.s1": "Client & établissement",
  "form.s2": "Crédit accordé",
  "form.s3": "Suivi & relances",
  "f.name": "Nom de l'établissement / client",
  "f.namePh": "Ex. : ESENGO, Mr Tushar…",
  "f.type": "Type d'établissement",
  "f.address": "Adresse",
  "f.addressPh": "Ex. : La Corniche",
  "f.phone": "Téléphone",
  "f.phonePh": "Ex. : 06 978 16 12",
  "f.responsable": "Responsable (validation côté client)",
  "f.responsablePh": "Personne ayant validé l'achat à crédit chez le client",
  "f.agent": "Agent GoodLuck",
  "f.agentPh": "Agent ayant accordé le crédit",
  "f.dateAchat": "Date de l'achat à crédit",
  "f.total": "Montant total (FCFA)",
  "f.totalPh": "Ex. : 150000",
  "f.paid": "Montant déjà réglé (FCFA)",
  "f.balance": "Solde restant dû",
  "f.balanceNote": "calculé automatiquement — non modifiable",
  "f.echeance": "Date d'échéance convenue",
  "f.echeanceHint": "Au-delà de cette date, la créance est considérée comme échue.",
  "f.statut": "Statut d'avancement",
  "f.reaction": "Réaction du client",
  "f.reactionNone": "— Non renseignée —",
  "f.lastRemind": "Date de dernière relance",
  "f.relances": "Nombre de relances",
  "f.relMinus": "Diminuer le nombre de relances",
  "f.relPlus": "Augmenter le nombre de relances",
  "f.nextActionText": "Prochaine action (description)",
  "f.nextActionPh": "Ex. : Relancer, Rappeler…",
  "f.nextActionDate": "Prochaine action (date)",
  "f.remarks": "Remarques",
  "f.remarksPh": "Notes libres sur cette créance…",
  "err.name": "Le nom de l'établissement / du client est obligatoire.",
  "err.total": "Saisissez un montant total valide (en FCFA).",
  "err.paid": "Saisissez un montant réglé valide (en FCFA).",
  "err.overpay": "Le montant déjà réglé ne peut pas dépasser le montant total.",
  "err.soldStatus":
    "Le statut « Soldé » est refusé : le solde restant dû est encore de {x}. Enregistrez d'abord le paiement du solde pour solder cette créance.",

  // ---- Paiement ----
  "pay.title": "Enregistrer un paiement — {ref}",
  "pay.sub": "{name} · le solde et le statut seront mis à jour automatiquement.",
  "pay.cancel": "Annuler",
  "pay.submit": "Enregistrer le paiement",
  "pay.total": "Total accordé",
  "pay.paid": "Déjà réglé",
  "pay.remaining": "Reste dû",
  "pay.amount": "Montant payé (FCFA)",
  "pay.err.amount": "Saisissez un montant valide, supérieur à 0.",
  "pay.err.over":
    "Montant trop élevé : le solde restant dû est de {x}. Le paiement est bloqué (pas de solde négatif).",
  "pay.max": "Maximum : {x} — au-delà, le paiement est refusé.",
  "pay.settle": "Tout solder ({x})",
  "pay.date": "Date du paiement",
  "pay.note": "Remarque (optionnelle)",
  "pay.notePh": "Ex. : versement espèces, virement…",
  "pay.hint":
    "Dès validation : le montant réglé est incrémenté, le solde recalculé, et le statut passe automatiquement en « {partial} » — ou « {settled} » si le solde atteint 0. L'opération est tracée dans l'historique de la créance {ref}.",

  // ---- Fiche détaillée ----
  "det.title": "Créance {ref}",
  "det.solded": "Créance soldée",
  "det.remaining": "Reste dû",
  "det.edit": "Modifier la fiche",
  "det.remind": "Relancer +1",
  "det.pay": "Enregistrer un paiement",
  "det.payDisabled": "Créance soldée — aucun paiement à enregistrer",
  "det.total": "Total accordé",
  "det.paid": "Déjà réglé",
  "det.balance": "Solde (auto)",
  "det.type": "Type",
  "det.address": "Adresse",
  "det.phone": "Téléphone",
  "det.responsable": "Responsable client",
  "det.agent": "Agent GoodLuck",
  "det.dateAchat": "Date d'achat",
  "det.unknownDate": "inconnue",
  "det.echeance": "Échéance convenue",
  "det.lastRemind": "Dernière relance",
  "det.relances": "Nombre de relances",
  "det.reaction": "Réaction du client",
  "det.nextAction": "Prochaine action",
  "det.remarks": "Remarques",
  "det.history": "Historique & journal",
  "det.refNote": "Référence {ref} — à citer dans toute relance ou correspondance.",

  // ---- Événements d'historique ----
  "ev.creation": "Créance créée",
  "ev.creationImport": "Créance enregistrée",
  "ev.importDetail": "Importée depuis la fiche PendingList.xlsm",
  "ev.creationAmount": "Créance de {x}",
  "ev.byAgent": "accordée par {agent}",
  "ev.payment": "Paiement de {x}",
  "ev.paidOn": "payé le {d}",
  "ev.reprise": "Reprise de l'historique Excel",
  "ev.reminder": "Relance n° {n}",
  "ev.status": "Statut : {from} → {to}",
  "ev.causePayment": "Suite au paiement",
  "ev.causeReminder": "Suite à la relance",
  "ev.causeEdit": "Ajusté lors de la modification de la fiche",
  "ev.edit": "Fiche modifiée",

  // ---- Dates relatives ----
  "rel.over": "dépassée de {n} j",
  "rel.today": "aujourd'hui",
  "rel.in": "dans {n} j",

  // ---- Confirmations & notifications ----
  "confirm.title": "Supprimer la créance {ref} ?",
  "confirm.purchase": "achat du",
  "confirm.due": "solde dû :",
  "confirm.warn":
    "Cette suppression est définitive : l'historique de la créance sera également effacé.",
  "confirm.cancel": "Annuler",
  "confirm.delete": "Supprimer définitivement",
  "toast.added": "Créance « {name} » ajoutée ({x}).",
  "toast.updated": "Créance « {name} » mise à jour.",
  "toast.reminder": "Relance n° {n} enregistrée pour « {name} » · statut passé en « {s} ».",
  "toast.reminderNoSwitch": "Relance n° {n} enregistrée pour « {name} ».",
  "toast.payment":
    "Paiement de {x} enregistré sur {ref} « {name} » — nouveau solde : {y}.",
  "toast.paymentSettled":
    "Paiement de {x} enregistré sur {ref} « {name} » — créance soldée.",
  "toast.deleted": "Créance {ref} « {name} » supprimée.",

  // ---- Mots (pluriels) ----
  "w.credit": "créance",
  "w.credits": "créances",
  "w.entity": "entité",
  "w.entities": "entités",
  "w.event": "événement",
  "w.events": "événements",
} as const;

export type TKey = keyof typeof fr;

const en: Record<TKey, string> = {
  appTitle: "GoodLuck — Customer receivables tracker",
  "lang.label": "Language",

  "login.brandName": "GoodLuck",
  "login.brandSub": "Receivables tracker",
  "login.brandSubMobile": "Customer receivables tracker",
  "login.access": "Secure access",
  "login.title": "Sign in",
  "login.subtitle": "Restricted to the business. Single login, no registration.",
  "login.username": "Username",
  "login.usernamePh": "Your username",
  "login.password": "Password",
  "login.showPass": "Show password",
  "login.hidePass": "Hide password",
  "login.error": "Incorrect credentials. Please try again.",
  "login.submit": "Sign in",
  "login.checking": "Checking…",
  "login.localNote": "Data is stored locally on this device.",
  "login.tagline": "Credit sales · Receivables tracking",
  "login.hero1": "Your receivables,",
  "login.hero2": "under control.",
  "login.heroDesc":
    "Record every credit sale, track settlements in FCFA and follow up at the right time — letting nothing slip.",
  "login.f1t": "Real-time recovery",
  "login.f1d": "Granted, collected and outstanding totals computed automatically.",
  "login.f2t": "Organised follow-ups",
  "login.f2d": "Next actions and overdue items highlighted every day.",
  "login.f3t": "Per-entity summary",
  "login.f3d": "Each customer's outstanding balance grouped at a glance.",
  "login.footer": "© 2026 Ets GoodLuck — Internal management area",

  "nav.dashboard": "Dashboard",
  "nav.creances": "Receivables",
  "nav.synthese": "Per-entity summary",
  "app.subtitle": "Receivables tracking",
  "view.dashboard.title": "Dashboard",
  "view.dashboard.desc": "Overview of receivables and actions to take today.",
  "view.creances.title": "Receivables",
  "view.creances.desc": "All your credit sales, from day one to final settlement.",
  "view.synthese.title": "Per-entity summary",
  "view.synthese.desc": "Balances automatically grouped by customer / business.",
  "layout.new": "New receivable",
  "layout.newShort": "New",
  "layout.logout": "Sign out",
  "layout.logoutShort": "Exit",
  "layout.account": "Single account",

  "kpi.granted": "Receivables granted",
  "kpi.paid": "Already collected",
  "kpi.remaining": "Outstanding",
  "kpi.paidSub": "{pct}% of the total granted",
  "kpi.remainingRest": "with an open balance",
  "kpi.seeAll": "View all receivables",
  "kpi.seePaid": "View settled receivables",
  "kpi.seeRemaining": "View open balances",
  "donut.title": "Breakdown by status",
  "donut.total": "receivables",
  "donut.pctOf": "% of total",
  "donut.remainingLabel": "outstanding",
  "donut.hint": "Hover or tap a segment to see details",
  "urgent.title": "Urgent actions",
  "urgent.none": "No urgent action",
  "urgent.noneDesc": "No overdue, no dispute, no missed deadline.",
  "urgent.critical": "Critical status — action to schedule",
  "urgent.remaining": "outstanding",
  "urgent.pay": "Collect",
  "urgent.remind": "Remind +1",
  "urgent.remindTitle": "Increment reminders and date it today",
  "urgent.edit": "Edit",
  "top.title": "Largest balances by customer",
  "top.allPaid": "All receivables are settled.",
  "top.synthese": "Full summary",
  "shortcuts.title": "Shortcuts",
  "shortcuts.creances": "Open receivables tracking",
  "shortcuts.creancesDesc": "Payments, reminders, filters and card history",
  "shortcuts.synthese": "View per-entity summary",
  "shortcuts.syntheseDesc": "Consolidated balances per customer",
  "shortcuts.note":
    "Payments, reminders and statuses are journaled on each receivable. Data saved automatically on this device — amounts in FCFA.",

  "search.ph": "Search by customer name…",
  "search.clear": "Clear search",
  "filter.allStatus": "All statuses",
  "filter.allEtab": "All businesses",
  "filter.allAgent": "All agents",
  "filter.reset": "Reset",
  "sort.list": "Sort list",
  "sort.by": "Sort:",
  "sort.asc": "Asc.",
  "sort.desc": "Desc.",
  "sort.dateAchat": "Purchase date",
  "sort.montantTotal": "Total amount",
  "sort.solde": "Outstanding balance",
  "sort.dateEcheance": "Due date",
  "th.client": "Customer",
  "th.contact": "Contact",
  "th.agent": "Agent",
  "th.achat": "Purchase",
  "th.echeance": "Due date",
  "th.total": "Total",
  "th.regle": "Collected",
  "th.solde": "Balance due",
  "th.relances": "Reminders",
  "th.statut": "Status",
  "th.action": "Next action",
  "th.actions": "Actions",
  "row.unknownDate": "unknown",
  "row.lastRemind": "last:",
  "row.remindTitle": "Record a reminder today",
  "row.payTitle": "Record a payment",
  "row.detailTitle": "Open detailed card",
  "row.editTitle": "Edit",
  "row.deleteTitle": "Delete",
  "card.total": "Total",
  "card.paid": "Collected",
  "card.remaining": "Balance due",
  "card.purchase": "Purchase",
  "card.due": "Due date",
  "card.details": "Details",
  "card.lessDetails": "Fewer details",
  "card.remind": "Remind +1",
  "d.phone": "Phone",
  "d.responsable": "Customer contact",
  "d.agent": "GoodLuck agent",
  "d.lastRemind": "Last reminder",
  "d.reaction": "Customer reaction",
  "d.remarks": "Notes",
  "footer.granted": "Granted:",
  "footer.paid": "Collected:",
  "footer.remaining": "Outstanding:",
  "footer.displayed": "{n} {w} shown",
  "footer.of": "(of {n})",
  "empty.title": "No receivable recorded",
  "empty.hint":
    "Record your first credit sale: it will appear here, on the dashboard and in the summary.",
  "empty.add": "Add a receivable",
  "empty.noResult": "No result",
  "empty.noResultHint":
    "No receivable matches these criteria. Change the search or reset the filters.",
  "empty.reset": "Reset filters",

  "syn.entities": "Tracked entities",
  "syn.credits": "Cumulated receivables",
  "syn.remaining": "Left to collect",
  "syn.rate": "Recovery rate",
  "syn.th.entity": "Entity",
  "syn.th.credits": "Receivables",
  "syn.th.granted": "Total granted",
  "syn.th.paid": "Collected",
  "syn.th.due": "Balance due",
  "syn.th.rate": "Recovery",
  "syn.total": "GRAND TOTAL",
  "syn.rateFoot": "{pct}% of the total granted already recovered",
  "syn.emptyTitle": "No entity yet",
  "syn.emptyHint":
    "Add your first receivable: the per-customer summary builds automatically.",

  "form.newTitle": "New receivable",
  "form.editTitle": "Edit receivable",
  "form.newSub": "Record a new credit sale. The balance is computed automatically.",
  "form.editSub": "{name} — purchased on {date}",
  "form.cancel": "Cancel",
  "form.save": "Add receivable",
  "form.saveEdit": "Save changes",
  "form.s1": "Customer & business",
  "form.s2": "Credit granted",
  "form.s3": "Follow-up & reminders",
  "f.name": "Business / customer name",
  "f.namePh": "E.g.: ESENGO, Mr Tushar…",
  "f.type": "Business type",
  "f.address": "Address",
  "f.addressPh": "E.g.: La Corniche",
  "f.phone": "Phone",
  "f.phonePh": "E.g.: 06 978 16 12",
  "f.responsable": "Contact (approved on customer side)",
  "f.responsablePh": "Person who approved the credit purchase at the customer's",
  "f.agent": "GoodLuck agent",
  "f.agentPh": "Agent who granted the credit",
  "f.dateAchat": "Credit purchase date",
  "f.total": "Total amount (FCFA)",
  "f.totalPh": "E.g.: 150000",
  "f.paid": "Amount already collected (FCFA)",
  "f.balance": "Outstanding balance",
  "f.balanceNote": "computed automatically — cannot be edited",
  "f.echeance": "Agreed due date",
  "f.echeanceHint": "Beyond this date, the receivable is considered overdue.",
  "f.statut": "Progress status",
  "f.reaction": "Customer reaction",
  "f.reactionNone": "— Not specified —",
  "f.lastRemind": "Last reminder date",
  "f.relances": "Number of reminders",
  "f.relMinus": "Decrease the number of reminders",
  "f.relPlus": "Increase the number of reminders",
  "f.nextActionText": "Next action (description)",
  "f.nextActionPh": "E.g.: Follow up, Call back…",
  "f.nextActionDate": "Next action (date)",
  "f.remarks": "Notes",
  "f.remarksPh": "Free notes about this receivable…",
  "err.name": "The business / customer name is required.",
  "err.total": "Enter a valid total amount (in FCFA).",
  "err.paid": "Enter a valid collected amount (in FCFA).",
  "err.overpay": "The collected amount cannot exceed the total amount.",
  "err.soldStatus":
    "The “Settled” status is rejected: the outstanding balance is still {x}. Record the payment of the balance first to settle this receivable.",

  "pay.title": "Record a payment — {ref}",
  "pay.sub": "{name} · balance and status update automatically.",
  "pay.cancel": "Cancel",
  "pay.submit": "Record payment",
  "pay.total": "Total granted",
  "pay.paid": "Collected",
  "pay.remaining": "Balance due",
  "pay.amount": "Amount paid (FCFA)",
  "pay.err.amount": "Enter a valid amount, greater than 0.",
  "pay.err.over":
    "Amount too high: the outstanding balance is {x}. Payment blocked (no negative balance).",
  "pay.max": "Maximum: {x} — anything above is rejected.",
  "pay.settle": "Settle in full ({x})",
  "pay.date": "Payment date",
  "pay.note": "Note (optional)",
  "pay.notePh": "E.g.: cash, bank transfer…",
  "pay.hint":
    "On confirmation: the collected amount is increased, the balance recomputed, and the status automatically becomes “{partial}” — or “{settled}” when the balance reaches 0. The operation is traced in the history of receivable {ref}.",

  "det.title": "Receivable {ref}",
  "det.solded": "Receivable settled",
  "det.remaining": "Outstanding",
  "det.edit": "Edit card",
  "det.remind": "Remind +1",
  "det.pay": "Record a payment",
  "det.payDisabled": "Receivable settled — no payment to record",
  "det.total": "Total granted",
  "det.paid": "Collected",
  "det.balance": "Balance (auto)",
  "det.type": "Type",
  "det.address": "Address",
  "det.phone": "Phone",
  "det.responsable": "Customer contact",
  "det.agent": "GoodLuck agent",
  "det.dateAchat": "Purchase date",
  "det.unknownDate": "unknown",
  "det.echeance": "Agreed due date",
  "det.lastRemind": "Last reminder",
  "det.relances": "Number of reminders",
  "det.reaction": "Customer reaction",
  "det.nextAction": "Next action",
  "det.remarks": "Notes",
  "det.history": "History & journal",
  "det.refNote": "Reference {ref} — quote it in every reminder or correspondence.",

  "ev.creation": "Receivable created",
  "ev.creationImport": "Receivable recorded",
  "ev.importDetail": "Imported from the PendingList.xlsm sheet",
  "ev.creationAmount": "Receivable of {x}",
  "ev.byAgent": "granted by {agent}",
  "ev.payment": "Payment of {x}",
  "ev.paidOn": "paid on {d}",
  "ev.reprise": "Carried over from Excel history",
  "ev.reminder": "Reminder #{n}",
  "ev.status": "Status: {from} → {to}",
  "ev.causePayment": "Following the payment",
  "ev.causeReminder": "Following the reminder",
  "ev.causeEdit": "Adjusted while editing the card",
  "ev.edit": "Card edited",

  "rel.over": "{n} days overdue",
  "rel.today": "today",
  "rel.in": "in {n} days",

  "confirm.title": "Delete receivable {ref}?",
  "confirm.purchase": "purchased on",
  "confirm.due": "balance due:",
  "confirm.warn": "This deletion is permanent: the receivable history will also be erased.",
  "confirm.cancel": "Cancel",
  "confirm.delete": "Delete permanently",
  "toast.added": "Receivable “{name}” added ({x}).",
  "toast.updated": "Receivable “{name}” updated.",
  "toast.reminder": "Reminder #{n} recorded for “{name}” · status set to “{s}”.",
  "toast.reminderNoSwitch": "Reminder #{n} recorded for “{name}”.",
  "toast.payment": "Payment of {x} recorded on {ref} “{name}” — new balance: {y}.",
  "toast.paymentSettled": "Payment of {x} recorded on {ref} “{name}” — receivable settled.",
  "toast.deleted": "Receivable {ref} “{name}” deleted.",

  "w.credit": "receivable",
  "w.credits": "receivables",
  "w.entity": "entity",
  "w.entities": "entities",
  "w.event": "event",
  "w.events": "events",
};

const hi: Record<TKey, string> = {
  appTitle: "GoodLuck — ग्राहक बकाया ट्रैकर",
  "lang.label": "भाषा",

  "login.brandName": "GoodLuck",
  "login.brandSub": "बकाया ट्रैकिंग",
  "login.brandSubMobile": "ग्राहक बकाया ट्रैकिंग",
  "login.access": "सुरक्षित प्रवेश",
  "login.title": "लॉगिन",
  "login.subtitle": "केवल प्रतिष्ठान के लिए। एकल पहचान, कोई पंजीकरण नहीं।",
  "login.username": "उपयोगकर्ता नाम",
  "login.usernamePh": "अपनी पहचान",
  "login.password": "पासवर्ड",
  "login.showPass": "पासवर्ड दिखाएं",
  "login.hidePass": "पासवर्ड छिपाएं",
  "login.error": "गलत पहचान। कृपया पुनः प्रयास करें।",
  "login.submit": "लॉगिन करें",
  "login.checking": "सत्यापन हो रहा है…",
  "login.localNote": "डेटा इस डिवाइस पर स्थानीय रूप से सहेजा जाता है।",
  "login.tagline": "उधार बिक्री · बकाया ट्रैकिंग",
  "login.hero1": "आपके बकाए,",
  "login.hero2": "पूरे नियंत्रण में।",
  "login.heroDesc":
    "हर उधार बिक्री दर्ज करें, FCFA में भुगतान ट्रैक करें और सही समय पर अनुस्मारक भेजें — कुछ भी छूटने न दें।",
  "login.f1t": "रीयल-टाइम वसूली",
  "login.f1d": "स्वीकृत, प्राप्त और शेष राशि की स्वतः गणना।",
  "login.f2t": "व्यवस्थित अनुस्मारक",
  "login.f2d": "अगली कार्रवाई और विलंब हर दिन हाइलाइट।",
  "login.f3t": "इकाई-वार सारांश",
  "login.f3d": "प्रत्येक ग्राहक का बकाया एक नज़र में।",
  "login.footer": "© 2026 Ets GoodLuck — आंतरिक प्रबंधन क्षेत्र",

  "nav.dashboard": "डैशबोर्ड",
  "nav.creances": "बकाया ट्रैकिंग",
  "nav.synthese": "इकाई सारांश",
  "app.subtitle": "बकाया ट्रैकिंग",
  "view.dashboard.title": "डैशबोर्ड",
  "view.dashboard.desc": "बकाओं का अवलोकन और आज की जाने वाली कार्रवाइयाँ।",
  "view.creances.title": "बकाया ट्रैकिंग",
  "view.creances.desc": "आपकी सभी उधार बिक्रियाँ, पहले दिन से अंतिम भुगतान तक।",
  "view.synthese.title": "इकाई सारांश",
  "view.synthese.desc": "ग्राहक/प्रतिष्ठान के अनुसार स्वतः समूहीकृत बकाया।",
  "layout.new": "नया बकाया",
  "layout.newShort": "नया",
  "layout.logout": "लॉगआउट",
  "layout.logoutShort": "बंद करें",
  "layout.account": "एकल खाता",

  "kpi.granted": "स्वीकृत बकाया",
  "kpi.paid": "प्राप्त राशि",
  "kpi.remaining": "शेष बकाया",
  "kpi.paidSub": "कुल स्वीकृत का {pct}%",
  "kpi.remainingRest": "खुली शेष राशि के साथ",
  "kpi.seeAll": "सभी बकाए देखें",
  "kpi.seePaid": "निपटाए गए बकाए देखें",
  "kpi.seeRemaining": "खुली शेष राशि देखें",
  "donut.title": "स्थिति के अनुसार वितरण",
  "donut.total": "बकाए",
  "donut.pctOf": "कुल का %",
  "donut.remainingLabel": "शेष बकाया",
  "donut.hint": "विवरण देखने के लिए खंड पर होवर या टैप करें",
  "urgent.title": "तत्काल कार्रवाइयाँ",
  "urgent.none": "कोई तत्काल कार्रवाई नहीं",
  "urgent.noneDesc": "कोई विलंब नहीं, कोई विवाद नहीं, कोई नियत तिथि पार नहीं।",
  "urgent.critical": "गंभीर स्थिति — कार्रवाई की योजना बनाएं",
  "urgent.remaining": "शेष बकाया",
  "urgent.pay": "भुगतान",
  "urgent.remind": "अनुस्मारक +1",
  "urgent.remindTitle": "अनुस्मारक बढ़ाएं और आज की तारीख डालें",
  "urgent.edit": "संपादित करें",
  "top.title": "ग्राहक के अनुसार सबसे बड़ी शेष राशि",
  "top.allPaid": "सभी बकाए निपटा दिए गए हैं।",
  "top.synthese": "पूर्ण सारांश",
  "shortcuts.title": "शॉर्टकट",
  "shortcuts.creances": "बकाया ट्रैकिंग खोलें",
  "shortcuts.creancesDesc": "भुगतान, अनुस्मारक, फ़िल्टर और कार्ड इतिहास",
  "shortcuts.synthese": "इकाई सारांश देखें",
  "shortcuts.syntheseDesc": "ग्राहक-दर-ग्राहक समेकित बकाया",
  "shortcuts.note":
    "भुगतान, अनुस्मारक और स्थितियाँ प्रत्येक बकाए पर दर्ज होती हैं। डेटा इस डिवाइस पर स्वतः सहेजा जाता है — राशि FCFA में।",

  "search.ph": "ग्राहक नाम से खोजें…",
  "search.clear": "खोज मिटाएं",
  "filter.allStatus": "सभी स्थितियाँ",
  "filter.allEtab": "सभी प्रतिष्ठान",
  "filter.allAgent": "सभी एजेंट",
  "filter.reset": "रीसेट",
  "sort.list": "सूची क्रमबद्ध करें",
  "sort.by": "क्रम:",
  "sort.asc": "आरोही",
  "sort.desc": "अवरोही",
  "sort.dateAchat": "खरीद तिथि",
  "sort.montantTotal": "कुल राशि",
  "sort.solde": "शेष बकाया",
  "sort.dateEcheance": "नियत तिथि",
  "th.client": "ग्राहक",
  "th.contact": "संपर्क",
  "th.agent": "एजेंट",
  "th.achat": "खरीद",
  "th.echeance": "नियत तिथि",
  "th.total": "कुल",
  "th.regle": "प्राप्त",
  "th.solde": "शेष राशि",
  "th.relances": "अनुस्मारक",
  "th.statut": "स्थिति",
  "th.action": "अगली कार्रवाई",
  "th.actions": "कार्रवाइयाँ",
  "row.unknownDate": "अज्ञात",
  "row.lastRemind": "अंतिम:",
  "row.remindTitle": "आज अनुस्मारक दर्ज करें",
  "row.payTitle": "भुगतान दर्ज करें",
  "row.detailTitle": "विस्तृत कार्ड खोलें",
  "row.editTitle": "संपादित करें",
  "row.deleteTitle": "हटाएं",
  "card.total": "कुल",
  "card.paid": "प्राप्त",
  "card.remaining": "शेष",
  "card.purchase": "खरीद",
  "card.due": "नियत तिथि",
  "card.details": "विवरण",
  "card.lessDetails": "कम विवरण",
  "card.remind": "अनुस्मारक +1",
  "d.phone": "फ़ोन",
  "d.responsable": "ग्राहक जिम्मेदार",
  "d.agent": "GoodLuck एजेंट",
  "d.lastRemind": "अंतिम अनुस्मारक",
  "d.reaction": "ग्राहक प्रतिक्रिया",
  "d.remarks": "टिप्पणियाँ",
  "footer.granted": "स्वीकृत:",
  "footer.paid": "प्राप्त:",
  "footer.remaining": "शेष:",
  "footer.displayed": "{n} {w} दिखाए गए",
  "footer.of": "({n} में से)",
  "empty.title": "कोई बकाया दर्ज नहीं",
  "empty.hint": "अपनी पहली उधार बिक्री दर्ज करें: वह यहाँ, डैशबोर्ड और सारांश में दिखेगी।",
  "empty.add": "बकाया जोड़ें",
  "empty.noResult": "कोई परिणाम नहीं",
  "empty.noResultHint": "इन मानदंडों से कोई बकाया मेल नहीं खाता। खोज बदलें या फ़िल्टर रीसेट करें।",
  "empty.reset": "फ़िल्टर रीसेट करें",

  "syn.entities": "ट्रैक की गई इकाइयाँ",
  "syn.credits": "संचित बकाए",
  "syn.remaining": "वसूल की जानी वाली राशि",
  "syn.rate": "वसूली दर",
  "syn.th.entity": "इकाई",
  "syn.th.credits": "बकाए",
  "syn.th.granted": "कुल स्वीकृत",
  "syn.th.paid": "प्राप्त",
  "syn.th.due": "शेष राशि",
  "syn.th.rate": "वसूली",
  "syn.total": "कुल योग",
  "syn.rateFoot": "कुल स्वीकृत का {pct}% पहले ही वसूल",
  "syn.emptyTitle": "अभी कोई इकाई नहीं",
  "syn.emptyHint": "पहला बकाया जोड़ें: ग्राहक-वार सारांश स्वतः बनेगा।",

  "form.newTitle": "नया बकाया",
  "form.editTitle": "बकाया संपादित करें",
  "form.newSub": "नई उधार बिक्री दर्ज करें। शेष राशि स्वतः गिनी जाती है।",
  "form.editSub": "{name} — खरीद {date}",
  "form.cancel": "रद्द करें",
  "form.save": "बकाया जोड़ें",
  "form.saveEdit": "परिवर्तन सहेजें",
  "form.s1": "ग्राहक और प्रतिष्ठान",
  "form.s2": "स्वीकृत ऋण",
  "form.s3": "ट्रैकिंग और अनुस्मारक",
  "f.name": "प्रतिष्ठान/ग्राहक का नाम",
  "f.namePh": "जैसे: ESENGO, Mr Tushar…",
  "f.type": "प्रतिष्ठान का प्रकार",
  "f.address": "पता",
  "f.addressPh": "जैसे: La Corniche",
  "f.phone": "फ़ोन",
  "f.phonePh": "जैसे: 06 978 16 12",
  "f.responsable": "जिम्मेदार (ग्राहक पक्ष से स्वीकृति)",
  "f.responsablePh": "ग्राहक के यहाँ उधार खरीद स्वीकृत करने वाले व्यक्ति",
  "f.agent": "GoodLuck एजेंट",
  "f.agentPh": "ऋण स्वीकृत करने वाला एजेंट",
  "f.dateAchat": "उधार खरीद की तिथि",
  "f.total": "कुल राशि (FCFA)",
  "f.totalPh": "जैसे: 150000",
  "f.paid": "पहले से प्राप्त राशि (FCFA)",
  "f.balance": "शेष बकाया",
  "f.balanceNote": "स्वतः गणना — संपादित नहीं किया जा सकता",
  "f.echeance": "सहमत नियत तिथि",
  "f.echeanceHint": "इस तिथि के बाद बकाया देय माना जाता है।",
  "f.statut": "प्रगति स्थिति",
  "f.reaction": "ग्राहक प्रतिक्रिया",
  "f.reactionNone": "— दर्ज नहीं —",
  "f.lastRemind": "अंतिम अनुस्मारक तिथि",
  "f.relances": "अनुस्मारकों की संख्या",
  "f.relMinus": "अनुस्मारकों की संख्या घटाएं",
  "f.relPlus": "अनुस्मारकों की संख्या बढ़ाएं",
  "f.nextActionText": "अगली कार्रवाई (विवरण)",
  "f.nextActionPh": "जैसे: फ़ॉलो-अप, कॉल बैक…",
  "f.nextActionDate": "अगली कार्रवाई (तिथि)",
  "f.remarks": "टिप्पणियाँ",
  "f.remarksPh": "इस बकाए पर मुक्त टिप्पणियाँ…",
  "err.name": "प्रतिष्ठान/ग्राहक का नाम आवश्यक है।",
  "err.total": "मान्य कुल राशि दर्ज करें (FCFA में)।",
  "err.paid": "मान्य प्राप्त राशि दर्ज करें (FCFA में)।",
  "err.overpay": "प्राप्त राशि कुल राशि से अधिक नहीं हो सकती।",
  "err.soldStatus":
    "«निपटाया गया» स्थिति अस्वीकृत: शेष बकाया अभी भी {x} है। पहले शेष राशि का भुगतान दर्ज करें।",

  "pay.title": "भुगतान दर्ज करें — {ref}",
  "pay.sub": "{name} · शेष राशि और स्थिति स्वतः अपडेट होंगी।",
  "pay.cancel": "रद्द करें",
  "pay.submit": "भुगतान दर्ज करें",
  "pay.total": "कुल स्वीकृत",
  "pay.paid": "प्राप्त",
  "pay.remaining": "शेष राशि",
  "pay.amount": "भुगतान राशि (FCFA)",
  "pay.err.amount": "0 से अधिक मान्य राशि दर्ज करें।",
  "pay.err.over": "राशि अधिक है: शेष बकाया {x} है। भुगतान अवरुद्ध (ऋणात्मक शेष नहीं)।",
  "pay.max": "अधिकतम: {x} — इससे अधिक अस्वीकृत।",
  "pay.settle": "पूरा निपटान ({x})",
  "pay.date": "भुगतान तिथि",
  "pay.note": "टिप्पणी (वैकल्पिक)",
  "pay.notePh": "जैसे: नकद, ट्रांसफ़र…",
  "pay.hint":
    "पुष्टि पर: प्राप्त राशि बढ़ेगी, शेष राशि पुनः गिनी जाएगी, और स्थिति स्वतः «{partial}» होगी — या शेष 0 होने पर «{settled}»। यह कार्रवाई बकाया {ref} के इतिहास में दर्ज होगी।",

  "det.title": "बकाया {ref}",
  "det.solded": "बकाया निपटाया गया",
  "det.remaining": "शेष",
  "det.edit": "कार्ड संपादित करें",
  "det.remind": "अनुस्मारक +1",
  "det.pay": "भुगतान दर्ज करें",
  "det.payDisabled": "बकाया निपटाया गया — कोई भुगतान नहीं",
  "det.total": "कुल स्वीकृत",
  "det.paid": "प्राप्त",
  "det.balance": "शेष (स्वतः)",
  "det.type": "प्रकार",
  "det.address": "पता",
  "det.phone": "फ़ोन",
  "det.responsable": "ग्राहक जिम्मेदार",
  "det.agent": "GoodLuck एजेंट",
  "det.dateAchat": "खरीद तिथि",
  "det.unknownDate": "अज्ञात",
  "det.echeance": "सहमत नियत तिथि",
  "det.lastRemind": "अंतिम अनुस्मारक",
  "det.relances": "अनुस्मारकों की संख्या",
  "det.reaction": "ग्राहक प्रतिक्रिया",
  "det.nextAction": "अगली कार्रवाई",
  "det.remarks": "टिप्पणियाँ",
  "det.history": "इतिहास और जर्नल",
  "det.refNote": "संदर्भ {ref} — हर अनुस्मारक या पत्राचार में उद्धृत करें।",

  "ev.creation": "बकाया बनाया गया",
  "ev.creationImport": "बकाया दर्ज किया गया",
  "ev.importDetail": "PendingList.xlsm से आयातित",
  "ev.creationAmount": "{x} का बकाया",
  "ev.byAgent": "{agent} द्वारा स्वीकृत",
  "ev.payment": "{x} का भुगतान",
  "ev.paidOn": "{d} को भुगतान",
  "ev.reprise": "Excel इतिहास से पुनः प्राप्ति",
  "ev.reminder": "अनुस्मारक #{n}",
  "ev.status": "स्थिति: {from} → {to}",
  "ev.causePayment": "भुगतान के पश्चात",
  "ev.causeReminder": "अनुस्मारक के पश्चात",
  "ev.causeEdit": "कार्ड संशोधन के दौरान समायोजित",
  "ev.edit": "कार्ड संशोधित",

  "rel.over": "{n} दिन विलंब",
  "rel.today": "आज",
  "rel.in": "{n} दिनों में",

  "confirm.title": "बकाया {ref} हटाएं?",
  "confirm.purchase": "खरीद",
  "confirm.due": "शेष राशि:",
  "confirm.warn": "यह विलोपन स्थायी है: बकाए का इतिहास भी मिट जाएगा।",
  "confirm.cancel": "रद्द करें",
  "confirm.delete": "स्थायी रूप से हटाएं",
  "toast.added": "बकाया «{name}» जोड़ा गया ({x})।",
  "toast.updated": "बकाया «{name}» अपडेट किया गया।",
  "toast.reminder": "«{name}» के लिए अनुस्मारक #{n} दर्ज · स्थिति «{s}» हुई।",
  "toast.reminderNoSwitch": "«{name}» के लिए अनुस्मारक #{n} दर्ज।",
  "toast.payment": "{ref} «{name}» पर {x} का भुगतान दर्ज — नई शेष राशि: {y}।",
  "toast.paymentSettled": "{ref} «{name}» पर {x} का भुगतान दर्ज — बकाया निपटाया गया।",
  "toast.deleted": "बकाया {ref} «{name}» हटाया गया।",

  "w.credit": "बकाया",
  "w.credits": "बकाए",
  "w.entity": "इकाई",
  "w.entities": "इकाइयाँ",
  "w.event": "घटना",
  "w.events": "घटनाएँ",
};

const DICTS: Record<Lang, Record<TKey, string>> = { fr, en, hi };

/* ------------------- Statuts / types / réactions traduits ------------------- */

export const STATUT_I18N: Record<Lang, Record<Statut, string>> = {
  fr: {
    "Non échu": "Non échu",
    "En retard": "En retard",
    Relance: "Relance",
    "Paiement partiel": "Paiement partiel",
    Soldé: "Soldé",
    Contentieux: "Contentieux",
  },
  en: {
    "Non échu": "Not yet due",
    "En retard": "Overdue",
    Relance: "Reminder",
    "Paiement partiel": "Partial payment",
    Soldé: "Settled",
    Contentieux: "Disputed",
  },
  hi: {
    "Non échu": "अवधि शेष",
    "En retard": "विलंबित",
    Relance: "अनुस्मारक",
    "Paiement partiel": "आंशिक भुगतान",
    Soldé: "निपटाया गया",
    Contentieux: "विवादित",
  },
};

export const TYPE_I18N: Record<Lang, Record<TypeEtablissement, string>> = {
  fr: { Restaurant: "Restaurant", Particulier: "Particulier", Boutique: "Boutique", "Hôtel": "Hôtel", Autre: "Autre" },
  en: { Restaurant: "Restaurant", Particulier: "Individual", Boutique: "Shop", "Hôtel": "Hotel", Autre: "Other" },
  hi: { Restaurant: "रेस्तरां", Particulier: "व्यक्ति", Boutique: "दुकान", "Hôtel": "होटल", Autre: "अन्य" },
};

export const REACTION_I18N: Record<Lang, Record<string, string>> = {
  fr: {
    "Positive - promesse de paiement": "Positive - promesse de paiement",
    "Négative": "Négative",
    "Pas de réponse": "Pas de réponse",
    Autre: "Autre",
  },
  en: {
    "Positive - promesse de paiement": "Positive — promise to pay",
    "Négative": "Negative",
    "Pas de réponse": "No answer",
    Autre: "Other",
  },
  hi: {
    "Positive - promesse de paiement": "सकारात्मक — भुगतान का वादा",
    "Négative": "नकारात्मक",
    "Pas de réponse": "कोई जवाब नहीं",
    Autre: "अन्य",
  },
};

/* --------------------------------- Contexte --------------------------------- */

export interface I18n {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TKey, vars?: Record<string, string | number>) => string;
  statut: (s: Statut) => string;
  type: (s: TypeEtablissement | string) => string;
  reaction: (r: Reaction | string) => string;
  relLabel: (days: number) => string;
}

const LangCtx = createContext<I18n | null>(null);
const KEY_LANG = "goodluck.lang.v1";

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      const s = localStorage.getItem(KEY_LANG);
      if (s === "fr" || s === "en" || s === "hi") return s;
    } catch {
      /* ignore */
    }
    return "fr";
  });

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(KEY_LANG, l);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = LANG_META[lang].html;
    document.title = DICTS[lang].appTitle;
    setNumLocale(LANG_META[lang].num);
  }, [lang]);

  const t = useCallback(
    (key: TKey, vars?: Record<string, string | number>) => {
      let s: string = DICTS[lang][key] ?? DICTS.fr[key] ?? key;
      if (vars) {
        for (const k of Object.keys(vars)) {
          s = s.split(`{${k}}`).join(String(vars[k]));
        }
      }
      return s;
    },
    [lang]
  );

  const value = useMemo<I18n>(
    () => ({
      lang,
      setLang,
      t,
      statut: (s) => STATUT_I18N[lang][s] ?? s,
      type: (s) =>
        (TYPE_I18N[lang] as Record<string, string>)[s as string] ?? s,
      reaction: (r) => REACTION_I18N[lang][r as string] ?? (r as string) ?? "",
      relLabel: (days) =>
        days < 0
          ? t("rel.over", { n: -days })
          : days === 0
            ? t("rel.today")
            : t("rel.in", { n: days }),
    }),
    [lang, setLang, t]
  );

  return <LangCtx.Provider value={value}>{children}</LangCtx.Provider>;
}

export function useT(): I18n {
  const ctx = useContext(LangCtx);
  if (!ctx) throw new Error("useT doit être utilisé dans <LangProvider>");
  return ctx;
}

/* --------------------- Pluriel simple (n === 1 ? s : p) --------------------- */

export function pl(n: number, i: I18n, singular: TKey, plural: TKey): string {
  return Math.abs(n) === 1 ? i.t(singular) : i.t(plural);
}

/* ------------------- Rendu traduit des événements d'historique ------------------- */

export function eventText(
  e: Evenement,
  i: I18n
): { title: string; detail?: string } {
  // Événements hérités (avant l'i18n) : libellés bruts.
  if (e.titre) return { title: e.titre, detail: e.detail };

  switch (e.type) {
    case "creation": {
      const title = e.excel ? i.t("ev.creationImport") : i.t("ev.creation");
      if (e.excel) return { title, detail: i.t("ev.importDetail") };
      const parts: string[] = [];
      if (e.montantTotal !== undefined)
        parts.push(i.t("ev.creationAmount", { x: fcfa(e.montantTotal) }));
      if (e.agent) parts.push(i.t("ev.byAgent", { agent: e.agent }));
      return { title, detail: parts.length ? parts.join(" · ") : undefined };
    }
    case "paiement": {
      const title = i.t("ev.payment", { x: fcfa(e.montant ?? 0) });
      const parts: string[] = [];
      if (e.note) parts.push(e.note);
      if (e.payDate) parts.push(i.t("ev.paidOn", { d: fmtDate(e.payDate) }));
      if (e.reprise) parts.push(i.t("ev.reprise"));
      return { title, detail: parts.length ? parts.join(" · ") : undefined };
    }
    case "relance":
      return { title: i.t("ev.reminder", { n: e.relanceNum ?? 1 }) };
    case "statut": {
      const title = i.t("ev.status", {
        from: i.statut(e.from ?? "Non échu"),
        to: i.statut(e.to ?? "Non échu"),
      });
      const cause =
        e.cause === "paiement"
          ? i.t("ev.causePayment")
          : e.cause === "relance"
            ? i.t("ev.causeReminder")
            : i.t("ev.causeEdit");
      return { title, detail: cause };
    }
    default:
      return { title: i.t("ev.edit") };
  }
}
