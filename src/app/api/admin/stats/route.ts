import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const supabase = createServiceClient();

  const [u, pr, runner, transf, pl, pay, pending] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("is_premium", true),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("track", "runner"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("track", "transformacion"),
    supabase.from("training_plans").select("id", { count: "exact", head: true }),
    supabase.from("payments").select("amount_usd").eq("status", "paid"),
    supabase.from("payments").select("id", { count: "exact", head: true }).eq("status", "pending_verification"),
  ]);

  const revenue = (pay.data ?? []).reduce((acc: number, p: { amount_usd: number }) => acc + (p.amount_usd ?? 0), 0);

  return NextResponse.json({
    users: u.count ?? 0,
    premium: pr.count ?? 0,
    runner: runner.count ?? 0,
    transformacion: transf.count ?? 0,
    plans: pl.count ?? 0,
    payments: (pay.data ?? []).length,
    revenue,
    pending: pending.count ?? 0,
  });
}
