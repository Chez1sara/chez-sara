import { redirect } from "next/navigation";
import Link from "next/link";
import { creerClientServeur } from "@/lib/supabase-server";
import { formatPrix } from "@/lib/types";

type LigneHistorique = {
  id: string;
  numero_court: string;
  table_id: string;
  mode: "sur_place" | "emporter" | "mixte";
  statut: "nouvelle" | "acceptee" | "en_preparation" | "prete" | "terminee";
  total_centimes: number;
  cree_le: string;
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
  const commandes = (data ?? []) as LigneHistorique[];

  const total = commandes.reduce((s, c) => s + c.total_centimes, 0);

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
      </div>

      <div className="flex flex-col gap-2 px-4 pb-6">
        {commandes.length === 0 && (
          <p className="py-12 text-center text-sm text-foreground/50">
            Aucune commande ce jour-là.
          </p>
        )}
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
                · {LABEL_MODE[c.mode]} · {LABEL_STATUT[c.statut]}
              </p>
            </div>
            <p className="font-mono font-semibold">
              {formatPrix(c.total_centimes)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}