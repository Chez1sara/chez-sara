"use client";

import Link from "next/link";
import { useRecap } from "@/lib/recap-session";
import { formatPrix } from "@/lib/types";

const LIEN_AVIS = process.env.NEXT_PUBLIC_GOOGLE_MAPS_REVIEW_URL;

export default function MerciPage() {
  const recap = useRecap();

  if (!recap) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-lg font-medium">Aucune commande récente à afficher</p>
        <Link href="/menu" className="text-sm font-medium text-accent underline">
          Retourner au menu
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 py-10 text-center">
      <div>
        <p className="text-4xl">✅</p>
        <h1 className="mt-2 text-2xl font-semibold">Commande envoyée !</h1>
        <p className="mt-1 text-sm text-foreground/60">
          Numéro de commande : <span className="font-mono font-semibold">{recap.numeroCourt}</span>
        </p>
      </div>

      <div className="rounded-xl border border-foreground/10 p-4 text-left">
        <div className="flex flex-col gap-1">
          {recap.lignes.map((ligne, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span>
                {ligne.quantite} × {ligne.nom}
              </span>
              <span className="font-mono text-foreground/60">
                {formatPrix(ligne.prixUnitaireCentimes * ligne.quantite)}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex justify-between border-t border-foreground/10 pt-3 font-semibold">
          <span>Total</span>
          <span>{formatPrix(recap.totalCentimes)}</span>
        </div>
      </div>

      <div className="rounded-xl bg-accent/10 p-4 text-sm">
        💳 Merci de régler au comptoir en indiquant le numéro{" "}
        <span className="font-semibold">{recap.numeroCourt}</span>.
      </div>

      {LIEN_AVIS && (
        <Link
          href={LIEN_AVIS}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full rounded-full border border-foreground/15 py-3 text-sm font-medium"
        >
          ⭐ Laissez-nous un avis
        </Link>
      )}

      <Link
        href="/menu"
        className="block w-full rounded-full bg-accent py-3 text-sm font-semibold text-background"
      >
        Commander autre chose
      </Link>
    </div>
  );
}