import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

// IMPORTANTE: los nombres exactos de los campos del payload
// (customer_reference, provider_subscription_id, etc.)
// deben verificarse con la documentación de Neopayment
// antes de ir a producción

interface NeopaymentWebhookPayload {
  event: string;
  customer_reference?: string;
  provider_subscription_id?: string;
  amount_usd?: number;
  plan?: string;
  current_period_start?: string;
  current_period_end?: string;
  data?: {
    customer_reference?: string;
    provider_subscription_id?: string;
    amount_usd?: number;
    plan?: string;
    current_period_start?: string;
    current_period_end?: string;
  };
}

function verifyNeopaymentSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expected = createHmac("sha256", secret).update(payload).digest("hex");
  const normalizedSignature = signature.replace(/^sha256=/, "");

  try {
    const signatureBuffer = Buffer.from(normalizedSignature, "hex");
    const expectedBuffer = Buffer.from(expected, "hex");

    if (signatureBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return timingSafeEqual(signatureBuffer, expectedBuffer);
  } catch {
    return false;
  }
}

function getPayloadField(
  payload: NeopaymentWebhookPayload,
  field: keyof NeopaymentWebhookPayload
): string | number | undefined {
  const value = payload[field] ?? payload.data?.[field as keyof NonNullable<NeopaymentWebhookPayload["data"]>];
  return value as string | number | undefined;
}

async function handlePaymentSuccess(
  supabase: ReturnType<typeof createServiceClient>,
  payload: NeopaymentWebhookPayload
) {
  const userId = getPayloadField(payload, "customer_reference") as
    | string
    | undefined;
  if (!userId) return;

  const providerSubscriptionId = getPayloadField(
    payload,
    "provider_subscription_id"
  ) as string | undefined;
  const amountUsd = getPayloadField(payload, "amount_usd") as number | undefined;
  const plan = getPayloadField(payload, "plan") as string | undefined;
  const currentPeriodStart = (getPayloadField(
    payload,
    "current_period_start"
  ) as string | undefined) ?? new Date().toISOString();

  const rawPeriodEnd = getPayloadField(payload, "current_period_end") as string | undefined;
  const endOfMonth = new Date();
  endOfMonth.setMonth(endOfMonth.getMonth() + 1);
  endOfMonth.setDate(0);
  endOfMonth.setHours(23, 59, 59, 999);
  const currentPeriodEnd = rawPeriodEnd ?? endOfMonth.toISOString();

  await supabase
    .from("profiles")
    .update({ is_premium: true, subscription_status: "active" })
    .eq("id", userId);

  await supabase.from("subscriptions").insert({
    user_id: userId,
    status: "active",
    provider: "neopayment",
    provider_subscription_id: providerSubscriptionId,
    amount_usd: amountUsd,
    current_period_start: currentPeriodStart,
    current_period_end: currentPeriodEnd,
    plan,
  });

  await supabase.from("payments").insert({
    user_id: userId,
    status: "paid",
    provider: "neopayment",
    amount_usd: amountUsd,
    plan,
  });
}

async function handlePaymentFailed(
  supabase: ReturnType<typeof createServiceClient>,
  payload: NeopaymentWebhookPayload
) {
  const userId = getPayloadField(payload, "customer_reference") as
    | string
    | undefined;
  if (!userId) return;

  const amountUsd = getPayloadField(payload, "amount_usd") as number | undefined;
  const plan = getPayloadField(payload, "plan") as string | undefined;

  // Período de gracia de 3 días: no revocar acceso inmediatamente
  await supabase
    .from("profiles")
    .update({ subscription_status: "past_due" })
    .eq("id", userId);

  await supabase
    .from("subscriptions")
    .update({ status: "past_due" })
    .eq("user_id", userId)
    .eq("status", "active");

  await supabase.from("payments").insert({
    user_id: userId,
    status: "failed",
    provider: "neopayment",
    amount_usd: amountUsd,
    plan,
  });
}

async function handlePaymentRefunded(
  supabase: ReturnType<typeof createServiceClient>,
  payload: NeopaymentWebhookPayload
) {
  const userId = getPayloadField(payload, "customer_reference") as
    | string
    | undefined;
  if (!userId) return;

  await supabase
    .from("profiles")
    .update({ is_premium: false, subscription_status: "cancelled" })
    .eq("id", userId);

  await supabase
    .from("subscriptions")
    .update({ status: "cancelled" })
    .eq("user_id", userId)
    .eq("status", "active");
}

async function handleSubscriptionCancelled(
  supabase: ReturnType<typeof createServiceClient>,
  payload: NeopaymentWebhookPayload
) {
  const userId = getPayloadField(payload, "customer_reference") as
    | string
    | undefined;
  if (!userId) return;

  await supabase
    .from("profiles")
    .update({ subscription_status: "cancelled" })
    .eq("id", userId);

  // Mantener is_premium = true hasta current_period_end
  // TODO: crear cron job que revoque acceso al vencer el período

  await supabase
    .from("subscriptions")
    .update({ status: "cancelled" })
    .eq("user_id", userId)
    .eq("status", "active");
}

export async function POST(request: Request) {
  const secret = process.env.NEOPAYMENT_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Webhook secret no configurado." },
      { status: 500 }
    );
  }

  const signature = request.headers.get("x-neopayment-signature");
  if (!signature) {
    return NextResponse.json({ error: "Firma no proporcionada." }, { status: 401 });
  }

  const rawBody = await request.text();

  if (!verifyNeopaymentSignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: "Firma inválida." }, { status: 401 });
  }

  let payload: NeopaymentWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as NeopaymentWebhookPayload;
  } catch {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  const supabase = createServiceClient();

  try {
    switch (payload.event) {
      case "payment.success":
        await handlePaymentSuccess(supabase, payload);
        break;
      case "payment.failed":
        await handlePaymentFailed(supabase, payload);
        break;
      case "payment.refunded":
        await handlePaymentRefunded(supabase, payload);
        break;
      case "subscription.cancelled":
        await handleSubscriptionCancelled(supabase, payload);
        break;
      default:
        break;
    }
  } catch (error) {
    console.error("neopayment webhook error:", error);
    return NextResponse.json(
      { error: "Error al procesar el webhook." },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
