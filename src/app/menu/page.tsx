import { supabase } from "@/lib/supabase";
import type { Categorie, OptionTaco, Plat } from "@/lib/types";
import MenuView from "./menu-view";

export const dynamic = "force-dynamic";

export default async function MenuPage() {
  const [{ data: categories }, { data: plats }, { data: viandes }, { data: sauces }] =
    await Promise.all([
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
      supabase
        .from("options_taco_viandes")
        .select("*")
        .eq("actif", true)
        .order("ordre", { ascending: true }),
      supabase
        .from("options_taco_sauces")
        .select("*")
        .eq("actif", true)
        .order("ordre", { ascending: true }),
    ]);

  return (
    <MenuView
      categories={(categories ?? []) as Categorie[]}
      plats={(plats ?? []) as Plat[]}
      viandes={(viandes ?? []) as OptionTaco[]}
      sauces={(sauces ?? []) as OptionTaco[]}
    />
  );
}