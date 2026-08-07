"use client";

import { useState } from "react";
import { creerClientNavigateur } from "@/lib/supabase-browser";

type Option = {
  id: string;
  nom: string;
  ordre: number;
  actif: boolean;
};

function ListeOptions({
  titre,
  table,
  optionsInitiales,
}: {
  titre: string;
  table: "options_taco_viandes" | "options_taco_sauces";
  optionsInitiales: Option[];
}) {
  const [options, setOptions] = useState(optionsInitiales);
  const [nouveauNom, setNouveauNom] = useState("");
  const supabase = creerClientNavigateur();

  async function ajouter() {
    if (!nouveauNom.trim()) return;
    const ordreMax = Math.max(0, ...options.map((o) => o.ordre));
    const { data, error } = await supabase
      .from(table)
      .insert({ nom: nouveauNom.trim(), ordre: ordreMax + 1 })
      .select()
      .single();
    if (!error && data) {
      setOptions((prec) => [...prec, data as Option]);
      setNouveauNom("");
    }
  }

  async function renommer(option: Option, nom: string) {
    setOptions((prec) =>
      prec.map((o) => (o.id === option.id ? { ...o, nom } : o))
    );
    await supabase.from(table).update({ nom }).eq("id", option.id);
  }

  async function basculerActif(option: Option) {
    setOptions((prec) =>
      prec.map((o) => (o.id === option.id ? { ...o, actif: !o.actif } : o))
    );
    await supabase
      .from(table)
      .update({ actif: !option.actif })
      .eq("id", option.id);
  }

  return (
    <section>
      <h2 className="mb-2 text-sm font-semibold uppercase text-foreground/50">
        {titre}
      </h2>
      <div className="flex flex-col gap-2">
        {options.map((option) => (
          <div key={option.id} className="flex items-center gap-2">
            <input
              type="text"
              value={option.nom}
              onChange={(e) => renommer(option, e.target.value)}
              className="flex-1 rounded-lg border border-accent/25 bg-transparent px-2 py-1 text-sm"
            />
            <button
              onClick={() => basculerActif(option)}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                option.actif
                  ? "bg-accent text-background"
                  : "bg-foreground/10 text-foreground/50"
              }`}
            >
              {option.actif ? "Active" : "Masquée"}
            </button>
          </div>
        ))}
        <div className="mt-1 flex gap-2">
          <input
            type="text"
            value={nouveauNom}
            onChange={(e) => setNouveauNom(e.target.value)}
            placeholder={`Ajouter ${titre.toLowerCase()}…`}
            className="flex-1 rounded-lg border border-accent/25 bg-transparent px-2 py-1 text-sm"
          />
          <button
            onClick={ajouter}
            className="rounded-full bg-jaune px-3 py-1 text-xs font-semibold text-ink"
          >
            + Ajouter
          </button>
        </div>
      </div>
    </section>
  );
}

export default function GestionOptions({
  viandes,
  sauces,
}: {
  viandes: Option[];
  sauces: Option[];
}) {
  return (
    <div className="flex flex-col gap-6 p-4">
      <p className="text-sm text-foreground/60">
        Ces deux listes servent au sélecteur qui apparaît sur les tacos à
        plusieurs viandes (et sur ceux avec un choix de sauce) côté client.
      </p>
      <ListeOptions
        titre="Viandes"
        table="options_taco_viandes"
        optionsInitiales={viandes}
      />
      <ListeOptions
        titre="Sauces"
        table="options_taco_sauces"
        optionsInitiales={sauces}
      />
    </div>
  );
}
