"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface AdaptationPromptProps {
  planId: string;
  weekNumber: number;
  completedDays: number;
  totalDays: number;
  prevWeekCompleted?: number;
  prevWeekTotal?: number;
}

export function AdaptationPrompt({
  planId,
  weekNumber,
  completedDays,
  totalDays,
  prevWeekCompleted,
  prevWeekTotal,
}: AdaptationPromptProps) {
  const [show, setShow] = useState(false);
  const [type, setType] = useState<"difficult" | "excellent" | null>(null);
  const [responded, setResponded] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (totalDays === 0 || responded) return;
    const pct = completedDays / totalDays;
    const prevPct = prevWeekTotal ? (prevWeekCompleted ?? 0) / prevWeekTotal : null;
    if (pct < 0.5 && completedDays > 0) {
      setType("difficult");
      setShow(true);
    } else if (pct === 1 && prevPct === 1) {
      setType("excellent");
      setShow(true);
    }
  }, [completedDays, totalDays, prevWeekCompleted, prevWeekTotal, responded]);

  async function handleResponse(accept: boolean) {
    setLoading(true);
    const supabase = createClient();
    const note = accept
      ? type === "difficult"
        ? "semana_" + weekNumber + ":reducir_volumen"
        : "semana_" + weekNumber + ":aumentar_intensidad"
      : "semana_" + weekNumber + ":sin_cambios";
    await supabase
      .from("training_plans")
      .update({ pending_adaptation: note })
      .eq("id", planId);
    setLoading(false);
    setResponded(true);
    setShow(false);
  }

  if (responded) {
    return (
      <div className="rounded-xl border border-green-500/30 bg-green-500/5 px-4 py-3 flex items-center gap-3">
        <span className="text-lg">OK</span>
        <p className="text-sm text-green-400">
          Tu solicitud fue registrada. El proximo bloque se ajustara automaticamente.
        </p>
      </div>
    );
  }

  if (!show) return null;

  const isDifficult = type === "difficult";

  return (
    <div className="rounded-xl border border-[#F16823]/40 bg-[#F16823]/5 p-4 space-y-3">
      <div className="flex items-start gap-3">
        <span className="text-2xl">{isDifficult ? "💪" : "🔥"}</span>
        <div>
          <p className="text-smt-semibold text-white">
            {isDifficult
              ? "Coach JJ: noto que la semana " + weekNumber + " fue retadora"
              : "Coach JJ: llevas dos semanas completando el 100%"}
          </p>
          <p className="text-xs text-[#B8B8B8] mt-1 leading-relaxed">
            {isDifficult
              ? "Completaste " + completedDays + " de " + totalDays + " sesiones. Puedo reducir el volumen de tu proximo bloque un 20%."
              : "Estas respondiendo muy bien. Puedo aumentar la intensidad de tu proximo bloque un 10-15%."}
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => handleResponse(true)}
          disabled={loading}
          className="flex-1 rounded-lg bg-[#F16823] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {isDifficult ? "Si, ajusta mi plan" : "Si, subeme la intensidad"}
        </button>
        <button
          onClick={() => handleResponse(false)}
          disabled={loading}
          className="flex-1 rounded-lg border border-[#707070] px-4 py-2 text-sm text-[#B8B8B8] hover:text-white transition-colors disabled:opacity-50"
        >
          No, sigo igual
        </button>
      </div>
    </div>
  );
}
