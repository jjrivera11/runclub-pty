"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Race {
  id: string;
  name: string;
  race_date: string;
  distance_km: number;
  location: string;
  is_trail?: boolean;
}

interface WeatherData {
  temp: number;
  humidity: number;
  description: string;
}

interface PanamaContextProps {
  currentWeek: number;
  totalWeeks: number;
  track: string;
  raceDate?: string | null;
  raceName?: string | null;
  userId?: string;
}

function getWeekContext(currentWeek: number, totalWeeks: number, track: string): string {
  const pct = currentWeek / totalWeeks;
  if (track === "transformacion") {
    if (pct <= 0.25) return "Estas en la fase de adaptacion. Tu cuerpo esta aprendiendo nuevos movimientos.";
    if (pct <= 0.5) return "Entrando en la fase de construccion. El volumen aumenta esta semana.";
    if (pct <= 0.75) return "Fase de mayor intensidad. Los cambios fisicos son mas visibles en esta etapa.";
    return "Recta final. Mantener la disciplina estas ultimas semanas marca la diferencia.";
  }
  if (pct <= 0.25) return "Fase base: construyendo tu resistencia aerobica. Corre despacio para ir rapido despues.";
  if (pct <= 0.5) return "Fase de construccion: el volumen semanal aumenta. La regla del 10% te protege de lesiones.";
  if (pct <= 0.75) return "Fase de pico: maxima exigencia del plan. Duerme bien y come suficiente.";
  return "Tapering: reduccion de volumen para llegar fresco a la carrera. Confia en el trabajo hecho.";
}

function getWeatherAdvice(temp: number, humidity: number): string {
  if (temp >= 32 && humidity >= 80) return "Calor extremo y alta humedad. Hidratate cada 15-20 min. Entrena antes de las 7am o despues de las 6pm.";
  if (temp >= 30) return "Temperatura alta. Reduce el ritmo un 10-15% comparado con dias frescos.";
  if (humidity >= 85) return "Alta humedad. Reduce la intensidad si sientes mucho esfuerzo.";
  return "Condiciones aceptables para entrenar. Hidratate bien de todas formas.";
}

function getDaysUntilRace(raceDate: string): number {
  const today = new Date();
  const race = new Date(raceDate);
  return Math.ceil((race.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function PanamaContext({ currentWeek, totalWeeks, track, raceDate, raceName }: PanamaContextProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [upcomingRaces, setUpcomingRaces] = useState<Race[]>([]);
  const [addedRaces, setAddedRaces] = useState<Set<string>>(new Set());
  const [addingRace, setAddingRace] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const today = new Date().toISOString().split("T")[0];
      const { data } = await supabase
        .from("races")
        .select("id, name, race_date, distance_km, location, is_trail")
        .eq("is_active", true)
        .gte("race_date", today)
        .order("race_date")
        .limit(3);
      setUpcomingRaces((data as Race[]) ?? []);
      const key = process.env.NEXT_PUBLIC_OPENWEATHER_KEY;
      if (key) {
        try {
          const res = await fetch(
            "https://api.openweathermap.org/data/2.5/weather?q=Panama+City,PA&appid=" + key + "&units=metric&lang=es"
          );
          const w = await res.json();
          setWeather({ temp: Math.round(w.main.temp), humidity: w.main.humidity, description: w.weather[0].description });
        } catch { /* silent */ }
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleAddRaceGoal(raceId: string) {
    setAddingRace(raceId);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setAddingRace(null); return; }
    await supabase.from("race_goals").upsert({
      user_id: user.id,
      race_id: raceId,
      is_target: false,
    }, { onConflict: "user_id,race_id" });
    setAddedRaces((prev) => new Set([...prev, raceId]));
    setAddingRace(null);
  }

  if (loading) return null;

  const weekContext = getWeekContext(currentWeek, totalWeeks, track);
  const daysUntilUserRace = raceDate ? getDaysUntilRace(raceDate) : null;

  return (
    <div className="rounded-xl border border-[#707070] bg-[#2a2b2d] p-4 space-y-4">
      <div className="flex items-center gap-2">
        <p className="text-sm font-semibold text-white">Contexto de esta semana</p>
      </div>
      <div className="space-y-3">
        <div className="rounded-lg bg-[#1B1C1E] px-3 py-3">
          <p className="text-xs font-medium text-[#F16823] mb-1">Tu plan</p>
          <p className="text-xs text-[#B8B8B8] leading-relaxed">{weekContext}</p>
        </div>
        {weather ? (
          <div className="rounded-lg bg-[#1B1C1E] px-3 py-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-[#F16823]">Clima en Panamá hoy</p>
              <span className="text-xs text-white font-medium">{weather.temp}°C · {weather.humidity}% humedad</span>
            </div>
            <p className="text-xs text-[#B8B8B8] leading-relaxed">{getWeatherAdvice(weather.temp, weather.humidity)}</p>
          </div>
        ) : (
          <div className="rounded-lg bg-[#1B1C1E] px-3 py-3">
            <p className="text-xs font-medium text-[#F16823] mb-1">Clima en Panamá</p>
            <p className="text-xs text-[#B8B8B8] leading-relaxed">En Panama la temperatura puede superar los 32C con alta humedad. Hidratate cada 15-20 min.</p>
          </div>
        )}
        {daysUntilUserRace != null && daysUntilUserRace > 0 && daysUntilUserRace <= 60 && (
          <div className="rounded-lg bg-[#1B1C1E] px-3 py-3">
            <p className="text-xs font-medium text-[#F16823] mb-1">Tu carrera objetivo</p>
            <p className="text-xs text-white font-medium">{raceName}</p>
            <p className="text-xs text-[#B8B8B8] mt-0.5">
              {daysUntilUserRace === 1 ? "Es manana" : daysUntilUserRace <= 7 ? "En " + daysUntilUserRace + " dias - ultima semana" : daysUntilUserRace <= 14 ? "En " + daysUntilUserRace + " dias - zona de tapering" : "En " + Math.ceil(daysUntilUserRace / 7) + " semanas"}
            </p>
          </div>
        )}
        {upcomingRaces.length > 0 && (
          <div className="rounded-lg bg-[#1B1C1E] px-3 py-3">
            <p className="text-xs font-medium text-[#F16823] mb-2">Próximas carreras en Panamá</p>
            <div className="space-y-2">
              {upcomingRaces.map((r) => {
                const days = getDaysUntilRace(r.race_date);
                const [year, month, day] = r.race_date.split("-").map(Number);
                const fechaTexto = new Date(year, month - 1, day).toLocaleDateString("es-PA", { day: "numeric", month: "short" });
                const countdown = days <= 7 ? "Esta semana" : days <= 14 ? "En 2 sem" : "En " + Math.ceil(days / 7) + " sem";
                return (
                  <div key={r.id} className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs text-white flex items-center gap-1">
                        {r.name}
                        {r.is_trail && <span className="text-green-400 text-xs">🏔️</span>}
                      </p>
                      <p className="text-xs text-[#B8B8B8]">{fechaTexto} · {r.distance_km}km · {r.location}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-[#B8B8B8]">{countdown}</span>
                      <button
                        type="button"
                        onClick={() => handleAddRaceGoal(r.id)}
                        disabled={addingRace === r.id || addedRaces.has(r.id)}
                        className={`rounded-full px-2 py-0.5 text-xs transition-colors ${
                          addedRaces.has(r.id)
                            ? "bg-green-500/20 text-green-400"
                            : "bg-[#F16823]/10 text-[#F16823] hover:bg-[#F16823]/20"
                        } disabled:opacity-50`}
                      >
                        {addedRaces.has(r.id) ? "✓ Agregada" : addingRace === r.id ? "..." : "+ Meta"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
