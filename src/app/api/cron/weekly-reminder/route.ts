import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendWeeklyReminderEmail } from "@/lib/email";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const supabase = await createClient();

  const { data: plans } = await supabase
    .from("training_plans")
    .select("id, user_id, total_weeks, plan_json, generated_at, profiles(full_name), subscriptions(status)")
    .eq("is_active", true);

  if (!plans) return NextResponse.json({ sent: 0 });

  let sent = 0;

  for (const plan of plans) {
    try {
      const { data: { user } } = await supabase.auth.admin.getUserById(plan.user_id);
      if (!user?.email) continue;

      const start = new Date(plan.generated_at);
      const today = new Date();
      const diffDays = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      const weekNumber = Math.min(Math.floor(diffDays / 7) + 1, plan.total_weeks);

      const semanas = plan.plan_json?.semanas ?? [];
      const currentWeekData = semanas.find((s: { numero: number }) => s.numero === weekNumber);
      const sessions = currentWeekData?.dias?.length ?? 0;

      if (sessions === 0) continue;

      const profile = plan.profiles as { full_name?: string } | null;

      await sendWeeklyReminderEmail(
        user.email,
        profile?.full_name ?? "Atleta",
        weekNumber,
        sessions
      );
      sent++;
    } catch {
      continue;
    }
  }

  return NextResponse.json({ sent });
}
