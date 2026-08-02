export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-4">
      <p className="font-mono text-xs tracking-widest uppercase text-accent">
        Niort · France
      </p>
      <h1 className="text-5xl sm:text-6xl font-semibold tracking-tight">
        Chez Sara
      </h1>
      <p className="max-w-sm text-sm text-foreground/70">
        Bientôt : la commande à table par QR code. Cette page confirme que le
        déploiement fonctionne — étape&nbsp;1 sur 14.
      </p>
    </main>
  );
}