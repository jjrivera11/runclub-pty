"use client";

import { useCallback, useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BannerAd } from "@/components/BannerAd";
import { RunClubLogo } from "@/components/RunClubLogo";

const RUNNER_STEPS = [
  { pct: 5,  label: "Analizando tu perfil de corredor..." },
  { pct: 18, label: "Evaluando tu nivel actual..." },
  { pct: 32, label: "Calculando semanas hasta la carrera..." },
  { pct: 47, label: "Diseñando tus sesiones de carrera..." },
  { pct: 61, label: "Ajustando ritmos y zonas..." },
  { pct: 74, label: "Incorporando días de descanso activo..." },
  { pct: 85, label: "Aplicando progresión de volumen..." },
  { pct: 93, label: "Finalizando tu plan de carrera..." },
];

const TRANSFORMACION_STEPS = [
  { pct: 5,  label: "Analizando tu objetivo de transformación..." },
  { pct: 18, label: "Evaluando tu nivel de condición física..." },
  { pct: 32, label: "Calculando tu déficit calórico óptimo..." },
  { pct: 47, label: "Diseñando tus sesiones de fuerza y cardio..." },
  { pct: 61, label: "Ajustando intensidad según tu experiencia..." },
  { pct: 74, label: "Balanceando días de entrenamiento y descanso..." },
  { pct: 85, label: "Estructurando la progresión semanal..." },
  { pct: 93, label: "Finalizando tu plan de transformación..." },
];

const TOTAL_MS = 90000;

function GeneratingPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const track = searchParams.get("track") ?? "runner";
  const STEPS = track === "transformacion" ? TRANSFORMACION_STEPS : RUNNER_STEPS;
  const [pct, setPct] = useState(0);
  const [msg, setMsg] = useState(STEPS[0].label);
  const [fadeMsg, setFadeMsg] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const hasStarted = useRef(false);

  // Bloquear navegación mientras se genera el plan
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (pct < 100) {
        e.preventDefault();
        e.returnValue = "Tu plan se está generando. ¿Seguro que quieres salir?";
        return e.returnValue;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [pct]);

  const generatePlan = useCallback(async () => {
    setError(null);
    setRetrying(true);
    try {
      const response = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "No se pudo generar tu plan. Intenta de nuevo.");
      }
      setPct(100);
      setMsg("¡Tus primeras semanas están listas!");
      setTimeout(() => {
        router.push("/dashboard");
      }, 800);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "No se pudo generar tu plan. Intenta de nuevo.";
      if (msg.includes("onboarding")) {
        router.push("/onboarding");
        return;
      }
      setError(msg);
      setRetrying(false);
    }
  }, [router]);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    let stepIndex = 0;
    function scheduleNext() {
      if (stepIndex >= STEPS.length) return;
      const step = STEPS[stepIndex];
      const delay =
        stepIndex === 0
          ? 800
          : ((step.pct - STEPS[stepIndex - 1].pct) / 100) * TOTAL_MS;
      setTimeout(() => {
        setFadeMsg(false);
        setTimeout(() => {
          setMsg(step.label);
          setPct(step.pct);
          setFadeMsg(true);
        }, 300);
        stepIndex++;
        scheduleNext();
      }, delay);
    }
    scheduleNext();
    generatePlan();
  }, [generatePlan]);

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center px-6"
      style={{ background: "#1B1C1E" }}
    >
      <div className="mb-12">
        <RunClubLogo size="lg" />
      </div>

      {error ? (
        <div className="w-full max-w-sm space-y-6 text-center">
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </p>
          <button
            type="button"
            onClick={generatePlan}
            disabled={retrying}
            className="rounded-lg bg-[#F16823] px-6 py-3 font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {retrying ? "Generando..." : "Intentar de nuevo"}
          </button>
        </div>
      ) : (
        <div className="w-full max-w-sm">
          <div className="mb-3 flex items-baseline justify-between">
            <span
              className="text-base text-white transition-opacity duration-300"
              style={{ opacity: fadeMsg ? 1 : 0 }}
            >
              {msg}
            </span>
            <span
              className="text-2xl font-semibold tabular-nums"
              style={{ color: "#F16823" }}
            >
              {pct}%
            </span>
          </div>

          <div
            className="h-2 overflow-hidden rounded-full"
            style={{ background: "#2a2b2d", border: "1px solid #707070" }}
          >
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${pct}%`, background: "#F16823" }}
            />
          </div>
        </div>
      )}

      <p
        className="mt-12 max-w-xs text-center text-xs leading-relaxed"
        style={{ color: "#A3A3A3" }}
      >
        Estamos generando tu plan personalizado con IA.
        <br />
        Esto toma aproximadamente 90 segundos.
      </p>

      {pct < 100 && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-[#F16823]/30 bg-[#F16823]/10 px-4 py-3 max-w-xs">
          <span className="text-sm">⚠️</span>
          <p className="text-xs text-[#F16823]">
            No cierres esta página mientras se genera tu plan.
          </p>
        </div>
      )}

      <div className="mt-8 w-full max-w-sm">
        <BannerAd placement="generating" isPremium={false} />
      </div>
    </main>
  );
}

export default function GeneratingPage() {
  return (
    <Suspense fallback={
      <main className="flex min-h-screen flex-col items-center justify-center px-6" style={{ background: "#1B1C1E" }}>
        <div className="mb-12">
          <img src="/logo.svg" alt="RunClub Panama" style={{ height: 72 }} />
        </div>
        <div className="w-full max-w-sm">
          <div className="h-2 overflow-hidden rounded-full" style={{ background: "#2a2b2d", border: "1px solid #707070" }}>
            <div className="h-full rounded-full" style={{ width: "0%", background: "#F16823" }} />
          </div>
        </div>
      </main>
    }>
      <GeneratingPageInner />
    </Suspense>
  );
}
