"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { Categorie, OptionTaco, Plat } from "@/lib/types";
import DishCard from "./dish-card";

export default function MenuView({
  categories,
  plats,
  viandes,
  sauces,
}: {
  categories: Categorie[];
  plats: Plat[];
  viandes: OptionTaco[];
  sauces: OptionTaco[];
}) {
  const [categorieActive, setCategorieActive] = useState(categories[0]?.id ?? "");
  const sectionsRef = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setCategorieActive(entry.target.id);
          }
        }
      },
      { rootMargin: "-120px 0px -70% 0px" }
    );

    for (const cat of categories) {
      const el = sectionsRef.current[cat.id];
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [categories]);

  function scrollVersCategorie(id: string) {
    sectionsRef.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (categories.length === 0) {
    return (
      <div className="p-6 text-center text-sm text-foreground/60">
        Le menu n&apos;est pas encore disponible.
      </div>
    );
  }

  return (
    <div className="relative pb-8">
      <Image
        src="/motif-geometrique.png"
        alt=""
        width={700}
        height={436}
        className="pointer-events-none absolute left-1/2 top-32 -z-10 -translate-x-1/2 opacity-[0.06]"
      />
      
      <nav className="sticky top-0 z-10 flex gap-2 overflow-x-auto bg-background/95 px-4 py-3 backdrop-blur">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => scrollVersCategorie(cat.id)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              categorieActive === cat.id
                ? "bg-accent text-background"
                : "bg-foreground/10 text-foreground/70"
            }`}
          >
            {cat.nom}
          </button>
        ))}
      </nav>

      <div className="flex flex-col gap-8 px-4 pt-4">
        {categories.map((cat) => {
          const platsDeCetteCategorie = plats.filter(
            (p) => p.categorie_id === cat.id
          );
          if (platsDeCetteCategorie.length === 0) return null;

          return (
            <section
              key={cat.id}
              id={cat.id}
              ref={(el) => {
                sectionsRef.current[cat.id] = el;
              }}
              className="scroll-mt-16"
            >
              <h2 className="mb-3 inline-block rounded-xl border border-accent/30 bg-panel px-4 py-1.5 text-lg font-semibold shadow-sm">
                {cat.nom}
              </h2>
              <div className="flex flex-col gap-3">
                {platsDeCetteCategorie.map((plat) => (
                  <DishCard
                    key={plat.id}
                    plat={plat}
                    viandes={viandes}
                    sauces={sauces}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}