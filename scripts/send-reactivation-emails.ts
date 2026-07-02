import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL ?? "coach@runclubpty.com";

const contacts = [
  { firstName: "Maria", email: "misabeldes@hotmail.com", code: "MARIA-RC" },
  { firstName: "Ana Maria", email: "amat22@gmail.com", code: "ANAMARIA-RC" },
  { firstName: "Veronica", email: "vero_2128@hotmail.com", code: "VERONICA-RC" },
  { firstName: "Nazareth", email: "alondra08@gmail.com", code: "NAZARETH-RC" },
  { firstName: "Alexandra", email: "apbermudezr@gmail.com", code: "ALEXANDRA-RC" },
  { firstName: "Lorena", email: "brownla20@hotmail.com", code: "LORENA-RC" },
  { firstName: "Alejandra", email: "acastrovaldes@gmail.com", code: "ALEJANDRA-RC" },
  { firstName: "Haydee", email: "castrovaldeshaydee@gmail.com", code: "HAYDEE-RC" },
  { firstName: "Tatiana", email: "tatytats@hotmail.com", code: "TATIANA-RC" },
  { firstName: "Gilma", email: "gilmachiari@yahoo.com", code: "GILMA-RC" },
  { firstName: "Kristine", email: "kristine.chongp@gmail.com", code: "KRISTINE-RC" },
  { firstName: "Cleide", email: "cleide.cooper@gmail.com", code: "CLEIDE-RC" },
  { firstName: "Ari", email: "ari@panamalifehack.com", code: "ARI-RC" },
  { firstName: "Mayelis", email: "maylor_gallardo17@hotmail.com", code: "MAYELIS-RC" },
  { firstName: "Yilian", email: "yilian1982@hotmail.com", code: "YILIAN-RC" },
  { firstName: "Mariana", email: "lleonartm@hotmail.com", code: "MARIANA-RC" },
  { firstName: "Marilyn", email: "medina_peralta@hotmail.com", code: "MARILYN-RC" },
  { firstName: "Frida", email: "frida_m08@hotmail.com", code: "FRIDA-RC" },
  { firstName: "Jessica", email: "jessica.a.25@hotmail.com", code: "JESSICA-RC" },
  { firstName: "Madelaine", email: "madepardos@gmail.com", code: "MADELAINE-RC" },
  { firstName: "Cindy", email: "cindyprieto@hotmail.com", code: "CINDY-RC" },
  { firstName: "Anne", email: "vantiem.anne@gmail.com", code: "ANNE-RC" },
];

function buildEmail(firstName: string, code: string): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#111111;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">

    <div style="text-align:center;margin-bottom:32px;">
      <span style="color:#ffffff;font-weight:700;font-size:18px;letter-spacing:0.5px;">RunClub Panamá</span>
    </div>

    <div style="background:#1B1C1E;border-radius:16px;padding:40px 32px;margin-bottom:16px;border:1px solid #2a2b2d;">
      <h1 style="color:#ffffff;font-size:26px;font-weight:700;margin:0 0 12px;line-height:1.2;">
        Hola ${firstName}, Coach JJ te extraña 🏃
      </h1>
      <p style="color:#B8B8B8;font-size:15px;line-height:1.6;margin:0 0 14px;">
        Hace tiempo que no entrenamos! Mucho ha pasado desde entonces — ahora tenemos <strong style="color:#ffffff;">RunClub PTY</strong>, una app de entrenamiento personalizado que diseñé específicamente para runners en Panamá.
      </p>
      <p style="color:#B8B8B8;font-size:15px;line-height:1.6;margin:0 0 14px;">
        Tu plan lo genera Coach JJ — con rutas locales, carreras en Panamá y sesiones adaptadas a tu nivel. Sin excusas, sin planes genéricos.
      </p>
      <p style="color:#ffffff;font-size:15px;line-height:1.6;margin:0 0 20px;">
        Quiero que seas parte de esta nueva experiencia y me des tu feedback sincero. Por eso tengo algo exclusivo para ti:
      </p>

      <div style="background:#111111;border-radius:10px;padding:16px 20px;margin-bottom:22px;text-align:center;">
        <p style="color:#707070;font-size:11px;margin:0 0 8px;text-transform:uppercase;letter-spacing:0.5px;">Tu código exclusivo</p>
        <span style="color:#F16823;font-size:26px;font-weight:700;letter-spacing:2px;">${code}</span>
        <p style="color:#B8B8B8;font-size:12px;margin:8px 0 0;">1 mes gratis — válido por 30 días</p>
      </div>

      <a href="https://runclubpty.com/register" style="display:inline-block;background:#F16823;color:#ffffff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;">
        Quiero ver mi plan →
      </a>
    </div>

    <div style="background:#1B1C1E;border-radius:12px;padding:20px 24px;margin-bottom:16px;border:1px solid #2a2b2d;border-left:3px solid #F16823;">
      <p style="color:#B8B8B8;font-size:13px;line-height:1.6;margin:0;">
        Puedes elegir entre <strong style="color:#ffffff;">Runner Pro</strong> — entrenamiento para carreras de 5K a 42K — o <strong style="color:#ffffff;">Transformación</strong> — running con fuerza para bajar de peso y cambiar tu cuerpo.
      </p>
    </div>

    <div style="background:#1B1C1E;border-radius:12px;padding:20px 24px;margin-bottom:24px;border:1px solid #2a2b2d;text-align:center;">
      <p style="color:#B8B8B8;font-size:13px;line-height:1.6;margin:0 0 8px;">
        ¿Te gustó la experiencia? Comparte tu link de referido desde el dashboard.
      </p>
      <p style="color:#707070;font-size:12px;margin:0;">
        Cada amiga que se una te da <strong style="color:#ffffff;">20% de descuento</strong> en tu próximo mes.
      </p>
    </div>

    <div style="text-align:center;margin-bottom:32px;">
      <p style="color:#707070;font-size:12px;margin:0 0 6px;">¿Tienes preguntas? Escríbeme directo.</p>
      <a href="https://wa.me/14038998916" style="color:#F16823;font-size:13px;text-decoration:none;font-weight:600;">WhatsApp Coach JJ →</a>
    </div>

    <div style="border-top:1px solid #2a2b2d;padding-top:24px;text-align:center;">
      <p style="color:#404040;font-size:11px;margin:0 0 3px;">RunClub Panamá — runclubpty.com</p>
      <p style="color:#404040;font-size:11px;margin:0;">El primer coach de running personalizado de Panamá.</p>
    </div>

  </div>
</body>
</html>
  `;
}

async function main() {
  console.log(`Enviando ${contacts.length} emails...`);
  let sent = 0;
  let failed = 0;

  for (const contact of contacts) {
    try {
      await resend.emails.send({
        from: FROM,
        to: contact.email,
        subject: `${contact.firstName}, Coach JJ tiene algo para ti 🏃`,
        html: buildEmail(contact.firstName, contact.code),
      });
      console.log(`✓ ${contact.firstName} — ${contact.email}`);
      sent++;
      await new Promise((r) => setTimeout(r, 300));
    } catch (err) {
      console.error(`✗ ${contact.firstName} — ${contact.email}:`, err);
      failed++;
    }
  }

  console.log(`\nListo: ${sent} enviados, ${failed} fallidos.`);
}

main();
