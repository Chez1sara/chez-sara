import type { Metadata, Viewport } from "next";
import { Geist_Mono, Poppins, Fraunces } from "next/font/google";
import Entete from "@/components/entete";
import CartBar from "@/components/cart-bar";
import StatutConnexion from "@/components/statut-connexion";
import EnregistrerServiceWorker from "@/components/enregistrer-sw";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["500", "600"],
});

export const metadata: Metadata = {
  title: "Chez Sara — Niort",
  description: "Commandez à table par QR code, chez Sara à Niort.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#0d2224",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${poppins.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <EnregistrerServiceWorker />
        <StatutConnexion />
        <Entete />
        <main className="flex flex-1 flex-col">{children}</main>
        <CartBar />
      </body>
    </html>
  );
}
