"use client";

import { useSyncExternalStore } from "react";

const RECAP_KEY = "chez-sara-dernier-recap";

export type RecapCommande = {
  numeroCourt: string;
  totalCentimes: number;
  mode: "sur_place" | "emporter" | "mixte";
  lignes: { nom: string; quantite: number; prixUnitaireCentimes: number }[];
};

export function enregistrerRecap(recap: RecapCommande) {
  sessionStorage.setItem(RECAP_KEY, JSON.stringify(recap));
}

// Même précaution que pour la table et le panier : useSyncExternalStore
// exige une référence stable tant que la donnée n'a pas changé.
let dernierBrut: string | null = null;
let derniereValeur: RecapCommande | null = null;

function lireRecap(): RecapCommande | null {
  const brut = sessionStorage.getItem(RECAP_KEY);
  if (brut === dernierBrut) {
    return derniereValeur;
  }
  dernierBrut = brut;
  if (!brut) {
    derniereValeur = null;
  } else {
    try {
      derniereValeur = JSON.parse(brut) as RecapCommande;
    } catch {
      derniereValeur = null;
    }
  }
  return derniereValeur;
}

function subscribe() {
  return () => {};
}

export function useRecap(): RecapCommande | null {
  return useSyncExternalStore(subscribe, lireRecap, () => null);
}