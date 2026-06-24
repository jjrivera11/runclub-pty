export const POINTS = {
  day_completed: 10,
  week_completed: 50,
  streak_7: 30,
  streak_30: 100,
  share_card: 20,
  referral_registered: 75,
  profile_complete: 50,
} as const;

export type PointEvent = keyof typeof POINTS;

export async function logPointEvent(
  supabase: ReturnType<typeof import("@/lib/supabase/client").createClient>,
  userId: string,
  event: PointEvent,
  metadata: Record<string, unknown> = {}
): Promise<boolean> {
  const { error } = await supabase.from("points_log").insert({
    user_id: userId,
    event_type: event,
    points: POINTS[event],
    metadata,
  });
  if (error) {
    console.error("logPointEvent error:", event, error);
    return false;
  }
  return true;
}

// Verificar si ya se registró un evento único (profile_complete, referral, etc.)
export async function hasLoggedEvent(
  supabase: ReturnType<typeof import("@/lib/supabase/client").createClient>,
  userId: string,
  event: PointEvent,
  withinDays?: number
): Promise<boolean> {
  let query = supabase
    .from("points_log")
    .select("id")
    .eq("user_id", userId)
    .eq("event_type", event);

  if (withinDays) {
    const since = new Date();
    since.setDate(since.getDate() - withinDays);
    query = query.gte("created_at", since.toISOString());
  }

  const { data } = await query.limit(1);
  return (data?.length ?? 0) > 0;
}
