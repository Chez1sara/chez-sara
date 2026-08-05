"use client";

import { QRCodeSVG } from "qrcode.react";

export default function GrilleQrCodes({
  tableIds,
  siteUrl,
}: {
  tableIds: string[];
  siteUrl: string;
}) {
  return (
    <div className="p-4">
      <button
        onClick={() => window.print()}
        className="mb-4 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-background"
      >
        Imprimer la planche (A4)
      </button>

      <div className="grille-imprimable grid grid-cols-2 gap-6">
        {tableIds.map((id) => (
          <div
            key={id}
            className="flex flex-col items-center gap-2 rounded-xl border border-foreground/10 p-4"
          >
            <QRCodeSVG
              value={`${siteUrl}/?table=${id}`}
              size={220}
              level="H"
              marginSize={2}
              className="h-auto w-full max-w-[220px]"
            />
            <p className="text-lg font-semibold">{id}</p>
          </div>
        ))}
      </div>
    </div>
  );
}