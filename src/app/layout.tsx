import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import TableBanner from "@/components/table-banner";
import CartBar from "@/components/cart-bar";
import StatutConnexion from "@/components/statut-connexion";
import EnregistrerServiceWorker from "@/components/enregistrer-sw";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Chez Sara — Niort",
  description: "Commandez à table par QR code, chez Sara à Niort.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <EnregistrerServiceWorker />
        <StatutConnexion />
        <TableBanner />
        <main className="flex flex-1 flex-col">{children}</main>
        <CartBar />
      </body>
    </html>
  );
}