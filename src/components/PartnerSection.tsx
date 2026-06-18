"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface CompatibleRunner {
  id: string;
  zona: string;
  nivel: string;
  initial: string;
  color: string;
}

interface PartnerRequest {
  id: string;
  to_user_id: string;
  status: string;
}

interface MatchInfo {
  whatsapp: string;
  initial: string;
  color: string;
}

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

interface PartnerSectionProps {
  track: string;
}

export function PartnerSection({ track }: PartnerSectionProps) {
  const [runners, setRunners] = useState<CompatibleRunner[]>([]);
  const [requests, setRequests] = useState<PartnerRequest[]>([]);
  const [matches, setMatches] = useState<MatchInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [buscaPartner, setBuscaPartner] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data: myProfile } = await supabase
        .from("profiles")
        .select("busca_partner, partner_zona, partner_nivel, sexo")
        .eq("id", user.id)
        .single();

      console.log("myProfile result:", myProfile);
      if (!myProfile?.busca_partner) {
        console.log("busca_partner es false o myProfile es null, saliendo");
        setLoading(false);
        return;
      }
      setBuscaPartner(true);

      const { data: myOnboarding } = await supabase
        .from("onboarding_answers")
        .select("horario_entrenamiento")
        .eq("user_id", user.id)
        .single();

      let query = supabase
        .from("profiles")
        .select("id, partner_zona, partner_nivel, sexo")
        .eq("busca_partner", true)
        .eq("track", track)
        .neq("id", user.id);

      // filtro de genero deshabilitado hasta agregar columna partner_genero

      const { data: candidates } = await query.limit(20);

      console.log("candidates:", candidates, "myProfile:", myProfile);

      const compatible = (candidates ?? [])
        .filter((c: { partner_zona: string; partner_nivel: string }) => {
          return c.partner_zona === myProfile.partner_zona || c.partner_nivel === myProfile.partner_nivel;
        })
        .slice(0, 5)
        .map((c: { id: string; partner_zona: string; partner_nivel: string }) => ({
          id: c.id,
          zona: c.partner_zona ?? "Panama",
          nivel: c.partner_nivel ?? "intermedio",
          initial: getInitial(c.id),
          color: getColor(c.id),
        }));

      setRunners(compatible);

      const { data: reqData } = await supabase
        .from("partner_requests")
        .select("id, to_user_id, status")
        .eq("from_user_id", user.id);
      setRequests(reqData ?? []);

      const myAccepted = (reqData ?? []).filter((r: { status: string }) => r.status === "accepted");
      const matchList: MatchInfo[] = [];

      for (const req of myAccepted) {
        const { data: p } = await supabase
          .from("profiles")
          .select("partner_whatsapp")
          .eq("id", req.to_user_id)
          .single();
        if (p?.partner_whatsapp) {
          matchList.push({
            whatsapp: p.partner_whatsapp,
            initial: getInitial(req.to_user_id),
            color: getColor(req.to_user_id),
          });
        }
      }

      setMatches(matchList);
      setLoading(false);
    }
    load();
  }, [track]);

  async function handleRequest(toUserId: string) {
    if (!userId) return;
    const supabase = createClient();
    await supabase.from("partner_requests").insert({ from_user_id: userId, to_user_id: toUserId });
    setRequests((prev) => [...prev, { id: "", to_user_id: toUserId, status: "pending" }]);
  }

  if (loading || !buscaPartner) return null;

  return (
    <div className="rounded-xl border border-[#707070] bg-[#2a2b2d] p-4 space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-white">Entrena en compania</p>
            {runners.length > 0 && (
              <span className="rounded-full bg-[#F16823] px-2 py-0.5 text-xs font-medium text-white">Nuevo</span>
            )}
          </div>
          <p className="text-xs text-[#B8B8B8] mt-0.5">
            {runners.length > 0
              ? "Encontramos " + runners.length + " corredor" + (runners.length > 1 ? "es" : "") + " en Panama Ciudad con tu perfil"
              : "No hay corredores disponibles aun en tu zona"}
          </p>
        </div>
      </div>

      {matches.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-green-400">Conexiones activas</p>
          {matches.map((m, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg border border-green-500/20 bg-green-500/5 px-3 py-2">
              <div className="flex items-center gap-2">
                <div className={"w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold " + m.color}>
                  {m.initial}
                </div>
                <p className="text-xs text-white">Corredor confirmado</p>
              </div>
              
              <a
                href={"https://wa.me/" + m.whatsapp.replace(/[^0-9]/g, "")}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-green-600 px-3 py-1 text-xs font-medium text-white hover:opacity-90"
              >
                WhatsApp
              </a>
            </div>
          ))}
        </div>
      )}

      {runners.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-[#707070]/30">
          <p className="text-xs text-[#B8B8B8]">Conecta primero, conocete despues. Tu info solo se comparte cuando ambos aceptan.</p>
          {runners.map((r) => {
            const alreadyRequested = requests.some((req) => req.to_user_id === r.id);
            const isMatch = matches.some((m) => m.initial === r.initial);
            return (
              <div key={r.id} className="flex items-center justify-between rounded-lg border border-[#707070]/40 bg-[#1B1C1E] px-3 py-3">
                <div className="flex items-center gap-3">
                  <div className={"w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 " + r.color}>
                    {r.initial}
                  </div>
                  <div>
                    <p className="text-xs text-white font-medium">Corredor disponible</p>
                    <p className="text-xs text-[#B8B8B8]">{r.zona} · {r.nivel}</p>
                  </div>
                </div>
               {isMatch ? (
                  <span className="text-xs text-green-400 font-medium">Conectado</span>
                ) : alreadyRequested ? (
                  <span className="text-xs text-[#B8B8B8]">Solicitud enviada</span>
                ) : (
                  <button
                    onClick={() => handleRequest(r.id)}
                    className="rounded-lg border border-[#F16823] px-3 py-1 text-xs text-[#F16823] hover:bg-[#F16823] hover:text-white transition-colors"
                  >
                    Conectar
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
