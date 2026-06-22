import { Resend } from "resend";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY ?? "");
}
const FROM = process.env.RESEND_FROM_EMAIL ?? "noreply@runclubpty.com";

export async function sendWelcomeEmail(to: string, name: string) {
  await getResend().emails.send({
    from: FROM,
    to,
    subject: "Bienvenido a RunClub Panama",
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#1B1C1E;color:#ffffff;padding:40px;border-radius:12px;">
        <img src="https://runclubpty.com/logo.svg" alt="RunClub Panama" style="height:60px;margin-bottom:24px;" />
        <h1 style="color:#F16823;font-size:24px;margin:0 0 16px;">Hola ${name}, bienvenido al club</h1>
        <p style="color:#A3A3A3;line-height:1.6;">Estamos construyendo tu plan de entrenamiento personalizado. En unos momentos estara listo.</p>
        <p style="color:#A3A3A3;line-height:1.6;">Nos vemos en la pista.</p>
        <div style="margin-top:32px;padding-top:24px;border-top:1px solid #707070;">
          <p style="color:#707070;font-size:12px;">RunClub Panama &mdash; runclubpty.com</p>
        </div>
      </div>
    `,
  });
}

export async function sendPlanReadyEmail(to: string, name: string, totalWeeks: number, track: string) {
  const isRunner = track === "runner";
  const firstName = name.split(" ")[0];
  const trackLabel = isRunner ? "Runner Pro" : "Transformación";
  const trackEmoji = isRunner ? "🏃" : "💪";
  const trackDesc = isRunner
    ? "entrenamiento progresivo para carrera"
    : "transformación física con running y fuerza";

  await getResend().emails.send({
    from: FROM,
    to,
    subject: `${firstName}, tu plan de ${totalWeeks} semanas está listo`,
    html: `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#111111;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">

    <!-- Logo -->
    <div style="text-align:center;margin-bottom:32px;">
      <span style="color:#ffffff;font-weight:700;font-size:18px;letter-spacing:0.5px;">RunClub Panamá</span>
    </div>

    <!-- Hero -->
    <div style="background:#1B1C1E;border-radius:16px;padding:40px 32px;margin-bottom:16px;border:1px solid #2a2b2d;">
      <div style="background:#F16823;display:inline-block;border-radius:8px;padding:6px 14px;margin-bottom:20px;">
        <span style="color:#ffffff;font-size:13px;font-weight:700;letter-spacing:0.5px;">${trackEmoji} ${trackLabel}</span>
      </div>
      <h1 style="color:#ffffff;font-size:28px;font-weight:700;margin:0 0 12px;line-height:1.2;">
        Tu plan está listo,<br/>${firstName}.
      </h1>
      <p style="color:#B8B8B8;font-size:16px;line-height:1.6;margin:0 0 28px;">
        Coach JJ preparó un plan de <strong style="color:#ffffff;">${totalWeeks} semanas</strong> de ${trackDesc} diseñado específicamente para ti.
      </p>
      <a href="https://runclubpty.com/dashboard" style="display:inline-block;background:#F16823;color:#ffffff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;">
        Ver mi plan →
      </a>
    </div>

    <!-- Stats -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
      <tr>
        <td width="48%" style="background:#1B1C1E;border-radius:12px;padding:20px;border:1px solid #2a2b2d;text-align:center;">
          <div style="color:#F16823;font-size:32px;font-weight:700;line-height:1;">${totalWeeks}</div>
          <div style="color:#707070;font-size:12px;margin-top:4px;text-transform:uppercase;letter-spacing:0.5px;">semanas de plan</div>
        </td>
        <td width="4%"></td>
        <td width="48%" style="background:#1B1C1E;border-radius:12px;padding:20px;border:1px solid #2a2b2d;text-align:center;">
          <div style="color:#F16823;font-size:32px;font-weight:700;line-height:1;">5</div>
          <div style="color:#707070;font-size:12px;margin-top:4px;text-transform:uppercase;letter-spacing:0.5px;">semanas generadas</div>
        </td>
      </tr>
    </table>

    <!-- Nota -->
    <div style="background:#1B1C1E;border-radius:12px;padding:20px 24px;margin-bottom:24px;border:1px solid #2a2b2d;border-left:3px solid #F16823;">
      <p style="color:#B8B8B8;font-size:14px;line-height:1.6;margin:0;">
        Las siguientes semanas se generarán automáticamente a medida que avances. Tu plan se adapta a tu progreso — Coach JJ lo ajusta cuando es necesario.
      </p>
    </div>

    <!-- CTA secundario -->
    <div style="text-align:center;margin-bottom:32px;">
      <p style="color:#707070;font-size:13px;margin:0 0 8px;">¿Tienes dudas sobre tu plan?</p>
      <a href="https://runclubpty.com/help" style="color:#F16823;font-size:13px;text-decoration:none;font-weight:600;">Visita el centro de ayuda →</a>
    </div>

    <!-- Footer -->
    <div style="border-top:1px solid #2a2b2d;padding-top:24px;text-align:center;">
      <p style="color:#404040;font-size:12px;margin:0 0 4px;">RunClub Panamá &mdash; runclubpty.com</p>
      <p style="color:#404040;font-size:12px;margin:0;">El primer coach de running personalizado de Panamá.</p>
    </div>

  </div>
</body>
</html>
    `,
  });
}

export async function sendWeeklyReminderEmail(to: string, name: string, weekNumber: number, sessions: number) {
  await getResend().emails.send({
    from: FROM,
    to,
    subject: `Semana ${weekNumber} — ${sessions} sesiones te esperan`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#1B1C1E;color:#ffffff;padding:40px;border-radius:12px;">
        <img src="https://runclubpty.com/logo.svg" alt="RunClub Panama" style="height:60px;margin-bottom:24px;" />
        <h1 style="color:#F16823;font-size:24px;margin:0 0 16px;">Nueva semana, ${name}</h1>
        <p style="color:#A3A3A3;line-height:1.6;">
          Empieza la semana ${weekNumber} de tu plan. Tienes 
          <strong style="color:#ffffff;">${sessions} sesiones</strong> programadas esta semana.
        </p>
        <a href="https://runclubpty.com/dashboard" style="display:inline-block;background:#F16823;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin:24px 0;">
          Ver mi semana
        </a>
        <div style="margin-top:32px;padding-top:24px;border-top:1px solid #707070;">
          <p style="color:#707070;font-size:12px;">RunClub Panama &mdash; runclubpty.com</p>
        </div>
      </div>
    `,
  });
}

export async function sendNewBlockEmail(to: string, name: string, blockStart: number, blockEnd: number) {
  await getResend().emails.send({
    from: FROM,
    to,
    subject: `Nuevas semanas disponibles — ${blockStart} a ${blockEnd}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#1B1C1E;color:#ffffff;padding:40px;border-radius:12px;">
        <img src="https://runclubpty.com/logo.svg" alt="RunClub Panama" style="height:60px;margin-bottom:24px;" />
        <h1 style="color:#F16823;font-size:24px;margin:0 0 16px;">Nuevas semanas listas, ${name}</h1>
        <p style="color:#A3A3A3;line-height:1.6;">
          Hemos generado las semanas <strong style="color:#ffffff;">${blockStart} a ${blockEnd}</strong> de tu plan. 
          Ya estan disponibles en tu dashboard.
        </p>
        <a href="https://runclubpty.com/dashboard" style="display:inline-block;background:#F16823;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin:24px 0;">
          Ver nuevas semanas
        </a>
        <div style="margin-top:32px;padding-top:24px;border-top:1px solid #707070;">
          <p style="color:#707070;font-size:12px;">RunClub Panama &mdash; runclubpty.com</p>
        </div>
      </div>
    `,
  });
}

export async function sendTrialReminderEmail(to: string, name: string, daysLeft: number) {
  const isLast = daysLeft === 0;
  await getResend().emails.send({
    from: FROM,
    to,
    subject: isLast ? "Hoy termina tu prueba gratuita — RunClub Panamá" : `Te quedan ${daysLeft} días de prueba gratuita`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#1B1C1E;color:#ffffff;padding:40px;border-radius:12px;">
        <img src="https://runclubpty.com/logo.svg" alt="RunClub Panamá" style="height:60px;margin-bottom:24px;" />
        <h1 style="color:#F16823;font-size:24px;margin:0 0 16px;">
          ${isLast ? `Hoy es tu último día, ${name}` : `${name}, te quedan ${daysLeft} días`}
        </h1>
        <p style="color:#A3A3A3;line-height:1.6;">
          ${isLast
            ? "Tu prueba gratuita de 7 días termina hoy. Suscríbete para seguir entrenando sin interrupciones."
            : `Tu prueba gratuita termina en ${daysLeft} días. Suscríbete ahora y sigue entrenando sin interrupciones.`
          }
        </p>
        <a href="https://runclubpty.com/pricing" style="display:inline-block;background:#F16823;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin:24px 0;">
          Ver planes — desde $12/mes
        </a>
        <p style="color:#A3A3A3;line-height:1.6;font-size:14px;">Sin tarjeta de crédito requerida para la prueba. Cancela cuando quieras.</p>
        <div style="margin-top:32px;padding-top:24px;border-top:1px solid #707070;">
          <p style="color:#707070;font-size:12px;">RunClub Panamá &mdash; runclubpty.com</p>
        </div>
      </div>
    `,
  });
}
