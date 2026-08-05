"use client";

import { useState } from "react";
import Image from "next/image";
import type { Plat } from "@/lib/types";
import { formatPrix } from "@/lib/types";
import { ajouterAuPanier } from "@/lib/cart-session";

export default function DishCard({ plat }: { plat: Plat }) {
  const [vientDetreAjoute, setVientDetreAjoute] = useState(false);

  function handleAjouter() {
    ajouterAuPanier({
      id: plat.id,
      nom: plat.nom,
      prixCentimes: plat.prix_centimes,
    });
    setVientDetreAjoute(true);
    setTimeout(() => setVientDetreAjoute(false), 1500);
  }

  return (
    <div
      className={`flex gap-3 rounded-xl border border-foreground/10 p-3 ${
        !plat.disponible ? "opacity-50" : ""
      }`}
    >
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-foreground/5">
        {plat.image_url ? (
          <Image
            src={plat.image_url}
            alt={plat.nom}
            fill
            sizes="80px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-2xl">
            🍽️
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium leading-tight">{plat.nom}</h3>
          <span className="whitespace-nowrap font-mono text-sm text-accent">
            {formatPrix(plat.prix_centimes)}
          </span>
        </div>

        {plat.description && (
          <p className="text-sm text-foreground/60 leading-snug">
            {plat.description}
          </p>
        )}

        {plat.allergenes.length > 0 && (
          <p className="text-xs text-foreground/40">
            Allergènes : {plat.allergenes.join(", ")}
          </p>
        )}

        <div className="mt-1">
          {!plat.disponible ? (
            <span className="inline-block rounded-full bg-foreground/10 px-3 py-1 text-xs font-medium">
              Épuisé
            </span>
          ) : (
            <button
              onClick={handleAjouter}
              className="rounded-full bg-accent px-4 py-1.5 text-xs font-medium text-background transition-colors"
            >
              {vientDetreAjoute ? "Ajouté ✓" : "Ajouter"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}