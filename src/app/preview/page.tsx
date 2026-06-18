import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { TrainingPlan } from "@/types/plan";
import PreviewClient from "./PreviewClient";

export default async function PreviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: planData } = await supabase
    .from("training_plans")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (!planData) {
    redirect("/generating");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_premium")
    .eq("id", user.id)
    .single();

  if (profile?.is_premium) {
    redirect("/dashboard");
  }

  return <PreviewClient plan={planData as TrainingPlan} />;
}
