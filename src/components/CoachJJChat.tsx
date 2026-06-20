"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const MAX_FREE_MESSAGES = 5;
const STORAGE_KEY = "coachJJ_msg_count";

export function CoachJJChat({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "¡Hola! Soy Coach JJ 👋 Cuéntame — ¿qué distancia quieres correr o cuál es tu objetivo fitness?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [msgCount, setMsgCount] = useState(() => {
    if (typeof window === "undefined") return 0;
    return parseInt(localStorage.getItem(STORAGE_KEY) ?? "0");
  });
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const isBlocked = msgCount >= MAX_FREE_MESSAGES;

  async function handleSend() {
    if (!input.trim() || loading || isBlocked) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const newCount = msgCount + 1;
    setMsgCount(newCount);
    localStorage.setItem(STORAGE_KEY, String(newCount));

    try {
      const response = await fetch("/api/coach-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await response.json();
      const assistantText = data.text ?? "Hubo un error. Intenta de nuevo.";

      let finalText = assistantText;
      if (newCount === MAX_FREE_MESSAGES - 1) {
        finalText += "\n\n💡 *Para ver tu plan completo personalizado, crea tu cuenta gratis — 7 días sin tarjeta.*";
      }

      setMessages((prev) => [...prev, { role: "assistant", content: finalText }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Hubo un error de conexión. Intenta de nuevo." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#1B1C1E] rounded-2xl border border-[#707070]/40 flex flex-col shadow-2xl" style={{ maxHeight: "85vh" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#707070]/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#F16823] flex items-center justify-center text-white font-black text-sm">
              JJ
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Coach JJ</p>
              <p className="text-[#B8B8B8] text-xs">RunClub Panamá</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#B8B8B8] hover:text-white transition-colors text-xl">✕</button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`rounded-2xl px-4 py-2.5 text-sm max-w-[80%] leading-relaxed whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-[#F16823] text-white rounded-tr-sm"
                  : "bg-[#2a2b2d] text-white rounded-tl-sm"
              }`}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-[#2a2b2d] rounded-2xl rounded-tl-sm px-4 py-2.5">
                <span className="text-[#B8B8B8] text-sm">Coach JJ está escribiendo...</span>
              </div>
            </div>
          )}
          {isBlocked && (
            <div className="rounded-xl border border-[#F16823]/30 bg-[#F16823]/10 p-4 text-center">
              <p className="text-white text-sm font-medium mb-3">
                ¿Listo para ver tu plan completo? 🏃
              </p>
              <button
                onClick={() => router.push("/register")}
                className="w-full rounded-lg bg-[#F16823] py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
              >
                Crear cuenta gratis — 7 días
              </button>
              <p className="text-[#B8B8B8] text-xs mt-2">Sin tarjeta de crédito</p>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        {!isBlocked && (
          <div className="px-4 py-3 border-t border-[#707070]/40">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Escribe tu mensaje..."
                className="flex-1 rounded-xl border border-[#707070] bg-[#2a2b2d] px-4 py-2.5 text-white text-sm outline-none focus:border-[#F16823] placeholder:text-[#707070]"
                disabled={loading}
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="rounded-xl bg-[#F16823] px-4 py-2.5 text-white font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                →
              </button>
            </div>
            <p className="text-[#707070] text-xs text-center mt-2">
              {MAX_FREE_MESSAGES - msgCount} mensaje{MAX_FREE_MESSAGES - msgCount !== 1 ? "s" : ""} gratis restante{MAX_FREE_MESSAGES - msgCount !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
