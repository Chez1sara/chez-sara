"use client";

import { useState } from "react";
import { creerClientNavigateur } from "@/lib/supabase-browser";

type Table = {
  id: string;
  zone: "interieur" | "exterieur";
  capacite: number;
  actif: boolean;
};

export default function GestionTables({
  tablesInitiales,
}: {
  tablesInitiales: Table[];
}) {
  const [tables, setTables] = useState(tablesInitiales);
  const supabase = creerClientNavigateur();

  async function basculerActive(table: Table) {
    setTables((prec) =>
      prec.map((t) => (t.id === table.id ? { ...t, actif: !t.actif } : t))
    );

    const { error } = await supabase
      .from("tables_resto")
      .update({ actif: !table.actif })
      .eq("id", table.id);

    if (error) {
      setTables((prec) =>
        prec.map((t) => (t.id === table.id ? { ...t, actif: table.actif } : t))
      );
    }
  }

  return (
    <div className="flex flex-col gap-2 p-4">
      <p className="mb-2 text-sm text-foreground/60">
        Désactive une table pour révoquer immédiatement son QR code (utile en
        cas d&apos;abus ou de lien partagé par erreur) — son client ne pourra
        plus commander tant qu&apos;elle reste désactivée.
      </p>
      {tables.map((table) => (
        <div
          key={table.id}
          className="flex items-center justify-between rounded-xl border border-foreground/10 p-3"
        >
          <div>
            <p className="font-medium">{table.id}</p>
            <p className="text-xs text-foreground/50">
              {table.zone === "interieur" ? "Intérieur" : "Extérieur"} ·{" "}
              {table.capacite} places
            </p>
          </div>
          <button
            onClick={() => basculerActive(table)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              table.actif
                ? "bg-accent text-background"
                : "bg-red-500/20 text-red-400"
            }`}
          >
            {table.actif ? "Active" : "Désactivée"}
          </button>
        </div>
      ))}
    </div>
  );
}