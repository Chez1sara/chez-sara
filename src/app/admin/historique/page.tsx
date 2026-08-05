import { redirect } from "next/navigation";
import Link from "next/link";
import { creerClientServeur } from "@/lib/supabase-server";
import { formatPrix } from "@/lib/types";
import ListeImprimable, { type CommandeAvecLignes } from "./liste-imprimable";

type LigneHistorique = {
  id: string;
  numero_court: string;
  table_id: string;
  mode: "sur_place" | "emporter" | "mixte";
  statut: "nouvelle" | "acceptee" | "en_preparation" | "prete" | "terminee";
  mode_paiement:
    | "especes"
    | "carte_bleue"
    | "cheque"
    | "ticket_restaurant"
    | "carte_restaurant"
    | null;
  commentaire_general: string | null;
  temps_retrait_minutes: number | null;
  total_centimes: number;
  cree_le: string;
};

const LABEL_PAIEMENT: Record<string, string> = {
  especes: "💵 Espèces",
  carte_bleue: "💳 Carte bleue",
  cheque: "📝 Chèque",
  ticket_restaurant: "🎫 Ticket restaurant",
  carte_restaurant: "🪪 Carte restaurant",
};

const ORDRE_PAIEMENT = [
  "especes",
  "carte_bleue",
  "cheque",
  "ticket_restaurant",
  "carte_restaurant",
  "non_regle",
];

export default async function HistoriquePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const supabase = await creerClientServeur();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const params = await searchParams;
  const aujourdHui = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Paris",
  }).format(new Date());
  const dateChoisie = params.date ?? aujourdHui;

  const { data } = await supabase.rpc("commandes_du_jour", {
    p_date: dateChoisie,
  });
  const commandesBase = (data ?? []) as LigneHistorique[];

  const ids = commandesBase.map((c) => c.id);
  const { data: lignesData } =
    ids.length > 0
      ? await supabase.from("commande_lignes").select("*").in("commande_id", ids)
      : { data: [] };

  const commandes: CommandeAvecLignes[] = commandesBase.map((c) => ({
    ...c,
    commande_lignes: (lignesData ?? []).filter(
      (l) => l.commande_id === c.id
    ),
  }));

  const total = commandes.reduce((s, c) => s + c.total_centimes, 0);

  const parPaiement = new Map<string, number>();
  for (const c of commandes) {
    const cle = c.mode_paiement ?? "non_regle";
    parPaiement.set(cle, (parPaiement.get(cle) ?? 0) + c.total_centimes);
  }
  const repartition = ORDRE_PAIEMENT.filter((cle) => parPaiement.has(cle)).map(
    (cle) => ({ cle, total: parPaiement.get(cle)! })
  );

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between border-b border-foreground/10 p-4">
        <h1 className="text-xl font-semibold">Historique</h1>
        <Link
          href="/admin"
          className="text-sm font-medium text-foreground/50 underline underline-offset-2"
        >
          ← Commandes
        </Link>
      </div>

      <form className="flex items-center gap-2 p-4">
        <input
          type="date"
          name="date"
          defaultValue={dateChoisie}
          max={aujourdHui}
          className="rounded-lg border border-foreground/15 bg-transparent px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-background"
        >
          Voir
        </button>
      </form>

      <div className="mx-4 mb-4 rounded-xl bg-accent/10 p-4">
        <p className="text-sm text-foreground/60">
          Total du{" "}
          {new Date(`${dateChoisie}T12:00:00`).toLocaleDateString("fr-FR")}
        </p>
        <p className="text-2xl font-bold">{formatPrix(total)}</p>
        <p className="text-xs text-foreground/50">
          {commandes.length} commande{commandes.length > 1 ? "s" : ""}
        </p>

        {repartition.length > 0 && (
          <div className="mt-3 flex flex-col gap-1 border-t border-foreground/10 pt-3">
            {repartition.map(({ cle, total: sousTotal }) => (
              <div key={cle} className="flex justify-between text-sm">
                <span className="text-foreground/60">
                  {cle === "non_regle" ? "Non réglé" : LABEL_PAIEMENT[cle]}
                </span>
                <span className="font-mono">{formatPrix(sousTotal)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <ListeImprimable commandes={commandes} />
    </div>
  );
}