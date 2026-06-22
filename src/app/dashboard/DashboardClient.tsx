"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePlan } from "@/lib/hooks/usePlan";
import { BannerAd } from "@/components/BannerAd";
import { RunClubLogo } from "@/components/RunClubLogo";
import { ReferralCard } from "@/components/ReferralCard";
import { PartnerSection } from "@/components/PartnerSection";
import { PartnerIncomingRequests } from "@/components/PartnerIncomingRequests";
import { WeeklyCheckin } from "@/components/WeeklyCheckin";
import { ProgressChart } from "@/components/ProgressChart";
import { PanamaContext } from "@/components/PanamaContext";
import { SessionCompleteModal } from "@/components/SessionCompleteModal";
import { PlanCompletionScreen } from "@/components/PlanCompletionScreen";
import { TrialBanner } from "@/components/TrialBanner";
import { CalendarExportModal } from "@/components/CalendarExportModal";
import type { DayProgress, PlanDay, PlanWeek, TrainingPlan } from "@/types/plan";

type WeekBadgeType =
  | "base"
  | "construccion"
  | "pico"
  | "recuperacion"
  | "tapering"
  | string;

const WEEK_BADGE_STYLES: Record<string, string> = {
  base: "bg-[#374151] text-gray-300",
  construccion: "bg-[#1e3a5f] text-blue-200",
  pico: "bg-[#7c2d12] text-[#F16823]",
  recuperacion: "bg-[#065F46] text-[#10B981]",
  tapering: "bg-[#3b0764] text-purple-200",
};

function isDayCompleted(
  weekNumber: number,
  dayName: string,
  progress: DayProgress[]
): boolean {
  return progress.some(
    (entry) =>
      entry.week_number === weekNumber &&
      entry.day_name === dayName &&
      entry.completed
  );
}

function isWeekComplete(week: PlanWeek, progress: DayProgress[]): boolean {
  if (week.dias.length === 0) return false;
  return week.dias.every((day) =>
    isDayCompleted(week.numero, day.dia, progress)
  );
}

function getWeekProgressCounts(
  week: PlanWeek,
  progress: DayProgress[]
): { completed: number; total: number } {
  const total = week.dias.length;
  const completed = week.dias.filter((day) =>
    isDayCompleted(week.numero, day.dia, progress)
  ).length;
  return { completed, total };
}

function getWeekVolumeCompleted(
  week: PlanWeek,
  progress: DayProgress[]
): number {
  return week.dias.reduce((sum, day) => {
    if (!isDayCompleted(week.numero, day.dia, progress)) return sum;
    return sum + (day.distancia_km ?? 0);
  }, 0);
}

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

function formatDaySubtitle(day: PlanDay): string {
  const parts: string[] = [day.tipo_sesion];
  const meta = formatDayMeta(day);
  if (meta) parts.push(meta);
  return parts.join(" · ");
}

const DAY_OFFSET: Record<string, number> = {
  Lunes: 0,
  Martes: 1,
  Miércoles: 2,
  Miercoles: 2,
  Jueves: 3,
  Viernes: 4,
  Sábado: 5,
  Sabado: 5,
  Domingo: 6,
};

function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function formatIcsDate(date: Date): string {
  const pad = (value: number) => value.toString().padStart(2, "0");
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

function getSessionDate(
  generatedAt: string,
  weekNumber: number,
  dayName: string
): Date {
  const planStart = new Date(generatedAt);
  planStart.setHours(8, 0, 0, 0);
  const dayOfWeek = planStart.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(planStart);
  monday.setDate(planStart.getDate() + mondayOffset);

  const offset = DAY_OFFSET[dayName] ?? 0;
  const sessionDate = new Date(monday);
  sessionDate.setDate(monday.getDate() + (weekNumber - 1) * 7 + offset);
  sessionDate.setHours(8, 0, 0, 0);
  return sessionDate;
}

async function handleDownloadPDF() {
  try {
    const response = await fetch("/api/export-pdf");
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.detail ?? "Error del servidor");
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `plan-runclub-${new Date().toISOString().split("T")[0]}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  } catch (e) {
    alert("No se pudo generar el PDF: " + (e instanceof Error ? e.message : String(e)));
  }
}

function handleExportCalendar(plan: TrainingPlan) {
  const events: string[] = [];

  for (const week of plan.plan_json.semanas) {
    for (const day of week.dias) {
      const start = getSessionDate(plan.generated_at, week.numero, day.dia);
      const duration = day.duracion_min ?? 60;
      const description = [day.descripcion, day.notas_locales]
        .filter(Boolean)
        .join("\n\n");

      events.push(`BEGIN:VEVENT
UID:${plan.id}-w${week.numero}-${day.dia}@runclubpty.com
DTSTART:${formatIcsDate(start)}
DURATION:PT${duration}M
SUMMARY:${escapeIcsText(day.titulo)}
DESCRIPTION:${escapeIcsText(description)}
END:VEVENT`);
    }
  }

  const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//RunClub Panama//Training Plan//ES
CALSCALE:GREGORIAN
METHOD:PUBLISH
${events.join("\n")}
END:VCALENDAR`;

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "plan-runclub-panama.ics";
  link.click();
  URL.revokeObjectURL(url);
}

const exportButtonClass =
  "rounded-lg border border-[#707070] bg-[#2a2b2d] px-3 py-1.5 text-xs text-white transition-colors hover:border-[#F16823] sm:text-sm";

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-[#2a2b2d] ${className ?? ""}`}
    />
  );
}

function LoadingSkeleton() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 pb-12 pt-24">
      <SkeletonBlock className="h-24 w-full" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SkeletonBlock className="h-20" />
        <SkeletonBlock className="h-20" />
        <SkeletonBlock className="h-20" />
        <SkeletonBlock className="h-20" />
      </div>
      <SkeletonBlock className="h-4 w-full" />
      <SkeletonBlock className="h-64 w-full" />
    </div>
  );
}

function StatsBar({
  currentWeek,
  totalWeeks,
  weekCompleted,
  weekTotal,
  weekVolume,
  completionPercent,
  isVerified,
}: {
  currentWeek: number;
  totalWeeks: number;
  weekCompleted: number;
  weekTotal: number;
  weekVolume: number;
  completionPercent: number;
  isVerified?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-lg bg-[#2a2b2d] p-4">
        <p className="text-xs text-[#B8B8B8]">Semana actual</p>
        {isVerified && (
          <span className="inline-flex items-center gap-1 rounded-full border border-[#F16823]/30 bg-[#F16823]/10 px-2 py-0.5 text-xs font-medium text-[#F16823]">
            🏅 Verificado
          </span>
        )}
        <p className="mt-1 text-xl font-semibold text-white">
          {currentWeek}{" "}
          <span className="text-sm font-normal text-[#B8B8B8]">
            / {totalWeeks}
          </span>
        </p>
      </div>
      <div className="rounded-lg bg-[#2a2b2d] p-4">
        <p className="text-xs text-[#B8B8B8]">Esta semana</p>
        <p className="mt-1 text-xl font-semibold text-white">
          {weekCompleted}{" "}
          <span className="text-sm font-normal text-[#B8B8B8]">
            / {weekTotal} días
          </span>
        </p>
      </div>
      <div className="rounded-lg bg-[#2a2b2d] p-4">
        <p className="text-xs text-[#B8B8B8]">Volumen semanal</p>
        <p className="mt-1 text-xl font-semibold text-white">
          {weekVolume.toFixed(1)}{" "}
          <span className="text-sm font-normal text-[#B8B8B8]">km</span>
        </p>
      </div>
      <div className="rounded-lg bg-[#2a2b2d] p-4">
        <p className="text-xs text-[#B8B8B8]">Consistencia</p>
        <p className="mt-1 text-xl font-semibold text-white">
          {completionPercent}%
        </p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#1B1C1E]">
          <div
            className="h-full rounded-full bg-[#F16823] transition-all duration-500"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function PlanProgressBar({
  completionPercent,
  currentWeek,
  totalWeeks,
}: {
  completionPercent: number;
  currentWeek: number;
  totalWeeks: number;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-[#B8B8B8]">
          Progreso del plan:{" "}
          <span className="font-medium text-white">{completionPercent}%</span>
        </span>
        <span className="text-[#B8B8B8]">
          Semana {currentWeek} de {totalWeeks}
        </span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-[#2a2b2d]">
        <div
          className="h-full rounded-full bg-[#F16823] transition-all duration-500 ease-out"
          style={{ width: `${completionPercent}%` }}
        />
      </div>
    </div>
  );
}

function WeekPills({
  weeks,
  selectedWeek,
  currentWeek,
  progress,
  onSelect,
  semanasGeneradas,
  totalWeeks,
}: {
  weeks: PlanWeek[];
  selectedWeek: number;
  currentWeek: number;
  progress: DayProgress[];
  onSelect: (weekNumber: number) => void;
  semanasGeneradas: number;
  totalWeeks: number;
}) {
  const generatedNums = new Set(weeks.map((w) => w.numero));
  const lockedWeeks = Array.from({ length: totalWeeks }, (_, i) => i + 1).filter(
    (n) => !generatedNums.has(n)
  );

  return (
    <div className="flex flex-wrap gap-2">
      {weeks.map((week) => {
        const complete = isWeekComplete(week, progress);
        const counts = getWeekProgressCounts(week, progress);
        const hasPartial = counts.completed > 0 && !complete;
        const isCurrent = week.numero === selectedWeek;
        const isCalendarCurrent = week.numero === currentWeek;

        let pillClass = "border border-[#B8B8B8]/40 bg-transparent text-[#B8B8B8]/40";
        if (complete) pillClass = "border-[#10B981] bg-[#065F46] text-white";
        else if (hasPartial) pillClass = "border-[#707070] bg-[#2a2b2d] text-white";

        if (isCurrent) {
          pillClass = complete
            ? "border-[#F16823] bg-[#065F46] text-white ring-2 ring-[#F16823]"
            : hasPartial
              ? "border-[#F16823] bg-[#2a2b2d] text-[#F16823] ring-2 ring-[#F16823]"
              : "border-[#F16823] bg-transparent text-[#F16823] ring-2 ring-[#F16823]";
        } else if (isCalendarCurrent && !complete && !hasPartial) {
          pillClass = "border-[#F16823] bg-transparent text-[#F16823]";
        }

        return (
          <button
            key={week.numero}
            type="button"
            onClick={() => onSelect(week.numero)}
            className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-medium transition-colors ${pillClass}`}
            aria-label={`Semana ${week.numero}`}
          >
            {complete ? "✓" : week.numero}
          </button>
        );
      })}
      {lockedWeeks.map((n) => (
        <div
          key={`locked-${n}`}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[#707070]/15 bg-[#1B1C1E]/50 cursor-not-allowed"
          title={`Semana ${n} — se generará pronto`}
        >
          <span className="text-[#707070]/20 text-xs">🔒</span>
        </div>
      ))}
    </div>
  );
}

function DayRow({
  weekNumber,
  day,
  completed,
  onToggle,
}: {
  weekNumber: number;
  day: PlanDay;
  completed: boolean;
  onToggle: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`rounded-lg border transition-colors ${
        completed
          ? "border-l-4 border-l-[#F16823] border-[#707070]/20 bg-[#2a2b2d]/60"
          : "border-[#707070]/40 bg-[#2a2b2d]"
      }`}
    >
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <span
          role="checkbox"
          aria-checked={completed}
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              e.stopPropagation();
              onToggle();
            }
          }}
          className={`flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded border ${
            completed
              ? "border-[#F16823] bg-[#F16823] text-white"
              : "border-[#707070] bg-transparent"
          }`}
        >
          {completed && (
            <svg
              className="h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-[#B8B8B8]">{day.dia}</p>
          <p className={`font-medium ${completed ? "text-[#B8B8B8] line-through decoration-[#F16823]/50" : "text-white"}`}>{day.titulo}</p>
          <div className="flex items-center gap-2 flex-wrap">
            {day.tipo_sesion === "Test" && (
              <span className="rounded-full bg-purple-600/20 border border-purple-500/40 px-2 py-0.5 text-xs font-semibold text-purple-400">
                Test
              </span>
            )}
            <p className="text-xs text-[#B8B8B8]">
              {day.tipo_sesion !== "Test" ? day.tipo_sesion : ""}
              {day.distancia_km ? ` · ${day.distancia_km} km` : ""}
              {day.duracion_min ? ` · ${day.duracion_min} min` : ""}
            </p>
          </div>
        </div>
        <span className="text-[#B8B8B8]">{expanded ? "▲" : "▼"}</span>
      </button>
      {expanded && (
        <div className="border-t border-[#707070]/30 px-4 pb-4 pt-2">
          <p className="text-sm text-white">{day.descripcion}</p>
          {day.notas_locales && (() => {
            const parts = day.notas_locales.split("|");
            const lugar = parts[0]?.trim() ?? day.notas_locales;
            const terreno = parts[1]?.trim() ?? null;
            return (
              <div className="mt-3 flex items-start gap-2 rounded-lg bg-[#F16823]/10 border border-[#F16823]/20 px-3 py-2">
                <span className="text-sm">📍</span>
                <div>
                  <p className="text-xs text-[#B8B8B8]">
                    <span className="font-semibold text-[#F16823]">Lugar sugerido: </span>
                    {lugar}.
                  </p>
                  {terreno && (
                    <p className="text-xs text-[#B8B8B8] mt-0.5">
                      <span className="font-semibold text-[#B8B8B8]">Terreno: </span>
                      {terreno}
                    </p>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

function WeekCard({
  week,
  progress,
  onToggleDay,
}: {
  week: PlanWeek;
  progress: DayProgress[];
  onToggleDay: (weekNumber: number, dayName: string) => void;
}) {
  const badgeType = week.tipo as WeekBadgeType;
  const badgeStyle =
    WEEK_BADGE_STYLES[badgeType] ?? WEEK_BADGE_STYLES.base;

  return (
    <div className="rounded-xl border border-[#707070]/40 bg-[#2a2b2d] p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-white">{week.nombre}</h2>
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
          <DayRow
            key={day.dia}
            weekNumber={week.numero}
            day={day}
            completed={isDayCompleted(week.numero, day.dia, progress)}
            onToggle={() => onToggleDay(week.numero, day.dia)}
          />
        ))}
      </div>
    </div>
  );
}

function CelebrationToast({
  weekNumber,
  onDismiss,
}: {
  weekNumber: number;
  onDismiss: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="fixed bottom-6 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-lg border border-[#F16823] bg-[#2a2b2d] px-5 py-4 text-center text-white shadow-lg">
      🎉 ¡Semana {weekNumber} completada! Eres increíble.
    </div>
  );
}

function CoachNoteCard({ note }: { note: string }) {
  return (
    <div className="rounded-xl border border-[#F16823]/30 bg-[#F16823]/5 p-4 flex items-start gap-3">
      <span className="text-xl shrink-0">🏃</span>
      <div>
        <p className="text-xs font-semibold text-[#F16823] uppercase tracking-wide mb-1">Nota de Coach JJ</p>
        <p className="text-sm text-white leading-relaxed">{note}</p>
      </div>
    </div>
  );
}

function getGreeting(name: string, sexo?: string | null): string {
  const hour = new Date().toLocaleString("en-US", { timeZone: "America/Panama", hour: "numeric", hour12: false });
  const h = parseInt(hour);
  const firstName = name.split(" ")[0];
  const listo = sexo === "femenino" ? "lista" : sexo === "masculino" ? "listo" : null;
  if (h >= 5 && h < 12) return listo
    ? `Buenos días, ${firstName} — ${listo} para arrancar hoy?`
    : `Buenos días, ${firstName} — ¿arrancamos hoy?`;
  if (h >= 12 && h < 18) return listo
    ? `Buenas tardes, ${firstName} — ¿ya entrenaste hoy?`
    : `Buenas tardes, ${firstName} — ¿ya entrenaste hoy?`;
  if (h >= 18 && h < 23) return `Buenas noches, ${firstName} — revisa tu plan de mañana.`;
  return `Hola, ${firstName} — Coach JJ tiene tu plan listo.`;
}

function TrailPromoBanner({ onDismiss }: { onDismiss: () => void }) {
  const router = useRouter();
  return (
    <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-4 relative">
      <button onClick={onDismiss} className="absolute top-3 right-3 text-[#707070] hover:text-white text-sm">✕</button>
      <p className="text-sm font-semibold text-white mb-1">🏔️ ¿Listo para el siguiente reto?</p>
      <p className="text-xs text-[#B8B8B8] mb-3 leading-relaxed">
        Completaste tu carrera. El trail running es una experiencia completamente diferente — montaña, naturaleza y un reto mayor. Hay carreras trail en Panamá perfectas para empezar.
      </p>
      <button
        onClick={() => router.push("/onboarding")}
        className="rounded-lg bg-green-600 px-4 py-2 text-xs font-medium text-white hover:opacity-90 transition-opacity"
      >
        Explorar trail running →
      </button>
    </div>
  );
}

export default function DashboardClient() {
  const router = useRouter();
  const [isPremium, setIsPremium] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [profile, setProfile] = useState<{ full_name?: string; is_verified?: boolean; trial_ends_at?: string | null; sexo?: string | null } | null>(null);
  const [pesoInicial, setPesoInicial] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showTrailPromo, setShowTrailPromo] = useState(false);
  const [pendingSession, setPendingSession] = useState<{
    weekNumber: number;
    dayName: string;
    title: string;
    tipoSesion?: string;
    distanceKm?: number;
    durationMin?: number;
  } | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  const {
    plan,
    currentWeek,
    progress,
    loading,
    error,
    toggleDay,
    streak,
    completionPercent,
    reload,
    semanasGeneradas,
    totalWeeks: totalWeeksFromHook,
  } = usePlan();

  useEffect(() => {
    async function loadProfile() {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("is_premium, is_verified, full_name, trial_ends_at, sexo, is_trail_promo_dismissed")
        .eq("id", user.id)
        .maybeSingle();
      if (data) {
        setProfile(data);
        setIsPremium(data.is_premium ?? false);
        setIsVerified(data.is_verified ?? false);
      }
      const { data: onboarding } = await supabase
        .from("onboarding_answers")
        .select("peso_lbs")
        .eq("user_id", user.id)
        .maybeSingle();
      if (onboarding?.peso_lbs) setPesoInicial(onboarding.peso_lbs);
      if (data?.is_premium !== undefined) setIsPremium(data.is_premium ?? false);
      if (data?.is_verified !== undefined) setIsVerified(data.is_verified ?? false);
      if (plan?.completion_celebrated === false && completionPercent === 100) {
        setShowCelebration(true);
      }
      if (completionPercent === 100 && !data?.is_trail_promo_dismissed) {
        setShowTrailPromo(true);
      }
    }
    loadProfile();
  }, [plan, completionPercent]);

  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [celebrationWeek, setCelebrationWeek] = useState<number | null>(null);
  const prevWeekCompleteRef = useRef<Record<number, boolean>>({});
  const progressInitializedRef = useRef(false);

  const weeks = plan?.plan_json.semanas ?? [];
  const totalWeeks = totalWeeksFromHook;
  const activeSelectedWeek = selectedWeek ?? currentWeek;

  const currentWeekData = useMemo(
    () => weeks.find((week) => week.numero === currentWeek),
    [weeks, currentWeek]
  );

  const selectedWeekData = useMemo(
    () => weeks.find((week) => week.numero === activeSelectedWeek),
    [weeks, activeSelectedWeek]
  );

  const currentWeekStats = useMemo(() => {
    if (!currentWeekData) return { completed: 0, total: 0, volume: 0 };
    const counts = getWeekProgressCounts(currentWeekData, progress);
    return {
      ...counts,
      volume: getWeekVolumeCompleted(currentWeekData, progress),
    };
  }, [currentWeekData, progress]);

  useEffect(() => {
    if (!plan) return;

    weeks.forEach((week) => {
      const complete = isWeekComplete(week, progress);
      const wasComplete = prevWeekCompleteRef.current[week.numero] ?? false;

      if (progressInitializedRef.current && complete && !wasComplete) {
        setCelebrationWeek(week.numero);
      }

      prevWeekCompleteRef.current[week.numero] = complete;
    });

    progressInitializedRef.current = true;
  }, [plan, progress, weeks]);

  useEffect(() => {
    if (!plan || !currentWeek || !semanasGeneradas) return;
    const triggerWeek = semanasGeneradas - 1;
    if (currentWeek >= triggerWeek && currentWeek < totalWeeks && semanasGeneradas < totalWeeks) {
      fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ next_block: true, plan_id: plan.id }),
      }).then(() => {
        setTimeout(() => reload(), 3000);
      }).catch(() => {});
    }
  }, [currentWeek, semanasGeneradas, plan, totalWeeks, reload]);

  async function handleToggleDay(weekNumber: number, dayName: string) {
    const week = plan?.plan_json.semanas.find((w) => w.numero === weekNumber);
    const day = week?.dias.find((d) => d.dia === dayName);
    const isCurrentlyCompleted = progress.some(
      (p) => p.week_number === weekNumber && p.day_name === dayName && p.completed
    );

    if (!isCurrentlyCompleted && day) {
      setPendingSession({
        weekNumber,
        dayName,
        title: day.titulo,
        tipoSesion: day.tipo_sesion,
        distanceKm: day.distancia_km ?? undefined,
        durationMin: day.duracion_min ?? undefined,
      });
    } else {
      await toggleDay(weekNumber, dayName);
    }
  }

  if (loading) {
    return (
      <div className="min-h-full bg-[#1B1C1E]">
        <nav className="fixed inset-x-0 top-0 z-40 border-b border-[#707070]/30 bg-[#1B1C1E] px-4 py-4">
          <SkeletonBlock className="mx-auto h-8 max-w-3xl" />
        </nav>
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center bg-[#1B1C1E] px-4">
        <p className="mb-4 text-center text-red-400">{error}</p>
        <button
          type="button"
          onClick={reload}
          className="rounded-lg bg-[#F16823] px-6 py-3 font-medium text-white hover:opacity-90"
        >
          Recargar
        </button>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center bg-[#1B1C1E] px-4">
        <p className="mb-6 text-center text-[#B8B8B8]">
          Tu plan está siendo generado
        </p>
        <Link
          href="/generating"
          className="rounded-lg bg-[#F16823] px-6 py-3 font-medium text-white hover:opacity-90"
        >
          Ir a generación
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#1B1C1E] text-white">
      <nav className="no-print fixed inset-x-0 top-0 z-40 border-b border-[#707070]/30 bg-[#1B1C1E]">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <RunClubLogo size="sm" showText={false} />
          <div className="flex items-center gap-4">
            {/* Streak + progreso semanal + plan */}
            <div className="flex items-center gap-3">
              {/* Racha */}
              <div className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="white">
                  <path d="M12 23c-4.418 0-8-3.582-8-8 0-3.5 2-6.5 5-8-.5 1.5 0 3 1 4 .5-2 2-4.5 5-6-1 2.5-.5 5 1 6.5.5-1 .5-2 0-3 2 2 3 4.5 3 6.5 0 4.418-3.582 8-8 8z"/>
                </svg>
                <span className="text-sm font-semibold text-white">{streak}</span>
              </div>

              {/* Sesiones esta semana — oculto en mobile */}
              <div className="hidden sm:flex items-center gap-1.5">
                <div className="flex gap-0.5">
                  {Array.from({ length: 7 }).map((_, i) => {
                    const weekDays = progress.filter(p => p.week_number === currentWeek);
                    const completed = weekDays.filter(p => p.completed).length;
                    return (
                      <div
                        key={i}
                        className={`h-1.5 w-3 rounded-full ${i < completed ? "bg-white" : "bg-[#707070]/40"}`}
                      />
                    );
                  })}
                </div>
                <span className="text-xs text-[#B8B8B8]">
                  {progress.filter(p => p.week_number === currentWeek && p.completed).length}/7
                </span>
              </div>

              {/* % plan — oculto en mobile */}
              <span className="hidden sm:block text-xs text-[#B8B8B8]">
                {completionPercent}%
              </span>
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMenu((v) => !v)}
                className="flex items-center gap-1.5 rounded-lg border border-[#707070]/60 bg-[#2a2b2d] px-3 py-2 text-sm text-white hover:border-[#F16823] transition-colors"
                aria-label="Menú"
              >
                <i className="ti ti-menu-2" style={{ fontSize: 18 }} aria-hidden="true"></i>
                <span className="text-xs">Menú</span>
              </button>

              {showMenu && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowMenu(false)}
                  />
                  {/* Dropdown */}
                  <div className="absolute right-0 top-11 z-50 w-52 rounded-xl border border-[#707070]/40 bg-[#2a2b2d] shadow-xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => { handleDownloadPDF(); setShowMenu(false); }}
                      className="flex w-full items-center gap-3 px-4 py-3 text-sm text-[#B8B8B8] hover:bg-[#1B1C1E] hover:text-white transition-colors"
                    >
                      <i className="ti ti-file-type-pdf" style={{ fontSize: 18 }}></i>
                      Exportar PDF
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowCalendarModal(true); setShowMenu(false); }}
                      className="flex w-full items-center gap-3 px-4 py-3 text-sm text-[#B8B8B8] hover:bg-[#1B1C1E] hover:text-white transition-colors"
                    >
                      <i className="ti ti-calendar-event" style={{ fontSize: 18 }}></i>
                      Exportar calendario
                    </button>
                    <div className="border-t border-[#707070]/30" />
                    <button
                      type="button"
                      onClick={() => { router.push("/settings"); setShowMenu(false); }}
                      className="flex w-full items-center gap-3 px-4 py-3 text-sm text-[#B8B8B8] hover:bg-[#1B1C1E] hover:text-white transition-colors"
                    >
                      <i className="ti ti-settings" style={{ fontSize: 18 }}></i>
                      Configuración
                    </button>
                    <button
                      type="button"
                      onClick={() => { router.push("/help"); setShowMenu(false); }}
                      className="flex w-full items-center gap-3 px-4 py-3 text-sm text-[#B8B8B8] hover:bg-[#1B1C1E] hover:text-white transition-colors"
                    >
                      <i className="ti ti-help-circle" style={{ fontSize: 18 }}></i>
                      Ayuda
                    </button>
                    <div className="border-t border-[#707070]/30" />
                    <form action="/auth/signout" method="POST">
                      <button
                        type="submit"
                        className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-[#1B1C1E] transition-colors"
                      >
                        <i className="ti ti-logout" style={{ fontSize: 18 }}></i>
                        Cerrar sesión
                      </button>
                    </form>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {!isPremium && profile?.trial_ends_at && (
        <TrialBanner trialEndsAt={profile.trial_ends_at} />
      )}
      <main className="mx-auto max-w-3xl space-y-6 px-4 pb-12 pt-24">
        {profile?.full_name && (
          <div className="px-1">
            <p className="text-lg font-semibold text-white">
              {getGreeting(profile.full_name, profile.sexo)}
            </p>
            {profile.is_verified && (
              <span className="inline-flex items-center gap-1 rounded-full border border-[#F16823]/30 bg-[#F16823]/10 px-2 py-0.5 text-xs font-medium text-[#F16823] mt-1">
                🏅 Corredor Verificado
              </span>
            )}
          </div>
        )}
        <StatsBar
          currentWeek={currentWeek}
          totalWeeks={totalWeeks}
          weekCompleted={currentWeekStats.completed}
          weekTotal={currentWeekStats.total}
          weekVolume={currentWeekStats.volume}
          completionPercent={completionPercent}
          isVerified={isVerified}
        />

        {showTrailPromo && (
          <TrailPromoBanner onDismiss={async () => {
            setShowTrailPromo(false);
            const { createClient } = await import("@/lib/supabase/client");
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              await supabase
                .from("profiles")
                .update({ is_trail_promo_dismissed: true })
                .eq("id", user.id);
            }
          }} />
        )}

        <PlanProgressBar
          completionPercent={completionPercent}
          currentWeek={currentWeek}
          totalWeeks={totalWeeks}
        />

        <BannerAd placement="dashboard" isPremium={isPremium} />

        {plan?.coach_note && (
          <CoachNoteCard note={plan.coach_note} />
        )}

        {streak >= 3 && (
          <div className="no-print rounded-lg border-l-4 border-[#F16823] bg-[#2a2b2d] px-4 py-3 text-sm text-white">
            🔥 ¡Llevas {streak} días seguidos entrenando! Sigue así.
          </div>
        )}

        <div>
          <div className="no-print mb-3 flex items-center justify-between">
            <p className="text-sm text-[#B8B8B8]">Selecciona una semana</p>
            {completionPercent === 100 && plan && (
              <button
                onClick={() => setShowCelebration(true)}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <svg width="28" height="28" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M32 8 L38 24 L56 24 L42 36 L48 52 L32 42 L16 52 L22 36 L8 24 L26 24 Z" fill="#F16823"/>
                </svg>
                <span className="text-sm font-medium text-[#F16823]">Ver mi logro</span>
              </button>
            )}
          </div>
          <div className="no-print">
            <WeekPills
              weeks={weeks}
              selectedWeek={activeSelectedWeek}
              currentWeek={currentWeek}
              progress={progress}
              onSelect={setSelectedWeek}
              semanasGeneradas={semanasGeneradas}
              totalWeeks={totalWeeks}
            />
          </div>
        </div>

        {selectedWeekData && (
          <WeekCard
            week={selectedWeekData}
            progress={progress}
            onToggleDay={handleToggleDay}
          />
        )}

        {selectedWeekData && plan && (
          <WeeklyCheckin
            planId={plan.id}
            weekNumber={selectedWeekData.numero}
            track={plan.track}
            pesoInicial={pesoInicial}
          />
        )}

        {plan && (
          <ProgressChart
            planId={plan.id}
            track={plan.track}
            pesoInicial={pesoInicial}
            totalWeeks={totalWeeks}
          />
        )}

        <PanamaContext
          currentWeek={currentWeek}
          totalWeeks={totalWeeks}
          track={plan.track}
          raceDate={plan.race_date}
          raceName={plan.race_name}
        />

        <ReferralCard />

        <PartnerIncomingRequests />

        {plan && (
          <PartnerSection track={plan.track} />
        )}
      </main>

      {showCalendarModal && plan && (
        <CalendarExportModal
          onClose={() => setShowCalendarModal(false)}
          onDownload={() => handleExportCalendar(plan)}
        />
      )}

      {pendingSession && (
        <SessionCompleteModal
          weekNumber={pendingSession.weekNumber}
          dayName={pendingSession.dayName}
          sessionTitle={pendingSession.title}
          tipoSesion={pendingSession.tipoSesion}
          plannedDistanceKm={pendingSession.distanceKm}
          plannedDurationMin={pendingSession.durationMin}
          onSave={async (data) => {
            await toggleDay(pendingSession.weekNumber, pendingSession.dayName, data);
            setPendingSession(null);
          }}
          onSkip={async () => {
            await toggleDay(pendingSession.weekNumber, pendingSession.dayName);
            setPendingSession(null);
          }}
        />
      )}

      {celebrationWeek !== null && (
        <CelebrationToast
          weekNumber={celebrationWeek}
          onDismiss={() => setCelebrationWeek(null)}
        />
      )}

      {showCelebration && plan && (
        <PlanCompletionScreen
          planId={plan.id}
          track={plan.track}
          raceName={plan.race_name}
          totalWeeks={totalWeeks}
          completionPercent={completionPercent}
          streak={streak}
          pesoInicial={pesoInicial}
          onDismiss={() => setShowCelebration(false)}
        />
      )}

    </div>
  );
}
