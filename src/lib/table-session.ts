"use client";

import { useSyncExternalStore } from "react";

export const TABLE_STORAGE_KEY = "chez-sara-table";
const TABLE_EVENT = "chez-sara-table-changed";

export type TableInfo = {
  id: string;
  zone: string;
  capacite: number;
  code_qr: string;
};

// Cache la dernière valeur lue : useSyncExternalStore exige que la
// fonction de lecture renvoie la MÊME référence tant que la donnée
// stockée n'a pas changé, sinon il redéclenche un rendu à l'infini.
let dernierBrut: string | null = null;
let derniereValeur: TableInfo | null = null;

function lireTableEnregistree(): TableInfo | null {
  const brut = sessionStorage.getItem(TABLE_STORAGE_KEY);
  if (brut === dernierBrut) {
    return derniereValeur;
  }
  dernierBrut = brut;
  if (!brut) {
    derniereValeur = null;
  } else {
    try {
      derniereValeur = JSON.parse(brut) as TableInfo;
    } catch {
      derniereValeur = null;
    }
  }
  return derniereValeur;
}

export function enregistrerTable(table: TableInfo) {
  sessionStorage.setItem(TABLE_STORAGE_KEY, JSON.stringify(table));
  window.dispatchEvent(new Event(TABLE_EVENT));
}

function subscribe(callback: () => void) {
  window.addEventListener(TABLE_EVENT, callback);
  return () => window.removeEventListener(TABLE_EVENT, callback);
}

export function useTableEnregistree(): TableInfo | null {
  return useSyncExternalStore(subscribe, lireTableEnregistree, () => null);
}