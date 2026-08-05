import PDFDocument from "pdfkit";
import sharp from "sharp";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";

async function imagePourPdf(url: string): Promise<Buffer | null> {
  try {
    const reponse = await fetch(url);
    if (!reponse.ok) return null;
    const arrayBuffer = await reponse.arrayBuffer();
    // pdfkit ne sait pas lire le WebP (format utilisé depuis l'Étape 9) :
    // on convertit systématiquement en PNG avant de l'insérer.
    return await sharp(Buffer.from(arrayBuffer)).png().toBuffer();
  } catch {
    return null;
  }
}

export async function GET() {
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

  const images = new Map<string, Buffer>();
  await Promise.all(
    tousLesPlats
      .filter((p) => p.image_url)
      .map(async (p) => {
        const buffer = await imagePourPdf(p.image_url as string);
        if (buffer) images.set(p.id, buffer);
      })
  );

  const doc = new PDFDocument({ margin: 50, size: "A4" });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk) => chunks.push(chunk));
  const pdfPret = new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  const OR = "#c99a4a";
  const BORDEAUX = "#7a2e2e";
  const largeurPage = doc.page.width;
  const margeGauche = 50;
  const margeDroite = 50;
  const largeurContenu = largeurPage - margeGauche - margeDroite;
  const tailleImage = 45;

  doc.rect(0, 0, largeurPage, 90).fill("#221019");
  doc
    .fillColor(OR)
    .font("Helvetica")
    .fontSize(10)
    .text("NIORT · FRANCE", margeGauche, 32);
  doc
    .fillColor("#f4ecdf")
    .font("Helvetica-Bold")
    .fontSize(26)
    .text("Chez Sara", margeGauche, 46);
  doc.y = 115;

  for (const cat of cats) {
    const platsCat = tousLesPlats.filter((p) => p.categorie_id === cat.id);
    if (platsCat.length === 0) continue;

    if (doc.y > doc.page.height - 130) {
      doc.addPage();
      doc.y = 50;
    }

    doc
      .fillColor(BORDEAUX)
      .font("Helvetica-Bold")
      .fontSize(15)
      .text(cat.nom, margeGauche, doc.y);
    doc
      .moveTo(margeGauche, doc.y + 4)
      .lineTo(largeurPage - margeDroite, doc.y + 4)
      .strokeColor(OR)
      .lineWidth(1)
      .stroke();
    doc.y += 16;

    for (const plat of platsCat) {
      const image = images.get(plat.id);
      const xTexte = image ? margeGauche + tailleImage + 12 : margeGauche;
      const largeurTexte = largeurContenu - (image ? tailleImage + 12 : 0) - 60;

      let hauteurTexte = doc
        .font("Helvetica-Bold")
        .fontSize(11)
        .heightOfString(plat.nom, { width: largeurTexte });
      if (plat.description) {
        hauteurTexte +=
          4 +
          doc
            .font("Helvetica")
            .fontSize(9)
            .heightOfString(plat.description, { width: largeurTexte });
      }
      if ((plat.allergenes ?? []).length > 0) {
        hauteurTexte +=
          3 +
          doc
            .font("Helvetica")
            .fontSize(8)
            .heightOfString(`Allergènes : ${plat.allergenes.join(", ")}`, {
              width: largeurTexte,
            });
      }
      const hauteurLigne = Math.max(hauteurTexte, tailleImage);

      if (doc.y + hauteurLigne > doc.page.height - 50) {
        doc.addPage();
        doc.y = 50;
      }

      const yDepart = doc.y;

      if (image) {
        try {
          doc.image(image, margeGauche, yDepart, {
            width: tailleImage,
            height: tailleImage,
            fit: [tailleImage, tailleImage],
          });
        } catch {
          // Image illisible : on continue sans elle plutôt que de faire
          // échouer tout le PDF.
        }
      }

      doc
        .fillColor("#111")
        .font("Helvetica-Bold")
        .fontSize(11)
        .text(plat.nom, xTexte, yDepart, { width: largeurTexte });

      doc
        .fillColor(OR)
        .font("Helvetica-Bold")
        .fontSize(11)
        .text(
          `${(plat.prix_centimes / 100).toFixed(2)} €`,
          largeurPage - margeDroite - 55,
          yDepart,
          { width: 55, align: "right" }
        );

      let yLigne =
        yDepart +
        doc
          .font("Helvetica-Bold")
          .fontSize(11)
          .heightOfString(plat.nom, { width: largeurTexte });

      if (plat.description) {
        doc
          .fillColor("#555")
          .font("Helvetica")
          .fontSize(9)
          .text(plat.description, xTexte, yLigne + 4, { width: largeurTexte });
        yLigne = doc.y;
      }
      if ((plat.allergenes ?? []).length > 0) {
        doc
          .fillColor("#999")
          .font("Helvetica")
          .fontSize(8)
          .text(`Allergènes : ${plat.allergenes.join(", ")}`, xTexte, yLigne + 3, {
            width: largeurTexte,
          });
        yLigne = doc.y;
      }

      doc.y = Math.max(yLigne, yDepart + tailleImage) + 10;
    }

    doc.y += 6;
  }

  doc.end();
  const pdfBuffer = await pdfPret;

  return new Response(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="menu-chez-sara.pdf"',
    },
  });
}