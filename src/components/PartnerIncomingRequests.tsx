"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const COLORS = [
  "bg-purple-500", "bg-blue-500", "bg-teal-500",
  "bg-orange-500", "bg-pink-500", "bg-indigo-500"
];

function getColor(id: string): string {
  const sum = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return COLORS[sum % COLORS.length];
}

function getInitial(id: string): string {
  const chars = "ABCDEFGHJKLMNPRSTUVWXYZ";
  const sum = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return chars[sum % chars.length];
}

interface IncomingRequest {
  id: string;
  from_user_id: string;
  zona: string;
  nivel: string;
}

export function PartnerIncomingRequests() {
  const [requests, setRequests] = useState<IncomingRequest[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("partner_requests")
      .select("id, from_user_id, profiles!partner_requests_from_user_id_fkey(partner_zona, partner_nivel)")
      .eq("to_user_id", user.id)
      .eq("status", "pending");

    const mapped = (data ?? []).map((r: { id: string; from_user_id: string; profiles: { partner_zona?: string; partner_nivel?: string } | { partner_zona?: string; partner_nivel?: string }[] | null }) => ({
      id: r.id,
      from_user_id: r.from_user_id,
      zona: (Array.isArray(r.profiles) ? r.profiles[0]?.partner_zona : r.profiles?.partner_zona) ?? "Panama",
      nivel: (Array.isArray(r.profiles) ? r.profiles[0]?.partner_nivel : r.profiles?.partner_nivel) ?? "intermedio",
    }));

    setRequests(mapped);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleRespond(requestId: string, action: "accepted" | "declined") {
    await fetch("/api/partner/respond", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ request_id: requestId, action }),
    });
    load();
  }

  if (loading || requests.length === 0) return null;

  return (
    <div className="rounded-xl border border-[#F16823]/30 bg-[#F16823]/5 p-4 space-y-3">
      <p className="text-sm font-semibold text-white">
        Alguien quiere entrenar contigo
      </p>
      <p className="text-xs text-[#B8B8B8]">
        Acepta para intercambiar contactos de WhatsApp mutuamente
      </p>
      {requests.map((r) => (
        <div key={r.id} className="flex items-center justify-between rounded-lg border border-[#707070]/40 bg-[#1B1C1E] px-3 py-3">
          <div className="flex items-center gap-3">
            <div className={"w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 " + getColor(r.from_user_id)}>
              {getInitial(r.from_user_id)}
            </div>
            <div>
              <p className="text-xs text-white font-medium">Corredor anonimo</p>
              <p className="text-xs text-[#B8B8B8]">{r.zona} · {r.nivel}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleRespond(r.id, "accepted")}
             className="rounded-lg bg-[#F16823] px-3 py-1 text-xs font-medium text-white hover:opacity-90"
            >
              Aceptar
            </button>
            <button
              onClick={() => handleRespond(r.id, "declined")}
              className="rounded-lg border border-[#707070] px-3 py-1 text-xs text-[#B8B8B8] hover:text-white"
            >
              Declinar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
