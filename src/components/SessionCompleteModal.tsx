"use client";
import { useState } from "react";

interface SessionCompleteModalProps {
  weekNumber: number;
  dayName: string;
  sessionTitle: string;
  plannedDistanceKm?: number;
  plannedDurationMin?: number;
  onSave: (data: { actualDistanceKm?: number; actualDurationMin?: number; effortLevel?: number }) => void;
  onSkip: () => void;
}

const EFFORT_LABELS = ["", "Muy fácil", "Fácil", "Moderado", "Duro", "Al límite"];
const EFFORT_COLORS = ["", "text-blue-400", "text-green-400", "text-yellow-400", "text-orange-400", "text-red-400"];

export function SessionCompleteModal({
  sessionTitle,
  plannedDistanceKm,
  plannedDurationMin,
  onSave,
  onSkip,
}: SessionCompleteModalProps) {
  const [distancia, setDistancia] = useState(plannedDistanceKm ? String(plannedDistanceKm) : "");
  const [duracion, setDuracion] = useState(plannedDurationMin ? String(plannedDurationMin) : "");
  const [esfuerzo, setEsfuerzo] = useState<number | null>(null);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm px-4 pb-4 sm:pb-0">
      <div className="w-full max-w-sm bg-[#1B1C1E] rounded-2xl border border-[#707070]/40 shadow-2xl">
        <div className="px-5 py-4 border-b border-[#707070]/40">
          <p className="text-white font-semibold text-sm">✅ ¡Sesión completada!</p>
          <p className="text-[#B8B8B8] text-xs mt-0.5">{sessionTitle}</p>
        </div>

        <div className="px-5 py-4 space-y-4">
          <p className="text-xs text-[#B8B8B8]">¿Cómo te fue? (opcional — Coach JJ usa esto para ajustar tu plan)</p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[#B8B8B8] mb-1.5">Distancia real (km)</label>
              <input
                type="number"
                value={distancia}
                onChange={(e) => setDistancia(e.target.value)}
                placeholder={plannedDistanceKm ? String(plannedDistanceKm) : "0"}
                className="w-full rounded-lg border border-[#707070] bg-[#2a2b2d] px-3 py-2 text-sm text-white outline-none focus:border-[#F16823] text-center"
              />
            </div>
            <div>
              <label className="block text-xs text-[#B8B8B8] mb-1.5">Duración real (min)</label>
              <input
                type="number"
                value={duracion}
                onChange={(e) => setDuracion(e.target.value)}
                placeholder={plannedDurationMin ? String(plannedDurationMin) : "0"}
                className="w-full rounded-lg border border-[#707070] bg-[#2a2b2d] px-3 py-2 text-sm text-white outline-none focus:border-[#F16823] text-center"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#B8B8B8] mb-2">Nivel de esfuerzo</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setEsfuerzo(level)}
                  className={`flex-1 rounded-lg border py-2 text-sm font-bold transition-colors ${
                    esfuerzo === level
                      ? "border-[#F16823] bg-[#F16823]/10 text-[#F16823]"
                      : "border-[#707070] text-[#B8B8B8]"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
            {esfuerzo && (
              <p className={`text-xs mt-1.5 ${EFFORT_COLORS[esfuerzo]}`}>
                {EFFORT_LABELS[esfuerzo]}
              </p>
            )}
          </div>
        </div>

        <div className="px-5 pb-5 flex gap-3">
          <button
            type="button"
            onClick={onSkip}
            className="flex-1 rounded-lg border border-[#707070] py-2.5 text-sm text-[#B8B8B8] hover:text-white transition-colors"
          >
            Saltar
          </button>
          <button
            type="button"
            onClick={() => onSave({
              actualDistanceKm: distancia ? Number(distancia) : undefined,
              actualDurationMin: duracion ? Number(duracion) : undefined,
              effortLevel: esfuerzo ?? undefined,
            })}
            className="flex-1 rounded-lg bg-[#F16823] py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
