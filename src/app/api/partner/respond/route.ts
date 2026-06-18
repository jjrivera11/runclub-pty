import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const { request_id, action } = await request.json();
  if (!request_id || !action) {
    return NextResponse.json({ error: "Parametros requeridos." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const { error } = await supabase
    .from("partner_requests")
    .update({ status: action })
    .eq("id", request_id)
    .eq("to_user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
