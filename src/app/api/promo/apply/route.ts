import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { promo_id } = await request.json();
  if (!promo_id) return NextResponse.json({ error: "promo_id requerido." }, { status: 400 });

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
    .eq("id", promo_id)
    .eq("is_active", true)
    .single();

  if (!promo) return NextResponse.json({ error: "Codigo no encontrado." }, { status: 404 });

  const { error: insertError } = await supabase
    .from("promo_uses")
    .insert({ user_id: user.id, promo_code_id: promo.id });

  if (insertError) {
    if (insertError.code === "23505") {
      return NextResponse.json({ error: "Ya usaste este codigo." }, { status: 400 });
    }
    return NextResponse.json({ error: "Error al aplicar el codigo." }, { status: 500 });
  }
  await supabase.from("promo_codes").update({ times_used: promo.times_used + 1 }).eq("id", promo.id);

  if (promo.type === "free_premium") {
    const start = new Date();
    const end = new Date();
    end.setMonth(end.getMonth() + promo.value);
    await supabase.from("profiles").update({
      is_premium: true,
      subscription_status: "active",
    }).eq("id", user.id);
    await supabase.from("subscriptions").insert({
      user_id: user.id,
      status: "active",
      provider: "promo",
      amount_usd: 0,
      current_period_start: start.toISOString(),
      current_period_end: end.toISOString(),
    });
  } else {
    await supabase.from("profiles").update({
      promo_discount: promo.value,
    }).eq("id", user.id);
  }

  return NextResponse.json({ success: true, type: promo.type, value: promo.value });
}
