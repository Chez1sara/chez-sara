"use client";

import { useEffect, useState } from "react";
import { formatPrix } from "@/lib/types";

type LigneCommande = {
  id: string;
  nom_plat_copie: string;
  prix_unitaire_copie: number;
  quantite: number;
  commentaire: string | null;
  mode_ligne: "sur_place" | "emporter" | null;
};

export type CommandeAvecLignes = {
  id: string;
  numero_court: string;
  table_id: string;
  mode: "sur_place" | "emporter" | "mixte";
  statut: string;
  mode_paiement: string | null;
  total_centimes: number;
  cree_le: string;
  commentaire_general: string | null;
  temps_retrait_minutes: number | null;
  commande_lignes: LigneCommande[];
};

const LABEL_MODE: Record<string, string> = {
  sur_place: "Sur place",
  emporter: "À emporter",
  mixte: "Mixte",
};

const LABEL_STATUT: Record<string, string> = {
  nouvelle: "Nouvelle",
  acceptee: "Acceptée",
  en_preparation: "En préparation",
  prete: "Prête",
  terminee: "Terminée",
};

const LABEL_PAIEMENT: Record<string, string> = {
  especes: "💵 Espèces",
  carte_bleue: "💳 Carte bleue",
  cheque: "📝 Chèque",
  ticket_restaurant: "🎫 Ticket restaurant",
  carte_restaurant: "🪪 Carte restaurant",
};

// N'apparaît jamais à l'écran : seulement au moment de l'impression
// (voir la règle @media print dans globals.css).
function TicketImprimable({ commande }: { commande: CommandeAvecLignes }) {
  return (
    <div className="ticket-impression hidden">
      <p className="text-center font-bold">Chez Sara</p>
      <p className="text-center">Table {commande.table_id}</p>
      <p className="text-center">
        #{commande.numero_court} · {LABEL_MODE[commande.mode]}
      </p>
      <p className="text-center">
        {new Date(commande.cree_le).toLocaleString("fr-FR", {
          timeZone: "Europe/Paris",
        })}
      </p>
      <hr />
      {commande.commande_lignes.map((ligne) => (
        <div key={ligne.id} className="flex justify-between">
          <span>
            {ligne.quantite}× {ligne.nom_plat_copie}
            {commande.mode === "mixte" && ligne.mode_ligne && (
              <> ({ligne.mode_ligne === "sur_place" ? "sur place" : "à emporter"})</>
            )}
            {ligne.commentaire && <> — {ligne.commentaire}</>}
          </span>
          <span>{formatPrix(ligne.prix_unitaire_copie * ligne.quantite)}</span>
        </div>
      ))}
      {commande.commentaire_general && (
        <p>« {commande.commentaire_general} »</p>
      )}
      {commande.mode === "mixte" && commande.temps_retrait_minutes && (
        <p className="text-center">
          Retrait à emporter dans {commande.temps_retrait_minutes} min
        </p>
      )}
      <hr />
      <div className="flex justify-between font-bold">
        <span>Total</span>
        <span>{formatPrix(commande.total_centimes)}</span>
      </div>
      {commande.mode_paiement && (
        <p className="mt-1 text-center">
          Paiement : {LABEL_PAIEMENT[commande.mode_paiement]}
        </p>
      )}
    </div>
  );
}

export default function ListeImprimable({
  commandes,
}: {
  commandes: CommandeAvecLignes[];
}) {
  const [aImprimer, setAImprimer] = useState<CommandeAvecLignes | null>(null);

  useEffect(() => {
    if (aImprimer) {
      window.print();
    }
  }, [aImprimer]);

  useEffect(() => {
    function surApresImpression() {
      setAImprimer(null);
    }
    window.addEventListener("afterprint", surApresImpression);
    return () => window.removeEventListener("afterprint", surApresImpression);
  }, []);

  if (commandes.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-foreground/50">
        Aucune commande ce jour-là.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2 px-4 pb-6">
      {commandes.map((c) => (
        <div
          key={c.id}
          className="flex items-center justify-between rounded-xl border border-foreground/10 p-3 text-sm"
        >
          <div>
            <p className="font-medium">
              {c.table_id} · #{c.numero_court}
            </p>
            <p className="text-xs text-foreground/50">
              {new Date(c.cree_le).toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
                timeZone: "Europe/Paris",
              })}{" "}
              · {LABEL_MODE[c.mode]} · {LABEL_STATUT[c.statut]} ·{" "}
              {c.mode_paiement ? LABEL_PAIEMENT[c.mode_paiement] : "Non réglé"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <p className="font-mono font-semibold">
              {formatPrix(c.total_centimes)}
            </p>
            <button
              onClick={() => setAImprimer(c)}
              className="rounded-full border border-foreground/15 px-2 py-1 text-xs text-foreground/60"
            >
              Imprimer
            </button>
          </div>
        </div>
      ))}
      {aImprimer && <TicketImprimable commande={aImprimer} />}
    </div>
  );
}