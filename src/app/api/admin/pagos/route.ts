import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = createServiceClient();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  let query = supabase
    .from("payments")
    .select("id, user_id, amount_usd, status, provider, plan, created_at, profiles(full_name, is_premium)")
    .order("created_at", { ascending: false })
    .limit(100);

  if (status && status !== "all") query = query.eq("status", status);

  const { data } = await query;
  return NextResponse.json(data ?? []);
}

export async function PATCH(request: Request) {
  const supabase = createServiceClient();
  const { id, status, user_id, amount_usd, plan } = await request.json();

  await supabase.from("payments").update({ status }).eq("id", id);

  if (status === "paid") {
    await supabase.from("profiles").update({
      is_premium: true,
      subscription_status: "active",
    }).eq("id", user_id);

    await supabase.from("subscriptions").upsert({
      user_id,
      status: "active",
      provider: "bank_transfer",
      amount_usd,
      plan,
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    }, { onConflict: "user_id" });

    const { data: paidProfile } = await supabase
      .from("profiles")
      .select("referred_by")
      .eq("id", user_id)
      .single();

    if (paidProfile?.referred_by) {
      await supabase.from("profiles").update({
        referral_discount_pct: 20,
        referral_discount_used: false,
      }).eq("id", paidProfile.referred_by);
    }
  }

  return NextResponse.json({ success: true });
}
