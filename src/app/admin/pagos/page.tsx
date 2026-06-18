"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Payment {
  id: string;
  amount_usd: number;
  status: string;
  provider: string;
  plan: string;
  created_at: string;
  profiles: { full_name: string }[] | { full_name: string } | null;
}

export default function PagosPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("payments")
        .select("id, amount_usd, status, provider, plan, created_at, profiles(full_name)")
        .order("created_at", { ascending: false })
        .limit(100);
      setPayments((data as unknown as Payment[]) ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const total = payments.filter((p) => p.status === "paid").reduce((acc, p) => acc + p.amount_usd, 0);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">Pagos</h1>
      <p className="text-[#B8B8B8] mb-6">
        Total recaudado: <span className="text-[#F16823] font-semibold">${total.toFixed(2)}</span>
      </p>

      {loading ? <p className="text-[#B8B8B8]">Cargando...</p> : (
        <div className="overflow-x-auto rounded-xl border border-[#707070]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#707070] bg-[#2a2b2d]">
                <th className="px-4 py-3 text-left text-[#B8B8B8] font-medium">Usuario</th>
                <th className="px-4 py-3 text-left text-[#B8B8B8] font-medium">Plan</th>
                <th className="px-4 py-3 text-left text-[#B8B8B8] font-medium">Monto</th>
                <th className="px-4 py-3 text-left text-[#B8B8B8] font-medium">Estado</th>
                <th className="px-4 py-3 text-left text-[#B8B8B8] font-medium">Proveedor</th>
                <th className="px-4 py-3 text-left text-[#B8B8B8] font-medium">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-b border-[#2a2b2d] hover:bg-[#2a2b2d] transition-colors">
                  <td className="px-4 py-3 text-white">{Array.isArray(p.profiles) ? (p.profiles[0]?.full_name ?? "—") : (p.profiles?.full_name ?? "—")}</td>
                  <td className="px-4 py-3 text-[#B8B8B8]">{p.plan ?? "—"}</td>
                  <td className="px-4 py-3 text-white">${p.amount_usd}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      p.status === "paid" ? "bg-green-500/20 text-green-400" :
                      p.status === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                      "bg-red-500/20 text-red-400"
                    }`}>{p.status}</span>
                  </td>
                  <td className="px-4 py-3 text-[#B8B8B8]">{p.provider ?? "—"}</td>
                  <td className="px-4 py-3 text-[#B8B8B8]">{new Date(p.created_at).toLocaleDateString("es-PA")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
