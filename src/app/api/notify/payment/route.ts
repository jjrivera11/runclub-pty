import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { sendTelegramNotification } from "@/lib/telegram";

export async function POST(request: Request) {
  const secret = process.env.SUPABASE_WEBHOOK_SECRET;
  const authHeader = request.headers.get("authorization");

  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const body = await request.json();
  const record = body.record;

  if (!record || record.status !== "pending_verification") {
    return NextResponse.json({ skipped: true });
  }

  const supabase = createServiceClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", record.user_id)
    .single();

  const name = profile?.full_name ?? "Usuario desconocido";
  const amount = record.amount_usd ? `$${record.amount_usd}` : "—";
  const plan = record.plan ?? "—";
  const date = new Date().toLocaleString("es-PA", { timeZone: "America/Panama" });

  await sendTelegramNotification(
    `💳 <b>Nuevo pago pendiente</b>\n\n` +
    `👤 <b>Usuario:</b> ${name}\n` +
    `💰 <b>Monto:</b> ${amount}\n` +
    `📦 <b>Plan:</b> ${plan}\n` +
    `🕐 <b>Hora:</b> ${date}\n\n` +
    `👉 Revisa en <a href="https://runclubpty.com/admin/pagos">Admin → Pagos</a>`
  );

  return NextResponse.json({ success: true });
}
