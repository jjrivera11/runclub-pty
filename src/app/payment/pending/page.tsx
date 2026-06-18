import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PaymentPendingClient from "./PaymentPendingClient";

export type PaymentPlan = "runner" | "transformacion";

interface PaymentPendingPageProps {
  searchParams: Promise<{ plan?: string }>;
}

export default async function PaymentPendingPage({
  searchParams,
}: PaymentPendingPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_premium")
    .eq("id", user.id)
    .single();

  if (profile?.is_premium) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const plan: PaymentPlan =
    params.plan === "transformacion" ? "transformacion" : "runner";

  return (
    <PaymentPendingClient
      plan={plan}
      email={user.email ?? ""}
      userId={user.id}
    />
  );
}
