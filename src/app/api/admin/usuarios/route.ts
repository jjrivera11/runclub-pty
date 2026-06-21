import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, track, is_premium, subscription_status, is_admin")
    .order("full_name");
  return NextResponse.json(data ?? []);
}

export async function PATCH(request: Request) {
  const supabase = createServiceClient();
  const { id, ...updates } = await request.json();
  await supabase.from("profiles").update(updates).eq("id", id);
  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const supabase = createServiceClient();
  const { id } = await request.json();

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
