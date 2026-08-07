"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTableEnregistree } from "@/lib/table-session";
import { usePanier } from "@/lib/cart-session";

function IconePanier({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="20" r="1" />
      <circle cx="17" cy="20" r="1" />
      <path d="M3 4h2l2.4 12.2a1 1 0 001 .8h8.6a1 1 0 001-.8L20 8H6" />
    </svg>
  );
}

// Bandeau d'en-tête, dans les mêmes tons que le reste du site (pas un
// îlot de couleur qui tranche) : logo réel, nom de l'enseigne en
// typo bâton fidèle au logo, table détectée, accès rapide au panier.
export default function Entete() {
  const pathname = usePathname();
  const table = useTableEnregistree();
  const panier = usePanier();
  const nombreArticles = panier.lignes.reduce((n, l) => n + l.quantite, 0);

  if (pathname.startsWith("/admin")) return null;

  return (
    <header className="flex items-center justify-between border-b border-accent/20 bg-background px-4 py-3">
      <div className="flex w-14 items-center">
        <Image
          src="/icone-192.png"
          alt="Chez Sara"
          width={36}
          height={36}
          className="rounded-full border border-accent/30"
        />
      </div>

      <p className="font-sans text-lg font-semibold uppercase tracking-[0.15em] text-accent">
        Chez Sara
      </p>

      <div className="flex w-14 flex-col items-end gap-1">
        {table && (
          <span className="text-[10px] font-medium text-foreground/50">
            {table.id}
          </span>
        )}
        <Link href="/panier" className="relative text-foreground">
          <IconePanier className="h-6 w-6" />
          {nombreArticles > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-background">
              {nombreArticles}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
