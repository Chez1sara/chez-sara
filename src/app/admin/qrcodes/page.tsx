import { redirect } from "next/navigation";
import Link from "next/link";
import { creerClientServeur } from "@/lib/supabase-server";
import GrilleQrCodes from "./grille-qrcodes";

export default async function QrCodesPage() {
  const supabase = await creerClientServeur();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: tables } = await supabase
    .from("tables_resto")
    .select("id")
    .order("id", { ascending: true });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return (
    <div className="flex flex-1 flex-col">
      <div className="qrcodes-en-tete flex items-center justify-between border-b border-foreground/10 p-4">
        <h1 className="text-xl font-semibold">QR codes des tables</h1>
        <Link
          href="/admin"
          className="text-sm font-medium text-foreground/50 underline underline-offset-2"
        >
          ← Commandes
        </Link>
      </div>
      <GrilleQrCodes
        tableIds={(tables ?? []).map((t) => t.id as string)}
        siteUrl={siteUrl}
      />
    </div>
  );
}