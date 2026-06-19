"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface PlanCompletionScreenProps {
  planId: string;
  track: string;
  raceName: string;
  totalWeeks: number;
  completionPercent: number;
  streak: number;
  pesoInicial: number;
  onDismiss?: () => void;
}

interface CoachMessage {
  message: string;
  badge: string;
}

function getBadge(track: string, completionPercent: number, raceName: string): string {
  if (track === "transformacion") {
    if (completionPercent >= 90) return "Guerrero de Transformacion";
    if (completionPercent >= 70) return "Atleta en Progreso";
    return "Iniciado en el Camino";
  }
  if (raceName.toLowerCase().includes("21") || raceName.toLowerCase().includes("media")) return "Medio Maratonista";
  if (raceName.toLowerCase().includes("10")) return "Corredor de 10K";
  if (completionPercent >= 90) return "Corredor Dedicado";
  return "Corredor de RunClub Panama";
}

function getCoachMessage(track: string, completionPercent: number, streak: number): string {
  if (completionPercent >= 90) {
    return track === "transformacion"
      ? "Completaste mas del 90% de tu plan. Esa consistencia es lo que produce resultados reales. Tu cuerpo cambio porque tu mente no se rindio."
      : "Completaste mas del 90% de tu plan de entrenamiento. En Panama, donde el calor y la humedad ponen a prueba a cualquiera, eso dice mucho de ti.";
  }
  if (completionPercent >= 70) {
    return "Completaste " + completionPercent + "% de tu plan. La vida pasa y los planes se ajustan — lo importante es que seguiste moviendote. Eso cuenta.";
  }
  return "Cada sesion que completaste fue un paso adelante. El progreso no siempre es lineal, pero seguiste en el camino. Eso es lo que importa.";
}

export function PlanCompletionScreen({
  planId,
  track,
  raceName,
  totalWeeks,
  completionPercent,
  streak,
  pesoInicial,
  onDismiss,
}: PlanCompletionScreenProps) {
  const router = useRouter();
  const [totalKm, setTotalKm] = useState(0);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);
  const [pesoFinal, setPesoFinal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [upcomingRaces, setUpcomingRaces] = useState<{ id: string; name: string; race_date: string; distance_km: number }[]>([]);
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: progress } = await supabase
        .from("plan_progress")
        .select("completed")
        .eq("plan_id", planId);

      const { data: plan } = await supabase
        .from("training_plans")
        .select("plan_json, total_weeks")
        .eq("id", planId)
        .single();

      if (plan) {
        const semanas = plan.plan_json?.semanas ?? [];
        let km = 0;
        let total = 0;
        for (const s of semanas) {
          for (const d of s.dias) {
            total++;
            km += d.distancia_km ?? 0;
          }
        }
        setTotalKm(Math.round(km));
        setTotalSessions(total);
      }

      const completed = (progress ?? []).filter((p: { completed: boolean }) => p.completed).length;
      setSessionsCompleted(completed);

      if (track === "transformacion") {
        const { data: lastCheckin } = await supabase
          .from("weekly_checkins")
          .select("peso_lbs")
          .eq("plan_id", planId)
          .not("peso_lbs", "is", null)
          .order("week_number", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (lastCheckin?.peso_lbs) setPesoFinal(lastCheckin.peso_lbs);
      }

      const supabase2 = createClient();
      const today2 = new Date().toISOString().split("T")[0];
      const { data: races } = await supabase2
        .from("races")
        .select("id, name, race_date, distance_km")
        .eq("is_active", true)
        .gte("race_date", today2)
        .order("race_date")
        .limit(3);
      setUpcomingRaces(races ?? []);

      setLoading(false);
      setTimeout(() => setShow(true), 100);
    }
    load();
  }, [planId, track]);

  useEffect(() => {
    if (!show) return;
    async function markCelebrated() {
      const supabase = createClient();
      await supabase
        .from("training_plans")
        .update({ completion_celebrated: true })
        .eq("id", planId);
    }
    markCelebrated();
  }, [show, planId]);

  if (loading) return null;

  const badge = getBadge(track, completionPercent, raceName);
  const coachMessage = getCoachMessage(track, completionPercent, streak);
  const lbsPerdidas = pesoInicial > 0 && pesoFinal > 0 ? (pesoInicial - pesoFinal).toFixed(1) : null;

  return (
    <div
      className={"fixed inset-0 z-50 flex flex-col items-center justify-center px-6 transition-opacity duration-700 " + (show ? "opacity-100" : "opacity-0")}
      style={{ background: "#1B1C1E" }}
    >
      <div className="w-full max-w-sm space-y-6 text-center">
        <div>
          <img src="/logo.svg" alt="RunClub Panama" className="h-16 mx-auto mb-4" />
          <div className="inline-block rounded-full border border-[#F16823] px-4 py-1 text-xs font-semibold text-[#F16823] mb-3">
            {badge}
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Plan completado</h1>
          <p className="text-sm text-[#B8B8B8]">{totalWeeks} semanas de entrenamiento en Panama</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-[#2a2b2d] border border-[#707070] p-4">
            <p className="text-2xl font-bold text-[#F16823]">{completionPercent}%</p>
            <p className="text-xs text-[#B8B8B8] mt-1">Consistencia</p>
          </div>
          <div className="rounded-xl bg-[#2a2b2d] border border-[#707070] p-4">
            <p className="text-2xl font-bold text-[#F16823]">{sessionsCompleted}</p>
            <p className="text-xs text-[#B8B8B8] mt-1">Sesiones completadas</p>
          </div>
          <div className="rounded-xl bg-[#2a2b2d] border border-[#707070] p-4">
            <p className="text-2xl font-bold text-[#F16823]">{streak}</p>
            <p className="text-xs text-[#B8B8B8] mt-1">Racha maxima</p>
          </div>
          <div className="rounded-xl bg-[#2a2b2d] border border-[#707070] p-4">
            {track === "transformacion" && lbsPerdidas ? (
              <>
                <p className="text-2xl font-bold text-green-400">{lbsPerdidas} lbs</p>
                <p className="text-xs text-[#B8B8B8] mt-1">Perdidas</p>
              </>
            ) : (
              <>
                <p className="text-2xl font-bold text-[#F16823]">{totalKm}</p>
                <p className="text-xs text-[#B8B8B8] mt-1">km totales</p>
              </>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-[#F16823]/30 bg-[#F16823]/5 p-4 text-left">
          <p className="text-xs font-semibold text-[#F16823] mb-2">Coach JJ dice:</p>
          <p className="text-sm text-white leading-relaxed">{coachMessage}</p>
        </div>

        {!showOptions ? (
          <div className="space-y-3">
            <button
              onClick={() => setShowOptions(true)}
              className="w-full rounded-lg bg-[#F16823] px-4 py-3 text-sm font-medium text-white hover:opacity-90 transition-opacity"
            >
              Siguiente reto
            </button>
            <button
              onClick={() => { setShow(false); onDismiss?.(); }}
              className="w-full rounded-lg border border-[#707070] px-4 py-3 text-sm text-[#B8B8B8] hover:text-white transition-colors"
            >
              Ver mi dashboard
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-[#B8B8B8] text-center">Elige tu proximo objetivo</p>

            {upcomingRaces.map((r) => {
              const [ry, rm, rd] = r.race_date.split("-").map(Number);
              const days = Math.ceil((new Date(ry, rm - 1, rd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              return (
                <button
                  key={r.id}
                  onClick={() => router.push("/onboarding?carrera=" + r.id)}
                  className="w-full rounded-lg border border-[#707070] bg-[#2a2b2d] px-4 py-3 text-left hover:border-[#F16823] transition-colors"
                >
                  <p className="text-sm font-medium text-white">{r.name}</p>
                  <p className="text-xs text-[#B8B8B8]">{r.distance_km}km · en {Math.ceil(days / 7)} semanas</p>
                </button>
              );
            })}

            <button
              onClick={() => router.push("/onboarding")}
              className="w-full rounded-lg border border-[#707070] px-4 py-3 text-sm text-[#B8B8B8] hover:text-white transition-colors"
            >
              Tengo otra carrera en mente
            </button>

            <button
              onClick={() => router.push("/onboarding?tipo=mantenimiento")}
              className="w-full rounded-lg border border-[#707070] px-4 py-3 text-sm text-[#B8B8B8] hover:text-white transition-colors"
            >
              Solo quiero mantenerme en forma
            </button>

            <button
              onClick={() => { setShow(false); onDismiss?.(); }}
              className="text-xs text-[#B8B8B8]/60 hover:text-[#B8B8B8] transition-colors w-full text-center py-1"
            >
              Ahora no
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
