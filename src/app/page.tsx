import { supabase } from "@/lib/supabase";
import type { TableInfo } from "@/lib/table-session";
import AccueilView from "./accueil-view";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ table?: string; code?: string }>;
}) {
  const params = await searchParams;
  const tableIdDemande = params.table ?? null;
  const codeDemande = params.code ?? null;

  const { data: toutesLesTables } = await supabase
    .from("tables_resto")
    .select("id, zone, capacite, code_qr")
    .eq("actif", true)
    .order("id", { ascending: true });

  const tableDetectee =
    (toutesLesTables ?? []).find(
      (t) => t.id === tableIdDemande && t.code_qr === codeDemande
    ) ?? null;

  return (
    <AccueilView
      tableDetectee={tableDetectee as TableInfo | null}
      tableIdDemande={tableIdDemande}
      toutesLesTables={(toutesLesTables ?? []) as TableInfo[]}
    />
  );
}