"use client";
import { useState } from "react";

interface PromoResult {
  valid: boolean;
  type: string;
  value: number;
  promo_id: string;
  message: string;
}

interface PromoCodeInputProps {
  onApplied?: (result: PromoResult) => void;
}

export function PromoCodeInput({ onApplied }: PromoCodeInputProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PromoResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);

  async function handleValidate() {
    setError(null);
    setResult(null);
    if (!code.trim()) return;
    setLoading(true);
    const res = await fetch("/api/promo/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    setResult(data);
  }

  async function handleApply() {
    if (!result) return;
    setLoading(true);
    const res = await fetch("/api/promo/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ promo_id: result.promo_id }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    setApplied(true);
    onApplied?.(result);
  }

  if (applied && result) {
    return (
      <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
        Codigo aplicado: {result.message}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => { setCode(e.target.value.toUpperCase()); setResult(null); setError(null); }}
          placeholder="Codigo promocional"
          className="flex-1 rounded-lg border border-[#707070] bg-[#2a2b2d] px-4 py-2 text-sm text-white placeholder:text-[#B8B8B8] outline-none focus:border-[#F16823]"
        />
        <button
          type="button"
          onClick={handleValidate}
          disabled={loading || !code.trim()}
          className="rounded-lg border border-[#707070] px-4 py-2 text-sm text-white hover:border-[#F16823] hover:text-[#F16823] transition-colors disabled:opacity-50"
        >
          {loading ? "..." : "Validar"}
        </button>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      {result && (
        <div className="rounded-lg border border-[#F16823]/30 bg-[#F16823]/10 px-4 py-3">
          <p className="text-sm text-[#F16823] mb-2">{result.message}</p>
          <button
            type="button"
            onClick={handleApply}
            disabled={loading}
            className="rounded-lg bg-[#F16823] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Aplicando..." : "Aplicar codigo"}
          </button>
        </div>
      )}
    </div>
  );
}
