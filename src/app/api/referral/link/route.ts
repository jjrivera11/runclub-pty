import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("referral_code")
    .eq("id", user.id)
    .single();

  let code = profile?.referral_code;

  if (!code) {
    code = user.id.split("-")[0].toUpperCase();
    await supabase.from("profiles").update({ referral_code: code }).eq("id", user.id);
  }

  return NextResponse.json({ code, url: `${process.env.NEXT_PUBLIC_APP_URL}/register?ref=${code}` });
}
