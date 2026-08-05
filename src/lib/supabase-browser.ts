"use client";

import { createBrowserClient } from "@supabase/ssr";

// Client Supabase pour les composants qui tournent dans le navigateur
// (formulaire de connexion, bouton de déconnexion). Gère lui-même les
// cookies de session, contrairement au client "anon" simple de
// src/lib/supabase.ts.
export function creerClientNavigateur() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}