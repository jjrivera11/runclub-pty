import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("banners")
    .select("*")
    .order("created_at", { ascending: false });
  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const supabase = createServiceClient();
  const body = await request.json();
  const { data } = await supabase.from("banners").insert(body).select().single();
  return NextResponse.json(data);
}

export async function PATCH(request: Request) {
  const supabase = createServiceClient();
  const { id, ...updates } = await request.json();
  await supabase.from("banners").update(updates).eq("id", id);
  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const supabase = createServiceClient();
  const { id } = await request.json();
  await supabase.from("banners").delete().eq("id", id);
  return NextResponse.json({ success: true });
}
