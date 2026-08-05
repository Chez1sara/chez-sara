import { redirect } from "next/navigation";
import Link from "next/link";
import { creerClientServeur } from "@/lib/supabase-server";
import GestionTables from "./gestion-tables";

export default async function TablesPage() {
  const supabase = await creerClientServeur();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: tables } = await supabase
    .from("tables_resto")
    .select("*")
    .order("id", { ascending: true });

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between border-b border-foreground/10 p-4">
        <h1 className="text-xl font-semibold">Gérer les tables</h1>
        <Link
          href="/admin"
          className="text-sm font-medium text-foreground/50 underline underline-offset-2"
        >
          ← Commandes
        </Link>
      </div>
      <GestionTables tablesInitiales={tables ?? []} />
    </div>
  );
}