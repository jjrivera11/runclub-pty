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
  await getResend().emails.send({
    from: FROM,
    to,
    subject: "Tu plan de entrenamiento esta listo",
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#1B1C1E;color:#ffffff;padding:40px;border-radius:12px;">
        <img src="https://runclubpty.com/logo.svg" alt="RunClub Panama" style="height:60px;margin-bottom:24px;" />
        <h1 style="color:#F16823;font-size:24px;margin:0 0 16px;">Tu plan esta listo, ${name}</h1>
        <p style="color:#A3A3A3;line-height:1.6;">
          Hemos generado tus primeras 5 semanas de un plan de ${totalWeeks} semanas de 
          ${isRunner ? "entrenamiento para carrera" : "transformacion fisica"}.
        </p>
        <a href="https://runclubpty.com/dashboard" style="display:inline-block;background:#F16823;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin:24px 0;">
          Ver mi plan
        </a>
        <p style="color:#A3A3A3;line-height:1.6;">Las proximas semanas se generaran automaticamente a medida que avances.</p>
        <div style="margin-top:32px;padding-top:24px;border-top:1px solid #707070;">
          <p style="color:#707070;font-size:12px;">RunClub Panama &mdash; runclubpty.com</p>
        </div>
      </div>
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
