"use client";

import { useSyncExternalStore } from "react";

export type ModeCommande = "sur_place" | "emporter" | "mixte";
export type ModeLigne = "sur_place" | "emporter";

export type LignePanier = {
  id: string;
  platId: string;
  nom: string;
  prixUnitaireCentimes: number;
  quantite: number;
  commentaire: string;
  modeLigne: ModeLigne | null;
};

export type PanierData = {
  mode: ModeCommande | null;
  lignes: LignePanier[];
  commentaireGeneral: string;
  tempsRetraitMinutes: number | null;
};

const PANIER_KEY = "chez-sara-panier";
const PANIER_EVENT = "chez-sara-panier-changed";

function idAleatoire(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

const panierVide: PanierData = {
  mode: null,
  lignes: [],
  commentaireGeneral: "",
  tempsRetraitMinutes: null,
};

let dernierBrut: string | null = null;
let derniereValeur: PanierData = panierVide;

function lirePanier(): PanierData {
  const brut = sessionStorage.getItem(PANIER_KEY);
  if (brut === dernierBrut) {
    return derniereValeur;
  }
  dernierBrut = brut;
  if (!brut) {
    derniereValeur = panierVide;
  } else {
    try {
      derniereValeur = JSON.parse(brut) as PanierData;
    } catch {
      derniereValeur = panierVide;
    }
  }
  return derniereValeur;
}

function ecrirePanier(data: PanierData) {
  sessionStorage.setItem(PANIER_KEY, JSON.stringify(data));
  window.dispatchEvent(new Event(PANIER_EVENT));
}

function subscribe(callback: () => void) {
  window.addEventListener(PANIER_EVENT, callback);
  return () => window.removeEventListener(PANIER_EVENT, callback);
}

export function usePanier(): PanierData {
  return useSyncExternalStore(subscribe, lirePanier, () => panierVide);
}

export function definirMode(mode: ModeCommande) {
  ecrirePanier({ ...lirePanier(), mode });
}

export function ajouterAuPanier(
  plat: {
    id: string;
    nom: string;
    prixCentimes: number;
  },
  options?: { commentaire?: string; quantite?: number }
) {
  const commentaire = options?.commentaire ?? "";
  const quantiteAjoutee = options?.quantite ?? 1;

  const actuel = lirePanier();
  const existante = actuel.lignes.find(
    (l) => l.platId === plat.id && l.commentaire === commentaire
  );

  let lignes: LignePanier[];
  if (existante) {
    lignes = actuel.lignes.map((l) =>
      l.id === existante.id
        ? { ...l, quantite: l.quantite + quantiteAjoutee }
        : l
    );
  } else {
    const nouvelle: LignePanier = {
      id: idAleatoire(),
      platId: plat.id,
      nom: plat.nom,
      prixUnitaireCentimes: plat.prixCentimes,
      quantite: quantiteAjoutee,
      commentaire,
      modeLigne: actuel.mode === "mixte" ? "sur_place" : null,
    };
    lignes = [...actuel.lignes, nouvelle];
  }

  ecrirePanier({ ...actuel, lignes });
}

export function modifierQuantite(ligneId: string, delta: number) {
  const actuel = lirePanier();
  const lignes = actuel.lignes
    .map((l) => (l.id === ligneId ? { ...l, quantite: l.quantite + delta } : l))
    .filter((l) => l.quantite > 0);
  ecrirePanier({ ...actuel, lignes });
}

export function supprimerLigne(ligneId: string) {
  const actuel = lirePanier();
  ecrirePanier({
    ...actuel,
    lignes: actuel.lignes.filter((l) => l.id !== ligneId),
  });
}

export function modifierCommentaireLigne(ligneId: string, commentaire: string) {
  const actuel = lirePanier();
  ecrirePanier({
    ...actuel,
    lignes: actuel.lignes.map((l) =>
      l.id === ligneId ? { ...l, commentaire } : l
    ),
  });
}

export function modifierModeLigne(ligneId: string, modeLigne: ModeLigne) {
  const actuel = lirePanier();
  ecrirePanier({
    ...actuel,
    lignes: actuel.lignes.map((l) =>
      l.id === ligneId ? { ...l, modeLigne } : l
    ),
  });
}

export function modifierCommentaireGeneral(commentaireGeneral: string) {
  ecrirePanier({ ...lirePanier(), commentaireGeneral });
}

export function definirTempsRetrait(minutes: number) {
  ecrirePanier({ ...lirePanier(), tempsRetraitMinutes: minutes });
}

export function viderPanier() {
  ecrirePanier(panierVide);
}

export function viderPanierApresEnvoi() {
  const actuel = lirePanier();
  ecrirePanier({
    mode: actuel.mode,
    lignes: [],
    commentaireGeneral: "",
    tempsRetraitMinutes: null,
  });
}

export function calculerTotal(lignes: LignePanier[]): number {
  return lignes.reduce(
    (somme, l) => somme + l.prixUnitaireCentimes * l.quantite,
    0
  );
}