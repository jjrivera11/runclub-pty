"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { RunClubLogo } from "@/components/RunClubLogo";
import type {
  DistanciaCarrera,
  Nivel,
  Objetivo,
  OnboardingData,
  Track,
} from "@/types/onboarding";

interface Race {
  id: string;
  name: string;
  race_date: string;
  distance_km?: number;
  distances?: number[];
}

type ObjectiveOption = {
  label: string;
  objetivo: Objetivo;
  track: Track;
};

const OBJECTIVE_OPTIONS: ObjectiveOption[] = [
  {
    label: "Terminar una carrera",
    objetivo: "terminar_carrera",
    track: "runner",
  },
  {
    label: "Mejorar mi tiempo",
    objetivo: "mejorar_tiempo",
    track: "runner",
  },
  {
    label: "Transformación física",
    objetivo: "bajar_peso",
    track: "transformacion",
  },
];

const DISTANCIA_OPTIONS: { label: string; value: DistanciaCarrera }[] = [
  { label: "5K", value: "5k" },
  { label: "10K", value: "10k" },
  { label: "15K", value: "15k" },
  { label: "21K", value: "21k" },
  { label: "42K", value: "42k" },
];

const CUSTOM_RACE_ID = "__custom__";

const CUSTOM_RACE_DISTANCIA_OPTIONS: {
  label: string;
  value: DistanciaCarrera;
}[] = [
  { label: "5K", value: "5k" },
  { label: "10K", value: "10k" },
  { label: "15K", value: "15k" },
  { label: "21K", value: "21k" },
  { label: "42K", value: "42k" },
  { label: "50K", value: "50k" },
  { label: "Otra distancia", value: "otro" },
];

const NIVEL_OPTIONS: { label: string; value: Nivel }[] = [
  { label: "Principiante", value: "principiante" },
  { label: "Intermedio", value: "intermedio" },
  { label: "Avanzado", value: "avanzado" },
];

const DIAS_OPTIONS = [3, 4, 5];

const HORARIO_OPTIONS = [
  { label: "Mañana", value: "mañana" },
  { label: "Noche", value: "noche" },
  { label: "Ambos", value: "ambos" },
];

const PESO_OPTIONS = ["1-10 lbs", "10-20 lbs", "20-30 lbs", "Más de 30 lbs"];

const EXP_PESAS_OPTIONS = [
  { label: "Nunca he levantado pesas", value: "ninguna" },
  { label: "He ido al gym pero sin rutina fija", value: "poca" },
  { label: "Entreno con pesas regularmente", value: "regular" },
];

const ZONAS_PANAMA = [
  "Panama Ciudad",
  "La Chorrera",
  "Playas del Este",
  "Penonome",
  "Santiago",
  "Chitre",
  "Chiriqui",
  "Colon",
  "David",
];

const RUNNER_STEP_LABELS = [
  "Objetivo",
  "Perfil personal",
  "Distancia",
  "Nivel",
  "Carrera",
  "Días por semana",
  "Lesión o limitación",
  "Tiempo reciente",
  "Horario",
  "Zona",
  "Compañero",
];

const TRANSFORMACION_STEP_LABELS = [
  "Objetivo",
  "Perfil personal",
  "Peso a perder",
  "Experiencia con pesas",
  "Acceso a gimnasio",
  "Peso actual",
  "Días por semana",
  "Condición de salud",
  "Horario",
  "Compañero",
];

function calculateWeeksUntilRace(raceDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const race = new Date(raceDate);
  race.setHours(0, 0, 0, 0);
  const diffDays = (race.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
  return Math.max(1, Math.floor(diffDays / 7));
}

function formatRaceDate(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("es-PA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function OptionCard({
  label,
  selected,
  onClick,
  description,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  description?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-lg border px-4 py-4 text-left transition-colors ${
        selected
          ? "border-[#F16823] bg-[#2a2b2d] text-white"
          : "border-[#707070] bg-transparent text-white hover:border-[#909090]"
      }`}
    >
      <span className="font-medium">{label}</span>
      {description && (
        <span className="mt-1 block text-sm text-[#B8B8B8]">{description}</span>
      )}
    </button>
  );
}

function OnboardingPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedCarreraId = searchParams.get("carrera");
  const tipoMantenimiento = searchParams.get("tipo") === "mantenimiento";
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [races, setRaces] = useState<Race[]>([]);
  const [racesLoading, setRacesLoading] = useState(true);

  const [track, setTrack] = useState<Track | null>(null);
  const [objetivo, setObjetivo] = useState<Objetivo | null>(null);
  const [distancia, setDistancia] = useState<DistanciaCarrera | null>(null);
  const [nivel, setNivel] = useState<Nivel | null>(null);
  const [selectedRaceId, setSelectedRaceId] = useState<string | null>(null);
  const [selectedRaceDistance, setSelectedRaceDistance] = useState<number | null>(null);
  const [customRaceName, setCustomRaceName] = useState("");
  const [customRaceDate, setCustomRaceDate] = useState("");
  const [customRaceDistancia, setCustomRaceDistancia] =
    useState<DistanciaCarrera | null>(null);
  const [diasSemana, setDiasSemana] = useState<number | null>(null);
  const [lesion, setLesion] = useState("");
  const [tiempoReciente, setTiempoReciente] = useState("");
  const [haCorridoAntes, setHaCorridoAntes] = useState<boolean | null>(null);
  const [horario, setHorario] = useState<string | null>(null);
  const [pesoAPerder, setPesoAPerder] = useState<string | null>(null);
  const [expPesas, setExpPesas] = useState<string | null>(null);
  const [accesoGym, setAccesoGym] = useState<boolean | null>(null);
  const [condicionSalud, setCondicionSalud] = useState("");
  const [pesoActual, setPesoActual] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [diaNac, setDiaNac] = useState("");
  const [mesNac, setMesNac] = useState("");
  const [anioNac, setAnioNac] = useState("");
  const [edad, setEdad] = useState<number | null>(null);
  const [edadConfirmada, setEdadConfirmada] = useState(false);
  const [estatura, setEstatura] = useState("");
  const [sexo, setSexo] = useState<string | null>(null);
  const [buscaPartner, setBuscaPartner] = useState<boolean | null>(null);
  const [isTrail, setIsTrail] = useState(false);
  const [partnerZona, setPartnerZona] = useState<string | null>(null);
  const [partnerWhatsapp, setPartnerWhatsapp] = useState("");
  const [partnerGenero, setPartnerGenero] = useState<string | null>(null);
  const [zonaEntrenamiento, setZonaEntrenamiento] = useState<string | null>(null);
  const [showAllRaces, setShowAllRaces] = useState(false);

  const isCustomRace = selectedRaceId === CUSTOM_RACE_ID;

  const selectedRace = useMemo(
    () => races.find((race) => race.id === selectedRaceId) ?? null,
    [races, selectedRaceId]
  );

  const effectiveRaceName = isCustomRace
    ? customRaceName.trim()
    : (selectedRace?.name ?? "");

  const effectiveRaceDate = isCustomRace
    ? customRaceDate
    : (selectedRace?.race_date ?? "");

  const semanasDisponibles = useMemo(() => {
    if (!effectiveRaceDate) return null;
    return calculateWeeksUntilRace(effectiveRaceDate);
  }, [effectiveRaceDate]);

  const stepLabels =
    track === "transformacion"
      ? TRANSFORMACION_STEP_LABELS
      : RUNNER_STEP_LABELS;

  const totalSteps = stepLabels.length;

  useEffect(() => {
    async function fetchRaces() {
      const supabase = createClient();
      const { data, error: fetchError } = await supabase
        .from("races")
        .select("id, name, distance_km, race_date, distances")
        .eq("is_active", true)
        .gte("race_date", new Date().toISOString().split("T")[0])
        .order("race_date", { ascending: true });

      if (!fetchError && data) {
        setRaces(data as Race[]);
        if (preselectedCarreraId) {
          setSelectedRaceId(preselectedCarreraId);
        }
      }
      setRacesLoading(false);
    }

    fetchRaces();
  }, []);

  useEffect(() => {
    if (tipoMantenimiento) {
      setObjetivo("bajar_peso");
      setTrack("transformacion");
    }
  }, [tipoMantenimiento]);

  const canProceed = useCallback((): boolean => {
    if (step === 0) return objetivo !== null && track !== null;

    if (track === "runner") {
      switch (step) {
        case 1:
          return edad !== null && sexo !== null && estatura.trim().length > 0 && Number(estatura) >= 120 && Number(estatura) <= 220;
        case 2:
          return distancia !== null;
        case 3:
          return nivel !== null;
        case 4:
          if (isCustomRace) {
            return (
              customRaceName.trim().length > 0 &&
              customRaceDate.length > 0 &&
              customRaceDistancia !== null
            );
          }
          return selectedRaceId !== null;
        case 5:
          return diasSemana !== null;
        case 6:
          return true;
        case 7:
          return tiempoReciente.trim().length > 0;
        case 8:
          return horario !== null;
        case 9:
          return zonaEntrenamiento !== null;
        case 10:
          return buscaPartner === false || (buscaPartner === true && partnerZona !== null && partnerWhatsapp.trim().length >= 7 && partnerGenero !== null);
        default:
          return false;
      }
    }

    if (track === "transformacion") {
      switch (step) {
        case 1:
          return edad !== null && sexo !== null && estatura.trim().length > 0 && Number(estatura) >= 120 && Number(estatura) <= 220;
        case 2:
          return pesoAPerder !== null;
        case 3:
          return expPesas !== null;
        case 4:
          return accesoGym !== null;
        case 5:
          return pesoActual.trim().length > 0;
        case 6:
          return diasSemana !== null;
        case 7:
          return true;
        case 8:
          return horario !== null;
        case 9:
          return buscaPartner === false || (buscaPartner === true && partnerZona !== null && partnerWhatsapp.trim().length >= 7 && partnerGenero !== null);
        default:
          return false;
      }
    }

    return false;
  }, [
    step,
    track,
    objetivo,
    distancia,
    nivel,
    selectedRaceId,
    isCustomRace,
    customRaceName,
    customRaceDate,
    customRaceDistancia,
    diasSemana,
    tiempoReciente,
    horario,
    pesoAPerder,
    expPesas,
    accesoGym,
    pesoActual,
    edad,
    sexo,
    buscaPartner,
    partnerZona,
    partnerWhatsapp,
    partnerGenero,
    zonaEntrenamiento,
  ]);

  function handleObjectiveSelect(option: ObjectiveOption) {
    setObjetivo(option.objetivo);
    setTrack(option.track);
  }

  function calcularEdad(fecha: string): number {
    const hoy = new Date();
    const nacimiento = new Date(fecha);
    let age = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) age--;
    return age;
  }

  function handleFechaNacimiento(fecha: string) {
    setFechaNacimiento(fecha);
    setEdadConfirmada(false);
    setEdad(null);
    if (fecha) {
      const e = calcularEdad(fecha);
      if (e >= 13 && e <= 80) setEdad(e);
    }
  }

  function handleFechaNacimientoManual(dia: string, mes: string, anio: string) {
    if (dia && mes && anio && anio.length === 4) {
      const fecha = `${anio}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`;
      setFechaNacimiento(fecha);
      handleFechaNacimiento(fecha);
    } else {
      setFechaNacimiento("");
      setEdad(null);
      setEdadConfirmada(false);
    }
  }

  function handleConfirmarEdad() {
    setEdadConfirmada(true);
  }

  function handlePrevious() {
    setError(null);
    setStep((current) => Math.max(0, current - 1));
  }

  function handleNext() {
    setError(null);
    console.log("handleNext step:", step, "track:", track, "edad:", edad, "sexo:", sexo, "canProceed:", canProceed());
    if (!canProceed()) {
      setError("Completa este paso antes de continuar.");
      return;
    }
    setStep((current) => current + 1);
  }

  async function handleFinish() {
    setError(null);
    if (!canProceed() || !track || !objetivo || diasSemana === null) {
      setError("Completa todos los campos requeridos.");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const answers: OnboardingData = {
      track,
      objetivo,
      edad: edad ?? null,
      sexo: sexo ?? null,
      distancia: isCustomRace
        ? (customRaceDistancia ?? "5k")
        : (distancia ?? "5k"),
      nivel: nivel ?? "principiante",
      carrera_nombre: effectiveRaceName,
      carrera_fecha: effectiveRaceDate || null,
      semanas_disponibles: semanasDisponibles ?? 0,
      dias_semana: diasSemana,
      horario_entrenamiento: horario ?? "",
      lesion,
      peso_lbs: pesoActual ? Number(pesoActual) : 0,
      estatura_cm: estatura ? Number(estatura) : 0,
      tiempo_reciente: tiempoReciente,
      exp_pesas: expPesas ?? "",
      acceso_gym: accesoGym ?? false,
      condicion_salud: condicionSalud,
      is_trail: isTrail,
    };

    const { nivel: nivelActual, dias_semana: diasDisponibles, ...restAnswers } =
      answers;

    const payload = {
      user_id: user.id,
      ...restAnswers,
      nivel_actual: nivelActual,
      dias_disponibles: diasDisponibles,
      peso_a_perder: pesoAPerder,
    };

    console.log("onboarding_answers upsert payload:", payload);

    const { error: upsertError } = await supabase
      .from("onboarding_answers")
      .upsert(payload, { onConflict: "user_id" });

    if (upsertError) {
      console.log("onboarding_answers upsert error:", upsertError);
      setError("No se pudieron guardar tus respuestas. Intenta de nuevo.");
      setLoading(false);
      return;
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        track,
        busca_partner: buscaPartner ?? false,
        partner_zona: buscaPartner ? partnerZona : null,
        partner_whatsapp: buscaPartner ? partnerWhatsapp : null,
        partner_nivel: nivel ?? expPesas ?? null,
        partner_genero: buscaPartner ? partnerGenero : null,
        zona_entrenamiento: zonaEntrenamiento,
      })
      .eq("id", user.id);

    if (profileError) {
      console.log("profiles update error:", profileError);
      setError("No se pudo actualizar tu perfil. Intenta de nuevo.");
      setLoading(false);
      return;
    }

    console.log("onboarding complete, redirecting to /generating");
    router.push(`/generating?track=${track}`);
    router.refresh();
  }

  const isLastStep = step === totalSteps - 1;

  function renderStepContent() {
    if (step === 0) {
      return (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white">
            Primero lo primero — ¿qué quieres lograr?
          </h2>
          <div className="space-y-3">
            {OBJECTIVE_OPTIONS.map((option) => (
              <OptionCard
                key={option.label}
                label={option.label}
                selected={objetivo === option.objetivo}
                onClick={() => handleObjectiveSelect(option)}
              />
            ))}
          </div>
        </div>
      );
    }

    if (track === "runner") {
      switch (step) {
        case 1:
          return (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">
                Hablemos de ti
              </h2>
              <div>
                <p className="text-sm text-[#B8B8B8] mb-2">¿Cuándo naciste?</p>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-[#B8B8B8] mb-1">Día</label>
                    <input
                      type="number"
                      min={1}
                      max={31}
                      placeholder="15"
                      value={diaNac}
                      onChange={(e) => { setDiaNac(e.target.value); handleFechaNacimientoManual(e.target.value, mesNac, anioNac); }}
                      className="w-full rounded-lg border border-[#707070] bg-[#2a2b2d] px-3 py-3 text-white outline-none focus:border-[#F16823] focus:ring-1 focus:ring-[#F16823] text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#B8B8B8] mb-1">Mes</label>
                    <select
                      value={mesNac}
                      onChange={(e) => { setMesNac(e.target.value); handleFechaNacimientoManual(diaNac, e.target.value, anioNac); }}
                      className="w-full rounded-lg border border-[#707070] bg-[#2a2b2d] px-3 py-3 text-white outline-none focus:border-[#F16823] focus:ring-1 focus:ring-[#F16823]"
                    >
                      <option value="">—</option>
                      {["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"].map((m, i) => (
                        <option key={i} value={String(i + 1)}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-[#B8B8B8] mb-1">Año</label>
                    <input
                      type="number"
                      min={1940}
                      max={new Date().getFullYear() - 13}
                      placeholder="1990"
                      value={anioNac}
                      onChange={(e) => { setAnioNac(e.target.value); handleFechaNacimientoManual(diaNac, mesNac, e.target.value); }}
                      className="w-full rounded-lg border border-[#707070] bg-[#2a2b2d] px-3 py-3 text-white outline-none focus:border-[#F16823] focus:ring-1 focus:ring-[#F16823] text-center"
                    />
                  </div>
                </div>
              </div>
              {edad !== null && !edadConfirmada && (
                <div className="rounded-lg border border-[#F16823]/30 bg-[#F16823]/10 px-4 py-3">
                  <p className="text-sm text-white mb-3">
                    Tienes <span className="font-bold text-[#F16823] text-lg">{edad} años</span>. ¿Es correcto?
                  </p>
                  <button
                    type="button"
                    onClick={handleConfirmarEdad}
                    className="rounded-lg bg-[#F16823] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                  >
                    Sí, confirmar
                  </button>
                </div>
              )}
              {edadConfirmada && (
                <p className="text-sm text-green-400">Edad confirmada: {edad} años</p>
              )}
              <p className="text-sm text-[#B8B8B8] mt-2 mb-1">¿Cuánto mides?</p>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={estatura}
                  onChange={(e) => setEstatura(e.target.value)}
                  placeholder="Ej: 175"
                  min={120}
                  max={220}
                  className="w-full rounded-lg border border-[#707070] bg-[#2a2b2d] px-4 py-3 text-white placeholder:text-[#B8B8B8] outline-none focus:border-[#F16823] focus:ring-1 focus:ring-[#F16823]"
                />
                <span className="shrink-0 text-[#B8B8B8]">cm</span>
              </div>
              <div className="space-y-3">
                <OptionCard
                  label="Hombre"
                  selected={sexo === "hombre"}
                  onClick={() => setSexo("hombre")}
                />
                <OptionCard
                  label="Mujer"
                  selected={sexo === "mujer"}
                  onClick={() => setSexo("mujer")}
                />
                <OptionCard
                  label="Prefiero no decir"
                  selected={sexo === "no_especificado"}
                  onClick={() => setSexo("no_especificado")}
                />
              </div>
            </div>
          );
        case 2:
          return (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">
                ¿Cuál es tu distancia objetivo?
              </h2>
              <div className="space-y-3">
                {DISTANCIA_OPTIONS.map((option) => (
                  <OptionCard
                    key={option.value}
                    label={option.label}
                    selected={distancia === option.value}
                    onClick={() => setDistancia(option.value)}
                  />
                ))}
              </div>
            </div>
          );
        case 3:
          return (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">
                Sé honesto contigo mismo — ¿dónde estás hoy?
              </h2>
              <div className="space-y-3">
                {NIVEL_OPTIONS.map((option) => (
                  <OptionCard
                    key={option.value}
                    label={option.label}
                    selected={nivel === option.value}
                    onClick={() => setNivel(option.value)}
                  />
                ))}
              </div>
            </div>
          );
        case 4: {
          const distanciaKm: Record<DistanciaCarrera, number[]> = {
            "5k": [5],
            "10k": [10],
            "15k": [15],
            "21k": [21, 21.1],
            "42k": [42],
            "50k": [50],
            "otro": [],
          };

          const kmValues = distancia ? distanciaKm[distancia] ?? [] : [];

          const filteredRaces = distancia && kmValues.length > 0
            ? races.filter((race) =>
                race.distances?.some((d) => kmValues.some((k) => Math.abs(d - k) < 0.5))
              )
            : races;

          const racesToShow = showAllRaces ? races : filteredRaces;
          const hasFilter = filteredRaces.length < races.length && !showAllRaces;

          return (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">
                ¿Ya tienes una carrera en mente?
              </h2>
              {distancia && filteredRaces.length === 0 && !showAllRaces && (
                <div className="rounded-lg border border-[#707070]/40 bg-[#2a2b2d] px-4 py-3">
                  <p className="text-sm text-[#B8B8B8]">No hay carreras disponibles para tu distancia aún.</p>
                </div>
              )}
              {racesLoading ? (
                <p className="text-[#B8B8B8]">Cargando carreras...</p>
              ) : (
                <div className="space-y-3">
                  {racesToShow.map((race) => (
                    <div key={race.id}>
                      <OptionCard
                        label={race.name}
                        description={formatRaceDate(race.race_date)}
                        selected={selectedRaceId === race.id}
                        onClick={() => {
                          setSelectedRaceId(race.id);
                          if (race.distances && race.distances.length === 1) {
                            const d = race.distances[0];
                            setDistancia(d <= 5 ? "5k" : d <= 10 ? "10k" : d <= 15 ? "15k" : d <= 21 ? "21k" : d <= 42 ? "42k" : "otro");
                          }
                        }}
                      />
                      {selectedRaceId === race.id && race.distances && race.distances.length > 1 && (
                        <div className="rounded-lg border border-[#F16823]/30 bg-[#2a2b2d] p-3 mt-1">
                          <p className="text-xs text-[#B8B8B8] mb-2">¿En qué distancia correrás?</p>
                          <div className="flex flex-wrap gap-2">
                            {race.distances.map((d) => (
                              <button
                                key={d}
                                type="button"
                                onClick={() => {
                                  setSelectedRaceDistance(d);
                                  setDistancia(d <= 5 ? "5k" : d <= 10 ? "10k" : d <= 15 ? "15k" : d <= 21 ? "21k" : d <= 42 ? "42k" : "otro");
                                }}
                                className={`rounded-full px-3 py-1 text-sm font-medium transition-colors border ${
                                  selectedRaceDistance === d
                                    ? "border-[#F16823] bg-[#F16823]/10 text-[#F16823]"
                                    : "border-[#707070] text-[#B8B8B8]"
                                }`}
                              >
                                {d}K
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {hasFilter && (
                    <button
                      type="button"
                      onClick={() => setShowAllRaces(true)}
                      className="w-full rounded-lg border border-[#707070]/40 bg-transparent px-4 py-3 text-sm text-[#B8B8B8] hover:border-[#909090] hover:text-white transition-colors"
                    >
                      Ver todas las carreras disponibles ({races.length})
                    </button>
                  )}

                  {showAllRaces && distancia && (
                    <button
                      type="button"
                      onClick={() => setShowAllRaces(false)}
                      className="w-full rounded-lg border border-[#707070]/40 bg-transparent px-4 py-3 text-sm text-[#B8B8B8] hover:border-[#909090] hover:text-white transition-colors"
                    >
                      Mostrar solo carreras de {distancia.toUpperCase()}
                    </button>
                  )}

                  <OptionCard
                    label="✏️ Otra carrera"
                    description="Ingresa los datos de tu carrera"
                    selected={isCustomRace}
                    onClick={() => setSelectedRaceId(CUSTOM_RACE_ID)}
                  />
                </div>
              )}
              {isCustomRace && (
                <div className="space-y-4 rounded-lg border border-[#707070] bg-[#2a2b2d] p-4">
                  <div>
                    <label htmlFor="custom-race-name" className="mb-1.5 block text-sm text-[#B8B8B8]">
                      Nombre de la carrera
                    </label>
                    <input
                      id="custom-race-name"
                      type="text"
                      required
                      value={customRaceName}
                      onChange={(e) => setCustomRaceName(e.target.value)}
                      placeholder="Ej: Media Maratón de Panamá"
                      className="w-full rounded-lg border border-[#707070] bg-[#1B1C1E] px-4 py-3 text-white placeholder:text-[#B8B8B8] outline-none focus:border-[#F16823] focus:ring-1 focus:ring-[#F16823]"
                    />
                  </div>
                  <div>
                    <label htmlFor="custom-race-distance" className="mb-1.5 block text-sm text-[#B8B8B8]">
                      Distancia
                    </label>
                    <select
                      id="custom-race-distance"
                      required
                      value={customRaceDistancia ?? ""}
                      onChange={(e) => setCustomRaceDistancia(e.target.value as DistanciaCarrera)}
                      className="w-full rounded-lg border border-[#707070] bg-[#1B1C1E] px-4 py-3 text-white outline-none focus:border-[#F16823] focus:ring-1 focus:ring-[#F16823]"
                    >
                      <option value="" disabled>Selecciona una distancia</option>
                      {CUSTOM_RACE_DISTANCIA_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="custom-race-date" className="mb-1.5 block text-sm text-[#B8B8B8]">
                      Fecha de la carrera
                    </label>
                    <input
                      id="custom-race-date"
                      type="date"
                      required
                      value={customRaceDate}
                      onChange={(e) => setCustomRaceDate(e.target.value)}
                      className="w-full rounded-lg border border-[#707070] bg-[#1B1C1E] px-4 py-3 text-white outline-none focus:border-[#F16823] focus:ring-1 focus:ring-[#F16823]"
                    />
                  </div>
                </div>
              )}
              <div className="rounded-lg border border-[#707070]/40 bg-[#2a2b2d] p-4 mt-2">
                <p className="text-sm font-medium text-white mb-3">¿Es una carrera trail? 🏔️</p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsTrail(false)}
                    className={`flex-1 rounded-lg border py-2.5 text-sm font-medium transition-colors ${!isTrail ? "border-[#F16823] bg-[#F16823]/10 text-[#F16823]" : "border-[#707070] text-[#B8B8B8]"}`}
                  >
                    🏁 Road
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsTrail(true)}
                    className={`flex-1 rounded-lg border py-2.5 text-sm font-medium transition-colors ${isTrail ? "border-[#F16823] bg-[#F16823]/10 text-[#F16823]" : "border-[#707070] text-[#B8B8B8]"}`}
                  >
                    🏔️ Trail
                  </button>
                </div>
                {isTrail && (
                  <p className="text-xs text-[#B8B8B8] mt-2">Coach JJ ajustará tu plan con sesiones de cuestas, desnivel y terreno técnico.</p>
                )}
              </div>
            </div>
          );
        }
        case 5:
          return (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">
                ¿Cuántos días a la semana puedes comprometerte?
              </h2>
              {semanasDisponibles !== null && (
                <p className="text-sm text-[#B8B8B8]">
                  Tienes{" "}
                  <span className="font-medium text-[#F16823]">
                    {semanasDisponibles} semana
                    {semanasDisponibles !== 1 ? "s" : ""}
                  </span>{" "}
                  hasta la carrera
                  {effectiveRaceName ? ` (${effectiveRaceName})` : ""}.
                </p>
              )}
              <div className="space-y-3">
                {DIAS_OPTIONS.map((days) => (
                  <OptionCard
                    key={days}
                    label={`${days} días`}
                    selected={diasSemana === days}
                    onClick={() => setDiasSemana(days)}
                  />
                ))}
              </div>
            </div>
          );
        case 6:
          return (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">
                Antes de arrancar — ¿tienes alguna lesión o molestia?
              </h2>
              <p className="text-sm text-[#B8B8B8]">Es importante que lo sepamos para protegerte</p>
              <textarea
                value={lesion}
                onChange={(e) => setLesion(e.target.value)}
                placeholder="Ej: dolor en rodilla derecha, problema de espalda baja..."
                rows={4}
                className="w-full rounded-lg border border-[#707070] bg-[#2a2b2d] px-4 py-3 text-white placeholder:text-[#B8B8B8] outline-none focus:border-[#F16823] focus:ring-1 focus:ring-[#F16823]"
              />
            </div>
          );
        case 7:
          return (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">
                ¿Has participado en alguna carrera recientemente?
              </h2>
              <p className="text-sm text-[#B8B8B8]">
                Tu tiempo de referencia nos ayuda a calibrar tu plan y hacerlo mucho más personalizado.
              </p>
              <div className="space-y-3">
                <OptionCard
                  label="Sí, he corrido antes"
                  selected={haCorridoAntes === true}
                  onClick={() => setHaCorridoAntes(true)}
                />
                <OptionCard
                  label="No, será mi primera vez"
                  selected={haCorridoAntes === false}
                  onClick={() => { setHaCorridoAntes(false); setTiempoReciente("primera carrera"); }}
                />
              </div>
              {haCorridoAntes === true && (
                <div className="space-y-2 pt-2">
                  <p className="text-sm text-white font-medium">¡Qué bueno! ¿Cuál fue tu mejor marca?</p>
                  <p className="text-xs text-[#B8B8B8]">No importa si fue un 5K o una media — cada marca cuenta.</p>
                  <input
                    type="text"
                    value={tiempoReciente}
                    onChange={(e) => setTiempoReciente(e.target.value)}
                    placeholder="Ej: 5K en 28 min, 10K en 55 min..."
                    className="w-full rounded-lg border border-[#707070] bg-[#2a2b2d] px-4 py-3 text-white placeholder:text-[#B8B8B8] outline-none focus:border-[#F16823] focus:ring-1 focus:ring-[#F16823]"
                  />
                </div>
              )}
              {haCorridoAntes === false && (
                <div className="rounded-lg border border-[#F16823]/20 bg-[#F16823]/5 px-4 py-3">
                  <p className="text-sm text-[#B8B8B8]">Perfecto — todos empezamos en algún punto. Vamos a construir desde cero contigo. 💪</p>
                </div>
              )}
            </div>
          );
        case 8:
          return (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">
                ¿A qué hora prefieres entrenar?
              </h2>
              <div className="space-y-3">
                {HORARIO_OPTIONS.map((option) => (
                  <OptionCard
                    key={option.value}
                    label={option.label}
                    selected={horario === option.value}
                    onClick={() => setHorario(option.value)}
                  />
                ))}
              </div>
            </div>
          );
        case 9:
          return (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">
                ¿Dónde entrenas normalmente?
              </h2>
              <p className="text-sm text-[#B8B8B8]">
                Usamos esto para sugerirte rutas y lugares de entrenamiento cerca de ti.
              </p>
              <div className="space-y-3">
                {ZONAS_PANAMA.map((zona) => (
                  <OptionCard
                    key={zona}
                    label={zona}
                    selected={zonaEntrenamiento === zona}
                    onClick={() => setZonaEntrenamiento(zona)}
                  />
                ))}
              </div>
            </div>
          );
        case 10:
          return (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">
                Entrenar acompañado es más divertido. ¿Buscamos un partner para ti?
              </h2>
              <div className="space-y-3">
                <OptionCard
                  label="Sí, quiero encontrar un partner"
                  selected={buscaPartner === true}
                  onClick={() => setBuscaPartner(true)}
                />
                <OptionCard
                  label="No por ahora"
                  selected={buscaPartner === false}
                  onClick={() => setBuscaPartner(false)}
                />
              </div>
              {buscaPartner === true && (
                <div className="space-y-2">
                  <p className="text-sm text-[#B8B8B8]">¿Qué estás buscando?</p>
                  <div className="space-y-2">
                    <OptionCard
                      label="Hombre"
                      selected={partnerGenero === "hombre"}
                      onClick={() => setPartnerGenero("hombre")}
                    />
                    <OptionCard
                      label="Mujer"
                      selected={partnerGenero === "mujer"}
                      onClick={() => setPartnerGenero("mujer")}
                    />
                    <OptionCard
                      label="Ambos"
                      selected={partnerGenero === "ambos"}
                      onClick={() => setPartnerGenero("ambos")}
                    />
                  </div>
                </div>
              )}
              {buscaPartner === true && (
                <div className="space-y-4 pt-2">
                  <div>
                    <p className="text-sm text-[#B8B8B8] mb-2">¿Dónde entrenas?</p>
                    <div className="space-y-2">
                      {ZONAS_PANAMA.map((zona) => (
                        <OptionCard
                          key={zona}
                          label={zona}
                          selected={partnerZona === zona}
                          onClick={() => setPartnerZona(zona)}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-[#B8B8B8] mb-2">¿Cómo te contactamos? (WhatsApp)</p>
                    <input
                      type="tel"
                      value={partnerWhatsapp}
                      onChange={(e) => setPartnerWhatsapp(e.target.value)}
                      placeholder="+507 6000-0000"
                      className="w-full rounded-lg border border-[#707070] bg-[#2a2b2d] px-4 py-3 text-white placeholder:text-[#B8B8B8] outline-none focus:border-[#F16823] focus:ring-1 focus:ring-[#F16823]"
                    />
                  </div>
                </div>
              )}
            </div>
          );
      }
    }

    if (track === "transformacion") {
      switch (step) {
        case 1:
          return (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">
                Hablemos de ti
              </h2>
              <div>
                <p className="text-sm text-[#B8B8B8] mb-2">¿Cuándo naciste?</p>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-[#B8B8B8] mb-1">Día</label>
                    <input
                      type="number"
                      min={1}
                      max={31}
                      placeholder="15"
                      value={diaNac}
                      onChange={(e) => { setDiaNac(e.target.value); handleFechaNacimientoManual(e.target.value, mesNac, anioNac); }}
                      className="w-full rounded-lg border border-[#707070] bg-[#2a2b2d] px-3 py-3 text-white outline-none focus:border-[#F16823] focus:ring-1 focus:ring-[#F16823] text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#B8B8B8] mb-1">Mes</label>
                    <select
                      value={mesNac}
                      onChange={(e) => { setMesNac(e.target.value); handleFechaNacimientoManual(diaNac, e.target.value, anioNac); }}
                      className="w-full rounded-lg border border-[#707070] bg-[#2a2b2d] px-3 py-3 text-white outline-none focus:border-[#F16823] focus:ring-1 focus:ring-[#F16823]"
                    >
                      <option value="">—</option>
                      {["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"].map((m, i) => (
                        <option key={i} value={String(i + 1)}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-[#B8B8B8] mb-1">Año</label>
                    <input
                      type="number"
                      min={1940}
                      max={new Date().getFullYear() - 13}
                      placeholder="1990"
                      value={anioNac}
                      onChange={(e) => { setAnioNac(e.target.value); handleFechaNacimientoManual(diaNac, mesNac, e.target.value); }}
                      className="w-full rounded-lg border border-[#707070] bg-[#2a2b2d] px-3 py-3 text-white outline-none focus:border-[#F16823] focus:ring-1 focus:ring-[#F16823] text-center"
                    />
                  </div>
                </div>
              </div>
              {edad !== null && !edadConfirmada && (
                <div className="rounded-lg border border-[#F16823]/30 bg-[#F16823]/10 px-4 py-3">
                  <p className="text-sm text-white mb-3">
                    Tienes <span className="font-bold text-[#F16823] text-lg">{edad} años</span>. ¿Es correcto?
                  </p>
                  <button
                    type="button"
                    onClick={handleConfirmarEdad}
                    className="rounded-lg bg-[#F16823] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                  >
                    Sí, confirmar
                  </button>
                </div>
              )}
              {edadConfirmada && (
                <p className="text-sm text-green-400">Edad confirmada: {edad} años</p>
              )}
              <p className="text-sm text-[#B8B8B8] mt-2 mb-1">¿Cuánto mides?</p>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={estatura}
                  onChange={(e) => setEstatura(e.target.value)}
                  placeholder="Ej: 175"
                  min={120}
                  max={220}
                  className="w-full rounded-lg border border-[#707070] bg-[#2a2b2d] px-4 py-3 text-white placeholder:text-[#B8B8B8] outline-none focus:border-[#F16823] focus:ring-1 focus:ring-[#F16823]"
                />
                <span className="shrink-0 text-[#B8B8B8]">cm</span>
              </div>
              <div className="space-y-3">
                <OptionCard
                  label="Hombre"
                  selected={sexo === "hombre"}
                  onClick={() => setSexo("hombre")}
                />
                <OptionCard
                  label="Mujer"
                  selected={sexo === "mujer"}
                  onClick={() => setSexo("mujer")}
                />
                <OptionCard
                  label="Prefiero no decir"
                  selected={sexo === "no_especificado"}
                  onClick={() => setSexo("no_especificado")}
                />
              </div>
            </div>
          );
        case 2:
          return (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">
                Seamos directos — ¿cuánto peso quieres perder?
              </h2>
              <div className="space-y-3">
                {PESO_OPTIONS.map((option) => (
                  <OptionCard
                    key={option}
                    label={option}
                    selected={pesoAPerder === option}
                    onClick={() => setPesoAPerder(option)}
                  />
                ))}
              </div>
            </div>
          );
        case 3:
          return (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">
                ¿Cómo te llevas con el gimnasio?
              </h2>
              <div className="space-y-3">
                {EXP_PESAS_OPTIONS.map((option) => (
                  <OptionCard
                    key={option.value}
                    label={option.label}
                    selected={expPesas === option.value}
                    onClick={() => setExpPesas(option.value)}
                  />
                ))}
              </div>
            </div>
          );
        case 4:
          return (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">
                ¿Tienes acceso a un gimnasio?
              </h2>
              <div className="space-y-3">
                <OptionCard
                  label="Sí"
                  selected={accesoGym === true}
                  onClick={() => setAccesoGym(true)}
                />
                <OptionCard
                  label="No"
                  selected={accesoGym === false}
                  onClick={() => setAccesoGym(false)}
                />
              </div>
            </div>
          );
        case 5:
          return (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">
                Para hacer tu plan lo más preciso posible — ¿cuánto pesas hoy?
              </h2>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={pesoActual}
                  onChange={(e) => setPesoActual(e.target.value)}
                  placeholder="Ej: 185"
                  min={50}
                  max={500}
                  className="w-full rounded-lg border border-[#707070] bg-[#2a2b2d] px-4 py-3 text-white placeholder:text-[#B8B8B8] outline-none focus:border-[#F16823] focus:ring-1 focus:ring-[#F16823]"
                />
                <span className="shrink-0 text-[#B8B8B8]">lbs</span>
              </div>
            </div>
          );
        case 6:
          return (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">
                ¿Cuántos días a la semana puedes comprometerte?
              </h2>
              <div className="space-y-3">
                {DIAS_OPTIONS.map((days) => (
                  <OptionCard
                    key={days}
                    label={`${days} días`}
                    selected={diasSemana === days}
                    onClick={() => setDiasSemana(days)}
                  />
                ))}
              </div>
            </div>
          );
        case 7:
          return (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">
                ¿Hay algo médico que debamos saber antes de empezar?
              </h2>
              <p className="text-sm text-[#B8B8B8]">Tu seguridad es lo primero</p>
              <textarea
                value={condicionSalud}
                onChange={(e) => setCondicionSalud(e.target.value)}
                placeholder="Ej: diabetes, hipertensión, problema de rodilla..."
                rows={4}
                className="w-full rounded-lg border border-[#707070] bg-[#2a2b2d] px-4 py-3 text-white placeholder:text-[#B8B8B8] outline-none focus:border-[#F16823] focus:ring-1 focus:ring-[#F16823]"
              />
            </div>
          );
        case 8:
          return (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">
                ¿A qué hora prefieres entrenar?
              </h2>
              <div className="space-y-3">
                {HORARIO_OPTIONS.map((option) => (
                  <OptionCard
                    key={option.value}
                    label={option.label}
                    selected={horario === option.value}
                    onClick={() => setHorario(option.value)}
                  />
                ))}
              </div>
            </div>
          );
        case 9:
          return (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">
                Entrenar acompañado es más divertido. ¿Buscamos un partner para ti?
              </h2>
              <div className="space-y-3">
                <OptionCard
                  label="Sí, quiero encontrar un partner"
                  selected={buscaPartner === true}
                  onClick={() => setBuscaPartner(true)}
                />
                <OptionCard
                  label="No por ahora"
                  selected={buscaPartner === false}
                  onClick={() => setBuscaPartner(false)}
                />
              </div>
              {buscaPartner === true && (
                <div className="space-y-2">
                  <p className="text-sm text-[#B8B8B8]">¿Qué estás buscando?</p>
                  <div className="space-y-2">
                    <OptionCard
                      label="Hombre"
                      selected={partnerGenero === "hombre"}
                      onClick={() => setPartnerGenero("hombre")}
                    />
                    <OptionCard
                      label="Mujer"
                      selected={partnerGenero === "mujer"}
                      onClick={() => setPartnerGenero("mujer")}
                    />
                    <OptionCard
                      label="Ambos"
                      selected={partnerGenero === "ambos"}
                      onClick={() => setPartnerGenero("ambos")}
                    />
                  </div>
                </div>
              )}
              {buscaPartner === true && (
                <div className="space-y-4 pt-2">
                  <div>
                    <p className="text-sm text-[#B8B8B8] mb-2">¿Dónde entrenas?</p>
                    <div className="space-y-2">
                      {ZONAS_PANAMA.map((zona) => (
                        <OptionCard
                          key={zona}
                          label={zona}
                          selected={partnerZona === zona}
                          onClick={() => setPartnerZona(zona)}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-[#B8B8B8] mb-2">¿Cómo te contactamos? (WhatsApp)</p>
                    <input
                      type="tel"
                      value={partnerWhatsapp}
                      onChange={(e) => setPartnerWhatsapp(e.target.value)}
                      placeholder="+507 6000-0000"
                      className="w-full rounded-lg border border-[#707070] bg-[#2a2b2d] px-4 py-3 text-white placeholder:text-[#B8B8B8] outline-none focus:border-[#F16823] focus:ring-1 focus:ring-[#F16823]"
                    />
                  </div>
                </div>
              )}
            </div>
          );
      }
    }

    return null;
  }

  return (
    <main className="flex min-h-full flex-1 flex-col bg-[#1B1C1E] px-4 py-8">
      <div className="mx-auto w-full max-w-lg flex-1">
        <div className="mb-8 text-center">
          <RunClubLogo size="md" />
        </div>

        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between text-sm text-[#B8B8B8]">
            <span>
              Paso {step + 1} de {totalSteps}
            </span>
            <span>{stepLabels[step]}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[#2a2b2d]">
            <div
              className="h-full rounded-full bg-[#F16823] transition-all duration-300"
              style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        <div className="mb-8">{renderStepContent()}</div>

        {error && (
          <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          {step > 0 && (
            <button
              type="button"
              onClick={handlePrevious}
              disabled={loading}
              className="flex-1 rounded-lg border border-[#707070] bg-transparent px-4 py-3 font-medium text-white transition-colors hover:border-[#909090] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Anterior
            </button>
          )}

          {isLastStep ? (
            <button
              type="button"
              onClick={handleFinish}
              disabled={loading || !canProceed()}
              className="flex-1 rounded-lg bg-[#F16823] px-4 py-3 font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Guardando..." : "Comenzar"}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              disabled={loading}
              className="flex-1 rounded-lg bg-[#F16823] px-4 py-3 font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Siguiente
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <main className="flex min-h-full flex-1 flex-col bg-[#1B1C1E] px-4 py-8">
        <div className="mx-auto w-full max-w-lg flex-1">
          <div className="mb-8 text-center">
            <img src="/logo.svg" alt="RunClub Panama" style={{ height: 48, margin: "0 auto" }} />
          </div>
        </div>
      </main>
    }>
      <OnboardingPageInner />
    </Suspense>
  );
}
