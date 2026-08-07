import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Cette route tourne côté serveur, jamais dans le navigateur du client.
// C'est ici, et seulement ici, qu'on fait confiance aux données : le
// vrai calcul du total se fait dans la fonction SQL creer_commande, à
// partir des prix stockés en base — jamais depuis ce que le panier du
// navigateur prétend.
export async function POST(request: Request) {
  const corps = await request.json();
  const { tableId, mode, commentaireGeneral, tempsRetraitMinutes, lignes } =
    corps;

  const manquants: string[] = [];
  if (!tableId) manquants.push("tableId");
  if (!mode) manquants.push("mode");
  if (!Array.isArray(lignes) || lignes.length === 0) manquants.push("lignes");

  if (manquants.length > 0) {
    return NextResponse.json(
      { erreur: `Commande invalide : champ(s) manquant(s) — ${manquants.join(", ")}.` },
      { status: 400 }
    );
  }

  const { data, error } = await supabase.rpc("creer_commande", {
    p_table_id: tableId,
    p_mode: mode,
    p_commentaire_general: commentaireGeneral || null,
    p_temps_retrait_minutes: tempsRetraitMinutes ?? null,
    p_lignes: lignes,
  });

  if (error) {
    return NextResponse.json({ erreur: error.message }, { status: 400 });
  }

  const resultat = data?.[0];
  return NextResponse.json({
    id: resultat.commande_id,
    numeroCourt: resultat.numero_court,
    totalCentimes: resultat.total_centimes,
  });
}