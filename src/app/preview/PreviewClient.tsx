"use client";

import { useRouter } from "next/navigation";
import { BannerAd } from "@/components/BannerAd";
import { RunClubLogo } from "@/components/RunClubLogo";
import type { PlanDay, PlanWeek, TrainingPlan } from "@/types/plan";

const WEEK_BADGE_STYLES: Record<string, string> = {
  base: "bg-[#374151] text-gray-300",
  construccion: "bg-[#1e3a5f] text-blue-200",
  pico: "bg-[#7c2d12] text-[#F16823]",
  recuperacion: "bg-[#065F46] text-[#10B981]",
  tapering: "bg-[#3b0764] text-purple-200",
};

function formatDayMeta(day: PlanDay): string {
  const parts: string[] = [];
  if (day.distancia_km != null && day.distancia_km > 0) {
    parts.push(`${day.distancia_km} km`);
  }
  if (day.duracion_min != null && day.duracion_min > 0) {
    parts.push(`${day.duracion_min} min`);
  }
  return parts.join(" · ");
}

function PreviewDayRow({ day }: { day: PlanDay }) {
  return (
    <div className="rounded-lg border border-[#707070]/40 bg-[#1B1C1E] px-4 py-3">
      <p className="font-medium text-white">{day.titulo}</p>
      <p className="mt-0.5 text-sm text-[#B8B8B8]">
        {day.tipo_sesion}
        {formatDayMeta(day) ? ` · ${formatDayMeta(day)}` : ""}
      </p>
      <p className="mt-2 text-sm text-white">{day.descripcion}</p>
      {day.notas_locales && (
        <p className="mt-2 text-sm italic text-[#B8B8B8]">
          {day.notas_locales}
        </p>
      )}
    </div>
  );
}

function PreviewWeekCard({
  week,
  highlighted = false,
}: {
  week: PlanWeek;
  highlighted?: boolean;
}) {
  const badgeStyle = WEEK_BADGE_STYLES[week.tipo] ?? WEEK_BADGE_STYLES.base;

  return (
    <div
      className={`rounded-xl border border-[#707070] bg-[#2a2b2d] p-5 ${
        highlighted ? "border-t-4 border-t-[#F16823]" : ""
      }`}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-white">{week.nombre}</h2>
          <p className="text-sm text-[#B8B8B8]">
            {week.volumen_total_km} km totales
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${badgeStyle}`}
        >
          {week.tipo}
        </span>
      </div>
      <div className="space-y-2">
        {week.dias.map((day) => (
          <PreviewDayRow key={day.dia} day={day} />
        ))}
      </div>
    </div>
  );
}

function BlockedWeekCard({ week }: { week: PlanWeek }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-[#707070] bg-[#2a2b2d]">
      <div className="pointer-events-none blur-[4px]">
        <PreviewWeekCard week={week} />
      </div>
      <div
        className="absolute inset-0 flex flex-col items-center justify-center"
        style={{ backgroundColor: "rgba(27, 28, 30, 0.85)" }}
      >
        <span className="text-3xl">🔒</span>
        <p className="mt-2 text-sm font-medium text-white">
          Semana {week.numero} — Bloqueada
        </p>
      </div>
    </div>
  );
}

interface PreviewClientProps {
  plan: TrainingPlan;
}

export default function PreviewClient({ plan }: PreviewClientProps) {
  const router = useRouter();
  const { resumen, semanas } = plan.plan_json;

  const weekOne = semanas.find((week) => week.numero === 1) ?? semanas[0];
  const blockedWeeks = semanas
    .filter((week) => week.numero > 1)
    .slice(0, 3);

  return (
    <div className="min-h-full bg-[#1B1C1E] text-white">
      <nav className="fixed inset-x-0 top-0 z-40 border-b border-[#707070]/30 bg-[#1B1C1E]">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <RunClubLogo size="sm" showText={false} />
            <span className="rounded-full bg-[#2a2b2d] px-2.5 py-0.5 text-xs text-[#B8B8B8]">
              Vista previa
            </span>
          </div>
          <form action="/auth/signout" method="POST">
            <button
              type="submit"
              className="text-sm text-[#B8B8B8] transition-colors hover:text-white"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-4 pb-40 pt-24">
        <section className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-white">{resumen.titulo}</h2>
          <p className="mt-2 text-[#B8B8B8]">
            Tu plan personalizado está listo
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <span className="rounded-full border border-[#707070] bg-[#2a2b2d] px-4 py-2 text-sm text-white">
              {resumen.duracion_semanas} semanas
            </span>
            <span className="rounded-full border border-[#707070] bg-[#2a2b2d] px-4 py-2 text-sm text-white">
              {resumen.volumen_inicial_km} km inicial
            </span>
            <span className="rounded-full border border-[#707070] bg-[#2a2b2d] px-4 py-2 text-sm text-white">
              {resumen.carrera}
            </span>
          </div>
        </section>

        {weekOne && (
          <section className="mb-6">
            <PreviewWeekCard week={weekOne} highlighted />
          </section>
        )}

        {blockedWeeks.length > 0 && (
          <section className="space-y-6">
            {blockedWeeks.map((week) => (
              <BlockedWeekCard key={week.numero} week={week} />
            ))}
          </section>
        )}

        <div className="mt-8">
          <BannerAd placement="preview" isPremium={false} />
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[#F16823] bg-[#1B1C1E]">
        <div className="mx-auto flex max-w-3xl flex-col items-start justify-between gap-4 px-4 py-4 sm:flex-row sm:items-center">
          <div>
            <p className="font-medium text-white">
              Desbloquea tu plan completo
            </p>
            <p className="text-sm text-[#B8B8B8]">
              Acceso ilimitado a todas las semanas y seguimiento de progreso
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/pricing")}
            className="shrink-0 rounded-lg bg-[#F16823] px-5 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Comenzar por $12/mes
          </button>
        </div>
      </div>
    </div>
  );
}
