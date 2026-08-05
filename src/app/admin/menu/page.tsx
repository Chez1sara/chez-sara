import { redirect } from "next/navigation";
import { creerClientServeur } from "@/lib/supabase-server";
import Link from "next/link";
import GestionMenu from "./gestion-menu";

export default async function AdminMenuPage() {
  const supabase = await creerClientServeur();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const [{ data: categories }, { data: plats }] = await Promise.all([
    supabase.from("categories").select("*").order("ordre", { ascending: true }),
    supabase.from("plats").select("*").order("ordre", { ascending: true }),
  ]);

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between border-b border-foreground/10 p-4">
        <h1 className="text-xl font-semibold">Gestion du menu</h1>
        <Link
          href="/admin"
          className="text-sm font-medium text-foreground/50 underline underline-offset-2"
        >
          ← Commandes
        </Link>
      </div>
      <GestionMenu
        categoriesInitiales={categories ?? []}
        platsInitiaux={plats ?? []}
      />
    </div>
  );
}