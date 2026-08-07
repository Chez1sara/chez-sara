"use client";

import { useEffect, useState } from "react";
import { formatPrix } from "@/lib/types";
import { creerClientNavigateur } from "@/lib/supabase-browser";
import { LOGO_TICKET_BASE64 } from "@/lib/logo-base64";

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
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={LOGO_TICKET_BASE64}
        alt=""
        style={{ width: "20mm", height: "20mm", margin: "0 auto 2mm" }}
      />
      <p className="text-center font-bold">Chez Sara</p>
      <p className="text-center">C.C Carrefour, 32 rue de Pierre, 79000 Niort</p>
      <p className="text-center">06 83 61 38 46</p>
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
  commandes: commandesInitiales,
}: {
  commandes: CommandeAvecLignes[];
}) {
  const [commandes, setCommandes] = useState(commandesInitiales);
  const [aImprimer, setAImprimer] = useState<CommandeAvecLignes | null>(null);
  const [ouverte, setOuverte] = useState<string | null>(null);
  const [paiementBrouillon, setPaiementBrouillon] = useState<string>("");
  const [enregistrementEnCours, setEnregistrementEnCours] = useState(false);
  const supabase = creerClientNavigateur();

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

  function ouvrirLigne(commande: CommandeAvecLignes) {
    if (ouverte === commande.id) {
      setOuverte(null);
      return;
    }
    setOuverte(commande.id);
    setPaiementBrouillon(commande.mode_paiement ?? "");
  }

  async function enregistrerPaiement(commande: CommandeAvecLignes) {
    setEnregistrementEnCours(true);
    const valeur = paiementBrouillon || null;

    const { error } = await supabase
      .from("commandes")
      .update({ mode_paiement: valeur })
      .eq("id", commande.id);

    setEnregistrementEnCours(false);
    if (!error) {
      setCommandes((prec) =>
        prec.map((c) => (c.id === commande.id ? { ...c, mode_paiement: valeur } : c))
      );
    }
  }

  async function supprimer(commande: CommandeAvecLignes) {
    if (
      !confirm(
        `Supprimer définitivement la commande #${commande.numero_court} de l'historique ?`
      )
    )
      return;
    setCommandes((prec) => prec.filter((c) => c.id !== commande.id));
    await supabase.from("commandes").delete().eq("id", commande.id);
  }

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
          className="rounded-xl border border-accent/25 bg-panel p-3 text-sm"
        >
          <button
            onClick={() => ouvrirLigne(c)}
            className="flex w-full items-center justify-between gap-2 text-left"
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
            <p className="font-mono font-semibold text-accent">
              {formatPrix(c.total_centimes)}
            </p>
          </button>

          {ouverte === c.id && (
            <div className="mt-3 flex flex-col gap-2 border-t border-accent/15 pt-3">
              <div className="flex items-center gap-2">
                <label className="text-xs text-foreground/50">Paiement :</label>
                <select
                  value={paiementBrouillon}
                  onChange={(e) => setPaiementBrouillon(e.target.value)}
                  className="rounded-full border border-accent/25 bg-transparent px-2 py-1 text-xs"
                >
                  <option className="text-black" value="">Non réglé</option>
                  <option className="text-black" value="especes">💵 Espèces</option>
                  <option className="text-black" value="carte_bleue">💳 Carte bleue</option>
                  <option className="text-black" value="cheque">📝 Chèque</option>
                  <option className="text-black" value="ticket_restaurant">🎫 Ticket restaurant</option>
                  <option className="text-black" value="carte_restaurant">🪪 Carte restaurant</option>
                </select>
                {paiementBrouillon !== (c.mode_paiement ?? "") && (
                  <button
                    onClick={() => enregistrerPaiement(c)}
                    disabled={enregistrementEnCours}
                    className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-background disabled:opacity-60"
                  >
                    {enregistrementEnCours ? "…" : "Enregistrer"}
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setAImprimer(c)}
                  className="rounded-full border border-accent/30 px-3 py-1.5 text-xs"
                >
                  Imprimer
                </button>
                <button
                  onClick={() => supprimer(c)}
                  className="rounded-full border border-red-500/40 px-3 py-1.5 text-xs text-red-500"
                >
                  Supprimer
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
      {aImprimer && <TicketImprimable commande={aImprimer} />}
    </div>
  );
}
