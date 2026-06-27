import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { timingSafeEqual } from "crypto";
import { Resend } from "resend";

export const runtime = "nodejs";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "coach@runclubpty.com";

function buildEmail(firstName: string, type: "day_3" | "day_7" | "day_14"): { subject: string; html: string } {
  const messages = {
    day_3: {
      subject: `${firstName}, tu plan te está esperando 🏃`,
      headline: "Hace 3 días que no entrenas",
      body: "Tu plan sigue ahí esperándote — incluso 20 minutos cuentan. No pierdas el ritmo que ya traías.",
      cta: "Retomar mi plan →",
    },
    day_7: {
      subject: `${firstName}, llevas una semana sin actividad`,
      headline: "Una semana sin registrar actividad",
      body: "No pierdas el progreso que ya tienes. Vuelve hoy — no hace falta empezar desde cero, solo continúa donde lo dejaste.",
      cta: "Continuar mi plan →",
    },
    day_14: {
      subject: `${firstName}, tu plan sigue activo`,
      headline: "Tu plan te necesita",
      body: "Llevas 14 días sin actividad registrada. Si necesitas ajustar algo en tu plan o tienes alguna duda, Coach JJ puede ayudarte. No te rindas ahora.",
      cta: "Volver al dashboard →",
    },
  };

  const m = messages[type];

  return {
    subject: m.subject,
    html: `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#111111;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="text-align:center;margin-bottom:32px;">
      <span style="color:#ffffff;font-weight:700;font-size:18px;letter-spacing:0.5px;">RunClub Panamá</span>
    </div>
    <div style="background:#1B1C1E;border-radius:16px;padding:40px 32px;margin-bottom:16px;border:1px solid #2a2b2d;">
      <h1 style="color:#ffffff;font-size:22px;font-weight:700;margin:0 0 12px;line-height:1.3;">
        Hola ${firstName} 👋
      </h1>
      <p style="color:#F16823;font-size:13px;font-weight:700;margin:0 0 16px;text-transform:uppercase;letter-spacing:0.5px;">
        ${m.headline}
      </p>
      <p style="color:#B8B8B8;font-size:15px;line-height:1.6;margin:0 0 28px;">
        ${m.body}
      </p>
      <a href="https://www.runclubpty.com/dashboard" style="display:inline-block;background:#F16823;color:#ffffff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;">
        ${m.cta}
      </a>
    </div>
    <div style="text-align:center;margin-bottom:24px;">
      <p style="color:#707070;font-size:12px;margin:0 0 6px;">¿Tienes preguntas? Escríbeme directo.</p>
      <a href="https://wa.me/14038998916" style="color:#F16823;font-size:13px;text-decoration:none;font-weight:600;">WhatsApp Coach JJ →</a>
    </div>
    <div style="border-top:1px solid #2a2b2d;padding-top:24px;text-align:center;">
      <p style="color:#404040;font-size:11px;margin:0 0 3px;">RunClub Panamá — runclubpty.com</p>
      <p style="color:#404040;font-size:11px;margin:0;">El primer coach de running personalizado de Panamá.</p>
    </div>
  </div>
</body>
</html>`,
  };
}

export async function GET(request: Request) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "") ?? "";
  const expected = process.env.CRON_SECRET ?? "";

  try {
    if (!timingSafeEqual(Buffer.from(token), Buffer.from(expected))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const now = new Date();

  // Obtener usuarios con plan activo
  const { data: activePlans } = await supabase
    .from("training_plans")
    .select("user_id, profiles(full_name)")
    .eq("is_active", true);

  if (!activePlans?.length) {
    return NextResponse.json({ ok: true, processed: 0 });
  }

  let sent = 0;

  for (const plan of activePlans) {
    const userId = plan.user_id;

    // Obtener último día completado
    const { data: lastActivity } = await supabase
      .from("day_progress")
      .select("completed_at")
      .eq("user_id", userId)
      .eq("completed", true)
      .order("completed_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // Si nunca ha completado un día, usar la fecha de generación del plan
    const lastDate = lastActivity?.completed_at
      ? new Date(lastActivity.completed_at)
      : new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000); // simular 3 días

    const daysSinceActivity = Math.floor(
      (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Determinar qué email enviar
    let emailType: "day_3" | "day_7" | "day_14" | null = null;
    if (daysSinceActivity >= 14) emailType = "day_14";
    else if (daysSinceActivity >= 7) emailType = "day_7";
    else if (daysSinceActivity >= 3) emailType = "day_3";

    if (!emailType) continue;

    // Verificar si ya se envió este email recientemente
    const { data: alreadySent } = await supabase
      .from("reengagement_log")
      .select("id")
      .eq("user_id", userId)
      .eq("email_type", emailType)
      .gte("sent_at", new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .maybeSingle();

    if (alreadySent) continue;

    // Obtener email del usuario
    const { data: authUser } = await supabase.auth.admin.getUserById(userId);
    const email = authUser?.user?.email;
    const fullName = (plan.profiles as { full_name?: string })?.full_name ?? "Atleta";
    const firstName = fullName.split(" ")[0];

    if (!email) continue;

    // Enviar email
    const { subject, html } = buildEmail(firstName, emailType);
    const { error: sendError } = await resend.emails.send({
      from: FROM,
      to: email,
      subject,
      html,
    });

    if (!sendError) {
      await supabase.from("reengagement_log").insert({
        user_id: userId,
        email_type: emailType,
      });
      sent++;
    }
  }

  return NextResponse.json({ ok: true, sent });
}
