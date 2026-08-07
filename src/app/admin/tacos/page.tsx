import { redirect } from "next/navigation";
import Link from "next/link";
import { creerClientServeur } from "@/lib/supabase-server";
import GestionOptions from "./gestion-options";

export default async function TacosPage() {
  const supabase = await creerClientServeur();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const [{ data: viandes }, { data: sauces }] = await Promise.all([
    supabase.from("options_taco_viandes").select("*").order("ordre"),
    supabase.from("options_taco_sauces").select("*").order("ordre"),
  ]);

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between border-b border-accent/20 p-4">
        <h1 className="text-xl font-semibold">Viandes & sauces (tacos)</h1>
        <Link
          href="/admin"
          className="text-sm font-medium text-foreground/50 underline underline-offset-2"
        >
          ← Commandes
        </Link>
      </div>
      <GestionOptions viandes={viandes ?? []} sauces={sauces ?? []} />
    </div>
  );
}
