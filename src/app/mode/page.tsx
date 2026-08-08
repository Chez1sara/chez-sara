"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { definirMode, type ModeCommande } from "@/lib/cart-session";
import { useTableEnregistree } from "@/lib/table-session";

const OPTIONS: {
  valeur: ModeCommande;
  emoji: string;
  titre: string;
  description: string;
}[] = [
  {
    valeur: "sur_place",
    emoji: "🍽️",
    titre: "Sur place",
    description: "Je mange ici, à ma table.",
  },
  {
    valeur: "emporter",
    emoji: "🥡",
    titre: "À emporter",
    description: "Je récupère ma commande pour partir.",
  },
  {
    valeur: "mixte",
    emoji: "🍽️ + 🥡",
    titre: "Mixte",
    description: "Certains plats sur place, d'autres à emporter.",
  },
];

export default function ModePage() {
  const router = useRouter();
  const table = useTableEnregistree();

  useEffect(() => {
    if (table === null) {
      router.replace("/");
    }
  }, [table, router]);

  function choisir(mode: ModeCommande) {
    definirMode(mode);
    router.push("/menu");
  }

  return (
    <div
      className="relative flex flex-1 flex-col items-center justify-center gap-6 px-4 py-12"
      style={{
        backgroundImage: "url('/motif-theiere.png')",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center 30%",
        backgroundSize: "180% auto",
      }}
    >
      <h1 className="font-display rounded-xl border border-accent/30 bg-panel px-5 py-2.5 text-center text-xl text-foreground shadow-sm">
        Comment souhaites-tu être servi ?
      </h1>
      <div className="flex w-full max-w-sm flex-col gap-3">
        {OPTIONS.map((option) => (
          <button
            key={option.valeur}
            onClick={() => choisir(option.valeur)}
            className="flex items-center gap-3 rounded-xl border border-accent/25 bg-panel p-4 text-left transition-colors hover:border-accent/50"
          >
            <span className="text-2xl">{option.emoji}</span>
            <div>
              <p className="font-medium">{option.titre}</p>
              <p className="text-sm text-foreground/60">{option.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}