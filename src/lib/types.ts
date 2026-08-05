export type Categorie = {
  id: string;
  nom: string;
  ordre: number;
  actif: boolean;
};

export type Plat = {
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
};

export function formatPrix(centimes: number): string {
  return (centimes / 100).toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + " €";
}