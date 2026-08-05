import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdfkit charge ses fichiers de police directement depuis son propre
  // dossier au moment de l'exécution : il doit rester "externe" au lieu
  // d'être empaqueté, sinon ces fichiers deviennent introuvables.
  serverExternalPackages: ["pdfkit"],
  // Autorise l'accès au serveur de développement depuis le téléphone
  // (adresse réseau locale), sans quoi Next.js bloque silencieusement
  // les fichiers JavaScript et rien ne devient cliquable.
  allowedDevOrigins: ["192.168.0.10"],
  images: {
    // Autorise next/image à charger les photos de plats stockées sur
    // Supabase Storage (utilisé à partir de l'Étape 9).
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;