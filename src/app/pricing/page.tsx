import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Track } from "@/types/onboarding";
import PricingClient from "./PricingClient";

export default async function PricingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_premium, track")
    .eq("id", user.id)
    .single();

  if (profile?.is_premium) {
    redirect("/dashboard");
  }

  const track = (profile?.track as Track | null) ?? "runner";

  return <PricingClient track={track} />;
}
