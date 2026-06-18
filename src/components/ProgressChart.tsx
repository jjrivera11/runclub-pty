"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Checkin {
  week_number: number;
  peso_lbs: number | null;
  tiempo_libre: string | null;
}

interface ProgressChartProps {
  planId: string;
  track: string;
  pesoInicial: number;
  totalWeeks: number;
}

function timeToSeconds(time: string): number | null {
  const parts = time.split(":");
  if (parts.length !== 3) return null;
  const [h, m, s] = parts.map(Number);
  if (isNaN(h) || isNaN(m) || isNaN(s)) return null;
  return h * 3600 + m * 60 + s;
}

function secondsToTime(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

export function ProgressChart({ planId, track, pesoInicial, totalWeeks }: ProgressChartProps) {
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("weekly_checkins")
        .select("week_number, peso_lbs, tiempo_libre")
        .eq("plan_id", planId)
        .order("week_number");
      setCheckins((data as Checkin[]) ?? []);
      setLoading(false);
    }
    load();
  }, [planId]);

  if (loading) return null;
  if (checkins.length === 0) return null;

  const isTransformacion = track === "transformacion";

  const W = 340;
  const H = 180;
  const PL = 52;
  const PR = 16;
  const PT = 24;
  const PB = 36;
  const CW = W - PL - PR;
  const CH = H - PT - PB;

  if (isTransformacion) {
    const data = checkins.filter((c) => c.peso_lbs !== null);
    if (data.length === 0) return null;

    const allPesos = pesoInicial > 0
      ? [pesoInicial, ...data.map((d) => d.peso_lbs!)]
      : data.map((d) => d.peso_lbs!);
    const minP = Math.min(...allPesos) - 3;
    const maxP = Math.max(...allPesos) + 3;
    const range = maxP - minP || 1;

    const primeraSemanaTienePeso = data.length > 0 && data[0].peso_lbs === pesoInicial;
    const mostrarInicio = pesoInicial > 0 && !primeraSemanaTienePeso;
    const labels = mostrarInicio ? ["Inicio", ...data.map((d) => `S${d.week_number}`)] : data.map((d) => `S${d.week_number}`);
    const pesos = mostrarInicio ? [pesoInicial, ...data.map((d) => d.peso_lbs!)] : data.map((d) => d.peso_lbs!);
    const n = pesos.length;

    const x = (i: number) => PL + (n === 1 ? CW / 2 : (i / (n - 1)) * CW);
    const y = (p: number) => PT + ((maxP - p) / range) * CH;

    const linePts = pesos.map((p, i) => `${x(i)},${y(p)}`).join(" ");
    const areaPts = `${x(0)},${H - PB} ` + pesos.map((p, i) => `${x(i)},${y(p)}`).join(" ") + ` ${x(n - 1)},${H - PB}`;

    const lastPeso = data[data.length - 1].peso_lbs!;
    const perdido = pesoInicial > 0 ? (pesoInicial - lastPeso) : 0;

    return (
      <div className="rounded-xl border border-[#707070] bg-[#2a2b2d] p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-white">Progreso de peso</p>
          {perdido > 0 && (
            <span className="text-lg font-bold text-green-400 bg-green-400/10 px-3 py-1 rounded-full">
              -{perdido.toFixed(1)} lbs
            </span>
          )}
          {perdido < 0 && (
            <span className="text-lg font-bold text-red-400 bg-red-400/10 px-3 py-1 rounded-full">
              +{Math.abs(perdido).toFixed(1)} lbs
            </span>
          )}
        </div>
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
          <defs>
            <linearGradient id="pesoGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F16823" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#F16823" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          {[0, 1, 2, 3].map((i) => {
            const yy = PT + (i / 3) * CH;
            const val = maxP - (i / 3) * range;
            return (
              <g key={i}>
                <line x1={PL} y1={yy} x2={W - PR} y2={yy} stroke="#444" strokeWidth="0.5" strokeDasharray="4 4" />
                <text x={PL - 6} y={yy + 4} textAnchor="end" fill="#A3A3A3" fontSize="10">{Math.round(val)}</text>
              </g>
            );
          })}
          <polygon points={areaPts} fill="url(#pesoGrad)" />
          <polyline points={linePts} fill="none" stroke="#F16823" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
          {pesos.map((p, i) => (
            <g key={i}>
              <circle cx={x(i)} cy={y(p)} r="5" fill="#1B1C1E" stroke="#F16823" strokeWidth="2.5" />
              <text x={x(i)} y={y(p) - 8} textAnchor="middle" fill="white" fontSize="8" fontWeight="400">{p}</text>
            </g>
          ))}
          {labels.map((l, i) => (
            <text key={i} x={x(i)} y={H - 4} textAnchor="middle" fill="#A3A3A3" fontSize="10">{l}</text>
          ))}
        </svg>
        <div className="flex justify-between items-end pt-2 border-t border-[#707070]/30">
          <div>
            <p className="text-xs text-[#B8B8B8]">Peso actual</p>
            <p className="text-2xl font-bold text-white">{lastPeso} <span className="text-sm font-normal text-[#B8B8B8]">lbs</span></p>
          </div>
          {pesoInicial > 0 && (
            <div className="text-right">
              <p className="text-xs text-[#B8B8B8]">Inicio</p>
              <p className="text-2xl font-bold text-white">{pesoInicial} <span className="text-sm font-normal text-[#B8B8B8]">lbs</span></p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Runner
  const data = checkins.filter((c) => c.tiempo_libre && timeToSeconds(c.tiempo_libre) !== null);
  if (data.length === 0) return null;

  const segundos = data.map((d) => timeToSeconds(d.tiempo_libre!)!);
  const minS = Math.min(...segundos) - 30;
  const maxS = Math.max(...segundos) + 30;
  const range = maxS - minS || 1;
  const n = segundos.length;

  const x = (i: number) => PL + (n === 1 ? CW / 2 : (i / (n - 1)) * CW);
  const y = (s: number) => PT + ((maxS - s) / range) * CH;

  const linePts = segundos.map((s, i) => `${x(i)},${y(s)}`).join(" ");
  const areaPts = `${x(0)},${H - PB} ` + segundos.map((s, i) => `${x(i)},${y(s)}`).join(" ") + ` ${x(n - 1)},${H - PB}`;
  const mejora = n > 1 ? segundos[0] - segundos[n - 1] : 0;

  return (
    <div className="rounded-xl border border-[#707070] bg-[#2a2b2d] p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-white">Progreso de tiempos</p>
          {mejora > 0 && (
            <span className="text-xs font-semibold text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
              {secondsToTime(mejora)} mejorado
            </span>
          )}
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
        <defs>
          <linearGradient id="runGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F16823" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#F16823" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3].map((i) => {
          const yy = PT + (i / 3) * CH;
          const val = maxS - (i / 3) * range;
          return (
            <g key={i}>
              <line x1={PL} y1={yy} x2={W - PR} y2={yy} stroke="#444" strokeWidth="0.5" strokeDasharray="4 4" />
              <text x={PL - 6} y={yy + 4} textAnchor="end" fill="#A3A3A3" fontSize="9">{secondsToTime(Math.round(val))}</text>
            </g>
          );
        })}
        <polygon points={areaPts} fill="url(#runGrad)" />
        <polyline points={linePts} fill="none" stroke="#F16823" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {segundos.map((s, i) => (
          <g key={i}>
            <circle cx={x(i)} cy={y(s)} r="5" fill="#1B1C1E" stroke="#F16823" strokeWidth="2.5" />
            <text x={i === n - 1 ? x(i) : x(i) + 7} y={i === n - 1 ? y(s) - 11 : y(s) - 7} textAnchor={i === n - 1 ? "middle" : "start"} fill="#A3A3A3" fontSize="7" fontWeight="400">
              {data[i].tiempo_libre}
            </text>
          </g>
        ))}
        {data.map((d, i) => (
          <text key={i} x={x(i)} y={H - 4} textAnchor="middle" fill="#A3A3A3" fontSize="10">{`S${d.week_number}`}</text>
        ))}
      </svg>
      <div className="flex justify-between text-xs text-[#B8B8B8] pt-1 border-t border-[#707070]/30">
        <span>Mejor tiempo: <span className="text-white font-mono font-medium">{data[n - 1].tiempo_libre}</span></span>
        {n > 1 && <span>Primer registro: <span className="text-white font-mono font-medium">{data[0].tiempo_libre}</span></span>}
      </div>
    </div>
  );
}
