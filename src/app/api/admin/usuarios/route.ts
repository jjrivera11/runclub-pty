import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, track, is_premium, subscription_status, is_admin")
    .order("full_name");
  return NextResponse.json(data ?? []);
}

export async function PATCH(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const supabase = createServiceClient();
  const { id, ...updates } = await request.json();

  const ALLOWED_FIELDS = new Set(["track", "is_premium", "subscription_status"]);
  const safeUpdates = Object.fromEntries(
    Object.entries(updates).filter(([key]) => ALLOWED_FIELDS.has(key))
  );

  if (Object.keys(safeUpdates).length === 0) {
    return NextResponse.json({ error: "No hay campos válidos para actualizar." }, { status: 400 });
  }

  await supabase.from("profiles").update(safeUpdates).eq("id", id);
  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const supabase = createServiceClient();
  const { id, hard_delete } = await request.json();

  if (hard_delete) {
    // Eliminar usuario completo de auth
    await supabase.auth.admin.deleteUser(id);
    return NextResponse.json({ success: true });
  }

  // Reset plan (comportamiento anterior)
  await supabase
    .from("training_plans")
    .update({ is_active: false })
    .eq("user_id", id)
    .eq("is_active", true);

  await supabase
    .from("onboarding_answers")
    .delete()
    .eq("user_id", id);

  return NextResponse.json({ success: true });
}
