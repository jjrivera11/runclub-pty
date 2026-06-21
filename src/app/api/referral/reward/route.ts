import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  const provided = authHeader?.replace("Bearer ", "") ?? "";
  if (!cronSecret || provided !== cronSecret) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { paid_user_id } = await request.json();
  if (!paid_user_id) return NextResponse.json({ error: "paid_user_id requerido." }, { status: 400 });

  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!UUID_REGEX.test(paid_user_id)) {
    return NextResponse.json({ error: "paid_user_id inválido." }, { status: 400 });
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const { data: paidProfile } = await supabase
    .from("profiles")
    .select("referred_by")
    .eq("id", paid_user_id)
    .single();

  if (!paidProfile?.referred_by) return NextResponse.json({ skipped: true });

  await supabase
    .from("profiles")
    .update({ referral_discount_pct: 20, referral_discount_used: false })
    .eq("id", paidProfile.referred_by);

  return NextResponse.json({ success: true });
}
