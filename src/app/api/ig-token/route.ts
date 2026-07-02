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

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET no configurado." }, { status: 500 });
  }

  const authHeader = request.headers.get("authorization");
  const providedSecret = authHeader?.replace("Bearer ", "") ?? request.headers.get("x-cron-secret");
  if (!providedSecret || !verifyCronSecret(providedSecret, cronSecret)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const supabase = createServiceClient();

  const { data: config, error } = await supabase
    .from("system_config")
    .select("value, expires_at, updated_at")
    .eq("key", IG_TOKEN_KEY)
    .maybeSingle();

  if (error) {
    console.error("[ig-token] Error leyendo system_config:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!config?.value) {
    return NextResponse.json(
      { error: "Token no encontrado. Insertar fila ig_access_token en system_config." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    access_token: config.value,
    expires_at: config.expires_at,
    updated_at: config.updated_at,
  });
}
