"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  usePanier,
  modifierQuantite,
  supprimerLigne,
  modifierCommentaireLigne,
  modifierModeLigne,
  modifierCommentaireGeneral,
  definirTempsRetrait,
  calculerTotal,
  viderPanierApresEnvoi,
  type ModeLigne,
} from "@/lib/cart-session";
import { useTableEnregistree } from "@/lib/table-session";
import { enregistrerRecap } from "@/lib/recap-session";
import { formatPrix } from "@/lib/types";

const CRENEAUX_MINUTES = [15, 20, 30, 40];

export default function PanierPage() {
  const panier = usePanier();
  const table = useTableEnregistree();
  const router = useRouter();
  const total = calculerTotal(panier.lignes);

  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function envoyerCommande() {
    if (panier.mode === "mixte" && panier.tempsRetraitMinutes === null) {
      setErreur("Choisis un délai de retrait pour la partie à emporter.");
      return;
    }
    if (!table) {
      setErreur("Table introuvable, retourne à l'accueil et rescanne le QR code.");
      return;
    }

    setEnvoiEnCours(true);
    setErreur(null);

    try {
      const reponse = await fetch("/api/commandes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableId: table.id,
          mode: panier.mode,
          commentaireGeneral: panier.commentaireGeneral,
          tempsRetraitMinutes: panier.tempsRetraitMinutes,
          lignes: panier.lignes.map((l) => ({
            plat_id: l.platId,
            quantite: l.quantite,
            commentaire: l.commentaire,
            mode_ligne: l.modeLigne,
          })),
        }),
      });

      const resultat = await reponse.json();

      if (!reponse.ok) {
        setErreur(resultat.erreur ?? "Une erreur est survenue, réessaie.");
        setEnvoiEnCours(false);
        return;
      }

      enregistrerRecap({
        numeroCourt: resultat.numeroCourt,
        totalCentimes: resultat.totalCentimes,
        mode: panier.mode!,
        lignes: panier.lignes.map((l) => ({
          nom: l.nom,
          quantite: l.quantite,
          prixUnitaireCentimes: l.prixUnitaireCentimes,
        })),
      });
      viderPanierApresEnvoi();
      router.push("/merci");
    } catch {
      setErreur("Impossible d'envoyer la commande, vérifie ta connexion.");
      setEnvoiEnCours(false);
    }
  }

  if (panier.lignes.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-lg font-medium">Ton panier est vide</p>
        <Link href="/menu" className="text-sm font-medium text-accent underline">
          Retourner au menu
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 px-4 py-6 pb-28">
      <h1 className="text-xl font-semibold">Ton panier</h1>

      <div className="flex flex-col gap-3">
        {panier.lignes.map((ligne) => (
          <div
            key={ligne.id}
            className="rounded-xl border border-foreground/10 p-3"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium">{ligne.nom}</p>
              <span className="whitespace-nowrap font-mono text-sm text-accent">
                {formatPrix(ligne.prixUnitaireCentimes * ligne.quantite)}
              </span>
            </div>

            <div className="mt-2 flex items-center gap-3">
              <button
                onClick={() => modifierQuantite(ligne.id, -1)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground/10 text-sm"
                aria-label="Retirer un"
              >
                −
              </button>
              <span className="w-4 text-center text-sm">{ligne.quantite}</span>
              <button
                onClick={() => modifierQuantite(ligne.id, 1)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground/10 text-sm"
                aria-label="Ajouter un"
              >
                +
              </button>

              <button
                onClick={() => supprimerLigne(ligne.id)}
                className="ml-auto text-xs font-medium text-foreground/40 underline underline-offset-2"
              >
                Supprimer
              </button>
            </div>

            {panier.mode === "mixte" && (
              <div className="mt-3 flex gap-2">
                {(["sur_place", "emporter"] as ModeLigne[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => modifierModeLigne(ligne.id, m)}
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      ligne.modeLigne === m
                        ? "bg-accent text-background"
                        : "bg-foreground/10 text-foreground/60"
                    }`}
                  >
                    {m === "sur_place" ? "Sur place" : "À emporter"}
                  </button>
                ))}
              </div>
            )}

            <input
              type="text"
              value={ligne.commentaire}
              onChange={(e) => modifierCommentaireLigne(ligne.id, e.target.value)}
              placeholder="Un commentaire ? (ex. sans oignons)"
              className="mt-3 w-full rounded-lg border border-foreground/15 bg-transparent px-3 py-2 text-sm"
            />
          </div>
        ))}
      </div>

      {panier.mode === "mixte" && (
        <div>
          <p className="mb-1 text-sm font-medium">
            Dans combien de temps viens-tu récupérer la partie à emporter ?
          </p>
          <div className="flex gap-2">
            {CRENEAUX_MINUTES.map((minutes) => (
              <button
                key={minutes}
                onClick={() => definirTempsRetrait(minutes)}
                className={`flex-1 rounded-lg py-2 text-sm font-medium ${
                  panier.tempsRetraitMinutes === minutes
                    ? "bg-accent text-background"
                    : "bg-foreground/10 text-foreground/70"
                }`}
              >
                {minutes} min
              </button>
            ))}
          </div>
          <p className="mt-1 text-xs text-foreground/40">
            Délai maximum : 40 minutes.
          </p>
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium">
          Commentaire pour toute la commande
        </label>
        <textarea
          value={panier.commentaireGeneral}
          onChange={(e) => modifierCommentaireGeneral(e.target.value)}
          rows={2}
          className="w-full rounded-lg border border-foreground/15 bg-transparent px-3 py-2 text-sm"
        />
      </div>

      {erreur && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600">
          {erreur}
        </p>
      )}

      <div className="fixed inset-x-0 bottom-0 z-20 bg-accent px-4 py-3 text-background">
        <button
          onClick={envoyerCommande}
          disabled={envoiEnCours}
          className="flex w-full items-center justify-between disabled:opacity-60"
        >
          <span className="text-sm font-medium">
            {envoiEnCours ? "Envoi en cours…" : "Envoyer la commande"}
          </span>
          <span className="text-base font-semibold">{formatPrix(total)}</span>
        </button>
      </div>
    </div>
  );
}