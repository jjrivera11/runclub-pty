"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { DayProgress, PlanJson, TrainingPlan } from "@/types/plan";

function getCurrentWeekNumber(generatedAt: string, totalWeeks: number): number {
  const start = new Date(generatedAt);
  start.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.floor(
    (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );
  const week = Math.floor(diffDays / 7) + 1;
  return Math.min(Math.max(1, week), totalWeeks);
}

function calculateStreak(progress: DayProgress[]): number {
  const completedDates = progress
    .filter((entry) => entry.completed && entry.logged_at)
    .map((entry) => {
      const date = new Date(entry.logged_at!);
      date.setHours(0, 0, 0, 0);
      return date.getTime();
    });

  const uniqueDates = new Set(completedDates);
  if (uniqueDates.size === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const oneDayMs = 1000 * 60 * 60 * 24;

  let checkDate = uniqueDates.has(today.getTime())
    ? today.getTime()
    : today.getTime() - oneDayMs;

  if (!uniqueDates.has(checkDate)) return 0;

  let streak = 0;
  while (uniqueDates.has(checkDate)) {
    streak++;
    checkDate -= oneDayMs;
  }

  return streak;
}

function countTotalPlanDays(planJson: PlanJson): number {
  return planJson.semanas.reduce((total, week) => total + week.dias.length, 0);
}

export function usePlan() {
  const [plan, setPlan] = useState<TrainingPlan | null>(null);
  const [progress, setProgress] = useState<DayProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPlan = useCallback(async () => {
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("No hay sesión activa.");
      setLoading(false);
      return;
    }

    const { data: planData, error: planError } = await supabase
      .from("training_plans")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .maybeSingle();

    if (planError) {
      window.location.href = "/onboarding";
      return;
      setLoading(false);
      return;
    }

    if (!planData) {
      setPlan(null);
      setProgress([]);
      setLoading(false);
      return;
    }

    const activePlan = planData as TrainingPlan;

    const { data: progressData, error: progressError } = await supabase
      .from("plan_progress")
      .select("*")
      .eq("plan_id", activePlan.id);

    if (progressError) {
      setError("No se pudo cargar tu progreso.");
      setLoading(false);
      return;
    }

    setPlan(activePlan);
    setProgress((progressData as DayProgress[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadPlan();
  }, [loadPlan]);

  const totalWeeks = plan?.total_weeks ?? plan?.plan_json.semanas.length ?? 0;

  const currentWeek = useMemo(() => {
    if (!plan) return 1;
    return getCurrentWeekNumber(plan.generated_at, totalWeeks);
  }, [plan, totalWeeks]);

  const streak = useMemo(() => calculateStreak(progress), [progress]);

  const completionPercent = useMemo(() => {
    if (!plan) return 0;
    const totalDays = countTotalPlanDays(plan.plan_json);
    if (totalDays === 0) return 0;
    const completedDays = progress.filter((entry) => entry.completed).length;
    return Math.round((completedDays / totalDays) * 100);
  }, [plan, progress]);

  const toggleDay = useCallback(
    async (weekNumber: number, dayName: string, sessionData?: { actualDistanceKm?: number; actualDurationMin?: number; effortLevel?: number }) => {
      if (!plan) return;

      const existing = progress.find(
        (entry) =>
          entry.week_number === weekNumber && entry.day_name === dayName
      );
      const newCompleted = !existing?.completed;
      const previousProgress = progress;

      const optimisticEntry: DayProgress = {
        id: existing?.id ?? `temp-${weekNumber}-${dayName}`,
        plan_id: plan.id,
        week_number: weekNumber,
        day_name: dayName,
        completed: newCompleted,
        notes: existing?.notes ?? null,
        logged_at: newCompleted ? new Date().toISOString() : null,
      };

      setProgress((prev) => {
        const index = prev.findIndex(
          (entry) =>
            entry.week_number === weekNumber && entry.day_name === dayName
        );
        if (index >= 0) {
          return prev.map((entry, i) =>
            i === index ? optimisticEntry : entry
          );
        }
        return [...prev, optimisticEntry];
      });

      const supabase = createClient();
      const { data, error: upsertError } = await supabase
        .from("plan_progress")
        .upsert(
          {
            plan_id: plan.id,
            user_id: plan.user_id,
            week_number: weekNumber,
            day_name: dayName,
            completed: newCompleted,
            logged_at: newCompleted ? new Date().toISOString() : null,
            ...(newCompleted && sessionData ? {
              actual_distance_km: sessionData.actualDistanceKm ?? null,
              actual_duration_min: sessionData.actualDurationMin ?? null,
              effort_level: sessionData.effortLevel ?? null,
            } : {}),
          },
          { onConflict: "plan_id,week_number,day_name" }
        )
        .select()
        .single();

      if (upsertError) {
        setProgress(previousProgress);
        setError("No se pudo guardar el progreso. Intenta de nuevo.");
        return;
      }

      if (data) {
        setProgress((prev) => {
          const index = prev.findIndex(
            (entry) =>
              entry.week_number === weekNumber && entry.day_name === dayName
          );
          const saved = data as DayProgress;
          if (index >= 0) {
            return prev.map((entry, i) => (i === index ? saved : entry));
          }
          return [...prev, saved];
        });
      }
    },
    [plan, progress]
  );

  const semanasGeneradas = plan?.semanas_generadas ?? plan?.plan_json.semanas.length ?? 0;

  return {
    plan,
    currentWeek,
    progress,
    loading,
    error,
    toggleDay,
    streak,
    completionPercent,
    reload: loadPlan,
    semanasGeneradas,
    totalWeeks,
  };
}
