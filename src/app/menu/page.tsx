import { supabase } from "@/lib/supabase";
import type { Categorie, Plat } from "@/lib/types";
import MenuView from "./menu-view";

export const dynamic = "force-dynamic";

export default async function MenuPage() {
  const [{ data: categories }, { data: plats }] = await Promise.all([
    supabase
      .from("categories")
      .select("*")
      .eq("actif", true)
      .order("ordre", { ascending: true }),
    supabase
      .from("plats")
      .select("*")
      .eq("actif", true)
      .order("ordre", { ascending: true }),
  ]);

  return (
    <MenuView
      categories={(categories ?? []) as Categorie[]}
      plats={(plats ?? []) as Plat[]}
    />
  );
}