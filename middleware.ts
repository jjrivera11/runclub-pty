import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log("[middleware] pathname:", pathname);

  // Rutas públicas — pasar sin verificar
  const publicPaths = [
    "/login",
    "/register",
    "/landing",
    "/auth",
    "/api/webhooks",
    "/api/cron",
    "/generating",
  ];
  if (publicPaths.some((p) => pathname.startsWith(p))) {
    console.log("[middleware] redirección: ninguna (ruta pública)");
    return NextResponse.next();
  }

  // Crear cliente Supabase para middleware
  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log("[middleware] user?.id:", user?.id);

  // Sin sesión → login
  if (!user) {
    console.log("[middleware] redirección: /login (sin sesión)");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Leer perfil del usuario
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_premium, is_admin")
    .eq("id", user.id)
    .single();

  console.log("[middleware] profile:", profile);

  // Ruta /admin → verificar is_admin
  if (pathname.startsWith("/admin")) {
    if (!profile?.is_admin) {
      console.log("[middleware] redirección: /dashboard (sin is_admin)");
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  console.log("[middleware] redirección: ninguna (continuar)");
  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/preview/:path*",
    "/pricing/:path*",
    "/payment/:path*",
    "/onboarding/:path*",
    "/generating/:path*",
    "/admin/:path*",
  ],
};
