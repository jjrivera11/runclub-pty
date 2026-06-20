import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendPlanReadyEmail, sendNewBlockEmail } from "@/lib/email";
import type { OnboardingData } from "@/types/onboarding";
import type { PlanJson } from "@/types/plan";

const ANTHROPIC_MODEL = "claude-sonnet-4-5";
const BLOCK_SIZE = 5;

const RUNNER_SYSTEM_PROMPT = `Eres Coach JJ, experto en running tropical de Panama. Conoces todos los spots de entrenamiento del pais — desde la Cinta Costera hasta el Estadio de Chitre. Cuando generes sesiones, sugiere el spot mas apropiado segun el tipo de entrenamiento y la ciudad del atleta. Usa el campo notas_locales de cada sesion para mencionar el spot especifico y por que es ideal para esa sesion.
Sigues la regla del 10% de incremento semanal de volumen.
La semana 4 de cada ciclo es de recuperacion (reduce volumen 20%).
Las ultimas 2-3 semanas antes de la carrera son de tapering.
Explica siempre los terminos tecnicos entre parentesis para principiantes.
Las carreras en Panama arrancan a las 6:00am.
Da feedback motivador y especifico como un coach personal en cada sesion.
Responde SOLO con JSON valido, sin markdown ni texto adicional.`;

const TRAIL_SYSTEM_PROMPT = `${RUNNER_SYSTEM_PROMPT}
Eres ademas experto en trail running en Panama. Conoces las rutas de montana como La India Dormida en El Valle, el Cerro Tute en Santa Fe, Altos de Campana en La Chorrera y el Pipeline Road en Colon.
Para planes de trail:
- Mide el esfuerzo en tiempo en pie (time on feet) ademas de kilometros
- Incluye sesiones especificas de subidas (hill repeats) y bajadas tecnicas
- La regla del 10% aplica al tiempo total, no solo a la distancia
- Incluye entrenamiento de fuerza para piernas (sentadillas, lunges, step-ups)
- Menciona el desnivel positivo esperado en sesiones largas
- Las semanas de recuperacion son mas importantes en trail que en road
- Para distancias de 42K o mas, incluye sesiones de back-to-back (sabado y domingo largos)`;

const TRANSFORMACION_SYSTEM_PROMPT = `${RUNNER_SYSTEM_PROMPT}
Tambien eres experto en entrenamiento funcional, pesas y acondicionamiento fisico para perdida de peso en clima tropical.
Disenias planes que combinan fuerza, cardio e HIIT segun el acceso a gimnasio del atleta.`;

interface OnboardingAnswersRow extends OnboardingData {
  user_id: string;
  peso_a_perder?: string | null;
  edad?: number | null;
  sexo?: string | null;
  estatura_cm?: number;
}

function buildRunnerBlockMessage(answers: OnboardingAnswersRow, blockStart: number, blockEnd: number, totalWeeks: number, adaptation?: string | null, spotsContext?: string | null, isTrail?: boolean): string {
  return `Eres Coach JJ, el coach personal de este corredor. Crea un plan de entrenamiento para las semanas ${blockStart} a ${blockEnd} de ${totalWeeks} totales.

Perfil del atleta:
- Nombre: corredor
- Edad: ${answers.edad ?? "no especificada"} anos
- Sexo: ${answers.sexo ?? "no especificado"}
- Estatura: ${answers.estatura_cm && answers.estatura_cm > 0 ? answers.estatura_cm + " cm" : "no especificada"}
- Peso: ${answers.peso_lbs > 0 ? answers.peso_lbs + " lbs" : "no especificado"}
- Distancia objetivo: ${answers.distancia}
- Nivel: ${answers.nivel}
- Carrera: ${answers.carrera_nombre} el ${answers.carrera_fecha}
- Dias por semana: ${answers.dias_semana}
- Lesion: ${answers.lesion?.trim() || "ninguna"}
- Tiempo reciente: ${answers.tiempo_reciente?.trim() || "no especificado"}
- Horario preferido: ${answers.horario_entrenamiento}
- Modalidad: ${isTrail ? "TRAIL RUNNING — terreno de montaña, desnivel, tecnico" : "ROAD RUNNING — asfalto y pista"}
${isTrail ? "- Incluir sesiones de hill repeats, bajadas tecnicas y tiempo en pie (time on feet)" : ""}
- Semanas totales del plan: ${totalWeeks}
- Bloque actual: semanas ${blockStart} a ${blockEnd}

${adaptation ? `\nNOTA DEL COACH: ${
  adaptation.includes("reducir_volumen")
    ? "El atleta tuvo dificultades la semana anterior. Reduce el volumen un 20% y aumenta los dias de recuperacion en este bloque."
    : adaptation.includes("aumentar_intensidad")
    ? "El atleta esta en excelente forma. Aumenta la intensidad un 10-15% en este bloque."
    : ""
}\n` : ""}
SESIONES DE TEST: En las semanas apropiadas segun la fase, incluye UNA sesion de evaluacion de rendimiento con tipo_sesion "Test". Usa estas distancias segun la fase:
- Fase base (semanas 1-3): Test 400m o Test 800m
- Fase construccion (semanas 4-6): Test 1km o Test 3km  
- Fase pico (semanas 7+): Test 5km
La sesion de test debe tener titulo como "Test de 400m" o "Test de 5K", descripcion explicando que es una evaluacion cronometrada para medir progreso, y duracion_min apropiada. No incluyas test en semanas de recuperacion o tapering. Maximo 1 test por bloque de 5 semanas.

IMPORTANTE: Escribe la descripcion de cada sesion como Coach JJ, motivador y directo. Maximo 40 palabras por sesion. Se especifico con el ritmo, la tecnica y el esfuerzo esperado.

Responde SOLO con este JSON:
{
  "resumen": {
    "titulo": string,
    "duracion_semanas": number,
    "volumen_inicial_km": number,
    "volumen_pico_km": number,
    "dias_por_semana": number,
    "carrera": string,
    "fecha_carrera": string,
    "semanas_tapering": number
  },
  "semanas": [
    {
      "numero": number,
      "nombre": string,
      "tipo": "base" | "construccion" | "pico" | "recuperacion" | "tapering",
      "volumen_total_km": number,
      "dias": [
        {
          "dia": string,
          "tipo_sesion": string,
          "titulo": string,
          "descripcion": string,
          "distancia_km": number,
          "duracion_min": number
        }
      ]
    }
  ]
}${spotsContext ?? ""}`;
}

function buildTransformacionBlockMessage(answers: OnboardingAnswersRow, blockStart: number, blockEnd: number, totalWeeks: number, adaptation?: string | null, spotsContext?: string | null): string {
  return `Eres Coach JJ, el coach personal de este atleta. Crea un plan de transformacion fisica para las semanas ${blockStart} a ${blockEnd} de ${totalWeeks} totales.

Perfil del atleta:
- Edad: ${answers.edad ?? "no especificada"} anos
- Sexo: ${answers.sexo ?? "no especificado"}
- Estatura: ${answers.estatura_cm && answers.estatura_cm > 0 ? answers.estatura_cm + " cm" : "no especificada"}
- Peso actual: ${answers.peso_lbs > 0 ? answers.peso_lbs + " lbs" : "no especificado"}
- Peso a perder: ${answers.peso_a_perder ?? "no especificado"}
- Experiencia con pesas: ${answers.exp_pesas || "no especificada"}
- Acceso a gimnasio: ${answers.acceso_gym ? "si" : "no"}
- Dias por semana: ${answers.dias_semana}
- Condicion de salud: ${answers.condicion_salud?.trim() || "ninguna"}
- Horario preferido: ${answers.horario_entrenamiento}
- Semanas totales del plan: ${totalWeeks}
- Bloque actual: semanas ${blockStart} a ${blockEnd}

${adaptation ? `\nNOTA DEL COACH: ${
  adaptation.includes("reducir_volumen")
    ? "El atleta tuvo dificultades la semana anterior. Reduce el volumen un 20% y aumenta los dias de recuperacion en este bloque."
    : adaptation.includes("aumentar_intensidad")
    ? "El atleta esta en excelente forma. Aumenta la intensidad un 10-15% en este bloque."
    : ""
}\n` : ""}
IMPORTANTE: Escribe la descripcion de cada sesion como Coach JJ, motivador y directo. Maximo 40 palabras por sesion. Se especifico con ejercicios, series, repeticiones o distancia.

Responde SOLO con este JSON:
{
  "resumen": {
    "titulo": string,
    "duracion_semanas": number,
    "volumen_inicial_km": number,
    "volumen_pico_km": number,
    "dias_por_semana": number,
    "carrera": string,
    "fecha_carrera": string,
    "semanas_tapering": number
  },
  "semanas": [
    {
      "numero": number,
      "nombre": string,
      "tipo": "base" | "construccion" | "pico" | "recuperacion" | "tapering",
      "volumen_total_km": number,
      "dias": [
        {
          "dia": string,
          "tipo_sesion": string,
          "titulo": string,
          "descripcion": string,
          "distancia_km": number,
          "duracion_min": number
        }
      ]
    }
  ]
}${spotsContext ?? ""}`;
}

async function callAnthropic(system: string, userMessage: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY no esta configurada.");

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 16000,
      system,
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Error de Anthropic: ${response.status} ${errorBody}`);
  }

  const data = await response.json() as { content?: { type: string; text?: string }[] };
  const text = data.content?.find((b) => b.type === "text")?.text;
  if (!text) throw new Error("Anthropic no devolvio contenido.");
  return text;
}

function cleanJsonText(text: string): string {
  let cleaned = text.trim();
  const fencedMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fencedMatch) cleaned = fencedMatch[1].trim();
  const objectMatch = cleaned.match(/\{[\s\S]*\}/);
  if (objectMatch) cleaned = objectMatch[0];
  return cleaned;
}

function parsePlanJson(text: string): PlanJson {
  const parsed = JSON.parse(text) as PlanJson;
  if (!parsed.resumen || !Array.isArray(parsed.semanas)) {
    throw new Error("El JSON no tiene la estructura esperada.");
  }
  return parsed;
}

async function fetchBlockFromClaude(system: string, userMessage: string): Promise<PlanJson> {
  const text = await callAnthropic(system, userMessage);
  try {
    return parsePlanJson(text.trim());
  } catch {
    return parsePlanJson(cleanJsonText(text));
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    const isNextBlock = body?.next_block === true;
    const existingPlanId = body?.plan_id;

    const { data: answers, error: answersError } = await supabase
      .from("onboarding_answers")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (answersError || !answers) {
      return NextResponse.json({ error: "No se encontraron respuestas de onboarding." }, { status: 404 });
    }

    const onboarding = answers as OnboardingAnswersRow;

      const { data: userProfile } = await supabase
        .from("profiles")
        .select("partner_zona")
        .eq("id", user.id)
        .single();
      const userCity = userProfile?.partner_zona ?? "Panama Ciudad";
      const { data: spots } = await supabase
        .from("training_spots")
        .select("name, description, city, zone, surface, best_for")
        .eq("is_active", true)
        .ilike("city", "%" + userCity.split(" ")[0] + "%")
        .limit(10);

      const spotsContext = spots && spots.length > 0
        ? "\n\nSPOTS DE ENTRENAMIENTO DISPONIBLES EN " + userCity.toUpperCase() + ":\n" +
          spots.map((s: { name: string; description: string; zone?: string; surface?: string; best_for?: string[] }) =>
            "- " + s.name + (s.zone ? " (" + s.zone + ")" : "") + ": " + s.description +
            (s.best_for?.length ? " Ideal para: " + s.best_for.join(", ") + "." : "")
          ).join("\n")
        : "";

      const { data: raceGoals } = await supabase
        .from("race_goals")
        .select("races(name, race_date, distance_km, is_trail)")
        .eq("user_id", user.id)
        .eq("is_target", false);

      const raceGoalsContext = raceGoals && raceGoals.length > 0
        ? "\n\nCARRERAS DE PRÁCTICA DEL ATLETA:\n" +
          raceGoals.map((g: { races: { name: string; race_date: string; distance_km: number; is_trail: boolean } | null }) =>
            g.races ? `- ${g.races.name} el ${g.races.race_date} (${g.races.distance_km}km${g.races.is_trail ? " TRAIL" : ""}) — planifica un mini-tapering de 2-3 días antes y recuperación de 2-3 días después.` : ""
          ).filter(Boolean).join("\n")
        : "";

    const isRunner = onboarding.track === "runner";
    const isTrail = !!(onboarding as OnboardingAnswersRow & { is_trail?: boolean }).is_trail;
    const system = isTrail ? TRAIL_SYSTEM_PROMPT : (isRunner ? RUNNER_SYSTEM_PROMPT : TRANSFORMACION_SYSTEM_PROMPT);

    if (isNextBlock && existingPlanId) {
      const { data: existingPlan } = await supabase
        .from("training_plans")
        .select("plan_json, semanas_generadas, total_weeks, pending_adaptation")
        .eq("id", existingPlanId)
        .single();

      if (!existingPlan) return NextResponse.json({ error: "Plan no encontrado." }, { status: 404 });

      const currentGenerated = existingPlan.semanas_generadas || 0;
      const totalWeeks = existingPlan.total_weeks || 12;
      const blockStart = currentGenerated + 1;
      const blockEnd = Math.min(currentGenerated + BLOCK_SIZE, totalWeeks);

      if (blockStart > totalWeeks) return NextResponse.json({ message: "Plan completo." });

      const { data: progressData } = await supabase
        .from("plan_progress")
        .select("week_number, completed")
        .eq("plan_id", existingPlanId)
        .gte("week_number", blockStart - 5)
        .lt("week_number", blockStart);

      const weekStats: Record<number, { completed: number; total: number }> = {};
      const planSemanas = existingPlan.plan_json?.semanas ?? [];
      for (let w = blockStart - 5; w < blockStart; w++) {
        const weekData = planSemanas.find((s: { numero: number }) => s.numero === w);
        if (!weekData) continue;
        const total = weekData.dias?.length ?? 0;
        const completed = (progressData ?? []).filter(
          (p: { week_number: number; completed: boolean }) => p.week_number === w && p.completed
        ).length;
        weekStats[w] = { completed, total };
      }

      const avgCompletion = Object.values(weekStats).length > 0
        ? Object.values(weekStats).reduce((acc, s) => acc + (s.total > 0 ? s.completed / s.total : 0), 0) / Object.values(weekStats).length
        : 1;

      const performanceNote = avgCompletion < 0.5
        ? `El atleta completo en promedio el ${Math.round(avgCompletion * 100)}% de sus sesiones en el bloque anterior. Reduce el volumen un 20% y aumenta los dias de recuperacion.`
        : avgCompletion === 1
        ? `El atleta completo el 100% de sus sesiones en el bloque anterior. Aumenta la intensidad un 10-15%.`
        : `El atleta completo en promedio el ${Math.round(avgCompletion * 100)}% de sus sesiones. Mantener el mismo nivel de exigencia.`;

      const coachNote = avgCompletion < 0.5
        ? `Ajuste tu proximo bloque: reduci el volumen un 20% basado en tu rendimiento de las ultimas semanas. El objetivo es que sea mas sostenible.`
        : avgCompletion === 1
        ? `Ajuste tu proximo bloque: aumente la intensidad un 10-15% porque completaste el 100% de tus sesiones. Estas listo para mas.`
        : null;

      const userMessage = isRunner
        ? buildRunnerBlockMessage(onboarding, blockStart, blockEnd, totalWeeks, performanceNote, spotsContext + raceGoalsContext, isTrail)
        : buildTransformacionBlockMessage(onboarding, blockStart, blockEnd, totalWeeks, performanceNote, spotsContext + raceGoalsContext);

      if (coachNote) {
        await supabase
          .from("training_plans")
          .update({ coach_note: coachNote })
          .eq("id", existingPlanId);
      }

      const blockJson = await fetchBlockFromClaude(system, userMessage);

      const existingPlanJson = existingPlan.plan_json as PlanJson;
      const mergedSemanas = [...existingPlanJson.semanas, ...blockJson.semanas];
      const mergedPlanJson: PlanJson = { ...existingPlanJson, semanas: mergedSemanas };

      await supabase
        .from("training_plans")
        .update({
          plan_json: mergedPlanJson,
          semanas_generadas: blockEnd,
        })
        .eq("id", existingPlanId);

      const { data: { user: blockUser } } = await supabase.auth.getUser();
      if (blockUser?.email) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", blockUser.id)
          .single();
        sendNewBlockEmail(
          blockUser.email,
          profile?.full_name ?? "Atleta",
          blockStart,
          blockEnd
        ).catch(() => {});
      }
      return NextResponse.json({ success: true, semanas_generadas: blockEnd, total_weeks: totalWeeks });
    }

    const totalWeeks = isRunner
      ? (onboarding.semanas_disponibles > 0 ? onboarding.semanas_disponibles : 12)
      : Math.min(onboarding.semanas_disponibles > 0 ? onboarding.semanas_disponibles : 12, 12);

    const blockEnd = Math.min(BLOCK_SIZE, totalWeeks);

    const userMessage = isRunner
      ? buildRunnerBlockMessage(onboarding, 1, blockEnd, totalWeeks, null, spotsContext + raceGoalsContext, isTrail)
      : buildTransformacionBlockMessage(onboarding, 1, blockEnd, totalWeeks, null, spotsContext + raceGoalsContext);

    const planJson = await fetchBlockFromClaude(system, userMessage);

    const raceName = isRunner
      ? onboarding.carrera_nombre
      : planJson.resumen.carrera || "Transformacion fisica";
    const raceDate = isRunner
      ? onboarding.carrera_fecha
      : planJson.resumen.fecha_carrera || "";

    await supabase
      .from("training_plans")
      .update({ is_active: false })
      .eq("user_id", user.id)
      .eq("is_active", true);

    const { data: newPlan, error: planError } = await supabase
      .from("training_plans")
      .insert({
        user_id: user.id,
        plan_json: planJson,
        race_name: raceName,
        race_date: raceDate,
        track: onboarding.track,
        total_weeks: totalWeeks,
        total_weeks_planned: totalWeeks,
        semanas_generadas: blockEnd,
        is_active: true,
      })
      .select("id")
      .single();

    if (planError || !newPlan) {
      return NextResponse.json({ error: "No se pudo guardar el plan." }, { status: 500 });
    }

    const { data: { user: newUser } } = await supabase.auth.getUser();
    if (newUser?.email) {
      const { data: newProfile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", newUser.id)
        .single();
      sendPlanReadyEmail(
        newUser.email,
        newProfile?.full_name ?? "Atleta",
        totalWeeks,
        onboarding.track
      ).catch(() => {});
    }
    return NextResponse.json({ success: true, plan_id: newPlan.id, semanas_generadas: blockEnd, total_weeks: totalWeeks });

  } catch (error) {
    console.error("generate-plan error:", error);
    return NextResponse.json({ error: "No se pudo generar tu plan. Intenta de nuevo." }, { status: 500 });
  }
}
