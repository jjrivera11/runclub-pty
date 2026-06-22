import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { sendWeeklyReminderEmail } from "@/lib/email";

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET no configurado." }, { status: 500 });
  }

  const authHeader = request.headers.get("authorization");
  const provided = authHeader?.replace("Bearer ", "") ?? "";

  try {
    const providedBuffer = Buffer.from(provided);
    const expectedBuffer = Buffer.from(cronSecret);
    if (
      providedBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(providedBuffer, expectedBuffer)
    ) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }
  } catch {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const supabase = createServiceClient();

  const { data: plans } = await supabase
    .from("training_plans")
    .select("id, user_id, total_weeks, generated_at, profiles(full_name)")
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

      const { data: planData } = await supabase
        .from("training_plans")
        .select("plan_json->semanas")
        .eq("id", plan.id)
        .single();
      const semanas = (planData?.semanas as { numero: number; dias: unknown[] }[]) ?? [];
      const currentWeekData = semanas.find((s) => s.numero === weekNumber);
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
