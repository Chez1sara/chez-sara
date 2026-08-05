import { createClient } from "@supabase/supabase-js";

// Client "anonyme" : utilise la clé publique (anon key), soumise aux
// politiques RLS définies dans Supabase. Ne jamais utiliser la clé
// service_role ici, elle contournerait toute la sécurité.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
