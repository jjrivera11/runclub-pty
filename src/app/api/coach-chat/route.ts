import { NextResponse } from "next/server";

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

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key no configurada." }, { status: 500 });
  }

  let messages: { role: string; content: string }[];
  try {
    const body = await request.json();
    messages = body.messages;
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Mensajes inválidos." }, { status: 400 });
    }
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
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages,
    }),
  });

  if (!response.ok) {
    return NextResponse.json({ error: "Error al contactar la IA." }, { status: 502 });
  }

  const data = await response.json();
  const text = data.content?.[0]?.text ?? "Hubo un error. Intenta de nuevo.";

  return NextResponse.json({ text });
}
