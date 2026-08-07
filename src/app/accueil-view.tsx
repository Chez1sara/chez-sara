"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  enregistrerTable,
  useTableEnregistree,
  type TableInfo,
} from "@/lib/table-session";
import EcranSecours from "./ecran-secours";
import VideoAccueil from "./video-accueil";

export default function AccueilView({
  tableDetectee,
  tableIdDemande,
  toutesLesTables,
}: {
  tableDetectee: TableInfo | null;
  tableIdDemande: string | null;
  toutesLesTables: TableInfo[];
}) {
  const tableEnregistree = useTableEnregistree();
  const [videoIgnoree, setVideoIgnoree] = useState(false);

  useEffect(() => {
    if (tableDetectee) {
      enregistrerTable(tableDetectee);
    }
  }, [tableDetectee]);

  const tableConfirmee = tableDetectee ?? tableEnregistree;

  if (!tableConfirmee) {
    return (
      <EcranSecours
        tablesDisponibles={toutesLesTables}
        tableIdDemande={tableIdDemande}
      />
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 py-6">
      <div className="relative overflow-hidden px-4 pb-6 pt-4 text-center">
        
        <p className="font-mono text-xs tracking-widest uppercase text-accent">
          Niort · France
        </p>
        <p className="mt-2 text-base text-foreground/75">
          Bienvenue ! Découvre notre carte et commande directement depuis ta
          table.
        </p>
      </div>

      {!videoIgnoree && (
        <VideoAccueil onIgnorer={() => setVideoIgnoree(true)} />
      )}

      <div className="px-4 pt-2">
        <Link
          href="/mode"
          className="block w-full rounded-full bg-accent py-3 text-center text-sm font-semibold text-background"
        >
          Commencer ma commande
        </Link>
      </div>
    </div>
  );
}