"use client";

import { useEffect, useRef, useState } from "react";
import type { Categorie, Plat } from "@/lib/types";
import DishCard from "./dish-card";

export default function MenuView({
  categories,
  plats,
}: {
  categories: Categorie[];
  plats: Plat[];
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
    <div className="pb-8">
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
              <h2 className="mb-3 text-lg font-semibold">{cat.nom}</h2>
              <div className="flex flex-col gap-3">
                {platsDeCetteCategorie.map((plat) => (
                  <DishCard key={plat.id} plat={plat} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}