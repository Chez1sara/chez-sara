"use client";

import Link from "next/link";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-4xl">😕</p>
      <h1 className="text-xl font-semibold">Une erreur est survenue</h1>
      <p className="text-sm text-foreground/60">
        Quelque chose s&apos;est mal passé. Réessaie, ou reviens à l&apos;accueil.
      </p>
      <div className="flex gap-2">
        <button
          onClick={reset}
          className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-background"
        >
          Réessayer
        </button>
        <Link
          href="/"
          className="rounded-full border border-foreground/15 px-4 py-2 text-sm font-medium"
        >
          Accueil
        </Link>
      </div>
    </div>
  );
}