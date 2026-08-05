"use client";

import { useSyncExternalStore } from "react";

function estHorsLigne() {
  return !navigator.onLine;
}

function subscribe(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

// Bandeau discret qui apparaît uniquement quand la connexion tombe
// (utile en salle si le wifi coupe pendant une commande).
export default function StatutConnexion() {
  const horsLigne = useSyncExternalStore(subscribe, estHorsLigne, () => false);

  if (!horsLigne) return null;

  return (
    <div className="bg-red-600 px-4 py-1.5 text-center text-xs font-medium text-white">
      📡 Pas de connexion internet — certaines actions peuvent échouer.
    </div>
  );
}