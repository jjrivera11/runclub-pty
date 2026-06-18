import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

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

  const providedSecret = request.headers.get("x-cron-secret");
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

  return NextResponse.json({ processed }, { status: 200 });
}
