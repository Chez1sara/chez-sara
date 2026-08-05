"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePanier, calculerTotal } from "@/lib/cart-session";
import { formatPrix } from "@/lib/types";

export default function CartBar() {
  const pathname = usePathname();
  const panier = usePanier();
  const nombreArticles = panier.lignes.reduce((n, l) => n + l.quantite, 0);

  if (nombreArticles === 0 || pathname === "/panier") return null;

  const total = calculerTotal(panier.lignes);

  return (
    <Link
      href="/panier"
      className="sticky bottom-0 z-20 flex items-center justify-between bg-accent px-4 py-3 text-background"
    >
      <span className="text-sm font-medium">
        {nombreArticles} article{nombreArticles > 1 ? "s" : ""}
      </span>
      <span className="text-sm font-semibold">
        Voir le panier · {formatPrix(total)}
      </span>
    </Link>
  );
}