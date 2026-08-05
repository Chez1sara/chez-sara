// Compresse et convertit une image en WebP directement dans le
// navigateur, avant l'envoi vers Supabase Storage. Évite d'envoyer des
// photos de plusieurs Mo prises telles quelles par un téléphone.
export async function compresserImage(
  fichier: File,
  largeurMax = 800,
  qualite = 0.8
): Promise<Blob> {
  const bitmap = await createImageBitmap(fichier);
  const ratio = Math.min(1, largeurMax / bitmap.width);
  const largeur = Math.round(bitmap.width * ratio);
  const hauteur = Math.round(bitmap.height * ratio);

  const canvas = document.createElement("canvas");
  canvas.width = largeur;
  canvas.height = hauteur;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Impossible de préparer l'image");
  ctx.drawImage(bitmap, 0, 0, largeur, hauteur);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Échec de la conversion de l'image"));
      },
      "image/webp",
      qualite
    );
  });
}