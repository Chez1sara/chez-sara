"use client";

import { useState } from "react";
import Image from "next/image";
import { creerClientNavigateur } from "@/lib/supabase-browser";
import { compresserImage } from "@/lib/image-compression";
import { formatPrix } from "@/lib/types";

type Categorie = {
  id: string;
  nom: string;
  ordre: number;
  actif: boolean;
};

type Plat = {
  id: string;
  categorie_id: string;
  nom: string;
  description: string | null;
  prix_centimes: number;
  image_url: string | null;
  disponible: boolean;
  allergenes: string[];
  ordre: number;
  actif: boolean;
  nb_viandes_a_choisir: number;
  nb_sauces_max: number;
};

type Formulaire = {
  id: string | null;
  categorieId: string;
  nom: string;
  description: string;
  prixTexte: string;
  allergenesTexte: string;
  nbViandesTexte: string;
  nbSaucesTexte: string;
};

const FORMULAIRE_VIDE: Formulaire = {
  id: null,
  categorieId: "",
  nom: "",
  description: "",
  prixTexte: "",
  allergenesTexte: "",
  nbViandesTexte: "0",
  nbSaucesTexte: "0",
};

function nomFichierPhoto(): string {
  return `plat-${Date.now()}.webp`;
}

export default function GestionMenu({
  categoriesInitiales,
  platsInitiaux,
}: {
  categoriesInitiales: Categorie[];
  platsInitiaux: Plat[];
}) {
  const [categories, setCategories] = useState(categoriesInitiales);
  const [plats, setPlats] = useState(platsInitiaux);
  const [formulaire, setFormulaire] = useState<Formulaire | null>(null);
  const [fichierPhoto, setFichierPhoto] = useState<File | null>(null);
  const [enregistrementEnCours, setEnregistrementEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const supabase = creerClientNavigateur();

  // ---- Disponibilité (mise à jour optimiste) --------------------------

  async function basculerDisponibilite(plat: Plat) {
    setPlats((prec) =>
      prec.map((p) =>
        p.id === plat.id ? { ...p, disponible: !p.disponible } : p
      )
    );

    const { error } = await supabase
      .from("plats")
      .update({ disponible: !plat.disponible })
      .eq("id", plat.id);

    if (error) {
      // Échec : on annule le changement local.
      setPlats((prec) =>
        prec.map((p) =>
          p.id === plat.id ? { ...p, disponible: plat.disponible } : p
        )
      );
    }
  }

  // ---- Réordonnancement des plats --------------------------------------

  async function deplacerPlat(plat: Plat, direction: -1 | 1) {
    const memeCategorie = plats
      .filter((p) => p.categorie_id === plat.categorie_id)
      .sort((a, b) => a.ordre - b.ordre);
    const index = memeCategorie.findIndex((p) => p.id === plat.id);
    const voisin = memeCategorie[index + direction];
    if (!voisin) return;

    setPlats((prec) =>
      prec.map((p) => {
        if (p.id === plat.id) return { ...p, ordre: voisin.ordre };
        if (p.id === voisin.id) return { ...p, ordre: plat.ordre };
        return p;
      })
    );

    await supabase.from("plats").update({ ordre: voisin.ordre }).eq("id", plat.id);
    await supabase.from("plats").update({ ordre: plat.ordre }).eq("id", voisin.id);
  }

  // ---- Catégories -------------------------------------------------------

  async function ajouterCategorie() {
    const ordreMax = Math.max(0, ...categories.map((c) => c.ordre));
    const { data, error } = await supabase
      .from("categories")
      .insert({ nom: "Nouvelle catégorie", ordre: ordreMax + 1 })
      .select()
      .single();
    if (!error && data) {
      setCategories((prec) => [...prec, data as Categorie]);
    }
  }

  async function renommerCategorie(categorie: Categorie, nom: string) {
    setCategories((prec) =>
      prec.map((c) => (c.id === categorie.id ? { ...c, nom } : c))
    );
    await supabase.from("categories").update({ nom }).eq("id", categorie.id);
  }

  async function basculerCategorieActive(categorie: Categorie) {
    setCategories((prec) =>
      prec.map((c) =>
        c.id === categorie.id ? { ...c, actif: !c.actif } : c
      )
    );
    await supabase
      .from("categories")
      .update({ actif: !categorie.actif })
      .eq("id", categorie.id);
  }

  // ---- Formulaire de création / modification d'un plat ------------------

  function ouvrirCreation() {
    setErreur(null);
    setFichierPhoto(null);
    setFormulaire({ ...FORMULAIRE_VIDE, categorieId: categories[0]?.id ?? "" });
  }

  function ouvrirModification(plat: Plat) {
    setErreur(null);
    setFichierPhoto(null);
    setFormulaire({
      id: plat.id,
      categorieId: plat.categorie_id,
      nom: plat.nom,
      description: plat.description ?? "",
      prixTexte: (plat.prix_centimes / 100).toFixed(2),
      allergenesTexte: plat.allergenes.join(", "),
      nbViandesTexte: String(plat.nb_viandes_a_choisir ?? 0),
      nbSaucesTexte: String(plat.nb_sauces_max ?? 0),
    });
  }

  async function enregistrerFormulaire() {
    if (!formulaire) return;
    const prixCentimes = Math.round(parseFloat(formulaire.prixTexte) * 100);

    if (!formulaire.nom.trim() || !formulaire.categorieId || isNaN(prixCentimes)) {
      setErreur("Nom, catégorie et prix sont obligatoires.");
      return;
    }

    setEnregistrementEnCours(true);
    setErreur(null);

    let imageUrl: string | null = null;

    try {
      if (fichierPhoto) {
        const blobCompresse = await compresserImage(fichierPhoto);
        const chemin = nomFichierPhoto();
        const { error: erreurUpload } = await supabase.storage
          .from("photos-plats")
          .upload(chemin, blobCompresse, {
            contentType: "image/webp",
          });
        if (erreurUpload) throw erreurUpload;

        const { data: urlPublique } = supabase.storage
          .from("photos-plats")
          .getPublicUrl(chemin);
        imageUrl = urlPublique.publicUrl;
      }

      const allergenes = formulaire.allergenesTexte
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean);

      const donnees = {
        categorie_id: formulaire.categorieId,
        nom: formulaire.nom.trim(),
        description: formulaire.description.trim() || null,
        prix_centimes: prixCentimes,
        allergenes,
        nb_viandes_a_choisir: parseInt(formulaire.nbViandesTexte, 10) || 0,
        nb_sauces_max: parseInt(formulaire.nbSaucesTexte, 10) || 0,
        ...(imageUrl ? { image_url: imageUrl } : {}),
      };

      if (formulaire.id) {
        const { data, error } = await supabase
          .from("plats")
          .update(donnees)
          .eq("id", formulaire.id)
          .select()
          .single();
        if (error) throw error;
        setPlats((prec) =>
          prec.map((p) => (p.id === formulaire.id ? (data as Plat) : p))
        );
      } else {
        const ordreMax = Math.max(
          0,
          ...plats
            .filter((p) => p.categorie_id === formulaire.categorieId)
            .map((p) => p.ordre)
        );
        const { data, error } = await supabase
          .from("plats")
          .insert({ ...donnees, ordre: ordreMax + 1, disponible: true, actif: true })
          .select()
          .single();
        if (error) throw error;
        setPlats((prec) => [...prec, data as Plat]);
      }

      setFormulaire(null);
    } catch {
      setErreur("Impossible d'enregistrer le plat, réessaie.");
    } finally {
      setEnregistrementEnCours(false);
    }
  }

  async function supprimerPlat(plat: Plat) {
    if (!confirm(`Supprimer « ${plat.nom} » ? Cette action est irréversible.`))
      return;
    setPlats((prec) => prec.filter((p) => p.id !== plat.id));
    await supabase.from("plats").delete().eq("id", plat.id);
  }

  const categoriesTriees = [...categories].sort((a, b) => a.ordre - b.ordre);

  return (
    <div className="flex flex-col gap-6 p-4">
      {/* Catégories */}
      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase text-foreground/50">
          Catégories
        </h2>
        <div className="flex flex-col gap-2">
          {categoriesTriees.map((cat) => (
            <div key={cat.id} className="flex items-center gap-2">
              <input
                type="text"
                value={cat.nom}
                onChange={(e) => renommerCategorie(cat, e.target.value)}
                className="flex-1 rounded-lg border border-accent/25 bg-transparent px-2 py-1 text-sm"
              />
              <button
                onClick={() => basculerCategorieActive(cat)}
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  cat.actif
                    ? "bg-accent text-background"
                    : "bg-foreground/10 text-foreground/50"
                }`}
              >
                {cat.actif ? "Active" : "Masquée"}
              </button>
            </div>
          ))}
          <button
            onClick={ajouterCategorie}
            className="self-start rounded-full bg-jaune px-3 py-1.5 text-xs font-semibold text-ink"
          >
            + Nouvelle catégorie
          </button>
        </div>
      </section>

      {/* Formulaire création/édition */}
      {formulaire && (
        <section className="flex flex-col gap-3 rounded-xl border border-accent/25 p-4">
          <h2 className="text-sm font-semibold">
            {formulaire.id ? "Modifier le plat" : "Nouveau plat"}
          </h2>

          <select
            value={formulaire.categorieId}
            onChange={(e) =>
              setFormulaire({ ...formulaire, categorieId: e.target.value })
            }
            className="rounded-lg border border-accent/25 bg-transparent px-3 py-2 text-sm"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nom}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Nom du plat"
            value={formulaire.nom}
            onChange={(e) => setFormulaire({ ...formulaire, nom: e.target.value })}
            className="rounded-lg border border-accent/25 bg-transparent px-3 py-2 text-sm"
          />

          <textarea
            placeholder="Description"
            value={formulaire.description}
            onChange={(e) =>
              setFormulaire({ ...formulaire, description: e.target.value })
            }
            rows={2}
            className="rounded-lg border border-accent/25 bg-transparent px-3 py-2 text-sm"
          />

          <input
            type="number"
            step="0.01"
            placeholder="Prix en euros (ex. 9.90)"
            value={formulaire.prixTexte}
            onChange={(e) =>
              setFormulaire({ ...formulaire, prixTexte: e.target.value })
            }
            className="rounded-lg border border-accent/25 bg-transparent px-3 py-2 text-sm"
          />

          <input
            type="text"
            placeholder="Allergènes séparés par des virgules (ex. gluten, lait)"
            value={formulaire.allergenesTexte}
            onChange={(e) =>
              setFormulaire({ ...formulaire, allergenesTexte: e.target.value })
            }
            className="rounded-lg border border-accent/25 bg-transparent px-3 py-2 text-sm"
          />

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-foreground/60">
                Viandes à choisir (0 = pas de choix)
              </label>
              <input
                type="number"
                min="0"
                value={formulaire.nbViandesTexte}
                onChange={(e) =>
                  setFormulaire({ ...formulaire, nbViandesTexte: e.target.value })
                }
                className="w-full rounded-lg border border-accent/25 bg-transparent px-3 py-2 text-sm"
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-foreground/60">
                Sauces au maximum (0 = pas de choix)
              </label>
              <input
                type="number"
                min="0"
                value={formulaire.nbSaucesTexte}
                onChange={(e) =>
                  setFormulaire({ ...formulaire, nbSaucesTexte: e.target.value })
                }
                className="w-full rounded-lg border border-accent/25 bg-transparent px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-foreground/60">
              Photo (optionnelle, compressée automatiquement)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFichierPhoto(e.target.files?.[0] ?? null)}
              className="text-sm"
            />
          </div>

          {erreur && <p className="text-sm text-red-600">{erreur}</p>}

          <div className="flex gap-2">
            <button
              onClick={enregistrerFormulaire}
              disabled={enregistrementEnCours}
              className="flex-1 rounded-full bg-vert py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {enregistrementEnCours ? "Enregistrement…" : "Enregistrer"}
            </button>
            <button
              onClick={() => setFormulaire(null)}
              className="rounded-full border border-accent/25 px-4 py-2 text-sm"
            >
              Annuler
            </button>
          </div>
        </section>
      )}

      {/* Liste des plats par catégorie */}
      {categoriesTriees.map((cat) => {
        const platsDeCetteCategorie = plats
          .filter((p) => p.categorie_id === cat.id)
          .sort((a, b) => a.ordre - b.ordre);
        if (platsDeCetteCategorie.length === 0) return null;

        return (
          <section key={cat.id}>
            <h2 className="mb-2 text-sm font-semibold uppercase text-foreground/50">
              {cat.nom}
            </h2>
            <div className="flex flex-col gap-2">
              {platsDeCetteCategorie.map((plat) => (
                <div
                  key={plat.id}
                  className="flex items-center gap-3 rounded-xl border border-accent/20 p-3"
                >
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-foreground/5">
                    {plat.image_url ? (
                      <Image
                        src={plat.image_url}
                        alt={plat.nom}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-lg">
                        🍽️
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{plat.nom}</p>
                    <p className="font-mono text-xs text-foreground/50">
                      {formatPrix(plat.prix_centimes)}
                    </p>
                  </div>

                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => deplacerPlat(plat, -1)}
                      className="text-xs text-foreground/40"
                      aria-label="Monter"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => deplacerPlat(plat, 1)}
                      className="text-xs text-foreground/40"
                      aria-label="Descendre"
                    >
                      ▼
                    </button>
                  </div>

                  <button
                    onClick={() => basculerDisponibilite(plat)}
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                      plat.disponible
                        ? "bg-accent text-background"
                        : "bg-foreground/10 text-foreground/50"
                    }`}
                  >
                    {plat.disponible ? "Disponible" : "Épuisé"}
                  </button>

                  <button
                    onClick={() => ouvrirModification(plat)}
                    className="shrink-0 text-xs font-medium text-orange underline underline-offset-2"
                  >
                    Modifier
                  </button>

                  <button
                    onClick={() => supprimerPlat(plat)}
                    className="shrink-0 text-xs font-medium text-red-500 underline underline-offset-2"
                  >
                    Supprimer
                  </button>
                </div>
              ))}
            </div>
          </section>
        );
      })}

      {!formulaire && (
        <button
          onClick={ouvrirCreation}
          className="rounded-full bg-jaune py-3 text-sm font-semibold text-ink"
        >
          + Ajouter un plat
        </button>
      )}
    </div>
  );
}
