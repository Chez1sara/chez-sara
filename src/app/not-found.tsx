import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-4xl">🔍</p>
      <h1 className="text-xl font-semibold">Page introuvable</h1>
      <p className="text-sm text-foreground/60">
        Cette page n&apos;existe pas ou plus.
      </p>
      <Link
        href="/"
        className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-background"
      >
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}