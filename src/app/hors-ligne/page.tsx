export default function HorsLignePage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-4xl">📡</p>
      <h1 className="text-xl font-semibold">Pas de connexion</h1>
      <p className="text-sm text-foreground/60">
        Impossible de charger cette page. Vérifie ta connexion internet et
        réessaie.
      </p>
    </div>
  );
}