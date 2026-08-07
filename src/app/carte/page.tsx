import type { Metadata } from "next";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { formatPrix } from "@/lib/types";
import Image from "next/image";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Carte — Chez Sara | Restaurant marocain à Niort",
  description:
    "Découvrez la carte de Chez Sara à Niort : couscous, tajines, tacos maison, pizzas artisanales et pâtisseries orientales.",
  openGraph: {
    title: "Carte — Chez Sara",
    description:
      "Couscous, tajines, tacos maison, pizzas artisanales et pâtisseries orientales, à Niort.",
    type: "website",
    locale: "fr_FR",
  },
};

export default async function CartePage() {
  const [{ data: categories }, { data: plats }] = await Promise.all([
    supabase
      .from("categories")
      .select("*")
      .eq("actif", true)
      .order("ordre", { ascending: true }),
    supabase
      .from("plats")
      .select("*")
      .eq("actif", true)
      .order("ordre", { ascending: true }),
  ]);

  const cats = categories ?? [];
  const tousLesPlats = plats ?? [];

  const donneesStructurees = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: "Chez Sara",
    servesCuisine: "Marocaine",
    telephone: "+33683613846",
    address: {
      "@type": "PostalAddress",
      streetAddress: "C.C Carrefour, 32 rue de Pierre",
      addressLocality: "Niort",
      postalCode: "79000",
      addressCountry: "FR",
    },
    hasMenu: {
      "@type": "Menu",
      hasMenuSection: cats.map((cat) => ({
        "@type": "MenuSection",
        name: cat.nom,
        hasMenuItem: tousLesPlats
          .filter((p) => p.categorie_id === cat.id)
          .map((p) => ({
            "@type": "MenuItem",
            name: p.nom,
            description: p.description ?? undefined,
            offers: {
              "@type": "Offer",
              price: (p.prix_centimes / 100).toFixed(2),
              priceCurrency: "EUR",
            },
          })),
      })),
    },
  };

  return (
    <div className="flex flex-1 flex-col gap-8 px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(donneesStructurees) }}
      />

      <div className="relative -mx-4 -mt-8 overflow-hidden px-4 pb-8 pt-8 text-center">
        <Image
          src="/motif-geometrique.png"
          alt=""
          width={500}
          height={455}
          className="pointer-events-none absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 opacity-[0.08]"
        />
        <Image
          src="/coin-arabesque.png"
          alt=""
          width={100}
          height={92}
          className="pointer-events-none absolute -left-2 -top-2 -z-10 opacity-80"
        />
        <Image
          src="/coin-arabesque.png"
          alt=""
          width={100}
          height={92}
          className="pointer-events-none absolute -right-2 -top-2 -z-10 -scale-x-100 opacity-80"
        />

        <Image
          src="/logo-carte.png"
          alt="Chez Sara"
          width={160}
          height={160}
          className="relative mx-auto mb-3 rounded-full border-2 border-accent/40"
          priority
        />
        <p className="font-mono text-xs tracking-widest uppercase text-accent">
          Niort · France
        </p>
        <h1 className="font-display text-3xl font-semibold">Chez Sara</h1>
        <p className="mt-1 text-sm text-foreground/60">
          Cuisine marocaine — couscous, tajines, tacos maison &amp; pizzas
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <Link
          href="/api/menu/export-pdf"
          className="rounded-full bg-jaune px-4 py-2 text-sm font-medium text-ink"
        >
          Exporter en PDF
        </Link>
        <Link
          href="/api/menu/export-csv"
          className="rounded-full bg-jaune px-4 py-2 text-sm font-medium text-ink"
        >
          Exporter en CSV
        </Link>
      </div>

      {cats.map((cat) => {
        const platsCat = tousLesPlats.filter((p) => p.categorie_id === cat.id);
        if (platsCat.length === 0) return null;

        return (
          <section key={cat.id}>
            <h2 className="mb-3 text-lg font-semibold">{cat.nom}</h2>
            <div className="flex flex-col gap-3">
              {platsCat.map((plat) => (
                <div
                  key={plat.id}
                  className="flex gap-3 rounded-xl border border-accent/20 bg-panel p-3"
                >
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-foreground/5">
                    {plat.image_url ? (
                      <Image
                        src={plat.image_url}
                        alt={plat.nom}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xl">
                        🍽️
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-medium">{plat.nom}</h3>
                      <span className="whitespace-nowrap font-mono text-sm text-accent">
                        {formatPrix(plat.prix_centimes)}
                      </span>
                    </div>
                    {plat.description && (
                      <p className="text-sm text-foreground/60">
                        {plat.description}
                      </p>
                    )}
                    {(plat.allergenes ?? []).length > 0 && (
                      <p className="text-xs text-foreground/40">
                        Allergènes : {plat.allergenes.join(", ")}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}

      <footer className="motif-zellige -mx-4 -mb-8 mt-4 flex flex-col items-center gap-2 border-t border-accent/20 px-4 pb-10 pt-8 text-center text-sm text-foreground/70">
        <Image
          src="/icone-192.png"
          alt=""
          width={56}
          height={56}
          className="mb-1 rounded-full"
        />
        <p className="font-display text-lg text-foreground">Chez Sara</p>
        <p>C.C Carrefour, 32 rue de Pierre, 79000 Niort</p>
        <Link
          href="tel:+33683613846"
          className="mt-1 rounded-full bg-jaune px-5 py-2 text-sm font-semibold text-ink"
        >
          📞 06 83 61 38 46
        </Link>
      </footer>
    </div>
  );
}