import { createClient, createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function requireAdmin(): Promise<{ error: NextResponse } | { userId: string }> {
  // Verificar sesión con cliente que lee cookies
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: NextResponse.json({ error: "No autorizado." }, { status: 401 }) };
  }

  // Verificar is_admin con service role para evitar bloqueos de RLS
  const serviceClient = createServiceClient();
  const { data: profile } = await serviceClient
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    return { error: NextResponse.json({ error: "Acceso denegado." }, { status: 403 }) };
  }

  return { userId: user.id };
}
