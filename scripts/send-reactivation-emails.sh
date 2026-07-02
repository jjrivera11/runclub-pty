#!/bin/bash

KEY=$(grep RESEND_API_KEY .env.local | cut -d '=' -f2)
FROM="coach@runclubpty.com"
SENT=0
FAILED=0

send_email() {
  local FIRST_NAME="$1"
  local EMAIL="$2"
  local CODE="$3"

  BODY=$(cat <<EOF
{
  "from": "$FROM",
  "to": ["$EMAIL"],
  "subject": "$FIRST_NAME, Coach JJ tiene algo para ti 🏃",
  "html": "<!DOCTYPE html><html lang='es'><head><meta charset='UTF-8'></head><body style='margin:0;padding:0;background-color:#111111;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;'><div style='max-width:600px;margin:0 auto;padding:40px 20px;'><div style='text-align:center;margin-bottom:32px;'><span style='color:#ffffff;font-weight:700;font-size:18px;letter-spacing:0.5px;'>RunClub Panamá</span></div><div style='background:#1B1C1E;border-radius:16px;padding:40px 32px;margin-bottom:16px;border:1px solid #2a2b2d;'><h1 style='color:#ffffff;font-size:26px;font-weight:700;margin:0 0 12px;line-height:1.2;'>Hola $FIRST_NAME, Coach JJ te extraña 🏃</h1><p style='color:#B8B8B8;font-size:15px;line-height:1.6;margin:0 0 14px;'>Hace tiempo que no entrenamos! Mucho ha pasado desde entonces — ahora tenemos <strong style='color:#ffffff;'>RunClub PTY</strong>, una app de entrenamiento personalizado que diseñé específicamente para runners en Panamá.</p><p style='color:#B8B8B8;font-size:15px;line-height:1.6;margin:0 0 14px;'>Tu plan lo genera Coach JJ — con rutas locales, carreras en Panamá y sesiones adaptadas a tu nivel. Sin excusas, sin planes genéricos.</p><p style='color:#ffffff;font-size:15px;line-height:1.6;margin:0 0 20px;'>Quiero que seas parte de esta nueva experiencia y me des tu feedback sincero. Por eso tengo algo exclusivo para ti:</p><div style='background:#111111;border-radius:10px;padding:16px 20px;margin-bottom:22px;text-align:center;'><p style='color:#707070;font-size:11px;margin:0 0 8px;text-transform:uppercase;letter-spacing:0.5px;'>Tu código exclusivo</p><span style='color:#F16823;font-size:26px;font-weight:700;letter-spacing:2px;'>$CODE</span><p style='color:#B8B8B8;font-size:12px;margin:8px 0 0;'>1 mes gratis — válido por 30 días</p></div><a href='https://runclubpty.com/register' style='display:inline-block;background:#F16823;color:#ffffff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;'>Quiero ver mi plan →</a></div><div style='background:#1B1C1E;border-radius:12px;padding:20px 24px;margin-bottom:16px;border:1px solid #2a2b2d;border-left:3px solid #F16823;'><p style='color:#B8B8B8;font-size:13px;line-height:1.6;margin:0;'>Puedes elegir entre <strong style='color:#ffffff;'>Runner Pro</strong> — entrenamiento para carreras de 5K a 42K — o <strong style='color:#ffffff;'>Transformación</strong> — running con fuerza para bajar de peso y cambiar tu cuerpo.</p></div><div style='background:#1B1C1E;border-radius:12px;padding:20px 24px;margin-bottom:24px;border:1px solid #2a2b2d;text-align:center;'><p style='color:#B8B8B8;font-size:13px;line-height:1.6;margin:0 0 8px;'>¿Te gustó la experiencia? Comparte tu link de referido desde el dashboard.</p><p style='color:#707070;font-size:12px;margin:0;'>Cada amiga que se una te da <strong style='color:#ffffff;'>20% de descuento</strong> en tu próximo mes.</p></div><div style='text-align:center;margin-bottom:32px;'><p style='color:#707070;font-size:12px;margin:0 0 6px;'>¿Tienes preguntas? Escríbeme directo.</p><a href='https://wa.me/14038998916' style='color:#F16823;font-size:13px;text-decoration:none;font-weight:600;'>WhatsApp Coach JJ →</a></div><div style='border-top:1px solid #2a2b2d;padding-top:24px;text-align:center;'><p style='color:#404040;font-size:11px;margin:0 0 3px;'>RunClub Panamá — runclubpty.com</p><p style='color:#404040;font-size:11px;margin:0;'>El primer coach de running personalizado de Panamá.</p></div></div></body></html>"
}
EOF
)

  RESPONSE=$(curl -s -X POST https://api.resend.com/emails \
    -H "Authorization: Bearer $KEY" \
    -H "Content-Type: application/json" \
    -d "$BODY")

  if echo "$RESPONSE" | grep -q '"id"'; then
    echo "✓ $FIRST_NAME — $EMAIL"
    SENT=$((SENT + 1))
  else
    echo "✗ $FIRST_NAME — $EMAIL: $RESPONSE"
    FAILED=$((FAILED + 1))
  fi

  sleep 0.3
}

send_email "Maria" "misabeldes@hotmail.com" "MARIA-RC"
send_email "Ana Maria" "amat22@gmail.com" "ANAMARIA-RC"
send_email "Veronica" "vero_2128@hotmail.com" "VERONICA-RC"
send_email "Nazareth" "alondra08@gmail.com" "NAZARETH-RC"
send_email "Alexandra" "apbermudezr@gmail.com" "ALEXANDRA-RC"
send_email "Lorena" "brownla20@hotmail.com" "LORENA-RC"
send_email "Alejandra" "acastrovaldes@gmail.com" "ALEJANDRA-RC"
send_email "Haydee" "castrovaldeshaydee@gmail.com" "HAYDEE-RC"
send_email "Tatiana" "tatytats@hotmail.com" "TATIANA-RC"
send_email "Gilma" "gilmachiari@yahoo.com" "GILMA-RC"
send_email "Kristine" "kristine.chongp@gmail.com" "KRISTINE-RC"
send_email "Cleide" "cleide.cooper@gmail.com" "CLEIDE-RC"
send_email "Ari" "ari@panamalifehack.com" "ARI-RC"
send_email "Mayelis" "maylor_gallardo17@hotmail.com" "MAYELIS-RC"
send_email "Yilian" "yilian1982@hotmail.com" "YILIAN-RC"
send_email "Mariana" "lleonartm@hotmail.com" "MARIANA-RC"
send_email "Marilyn" "medina_peralta@hotmail.com" "MARILYN-RC"
send_email "Frida" "frida_m08@hotmail.com" "FRIDA-RC"
send_email "Jessica" "jessica.a.25@hotmail.com" "JESSICA-RC"
send_email "Madelaine" "madepardos@gmail.com" "MADELAINE-RC"
send_email "Cindy" "cindyprieto@hotmail.com" "CINDY-RC"
send_email "Anne" "vantiem.anne@gmail.com" "ANNE-RC"

echo ""
echo "Listo: $SENT enviados, $FAILED fallidos."
