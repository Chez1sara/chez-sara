"use client";

import { useEffect } from "react";

export default function EnregistrerServiceWorker() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Sans conséquence si ça échoue : le site fonctionne normalement,
        // juste sans page hors-ligne personnalisée.
      });
    }
  }, []);

  return null;
}