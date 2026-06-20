"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface WeeklyCheckinProps {
  planId: string;
  weekNumber: number;
  track: string;
  pesoInicial: number;
}

export function WeeklyCheckin({ planId, weekNumber, track, pesoInicial }: WeeklyCheckinProps) {
  const [peso, setPeso] = useState("");
  const [tiempo, setTiempo] = useState("");
  const [distancia, setDistancia] = useState("");
  const [existing, setExisting] = useState<{ peso_lbs?: number; tiempo_libre?: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const isRunner = track === "runner";

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      const { data } = await supabase
        .from("weekly_checkins")
        .select("peso_lbs, tiempo_libre")
        .eq("user_id", user.id)
        .eq("plan_id", planId)
        .eq("week_number", weekNumber)
        .maybeSingle();
      if (data) {
        setExisting(data);
        if (data.peso_lbs) setPeso(String(data.peso_lbs));
        if (data.tiempo_libre) {
          const parts = data.tiempo_libre.split("|");
          if (parts[0]) setTiempo(parts[0]);
          if (parts[1]) setDistancia(parts[1]);
        }
      }
    }
    load();
  }, [planId, weekNumber]);

  function validarTiempo(tiempo: string, distancia: string): string | null {
    const partes = tiempo.split(":");
    const horas = parseInt(partes[0] ?? "0") || 0;
    const minutos = parseInt(partes[1] ?? "0") || 0;
    const segundos = parseInt(partes[2] ?? "0") || 0;
    const totalSegundos = horas * 3600 + minutos * 60 + segundos;

    if (totalSegundos === 0) return null;

    const recordes: Record<string, number> = {
      "400m": 43,
      "1K": 131,
      "3K": 440,
      "5K": 755,
    };

    const record = recordes[distancia];
    if (!record) return null;

    if (totalSegundos < record) {
      return `⚡ Ese tiempo rompe el récord mundial de ${distancia}. Coach JJ te cree, pero revisa los números.`;
    }
    return null;
  }

  async function handleSave() {
    if (!userId) return;
    if (isRunner && tiempo && distancia) {
      const error = validarTiempo(tiempo, distancia);
      if (error) {
        setValidationError(error);
        return;
      }
    }
    setValidationError(null);
    setSaving(true);
    const supabase = createClient();
    const tiempoValue = track === "runner" ? tiempo + "|" + distancia : null;
    const pesoValue = track === "transformacion" && peso ? parseFloat(peso) : null;
    await supabase.from("weekly_checkins").upsert({
      user_id: userId,
      plan_id: planId,
      week_number: weekNumber,
      track,
      peso_lbs: pesoValue,
      tiempo_libre: tiempoValue,
    }, { onConflict: "user_id,plan_id,week_number" });
    setSaving(false);
    setSaved(true);
  }

  const hasData = isRunner ? (tiempo.length > 0 || distancia.length > 0) : peso.length > 0;

  if (saved || existing) {
    const pesoActual = parseFloat(peso);
    const perdidas = pesoInicial > 0 && pesoActual > 0 ? (pesoInicial - pesoActual).toFixed(1) : null;
    return (
      <div className="rounded-xl border border-[#F16823]/20 bg-[#2a2b2d] p-4 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-base">✓</span>
          <p className="text-sm font-semibold text-white">Check-in semana {weekNumber} guardado</p>
        </div>
        {isRunner && tiempo && (
          <p className="text-xs text-[#B8B8B8]">
            Tiempo: <span className="text-white font-medium">{tiempo.split(":").filter(Boolean).join(":")}</span>
            {distancia && <> · Distancia: <span className="text-white font-medium">{distancia}</span></>}
          </p>
        )}
        {!isRunner && peso && (
          <p className="text-xs text-[#B8B8B8]">
            Peso: <span className="text-white font-medium">{peso} lbs</span>
            {perdidas && Number(perdidas) > 0 && <> · <span className="text-green-400 font-medium">{perdidas} lbs menos que al inicio</span></>}
          </p>
        )}
        <p className="text-xs text-[#B8B8B8]/60">Coach JJ usa estos datos para ajustar tu próximo bloque.</p>
        <button onClick={() => { setSaved(false); setExisting(null); }} className="text-xs text-[#F16823] hover:opacity-80 transition-opacity">
          Actualizar mi marca
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#707070]/40 bg-[#2a2b2d] p-4 space-y-4">
      <div>
        <p className="text-sm font-semibold text-white">Como te fue esta semana?</p>
        <p className="text-xs text-[#B8B8B8] mt-1 leading-relaxed">
          Tu reporte semanal ayuda a Coach JJ a ajustar tu plan. Toma 30 segundos.
        </p>
      </div>

      {isRunner ? (
        <div className="space-y-4">
          <p className="text-xs text-[#B8B8B8]/60">Registra tu mejor marca de la semana — Coach JJ la usa para ajustar tu siguiente bloque.</p>
          <div className="space-y-2">
            <label className="text-xs font-medium text-[#B8B8B8]">Distancia</label>
            <div className="grid grid-cols-4 gap-2">
              {["400m", "1K", "3K", "5K"].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDistancia(d)}
                  className={"rounded-lg border py-2.5 text-sm font-medium transition-colors " + (distancia === d ? "border-[#F16823] bg-[#F16823]/10 text-[#F16823]" : "border-[#707070] bg-transparent text-[#B8B8B8] hover:border-[#F16823] hover:text-white")}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-[#B8B8B8]">Tiempo</label>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={tiempo.split(":")[0] ?? ""}
                  onChange={(e) => {
                    const parts = tiempo.split(":");
                    parts[0] = e.target.value.padStart(2, "0");
                    setTiempo(parts.join(":"));
                  }}
                  placeholder="00"
                  className="w-full rounded-lg border border-[#707070] bg-[#1B1C1E] px-3 py-2.5 text-center text-sm text-white placeholder:text-[#B8B8B8]/40 outline-none focus:border-[#F16823]"
                />
                <p className="text-xs text-[#B8B8B8]/60 text-center">horas</p>
              </div>
              <div className="space-y-1">
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={tiempo.split(":")[1] ?? ""}
                  onChange={(e) => {
                    const parts = tiempo.split(":");
                    parts[1] = e.target.value.padStart(2, "0");
                    setTiempo(parts.join(":"));
                  }}
                  placeholder="25"
                  className="w-full rounded-lg border border-[#707070] bg-[#1B1C1E] px-3 py-2.5 text-center text-sm text-white placeholder:text-[#B8B8B8]/40 outline-none focus:border-[#F16823]"
                />
                <p className="text-xs text-[#B8B8B8]/60 text-center">minutos</p>
              </div>
              <div className="space-y-1">
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={tiempo.split(":")[2] ?? ""}
                  onChange={(e) => {
                    const parts = tiempo.split(":");
                    parts[2] = e.target.value.padStart(2, "0");
                    setTiempo(parts.join(":"));
                  }}
                  placeholder="00"
                  className="w-full rounded-lg border border-[#707070] bg-[#1B1C1E] px-3 py-2.5 text-center text-sm text-white placeholder:text-[#B8B8B8]/40 outline-none focus:border-[#F16823]"
                />
                <p className="text-xs text-[#B8B8B8]/60 text-center">segundos</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#B8B8B8]">Peso actual (lbs)</label>
          <p className="text-xs text-[#B8B8B8]/60">Tu progreso es privado y solo lo usa Coach JJ para tu plan.</p>
          <input
            type="number"
            value={peso}
            onChange={(e) => setPeso(e.target.value)}
            placeholder={pesoInicial > 0 ? String(pesoInicial) : "150"}
            className="w-full rounded-lg border border-[#707070] bg-[#1B1C1E] px-3 py-2.5 text-sm text-white placeholder:text-[#B8B8B8]/40 outline-none focus:border-[#F16823]"
          />
          {pesoInicial > 0 && (
            <p className="text-xs text-[#B8B8B8]/60">Peso inicial: {pesoInicial} lbs</p>
          )}
        </div>
      )}

      {validationError && (
        <p className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-3 py-2.5 text-xs text-yellow-400">
          {validationError}
        </p>
      )}

      <button
        onClick={handleSave}
        disabled={saving || !hasData}
        className="w-full rounded-lg bg-[#F16823] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-40 transition-opacity"
      >
        {saving ? "Guardando..." : "Guardar check-in"}
      </button>
    </div>
  );
}
