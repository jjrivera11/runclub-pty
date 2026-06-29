"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import FocusTrap from "focus-trap-react";
import { usePlan } from "@/lib/hooks/usePlan";
import { buildLeaderboardRows } from "@/lib/leaderboard";
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
import { ProductTour } from "@/components/ProductTour";
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
  dayName: string,
  horario?: string
): Date {
  const planStart = new Date(generatedAt);
  const panamaTz = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Panama",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false,
  }).formatToParts(planStart);

  const parts: Record<string, string> = {};
  panamaTz.forEach(({ type, value }) => { parts[type] = value; });

  const localDate = new Date(
    `${parts.year}-${parts.month}-${parts.day}T08:00:00`
  );

  const dayOfWeek = localDate.getDay();
  const mondayOffset = dayOfWeek === 1 ? 0 : dayOfWeek === 0 ? 1 : 8 - dayOfWeek;

  const monday = new Date(localDate);
  monday.setDate(localDate.getDate() + mondayOffset);

  const offset = DAY_OFFSET[dayName] ?? 0;
  const sessionDate = new Date(monday);
  sessionDate.setDate(monday.getDate() + (weekNumber - 1) * 7 + offset);

  // Aplicar hora según preferencia
  if (horario === "noche") {
    sessionDate.setHours(19, 0, 0, 0);
  } else {
    sessionDate.setHours(5, 30, 0, 0); // mañana por defecto
  }

  return sessionDate;
}

function handleExportCalendar(plan: TrainingPlan, horarioEntrenamiento: string) {
  const events: string[] = [];

  for (const week of plan.plan_json.semanas) {
    for (const day of week.dias) {
      const start = getSessionDate(plan.generated_at, week.numero, day.dia, horarioEntrenamiento);
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

function StatsCard({
  currentWeek,
  totalWeeks,
  weekCompleted,
  weekTotal,
  weekVolume,
  completionPercent,
  streak,
  progress,
  fullName,
  raceName,
  track,
  myPoints,
  myUserId,
  myName,
  weeklyRankChange,
  setShowPointsModal,
}: {
  currentWeek: number;
  totalWeeks: number;
  weekCompleted: number;
  weekTotal: number;
  weekVolume: number;
  completionPercent: number;
  streak: number;
  progress: DayProgress[];
  fullName?: string;
  raceName?: string;
  track?: string;
  myPoints?: number;
  myUserId?: string;
  myName?: string;
  weeklyRankChange?: number;
  setShowPointsModal: (value: boolean) => void;
}) {
  const DAYS = ["L", "M", "X", "J", "V", "S", "D"];
  const dayNames = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

  const completedDayNames = new Set(
    progress
      .filter((p) => p.week_number === currentWeek && p.completed)
      .map((p) => p.day_name)
  );

  return (
    <div className="rounded-2xl border border-[#707070]/30 bg-[#2a2b2d] overflow-hidden">
      {/* Progreso del plan + Ranking — grid 50/50 */}
      <div className="px-5 pt-5 pb-4 border-b border-[#707070]/20">
        <div className="grid grid-cols-2 gap-0">

          {/* Columna izquierda — Progreso */}
          <div className="pr-4 border-r border-[#707070]/20">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-xs text-[#707070] uppercase tracking-widest mb-1">Progreso del plan</p>
                <p className="text-3xl font-bold text-white">{completionPercent}%</p>
              </div>
              <a
                href={`/api/share-card?name=${encodeURIComponent(fullName ?? "Atleta")}&race=${encodeURIComponent(raceName ?? "")}&weeks=${totalWeeks}&streak=${streak}&track=${track ?? "runner"}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Compartir mi plan"
                data-tour="share-card"
                className="text-[#F16823] hover:opacity-70 transition-opacity mt-1"
                onClick={async () => {
                  if (!myUserId) return;
                  try {
                    const { createClient } = await import("@/lib/supabase/client");
                    const supabase = createClient();
                    const { logPointEvent, hasLoggedEvent } = await import("@/lib/points");
                    const alreadyLogged = await hasLoggedEvent(supabase, myUserId, "share_card", 7);
                    if (!alreadyLogged) await logPointEvent(supabase, myUserId, "share_card");
                  } catch {}
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
                </svg>
              </a>
            </div>
            <div className="h-2 rounded-full bg-[#1B1C1E] overflow-hidden mb-2">
              <div
                className="h-full rounded-full bg-[#F16823] transition-all duration-700 ease-out"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
            <p className="text-xs text-[#B8B8B8]">
              Semana <span className="text-white font-semibold">{currentWeek}</span> de {totalWeeks}
            </p>
          </div>

          {/* Columna derecha — Ranking */}
          <div data-tour="leaderboard" className="pl-4 flex flex-col justify-center">
            <div className="flex items-center gap-1.5 mb-3">
              <span className="text-[10px] uppercase tracking-widest text-[#707070]">
                {track === "transformacion" ? "Transformación" : "Runner Pro"} · Ranking
              </span>
              <button
                onClick={() => setShowPointsModal(true)}
                className="w-4 h-4 rounded-full border border-[#707070] flex items-center justify-center text-[#707070] text-[10px] font-bold hover:border-[#F16823] hover:text-[#F16823] transition-colors flex-shrink-0"
              >
                ?
              </button>
            </div>
            {myPoints !== undefined && myUserId && myName && track && (
              buildLeaderboardRows(myPoints, myUserId, myName, track, weeklyRankChange ?? 0).map((row) => (
                <div
                  key={row.user_id}
                  className={`flex items-center gap-2 py-1 px-1.5 rounded-md ${row.isMe ? "bg-[#F16823]/5" : ""}`}
                >
                  <span className={`text-xs font-bold min-w-[18px] ${row.isMe ? "text-[#F16823]" : "text-[#707070]"}`}>
                    {row.rank}
                  </span>
                  <span className={`text-xs flex-1 truncate ${row.isMe ? "text-white font-semibold" : "text-[#B8B8B8]"}`}>
                    {row.isMe ? "Tú" : row.name}
                  </span>
                  <span className={`text-[11px] ${row.isMe ? "text-[#F16823]" : "text-[#707070]"}`}>
                    {row.points}
                  </span>
                  {row.isMe && row.weeklyRankChange !== 0 && (
                    <span style={{ color: row.weeklyRankChange > 0 ? "#10B981" : "#ef4444", fontSize: "10px" }}>
                      {row.weeklyRankChange > 0 ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>

        </div>
      </div>

      {/* Métricas de la semana */}
      <div className="grid grid-cols-3 divide-x divide-[#707070]/20 border-b border-[#707070]/20">
        <div className="px-4 py-4 text-center">
          <p className="text-xs text-[#707070] uppercase tracking-widest mb-1">Racha</p>
          <p className="text-2xl font-bold text-white">{streak}</p>
          <p className="text-xs text-[#B8B8B8]">{streak === 1 ? "día" : "días"}</p>
        </div>
        <div className="px-4 py-4 text-center">
          <p className="text-xs text-[#707070] uppercase tracking-widest mb-1">Esta semana</p>
          <p className="text-2xl font-bold text-white">{weekCompleted}<span className="text-sm font-normal text-[#B8B8B8]">/{weekTotal}</span></p>
          <p className="text-xs text-[#B8B8B8]">sesiones</p>
        </div>
        <div className="px-4 py-4 text-center">
          <p className="text-xs text-[#707070] uppercase tracking-widest mb-1">Volumen</p>
          <p className="text-2xl font-bold text-white">{weekVolume.toFixed(1)}</p>
          <p className="text-xs text-[#B8B8B8]">km esta semana</p>
        </div>
      </div>

      {/* Días de la semana */}
      <div className="px-5 py-4">
        <p className="text-xs text-[#707070] uppercase tracking-widest mb-3">Semana actual</p>
        <div className="flex justify-between">
          {DAYS.map((label, i) => {
            const completed = completedDayNames.has(dayNames[i]) ||
              completedDayNames.has(dayNames[i].normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
            return (
              <div key={label} className="flex flex-col items-center gap-1.5">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                  completed
                    ? "bg-[#F16823] text-white"
                    : "bg-[#1B1C1E] text-[#707070]"
                }`}>
                  {completed ? (
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : label}
                </div>
              </div>
            );
          })}
        </div>
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
            className={`flex h-11 w-11 items-center justify-center rounded-full border text-sm font-medium transition-colors ${pillClass}`}
            aria-label={`Semana ${week.numero}`}
          >
            {complete ? "✓" : week.numero}
          </button>
        );
      })}
      {lockedWeeks.map((n) => (
        <div
          key={`locked-${n}`}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-[#707070]/15 bg-[#1B1C1E]/50 cursor-not-allowed"
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
  horario,
}: {
  weekNumber: number;
  day: PlanDay;
  completed: boolean;
  onToggle: () => void;
  horario?: string;
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
          <p className={`font-medium ${completed ? "text-[#B8B8B8]" : "text-white"}`}>{day.titulo}</p>
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
              <span className="text-[#F16823] ml-1">
                · {horario === "noche" ? "7:00 pm" : "5:30 am"}
              </span>
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
  shareUrl,
  horario,
}: {
  week: PlanWeek;
  progress: DayProgress[];
  onToggleDay: (weekNumber: number, dayName: string) => void;
  shareUrl?: string;
  horario?: string;
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
        <div className="flex items-center gap-2">
          {shareUrl && (
            <a
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Compartir semana completada"
              className="text-[#10B981] hover:opacity-70 transition-opacity"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
              </svg>
            </a>
          )}
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${badgeStyle}`}
          >
            {week.tipo}
          </span>
        </div>
      </div>
      <div className="space-y-2">
        {week.dias.map((day) => (
          <DayRow
            key={day.dia}
            weekNumber={week.numero}
            day={day}
            completed={isDayCompleted(week.numero, day.dia, progress)}
            onToggle={() => onToggleDay(week.numero, day.dia)}
            horario={horario}
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
    <div
      role="alert"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-lg border border-[#F16823] bg-[#2a2b2d] px-5 py-4 text-center text-white shadow-lg"
    >
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
      <button onClick={onDismiss} aria-label="Cerrar" className="absolute top-3 right-3 text-[#707070] hover:text-white transition-colors">
        <X size={16} />
      </button>
      <p className="text-sm font-semibold text-white mb-1">🏔️ ¿Listo para el siguiente reto?</p>
      <p className="text-xs text-[#B8B8B8] mb-3 leading-relaxed">
        Completaste tu carrera. El trail running es una experiencia completamente diferente — montaña, naturaleza y un reto mayor. Hay carreras trail en Panamá perfectas para empezar.
      </p>
      <button
        onClick={() => router.push("/onboarding?tipo=trail")}
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
  const [profile, setProfile] = useState<{ id?: string; full_name?: string; is_verified?: boolean; trial_ends_at?: string | null; sexo?: string | null } | null>(null);
  const [userPoints, setUserPoints] = useState<{ total_points?: number; weekly_rank?: number; last_week_rank?: number } | null>(null);
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [toastError, setToastError] = useState<string | null>(null);
  const [pesoInicial, setPesoInicial] = useState(0);
  const [horarioEntrenamiento, setHorarioEntrenamiento] = useState<string>("mañana");
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
        .select("id, is_premium, is_verified, full_name, trial_ends_at, sexo, is_trail_promo_dismissed, tour_completed")
        .eq("id", user.id)
        .maybeSingle();
      if (data) {
        setProfile(data);
        setIsPremium(data.is_premium ?? false);
        setIsVerified(data.is_verified ?? false);
        if (!data?.tour_completed) setShowTour(true);
      }
      const { data: userPointsData } = await supabase
        .from("user_points")
        .select("total_points, weekly_rank, last_week_rank")
        .eq("user_id", user.id)
        .maybeSingle();
      if (userPointsData) setUserPoints(userPointsData);
      const { data: onboarding } = await supabase
        .from("onboarding_answers")
        .select("peso_lbs, horario_entrenamiento")
        .eq("user_id", user.id)
        .maybeSingle();
      if (onboarding?.peso_lbs) setPesoInicial(onboarding.peso_lbs);
      if (onboarding?.horario_entrenamiento) setHorarioEntrenamiento(onboarding.horario_entrenamiento);
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

  async function handleSessionSave(data: Parameters<typeof toggleDay>[2]) {
    if (!pendingSession || !profile?.id) return;
    await toggleDay(pendingSession.weekNumber, pendingSession.dayName, data);

    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { logPointEvent, hasLoggedEvent } = await import("@/lib/points");

      // Puntos por día completado
      await logPointEvent(supabase, profile.id, "day_completed", {
        week: pendingSession.weekNumber,
        day: pendingSession.dayName,
      });

      // Verificar racha después de completar
      const newStreak = streak + 1;
      if (newStreak === 7) {
        const alreadyLogged = await hasLoggedEvent(supabase, profile.id, "streak_7", 8);
        if (!alreadyLogged) await logPointEvent(supabase, profile.id, "streak_7");
      }
      if (newStreak === 30) {
        const alreadyLogged = await hasLoggedEvent(supabase, profile.id, "streak_30", 32);
        if (!alreadyLogged) await logPointEvent(supabase, profile.id, "streak_30");
      }

      // Verificar si la semana quedó completa
      const weekData = plan?.plan_json.semanas.find((w) => w.numero === pendingSession.weekNumber);
      if (weekData) {
        const updatedProgress = [
          ...progress,
          { week_number: pendingSession.weekNumber, day_name: pendingSession.dayName, completed: true }
        ];
        const allDone = weekData.dias.every((d) =>
          updatedProgress.some((p) => p.week_number === weekData.numero && p.day_name === d.dia && p.completed)
        );
        if (allDone) {
          const alreadyLogged = await hasLoggedEvent(supabase, profile.id, "week_completed");
          if (!alreadyLogged) {
            await logPointEvent(supabase, profile.id, "week_completed", {
              week: pendingSession.weekNumber,
            });
          }
        }
      }

      // Refrescar puntos
      const { data: updatedPoints } = await supabase
        .from("user_points")
        .select("total_points, weekly_rank, last_week_rank")
        .eq("user_id", profile.id)
        .maybeSingle();
      if (updatedPoints) setUserPoints(updatedPoints);

    } catch (e) {
      console.error("points error:", e);
    }

    setPendingSession(null);
  }

  async function handleTourComplete() {
    setShowTour(false);
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").update({ tour_completed: true }).eq("id", user.id);
    }
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
      setToastError("No se pudo generar el PDF. Intenta de nuevo.");
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
            <div className="relative">
              <button
                type="button"
                data-tour="menu-btn"
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
                      data-tour="pdf-export"
                      onClick={() => { handleDownloadPDF(); setShowMenu(false); }}
                      className="flex w-full items-center gap-3 px-4 py-3 text-sm text-[#B8B8B8] hover:bg-[#1B1C1E] hover:text-white transition-colors"
                    >
                      <i className="ti ti-file-type-pdf" style={{ fontSize: 18 }}></i>
                      Exportar PDF
                    </button>
                    <button
                      type="button"
                      data-tour="calendar-export"
                      onClick={() => { setShowCalendarModal(true); setShowMenu(false); }}
                      className="flex w-full items-center gap-3 px-4 py-3 text-sm text-[#B8B8B8] hover:bg-[#1B1C1E] hover:text-white transition-colors"
                    >
                      <i className="ti ti-calendar-event" style={{ fontSize: 18 }}></i>
                      Exportar calendario
                    </button>
                    <div className="border-t border-[#707070]/30" />
                    <button
                      type="button"
                      data-tour="settings"
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
                    <button
                      type="button"
                      onClick={() => { router.push("/nosotros"); setShowMenu(false); }}
                      className="flex w-full items-center gap-3 px-4 py-3 text-sm text-[#B8B8B8] hover:bg-[#1B1C1E] hover:text-white transition-colors"
                    >
                      <i className="ti ti-user" style={{ fontSize: 18 }}></i>
                      Nosotros
                    </button>
                    <div className="border-t border-[#707070]/30" />
                    <button
                      type="button"
                      onClick={async () => {
                        const { createClient } = await import("@/lib/supabase/client");
                        const supabase = createClient();
                        await supabase.auth.signOut();
                        router.push("/login");
                      }}
                      className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-[#1B1C1E] transition-colors"
                    >
                      <i className="ti ti-logout" style={{ fontSize: 18 }}></i>
                      Cerrar sesión
                    </button>
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
        <div data-tour="progress-card">
        <StatsCard
          currentWeek={currentWeek}
          totalWeeks={totalWeeks}
          weekCompleted={currentWeekStats.completed}
          weekTotal={currentWeekStats.total}
          weekVolume={currentWeekStats.volume}
          completionPercent={completionPercent}
          streak={streak}
          progress={progress}
          fullName={profile?.full_name}
          raceName={plan?.race_name}
          track={plan?.track}
          myPoints={userPoints?.total_points ?? 0}
          myUserId={profile?.id ?? ""}
          myName={profile?.full_name ?? ""}
          weeklyRankChange={(userPoints?.last_week_rank ?? 0) - (userPoints?.weekly_rank ?? 0)}
          setShowPointsModal={setShowPointsModal}
        />
        </div>

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
          <div className="no-print" data-tour="week-pills">
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
          <div data-tour="week-card">
          <WeekCard
            week={selectedWeekData}
            progress={progress}
            onToggleDay={handleToggleDay}
            horario={horarioEntrenamiento}
            shareUrl={
              plan && isWeekComplete(selectedWeekData, progress)
                ? `/api/share-card?type=week&name=${encodeURIComponent(profile?.full_name ?? "Atleta")}&race=${encodeURIComponent(plan.race_name ?? "")}&weeks=${totalWeeks}&streak=${streak}&track=${plan.track}&week=${selectedWeekData.numero}&km=${getWeekVolumeCompleted(selectedWeekData, progress).toFixed(1)}&pct=${completionPercent}`
                : undefined
            }
          />
          </div>
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

        <div data-tour="panama-context">
        <PanamaContext
          currentWeek={currentWeek}
          totalWeeks={totalWeeks}
          track={plan.track}
          raceDate={plan.race_date}
          raceName={plan.race_name}
        />
        </div>

        <div data-tour="referral">
        <ReferralCard />
        </div>

        <PartnerIncomingRequests />

        {plan && (
          <PartnerSection track={plan.track} />
        )}

        {showPointsModal && (
          <FocusTrap
            focusTrapOptions={{
              onDeactivate: () => setShowPointsModal(false),
              clickOutsideDeactivates: true,
              returnFocusOnDeactivate: true,
            }}
          >
            <div
              className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
              onClick={() => setShowPointsModal(false)}
            >
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="points-modal-title"
                className="bg-[#1B1C1E] border border-[#2a2b2d] rounded-2xl p-6 max-w-sm w-full"
                onClick={(e) => e.stopPropagation()}
              >
              <div className="flex justify-between items-center mb-5">
                <h3 id="points-modal-title" className="text-white font-semibold">¿Cómo ganas puntos?</h3>
                <button onClick={() => setShowPointsModal(false)} aria-label="Cerrar" className="text-[#707070] hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>
              <div className="flex flex-col gap-3">
                {[
                  { label: "Día completado", pts: "+10 pts" },
                  { label: "Semana 100% completada", pts: "+50 pts" },
                  { label: "Racha de 7 días", pts: "+30 pts" },
                  { label: "Racha de 30 días", pts: "+100 pts" },
                  { label: "Compartir en redes", pts: "+20 pts / semana" },
                  { label: "Amigo referido que se registra", pts: "+75 pts" },
                  { label: "Perfil completo", pts: "+50 pts" },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-center py-2 border-b border-[#2a2b2d] last:border-0">
                    <span className="text-sm text-[#B8B8B8]">{item.label}</span>
                    <span className="text-sm font-semibold text-[#F16823]">{item.pts}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          </FocusTrap>
        )}
      </main>

      {showCalendarModal && plan && (
        <CalendarExportModal
          onClose={() => setShowCalendarModal(false)}
          onDownload={() => handleExportCalendar(plan, horarioEntrenamiento)}
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
          onSave={handleSessionSave}
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
          fullName={profile?.full_name}
          onDismiss={() => setShowCelebration(false)}
        />
      )}

      {toastError && (
        <div
          role="alert"
          aria-live="assertive"
          className="fixed bottom-6 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-lg border border-red-500/30 bg-[#2a2b2d] px-5 py-4 text-center text-red-400 shadow-lg"
        >
          {toastError}
          <button
            onClick={() => setToastError(null)}
            aria-label="Cerrar"
            className="ml-3 text-[#707070] hover:text-white transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {showTour && <ProductTour onComplete={handleTourComplete} />}

    </div>
  );
}
