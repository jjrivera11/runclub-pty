import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { sendTrialReminderEmail } from "@/lib/email";

function verifyCronSecret(provided: string, expected: string): boolean {
  try {
    const providedBuffer = Buffer.from(provided);
    const expectedBuffer = Buffer.from(expected);

    if (providedBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return timingSafeEqual(providedBuffer, expectedBuffer);
  } catch {
    return false;
  }
}

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json(
      { error: "CRON_SECRET no configurado." },
      { status: 500 }
    );
  }

  const authHeader = request.headers.get("authorization");
  const providedSecret = authHeader?.replace("Bearer ", "") ?? request.headers.get("x-cron-secret");
  if (!providedSecret || !verifyCronSecret(providedSecret, cronSecret)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const supabase = createServiceClient();
  const now = new Date();
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  let processed = 0;

  const { data: expiredPastDue, error: pastDueError } = await supabase
    .from("subscriptions")
    .select("id, user_id")
    .eq("status", "past_due")
    .lt("current_period_end", threeDaysAgo.toISOString());

  if (pastDueError) {
    console.error("check-subscriptions past_due error:", pastDueError);
    return NextResponse.json(
      { error: "Error al consultar suscripciones." },
      { status: 500 }
    );
  }

  for (const subscription of expiredPastDue ?? []) {
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ is_premium: false, subscription_status: "cancelled" })
      .eq("id", subscription.user_id);

    if (!profileError) {
      await supabase
        .from("subscriptions")
        .update({ status: "cancelled" })
        .eq("id", subscription.id);

      processed++;
    }
  }

  // Revocar is_premium en suscripciones canceladas que ya vencieron
  const { data: expiredCancelled, error: cancelledError } = await supabase
    .from("subscriptions")
    .select("id, user_id")
    .eq("status", "cancelled")
    .lt("current_period_end", now.toISOString());

  if (cancelledError) {
    console.error("check-subscriptions cancelled error:", cancelledError);
  } else {
    for (const subscription of expiredCancelled ?? []) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_premium")
        .eq("id", subscription.user_id)
        .single();

      if (profile?.is_premium) {
        await supabase
          .from("profiles")
          .update({ is_premium: false, subscription_status: "cancelled" })
          .eq("id", subscription.user_id);
        processed++;
      }
    }
  }

  const { data: expiringSoon, error: expiringError } = await supabase
    .from("subscriptions")
    .select("id, user_id, current_period_end")
    .eq("status", "active")
    .lt("current_period_end", threeDaysFromNow.toISOString())
    .gte("current_period_end", now.toISOString());

  if (expiringError) {
    console.error("check-subscriptions expiring error:", expiringError);
    return NextResponse.json(
      { error: "Error al consultar renovaciones." },
      { status: 500 }
    );
  }

  for (const subscription of expiringSoon ?? []) {
    // TODO: enviar email de renovación con Resend
    void subscription;
    processed++;
  }

  // Emails de reminder de trial — día 5 (2 días restantes) y día 7 (último día)
  const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
  const oneDayFromNow = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);

  const { data: trialUsers } = await supabase
    .from("profiles")
    .select("id, full_name, trial_ends_at, trial_reminder_sent")
    .eq("is_premium", false)
    .gte("trial_ends_at", now.toISOString());

  for (const profile of trialUsers ?? []) {
    const trialEnd = new Date(profile.trial_ends_at);
    const { data: { user } } = await supabase.auth.admin.getUserById(profile.id);
    if (!user?.email) continue;

    const name = profile.full_name ?? "Atleta";

    // Email día 5 — faltan 2 días
    if (trialEnd <= twoDaysFromNow && profile.trial_reminder_sent !== "day5" && profile.trial_reminder_sent !== "day7") {
      await sendTrialReminderEmail(user.email, name, 2).catch(() => {});
      await supabase.from("profiles").update({ trial_reminder_sent: "day5" }).eq("id", profile.id);
      processed++;
    }

    // Email día 7 — último día
    if (trialEnd <= oneDayFromNow && profile.trial_reminder_sent !== "day7") {
      await sendTrialReminderEmail(user.email, name, 0).catch(() => {});
      await supabase.from("profiles").update({ trial_reminder_sent: "day7" }).eq("id", profile.id);
      processed++;
    }
  }

  // Marcar trials expirados
  const { data: expiredTrials } = await supabase
    .from("profiles")
    .select("id")
    .eq("is_premium", false)
    .lt("trial_ends_at", now.toISOString());

  for (const profile of expiredTrials ?? []) {
    await supabase
      .from("profiles")
      .update({ subscription_status: "trial_expired" })
      .eq("id", profile.id);
    processed++;
  }

  return NextResponse.json({ processed }, { status: 200 });
}
