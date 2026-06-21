"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Stats {
  users: number;
  premium: number;
  runner: number;
  transformacion: number;
  plans: number;
  payments: number;
  revenue: number;
  pending: number;
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats>({
    users: 0, premium: 0, runner: 0, transformacion: 0,
    plans: 0, payments: 0, revenue: 0, pending: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const [u, pr, runner, transf, pl, pay, pending] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("is_premium", true),
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("track", "runner"),
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("track", "transformacion"),
        supabase.from("training_plans").select("id", { count: "exact", head: true }),
        supabase.from("payments").select("amount_usd").eq("status", "paid"),
        supabase.from("payments").select("id", { count: "exact", head: true }).eq("status", "pending_verification"),
      ]);

      const revenue = (pay.data ?? []).reduce((acc, p) => acc + (p.amount_usd ?? 0), 0);

      setStats({
        users: u.count ?? 0,
        premium: pr.count ?? 0,
        runner: runner.count ?? 0,
        transformacion: transf.count ?? 0,
        plans: pl.count ?? 0,
        payments: (pay.data ?? []).length,
        revenue,
        pending: pending.count ?? 0,
      });
      setLoading(false);
    }
    load();
  }, []);

  const cards = [
    { label: "Usuarios totales", value: stats.users, color: "text-[#F16823]" },
    { label: "Usuarios premium", value: stats.premium, color: "text-green-400" },
    { label: "Runner Pro", value: stats.runner, color: "text-blue-400" },
    { label: "Transformación", value: stats.transformacion, color: "text-purple-400" },
    { label: "Planes generados", value: stats.plans, color: "text-[#F16823]" },
    { label: "Pagos completados", value: stats.payments, color: "text-green-400" },
    { label: "Pagos pendientes", value: stats.pending, color: "text-yellow-400" },
    { label: "Revenue total", value: `$${stats.revenue.toFixed(2)}`, color: "text-green-400" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8">Panel de administración</h1>
      {loading ? (
        <p className="text-[#B8B8B8]">Cargando...</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {cards.map((c) => (
            <div key={c.label} className="rounded-xl border border-[#707070] bg-[#2a2b2d] p-6">
              <p className="text-sm text-[#B8B8B8] mb-1">{c.label}</p>
              <p className={`text-3xl font-bold ${c.color}`}>{c.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
