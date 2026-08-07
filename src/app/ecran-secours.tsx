"use client";

import Link from "next/link";
import type { TableInfo } from "@/lib/table-session";

// Affiché quand aucune table valide n'est détectée : soit le paramètre
// ?table= est absent, soit il ne correspond à aucune table connue.
export default function EcranSecours({
  tablesDisponibles,
  tableIdDemande,
}: {
  tablesDisponibles: TableInfo[];
  tableIdDemande: string | null;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-12 text-center">
      <div>
        <h1 className="font-display text-2xl text-foreground">Table non détectée</h1>
        <p className="mt-2 max-w-sm text-sm text-foreground/60">
          {tableIdDemande
            ? `« ${tableIdDemande} » ne correspond à aucune table de Chez Sara. Rescanne le QR code posé sur ta table, ou choisis-la ci-dessous.`
            : "Rescanne le QR code posé sur ta table, ou choisis-la ci-dessous."}
        </p>
      </div>

      <div className="grid w-full max-w-xs grid-cols-2 gap-2">
        {tablesDisponibles.map((table) => (
          <Link
            key={table.id}
            href={`/?table=${table.id}`}
            className="rounded-lg border border-accent/25 bg-panel py-3 text-sm font-medium transition-colors hover:border-accent/50"
          >
            {table.id}
          </Link>
        ))}
      </div>
    </div>
  );
}
