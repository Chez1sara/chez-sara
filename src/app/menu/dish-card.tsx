"use client";

import { useState } from "react";
import Image from "next/image";
import type { OptionTaco, Plat } from "@/lib/types";
import { formatPrix } from "@/lib/types";
import { ajouterAuPanier } from "@/lib/cart-session";
import IconePlat from "./icone-plat";

export default function DishCard({
  plat,
  viandes,
  sauces,
}: {
  plat: Plat;
  viandes: OptionTaco[];
  sauces: OptionTaco[];
}) {
  const [vientDetreAjoute, setVientDetreAjoute] = useState(false);
  const [selecteurOuvert, setSelecteurOuvert] = useState(false);
  const [viandesChoisies, setViandesChoisies] = useState<string[]>([]);
  const [saucesChoisies, setSaucesChoisies] = useState<string[]>([]);
  const [quantite, setQuantite] = useState(1);

  const necessiteChoix = plat.nb_viandes_a_choisir > 0 || plat.nb_sauces_max > 0;

  function basculerViande(nom: string) {
    setViandesChoisies((prec) => {
      if (prec.includes(nom)) return prec.filter((v) => v !== nom);
      if (prec.length >= plat.nb_viandes_a_choisir) return prec;
      return [...prec, nom];
    });
  }

  function basculerSauce(nom: string) {
    setSaucesChoisies((prec) => {
      if (prec.includes(nom)) return prec.filter((s) => s !== nom);
      if (prec.length >= plat.nb_sauces_max) return prec;
      return [...prec, nom];
    });
  }

  function ouvrirSelecteur() {
    setViandesChoisies([]);
    setSaucesChoisies([]);
    setQuantite(1);
    setSelecteurOuvert(true);
  }

  function confirmerSelecteur() {
    const morceaux: string[] = [];
    if (viandesChoisies.length > 0) {
      morceaux.push(`Viandes : ${viandesChoisies.join(", ")}`);
    }
    if (saucesChoisies.length > 0) {
      morceaux.push(`Sauces : ${saucesChoisies.join(", ")}`);
    }

    ajouterAuPanier(
      { id: plat.id, nom: plat.nom, prixCentimes: plat.prix_centimes },
      { commentaire: morceaux.join(" — "), quantite }
    );

    setSelecteurOuvert(false);
    setVientDetreAjoute(true);
    setTimeout(() => setVientDetreAjoute(false), 1500);
  }

  function handleAjouterSimple() {
    ajouterAuPanier({
      id: plat.id,
      nom: plat.nom,
      prixCentimes: plat.prix_centimes,
    });
    setVientDetreAjoute(true);
    setTimeout(() => setVientDetreAjoute(false), 1500);
  }

  const viandesOk =
    plat.nb_viandes_a_choisir === 0 ||
    viandesChoisies.length === plat.nb_viandes_a_choisir;

  return (
    <div
      className={`flex flex-col gap-3 rounded-xl border border-accent/25 bg-panel p-3 transition-shadow focus-within:border-accent/60 ${
        !plat.disponible ? "opacity-50" : ""
      }`}
    >
      <div className="flex gap-3">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-accent/20 bg-background">
          {plat.image_url ? (
            <Image
              src={plat.image_url}
              alt={plat.nom}
              fill
              sizes="80px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <IconePlat nom={plat.nom} className="h-10 w-10 text-accent/70" />
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display leading-tight text-foreground">
              {plat.nom}
            </h3>
            <span className="whitespace-nowrap font-display text-sm text-accent">
              {formatPrix(plat.prix_centimes)}
            </span>
          </div>

          {plat.description && (
            <p className="text-sm leading-snug text-foreground/70">
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
              <span className="inline-block rounded-full border border-accent/20 px-3 py-1 text-xs font-medium text-foreground/50">
                Épuisé
              </span>
            ) : necessiteChoix ? (
              <button
                onClick={ouvrirSelecteur}
                className="rounded-full bg-jaune px-4 py-1.5 text-xs font-medium text-ink transition-colors"
              >
                {vientDetreAjoute ? "Ajouté ✓" : "Personnaliser"}
              </button>
            ) : (
              <button
                onClick={handleAjouterSimple}
                className="rounded-full bg-jaune px-4 py-1.5 text-xs font-medium text-ink transition-colors"
              >
                {vientDetreAjoute ? "Ajouté ✓" : "Ajouter"}
              </button>
            )}
          </div>
        </div>
      </div>

      {selecteurOuvert && (
        <div className="flex flex-col gap-3 rounded-lg border border-accent/30 bg-accent/10 p-3">
          {plat.nb_viandes_a_choisir > 0 && (
            <div>
              <p className="mb-1 text-xs font-medium text-foreground/70">
                Choisis {plat.nb_viandes_a_choisir} viande
                {plat.nb_viandes_a_choisir > 1 ? "s" : ""} (
                {viandesChoisies.length}/{plat.nb_viandes_a_choisir})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {viandes.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => basculerViande(v.nom)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium ${
                      viandesChoisies.includes(v.nom)
                        ? "border-accent bg-accent text-background"
                        : "border-accent/25 text-foreground/70"
                    }`}
                  >
                    {v.nom}
                  </button>
                ))}
              </div>
            </div>
          )}

          {plat.nb_sauces_max > 0 && (
            <div>
              <p className="mb-1 text-xs font-medium text-foreground/70">
                Sauces (jusqu&apos;à {plat.nb_sauces_max}) — {saucesChoisies.length}/
                {plat.nb_sauces_max}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {sauces.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => basculerSauce(s.nom)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium ${
                      saucesChoisies.includes(s.nom)
                        ? "border-accent bg-accent text-background"
                        : "border-accent/25 text-foreground/70"
                    }`}
                  >
                    {s.nom}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantite((q) => Math.max(1, q - 1))}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-accent/30 text-sm"
                aria-label="Retirer un"
              >
                −
              </button>
              <span className="w-4 text-center text-sm">{quantite}</span>
              <button
                onClick={() => setQuantite((q) => q + 1)}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-accent/30 text-sm"
                aria-label="Ajouter un"
              >
                +
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSelecteurOuvert(false)}
                className="rounded-full border border-accent/30 px-3 py-1.5 text-xs font-medium"
              >
                Annuler
              </button>
              <button
                onClick={confirmerSelecteur}
                disabled={!viandesOk}
                className="rounded-full bg-vert px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
              >
                Ajouter au panier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
