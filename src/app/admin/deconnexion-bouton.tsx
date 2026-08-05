"use client";

import { useRouter } from "next/navigation";
import { creerClientNavigateur } from "@/lib/supabase-browser";

export default function DeconnexionBouton() {
  const router = useRouter();

  async function seDeconnecter() {
    const supabase = creerClientNavigateur();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      onClick={seDeconnecter}
      className="text-sm font-medium text-foreground/50 underline underline-offset-2"
    >
      Se déconnecter
    </button>
  );
}