import type { Track } from "./onboarding";

export type SessionType =
  | "Correr"
  | "Velocidad"
  | "Long run"
  | "Descanso"
  | "Descanso activo"
  | "Fuerza"
  | "Pesas"
  | "Pesas + Cardio"
  | "HIIT"
  | "Carrera"
  | "Test";

export type WeekType =
  | "base"
  | "velocidad"
  | "volumen"
  | "recuperacion"
  | "tapering"
  | "carrera";

export interface PlanDay {
  dia: string;
  tipo_sesion: SessionType;
  titulo: string;
  descripcion: string;
  distancia_km: number | null;
  duracion_min: number | null;
  notas_locales: string;
  grupos_musculares?: string;
}

export interface PlanWeek {
  numero: number;
  nombre: string;
  tipo: WeekType;
  volumen_total_km: number;
  dias: PlanDay[];
}

export interface PlanResumen {
  titulo: string;
  duracion_semanas: number;
  volumen_inicial_km: number;
  volumen_pico_km: number;
  dias_por_semana: number;
  carrera: string;
  fecha_carrera: string;
  semanas_tapering: number;
}

export interface PlanJson {
  resumen: PlanResumen;
  semanas: PlanWeek[];
}

export interface TrainingPlan {
  id: string;
  user_id: string;
  track: Track;
  plan_json: PlanJson;
  race_name: string;
  race_date: string;
  total_weeks: number;
  semanas_generadas: number;
  is_active: boolean;
  generated_at: string;
  coach_note?: string | null;
  completion_celebrated?: boolean | null;
  pending_adaptation?: string | null;
}

export interface DayProgress {
  id: string;
  plan_id: string;
  week_number: number;
  day_name: string;
  completed: boolean;
  notes: string | null;
  logged_at: string | null;
}
