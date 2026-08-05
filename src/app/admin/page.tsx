import { redirect } from "next/navigation";
import Link from "next/link";
import { creerClientServeur } from "@/lib/supabase-server";
import DeconnexionBouton from "./deconnexion-bouton";
import Dashboard, { type Commande } from "./dashboard";

export default async function AdminPage() {
  const supabase = await creerClientServeur();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: commandes } = await supabase
    .from("commandes")
    .select("*, commande_lignes(*)")
    .neq("statut", "terminee")
    .gt("expire_le", new Date().toISOString())
    .order("cree_le", { ascending: true });

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between border-b border-foreground/10 p-4">
        <h1 className="text-xl font-semibold">Commandes</h1>
        <div className="flex items-center gap-4">
          <Link
            href="/admin/tables"
            className="text-sm font-medium text-foreground/50 underline underline-offset-2"
          >
            Tables
          </Link>
          <Link
            href="/admin/qrcodes"
            className="text-sm font-medium text-foreground/50 underline underline-offset-2"
          >
            QR codes
          </Link>
          <Link
            href="/admin/historique"
            className="text-sm font-medium text-foreground/50 underline underline-offset-2"
          >
            Historique
          </Link>
          <Link
            href="/admin/menu"
            className="text-sm font-medium text-foreground/50 underline underline-offset-2"
          >
            Gérer le menu
          </Link>
          <DeconnexionBouton />
        </div>
      </div>
      <Dashboard commandesInitiales={(commandes ?? []) as Commande[]} />
    </div>
  );
}