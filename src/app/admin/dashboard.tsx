"use client";

import { useEffect, useRef, useState } from "react";
import { creerClientNavigateur } from "@/lib/supabase-browser";
import { formatPrix } from "@/lib/types";
import { LOGO_TICKET_BASE64 } from "@/lib/logo-base64";

type ModeLigne = "sur_place" | "emporter" | null;
type Mode = "sur_place" | "emporter" | "mixte";
type Statut = "nouvelle" | "acceptee" | "en_preparation" | "prete" | "terminee";
type ModePaiement =
  | "especes"
  | "carte_bleue"
  | "cheque"
  | "ticket_restaurant"
  | "carte_restaurant"
  | null;

type LigneCommande = {
  id: string;
  nom_plat_copie: string;
  prix_unitaire_copie: number;
  quantite: number;
  commentaire: string | null;
  mode_ligne: ModeLigne;
};

export type Commande = {
  id: string;
  numero_court: string;
  table_id: string;
  mode: Mode;
  statut: Statut;
  mode_paiement: ModePaiement;
  commentaire_general: string | null;
  total_centimes: number;
  cree_le: string;
  temps_retrait_minutes: number | null;
  commande_lignes: LigneCommande[];
};

const LABEL_MODE: Record<Mode, string> = {
  sur_place: "Sur place",
  emporter: "À emporter",
  mixte: "Mixte",
};

const LABEL_PAIEMENT: Record<NonNullable<ModePaiement>, string> = {
  especes: "💵 Espèces",
  carte_bleue: "💳 Carte bleue",
  cheque: "📝 Chèque",
  ticket_restaurant: "🎫 Ticket restaurant",
  carte_restaurant: "🪪 Carte restaurant",
};

const LABEL_STATUT: Record<Statut, string> = {
  nouvelle: "Nouvelle",
  acceptee: "Acceptée",
  en_preparation: "En préparation",
  prete: "Prête",
  terminee: "Terminée",
};

const PROCHAIN_STATUT: Record<Statut, { suivant: Statut; label: string } | null> = {
  nouvelle: { suivant: "acceptee", label: "Accepter" },
  acceptee: { suivant: "en_preparation", label: "En préparation" },
  en_preparation: { suivant: "prete", label: "Marquer prête" },
  prete: { suivant: "terminee", label: "Terminer" },
  terminee: null,
};

function jouerSon() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 880;
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch {
    // Son indisponible (ex. navigateur qui bloque l'audio avant une
    // interaction) : sans conséquence, la pastille visuelle suffit.
  }
}

function MinuteurDepuis({ date }: { date: string }) {
  const [texte, setTexte] = useState("à l'instant");

  useEffect(() => {
    function maj() {
      const minutes = Math.floor(
        (Date.now() - new Date(date).getTime()) / 60000
      );
      setTexte(minutes < 1 ? "à l'instant" : `il y a ${minutes} min`);
    }
    maj();
    const id = setInterval(maj, 15000);
    return () => clearInterval(id);
  }, [date]);

  return <span>{texte}</span>;
}

// N'apparaît jamais à l'écran : seulement au moment de l'impression
// (voir la règle @media print dans globals.css).
function TicketImprimable({ commande }: { commande: Commande }) {
  return (
    <div className="ticket-impression hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      
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

function CarteCommande({
  commande,
  ouverte,
  onToggle,
  onChangerStatut,
  onSupprimer,
  onImprimer,
  onChangerPaiement,
}: {
  commande: Commande;
  ouverte: boolean;
  onToggle: () => void;
  onChangerStatut: () => void;
  onSupprimer: () => void;
  onImprimer: () => void;
  onChangerPaiement: (mode: ModePaiement) => void;
}) {
  const prochain = PROCHAIN_STATUT[commande.statut];
  const estNouvelle = commande.statut === "nouvelle";

  return (
    <div
      className={`rounded-xl border p-3 transition-colors ${
        ouverte ? "border-accent/50 bg-accent/10" : "border-accent/20 bg-panel"
      }`}
    >
      <button
        onClick={onToggle}
        className="flex w-full items-start justify-between gap-3 text-left"
      >
        <div className="flex items-center gap-2">
          {estNouvelle && (
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full bg-red-500"
              aria-label="Nouvelle commande"
            />
          )}
          <div>
            <p className="text-2xl font-bold">{commande.table_id}</p>
            <p className="text-xs text-foreground/50">
              #{commande.numero_court} · {LABEL_MODE[commande.mode]} ·{" "}
              <MinuteurDepuis date={commande.cree_le} />
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-mono font-semibold">
            {formatPrix(commande.total_centimes)}
          </p>
          <p className="text-xs text-foreground/50">
            {LABEL_STATUT[commande.statut]}
          </p>
        </div>
      </button>

      <div className="mt-2 flex items-center gap-2">
        <label className="text-xs text-foreground/50">Paiement :</label>
        <select
          value={commande.mode_paiement ?? ""}
          onChange={(e) =>
            onChangerPaiement((e.target.value || null) as ModePaiement)
          }
          className="rounded-full border border-accent/25 bg-transparent px-2 py-1 text-xs"
        >
          <option className="text-black" value="">Non réglé</option>
          <option className="text-black" value="especes">💵 Espèces</option>
          <option className="text-black" value="carte_bleue">💳 Carte bleue</option>
          <option className="text-black" value="cheque">📝 Chèque</option>
          <option className="text-black" value="ticket_restaurant">🎫 Ticket restaurant</option>
          <option className="text-black" value="carte_restaurant">🪪 Carte restaurant</option>
        </select>
      </div>

      {ouverte && (
        <div className="mt-3 flex flex-col gap-2 border-t border-accent/15 pt-3">
          {commande.commande_lignes.map((ligne) => (
            <div key={ligne.id} className="flex justify-between text-sm">
              <span>
                {ligne.quantite} × {ligne.nom_plat_copie}
                {commande.mode === "mixte" && ligne.mode_ligne && (
                  <span className="text-foreground/40">
                    {" "}
                    ({ligne.mode_ligne === "sur_place" ? "sur place" : "à emporter"})
                  </span>
                )}
                {ligne.commentaire && (
                  <span className="block text-xs text-foreground/40">
                    {ligne.commentaire}
                  </span>
                )}
              </span>
              <span className="font-mono text-foreground/60">
                {formatPrix(ligne.prix_unitaire_copie * ligne.quantite)}
              </span>
            </div>
          ))}
          {commande.commentaire_general && (
            <p className="text-xs italic text-foreground/50">
              « {commande.commentaire_general} »
            </p>
          )}
          {commande.mode === "mixte" && commande.temps_retrait_minutes && (
            <p className="text-xs text-foreground/50">
              Retrait de la partie à emporter dans{" "}
              {commande.temps_retrait_minutes} min
            </p>
          )}
        </div>
      )}

      <div className="mt-3 flex gap-2">
        {prochain && (
          <button
            onClick={onChangerStatut}
            className="flex-1 rounded-full bg-jaune py-2 text-sm font-medium text-ink"
          >
            {prochain.label}
          </button>
        )}
        <button
          onClick={onImprimer}
          className="rounded-full border border-accent/30 px-3 py-2 text-sm text-foreground/70"
        >
          Imprimer
        </button>
        <button
          onClick={onSupprimer}
          className="rounded-full border border-red-500/40 px-3 py-2 text-sm text-red-500"
        >
          Supprimer
        </button>
      </div>
    </div>
  );
}

export default function Dashboard({
  commandesInitiales,
}: {
  commandesInitiales: Commande[];
}) {
  const [commandes, setCommandes] = useState<Commande[]>(commandesInitiales);
  const [ouverte, setOuverte] = useState<string | null>(null);
  const [commandeAImprimer, setCommandeAImprimer] = useState<Commande | null>(
    null
  );
  const supabaseRef = useRef(creerClientNavigateur());

  useEffect(() => {
    if (commandeAImprimer) {
      window.print();
    }
  }, [commandeAImprimer]);

  useEffect(() => {
    function surApresImpression() {
      setCommandeAImprimer(null);
    }
    window.addEventListener("afterprint", surApresImpression);
    return () => window.removeEventListener("afterprint", surApresImpression);
  }, []);

  useEffect(() => {
    const supabase = supabaseRef.current;

    const canal = supabase
      .channel("commandes-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "commandes" },
        async (payload) => {
          const nouvelle = payload.new as Commande;
          const { data: lignes } = await supabase
            .from("commande_lignes")
            .select("*")
            .eq("commande_id", nouvelle.id);

          setCommandes((precedentes) => [
            ...precedentes,
            { ...nouvelle, commande_lignes: lignes ?? [] },
          ]);
          jouerSon();
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "commandes" },
        (payload) => {
          const maj = payload.new as Commande;
          if (maj.statut === "terminee") {
            setCommandes((precedentes) =>
              precedentes.filter((c) => c.id !== maj.id)
            );
          } else {
            setCommandes((precedentes) =>
              precedentes.map((c) =>
                c.id === maj.id ? { ...c, ...maj } : c
              )
            );
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "commandes" },
        (payload) => {
          const supprimee = payload.old as { id: string };
          setCommandes((precedentes) =>
            precedentes.filter((c) => c.id !== supprimee.id)
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, []);

  async function changerStatut(commande: Commande) {
    const prochain = PROCHAIN_STATUT[commande.statut];
    if (!prochain) return;

    if (prochain.suivant === "terminee") {
      // Une commande terminée sort du tableau actif : elle reste
      // consultable dans l'Historique, mais n'a plus rien à faire ici.
      setCommandes((precedentes) =>
        precedentes.filter((c) => c.id !== commande.id)
      );
    } else {
      setCommandes((precedentes) =>
        precedentes.map((c) =>
          c.id === commande.id ? { ...c, statut: prochain.suivant } : c
        )
      );
    }

    await supabaseRef.current
      .from("commandes")
      .update({ statut: prochain.suivant })
      .eq("id", commande.id);
  }

  async function changerModePaiement(commande: Commande, mode: ModePaiement) {
    setCommandes((precedentes) =>
      precedentes.map((c) =>
        c.id === commande.id ? { ...c, mode_paiement: mode } : c
      )
    );

    await supabaseRef.current
      .from("commandes")
      .update({ mode_paiement: mode })
      .eq("id", commande.id);
  }

  async function supprimerCommande(commande: Commande) {
    if (!confirm(`Supprimer la commande ${commande.numero_court} ?`)) return;

    setCommandes((precedentes) =>
      precedentes.filter((c) => c.id !== commande.id)
    );

    await supabaseRef.current.from("commandes").delete().eq("id", commande.id);
  }

  async function supprimerTout() {
    if (commandes.length === 0) return;
    if (
      !confirm(
        `Supprimer les ${commandes.length} commande(s) affichée(s) ? Cette action est irréversible.`
      )
    )
      return;

    const idsASupprimer = commandes.map((c) => c.id);
    setCommandes([]);

    await supabaseRef.current.from("commandes").delete().in("id", idsASupprimer);
  }

  const triees = [...commandes].sort(
    (a, b) => new Date(a.cree_le).getTime() - new Date(b.cree_le).getTime()
  );

  return (
    <div className="flex flex-col gap-3 p-4">
      {triees.length > 0 && (
        <button
          onClick={supprimerTout}
          className="self-end text-xs font-medium text-red-600 underline underline-offset-2"
        >
          Supprimer tout
        </button>
      )}
      {triees.length === 0 && (
        <p className="py-12 text-center text-sm text-foreground/50">
          Aucune commande en cours.
        </p>
      )}
      {triees.map((commande) => (
        <CarteCommande
          key={commande.id}
          commande={commande}
          ouverte={ouverte === commande.id}
          onToggle={() =>
            setOuverte((o) => (o === commande.id ? null : commande.id))
          }
          onChangerStatut={() => changerStatut(commande)}
          onSupprimer={() => supprimerCommande(commande)}
          onImprimer={() => setCommandeAImprimer(commande)}
          onChangerPaiement={(mode) => changerModePaiement(commande, mode)}
        />
      ))}
      {commandeAImprimer && <TicketImprimable commande={commandeAImprimer} />}
    </div>
  );
}
