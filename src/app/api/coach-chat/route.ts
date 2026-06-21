import { NextResponse } from "next/server";
import { logError } from "@/lib/logger";

const SYSTEM_PROMPT = `Eres Coach JJ, el entrenador de running de RunClub Panamá. Eres motivador, directo y conoces Panamá perfectamente.

Conoces estas rutas locales: Cinta Costera (flat, 6km loop, ideal para principiantes), Parque Omar (colinas, 3km loop, intermedio), Causeway Amador (vistas al mar, 8km ida y vuelta), Cerro Ancón (subida intensa, avanzado).

Tu objetivo en esta conversación es:
1. Conocer al usuario — su objetivo (5K, 10K, 21K, bajar de peso), su nivel y disponibilidad
2. Darle una probada de lo que puede lograr con un plan personalizado
3. Generar curiosidad y motivación para que se registre
4. NO dar un plan completo — solo una muestra de lo que recibiría

Reglas:
- Máximo 2-3 oraciones por respuesta
- Haz UNA pregunta a la vez
- Sé conversacional, usa emojis ocasionalmente
- Menciona rutas de Panamá cuando sea relevante
- Nunca generes un plan completo de entrenamiento
- Cuando el usuario muestre interés, invítalo a registrarse para ver su plan completo`;

const RATE_LIMIT_MAP = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hora

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = RATE_LIMIT_MAP.get(ip);

  if (!entry || now > entry.resetAt) {
    RATE_LIMIT_MAP.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) return false;

  entry.count++;
  return true;
}

const ALLOWED_ROLES = new Set(["user", "assistant"]);

interface ChatMessage {
  role: string;
  content: string;
}

function validateMessages(messages: unknown): messages is ChatMessage[] {
  if (!Array.isArray(messages) || messages.length === 0) return false;
  if (messages.length > 20) return false;

  for (const msg of messages) {
    if (typeof msg !== "object" || msg === null) return false;
    const m = msg as Record<string, unknown>;
    if (!ALLOWED_ROLES.has(m.role as string)) return false;
    if (typeof m.content !== "string") return false;
    if ((m.content as string).length > 2000) return false;
  }

  return true;
}

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key no configurada." }, { status: 500 });
  }

  // Rate limiting por IP
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? request.headers.get("x-real-ip")
    ?? "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes. Intenta de nuevo en una hora." },
      { status: 429 }
    );
  }

  let messages: ChatMessage[];
  try {
    const body = await request.json();
    if (!validateMessages(body.messages)) {
      return NextResponse.json({ error: "Mensajes inválidos." }, { status: 400 });
    }
    messages = body.messages;
  } catch {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages,
    }),
  });

  if (!response.ok) {
    await logError({
      route: "/api/coach-chat",
      error: `Anthropic error: ${response.status}`,
      context: { ip },
    });
    return NextResponse.json({ error: "Error al contactar la IA." }, { status: 502 });
  }

  const data = await response.json();
  const text = data.content?.[0]?.text ?? "Hubo un error. Intenta de nuevo.";

  return NextResponse.json({ text });
}
