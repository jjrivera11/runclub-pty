export type Track = "runner" | "transformacion";

export type Objetivo = "terminar_carrera" | "mejorar_tiempo" | "bajar_peso";

export type Nivel = "principiante" | "intermedio" | "avanzado";

export type DistanciaCarrera = "5k" | "10k" | "15k" | "21k" | "42k" | "50k" | "otro";

export interface OnboardingData {
  track: Track;
  objetivo: Objetivo;
  distancia: DistanciaCarrera;
  nivel: Nivel;
  carrera_nombre: string;
  carrera_fecha: string | null;
  semanas_disponibles: number;
  dias_semana: number;
  horario_entrenamiento: string;
  lesion: string;
  peso_lbs: number;
  edad?: number | null;
  sexo?: string | null;
  estatura_cm?: number;
  tiempo_reciente: string;
  exp_pesas: string;
  acceso_gym: boolean;
  condicion_salud: string;
  is_trail?: boolean;
}
