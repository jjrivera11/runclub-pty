import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url, partner_zona, partner_whatsapp, busca_partner, email_notifications, is_premium, subscription_status")
    .eq("id", user.id)
    .single();

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("status, current_period_end, amount_usd")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  return (
    <SettingsClient
      userId={user.id}
      email={user.email ?? ""}
      profile={profile}
      subscription={subscription}
    />
  );
}
