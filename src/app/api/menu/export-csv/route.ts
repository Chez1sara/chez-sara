import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
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

  const lignes: string[][] = [
    ["Catégorie", "Nom", "Description", "Prix (€)", "Allergènes", "Disponibilité"],
  ];

  for (const cat of categories ?? []) {
    const platsCat = (plats ?? []).filter((p) => p.categorie_id === cat.id);
    for (const p of platsCat) {
      lignes.push([
        cat.nom,
        p.nom,
        p.description ?? "",
        (p.prix_centimes / 100).toFixed(2),
        (p.allergenes ?? []).join(", "),
        p.disponible ? "Disponible" : "Épuisé",
      ]);
    }
  }

  const csv = lignes
    .map((ligne) =>
      ligne.map((champ) => `"${String(champ).replace(/"/g, '""')}"`).join(",")
    )
    .join("\r\n");

  return new NextResponse("\uFEFF" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="menu-chez-sara.csv"',
    },
  });
}