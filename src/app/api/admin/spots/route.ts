import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("training_spots")
    .select("*")
    .order("city", { ascending: true });
  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const supabase = createServiceClient();
  const body = await request.json();
  const { data } = await supabase.from("training_spots").insert(body).select().single();
  return NextResponse.json(data);
}

export async function PATCH(request: Request) {
  const supabase = createServiceClient();
  const { id, ...updates } = await request.json();
  await supabase.from("training_spots").update(updates).eq("id", id);
  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const supabase = createServiceClient();
  const { id } = await request.json();
  await supabase.from("training_spots").delete().eq("id", id);
  return NextResponse.json({ success: true });
}
