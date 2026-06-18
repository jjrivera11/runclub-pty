import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { code } = await request.json();
  if (!code) return NextResponse.json({ error: "Codigo requerido." }, { status: 400 });

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

  const { data: promo } = await supabase
    .from("promo_codes")
    .select("*")
    .eq("code", code.toUpperCase().trim())
    .eq("is_active", true)
    .single();

  if (!promo) return NextResponse.json({ error: "Codigo invalido o inactivo." }, { status: 404 });

  if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
    return NextResponse.json({ error: "Este codigo ha expirado." }, { status: 400 });
  }

  if (promo.max_uses !== null && promo.times_used >= promo.max_uses) {
    return NextResponse.json({ error: "Este codigo ha alcanzado su limite de usos." }, { status: 400 });
  }

  const { data: alreadyUsed } = await supabase
    .from("promo_uses")
    .select("id")
    .eq("user_id", user.id)
    .eq("promo_code_id", promo.id)
    .single();

  if (alreadyUsed) return NextResponse.json({ error: "Ya usaste este codigo." }, { status: 400 });

  return NextResponse.json({
    valid: true,
    type: promo.type,
    value: promo.value,
    promo_id: promo.id,
    message: promo.type === "free_premium"
      ? `${promo.value} mes(es) de plan premium gratis`
      : `${promo.value}% de descuento en tu suscripcion`,
  });
}
