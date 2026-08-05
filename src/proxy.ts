import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let reponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          reponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            reponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT : getUser() (et non getSession()) vérifie le jeton
  // directement auprès du serveur Supabase Auth. Cette couche reste
  // une première barrière rapide, pas la seule protection : chaque
  // page /admin revérifie aussi la connexion elle-même.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const estPageLogin = request.nextUrl.pathname === "/admin/login";
  const estEspaceAdmin = request.nextUrl.pathname.startsWith("/admin");

  if (estEspaceAdmin && !estPageLogin && !user) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  if (estPageLogin && user) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return reponse;
}

export const config = {
  matcher: ["/admin/:path*"],
};