import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const IG_TOKEN_KEY = "ig_access_token";

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

function unauthorized() {
  return NextResponse.json({ error: "No autorizado." }, { status: 401 });
}

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error("[refresh-ig-token] CRON_SECRET no configurado.");
    return NextResponse.json({ error: "CRON_SECRET no configurado." }, { status: 500 });
  }

  const authHeader = request.headers.get("authorization");
  const providedSecret = authHeader?.replace("Bearer ", "") ?? request.headers.get("x-cron-secret");
  if (!providedSecret || !verifyCronSecret(providedSecret, cronSecret)) {
    return unauthorized();
  }

  const supabase = createServiceClient();

  const { data: config, error: readError } = await supabase
    .from("system_config")
    .select("value, expires_at")
    .eq("key", IG_TOKEN_KEY)
    .maybeSingle();

  if (readError) {
    console.error("[refresh-ig-token] Error leyendo system_config:", readError);
    return NextResponse.json({ error: readError.message }, { status: 500 });
  }

  if (!config?.value) {
    console.error("[refresh-ig-token] No existe ig_access_token en system_config.");
    return NextResponse.json(
      { error: "Token no encontrado. Insertar fila ig_access_token en system_config." },
      { status: 404 }
    );
  }

  const refreshUrl = new URL("https://graph.instagram.com/refresh_access_token");
  refreshUrl.searchParams.set("grant_type", "ig_refresh_token");
  refreshUrl.searchParams.set("access_token", config.value);

  let response: Response;
  try {
    response = await fetch(refreshUrl.toString(), { method: "GET" });
  } catch (err) {
    console.error("[refresh-ig-token] Error de red al llamar Instagram Graph API:", err);
    return NextResponse.json({ error: "Error de red al refrescar token." }, { status: 502 });
  }

  const body = await response.json().catch(() => null);

  if (!response.ok || !body?.access_token) {
    console.error("[refresh-ig-token] Instagram Graph API rechazó el refresh:", {
      status: response.status,
      body,
      current_expires_at: config.expires_at,
    });
    return NextResponse.json(
      {
        error: "No se pudo refrescar el token de Instagram.",
        instagram_status: response.status,
        instagram_error: body?.error ?? body,
      },
      { status: 502 }
    );
  }

  const expiresAt = new Date(Date.now() + Number(body.expires_in) * 1000).toISOString();
  const updatedAt = new Date().toISOString();

  const { error: updateError } = await supabase
    .from("system_config")
    .upsert({
      key: IG_TOKEN_KEY,
      value: body.access_token,
      expires_at: expiresAt,
      updated_at: updatedAt,
    });

  if (updateError) {
    console.error("[refresh-ig-token] Error guardando token en system_config:", updateError);
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  console.log("[refresh-ig-token] Token refrescado correctamente.", {
    expires_at: expiresAt,
    token_type: body.token_type,
  });

  return NextResponse.json({
    ok: true,
    refreshed_at: updatedAt,
    expires_at: expiresAt,
  });
}
