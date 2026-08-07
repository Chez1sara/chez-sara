"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { creerClientNavigateur } from "@/lib/supabase-browser";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  async function seConnecter(e: FormEvent) {
    e.preventDefault();
    setEnCours(true);
    setErreur(null);

    const supabase = creerClientNavigateur();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: motDePasse,
    });

    if (error) {
      setErreur("Email ou mot de passe incorrect.");
      setEnCours(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4">
      <form
        onSubmit={seConnecter}
        className="flex w-full max-w-sm flex-col gap-4"
      >
        <h1 className="font-display text-center text-xl text-foreground">Espace caissier</h1>

        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-accent/25 bg-transparent px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Mot de passe
          </label>
          <input
            type="password"
            required
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            className="w-full rounded-lg border border-accent/25 bg-transparent px-3 py-2 text-sm"
          />
        </div>

        {erreur && <p className="text-sm text-red-600">{erreur}</p>}

        <button
          type="submit"
          disabled={enCours}
          className="rounded-full bg-jaune py-3 text-sm font-semibold text-ink disabled:opacity-60"
        >
          {enCours ? "Connexion…" : "Se connecter"}
        </button>
      </form>
    </div>
  );
}
