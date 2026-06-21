import { createServiceClient } from "@/lib/supabase/server";

export async function logError({
  userId,
  route,
  error,
  context,
}: {
  userId?: string;
  route: string;
  error: unknown;
  context?: Record<string, unknown>;
}) {
  try {
    const supabase = createServiceClient();
    const message = error instanceof Error ? error.message : String(error);
    await supabase.from("error_logs").insert({
      user_id: userId ?? null,
      route,
      error_message: message,
      context: context ?? null,
    });
  } catch {
    // No lanzar error si el logging falla
    console.error("Logger failed:", error);
  }
}
