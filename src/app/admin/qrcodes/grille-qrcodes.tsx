"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { creerClientNavigateur } from "@/lib/supabase-browser";

type Table = { id: string; code_qr: string };

function nouveauCode(): string {
  return Array.from({ length: 12 }, () =>
    "abcdefghijklmnopqrstuvwxyz0123456789"[Math.floor(Math.random() * 36)]
  ).join("");
}

export default function GrilleQrCodes({
  tablesInitiales,
  siteUrl,
}: {
  tablesInitiales: Table[];
  siteUrl: string;
}) {
  const [tables, setTables] = useState(tablesInitiales);
  const [enCours, setEnCours] = useState<string | null>(null);
  const supabase = creerClientNavigateur();

  async function renouveler(table: Table) {
    if (
      !confirm(
        `Renouveler le QR code de ${table.id} ? L'ancien QR code déjà imprimé cessera immédiatement de fonctionner — il faudra réimprimer et reposer le nouveau sur la table.`
      )
    )
      return;

    setEnCours(table.id);
    const code = nouveauCode();

    const { error } = await supabase
      .from("tables_resto")
      .update({ code_qr: code })
      .eq("id", table.id);

    setEnCours(null);
    if (!error) {
      setTables((prec) =>
        prec.map((t) => (t.id === table.id ? { ...t, code_qr: code } : t))
      );
    }
  }

  return (
    <div className="p-4">
      <button
        onClick={() => window.print()}
        className="mb-4 rounded-full bg-jaune px-4 py-2 text-sm font-semibold text-ink"
      >
        Imprimer la planche (A4)
      </button>

      <div className="grille-imprimable grid grid-cols-2 gap-6">
        {tables.map((table) => (
          <div
            key={table.id}
            className="flex flex-col items-center gap-2 rounded-xl border border-accent/25 bg-panel p-4"
          >
            <QRCodeSVG
              value={`${siteUrl}/?table=${table.id}&code=${table.code_qr}`}
              size={220}
              level="H"
              marginSize={2}
              className="h-auto w-full max-w-[220px]"
            />
            <p className="text-lg font-semibold">{table.id}</p>
            <button
              onClick={() => renouveler(table)}
              disabled={enCours === table.id}
              className="rounded-full border border-orange/60 px-3 py-1 text-xs font-medium text-orange disabled:opacity-50"
            >
              {enCours === table.id ? "…" : "🔄 Renouveler"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}