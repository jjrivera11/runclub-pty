"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AdminPage() {
  const [stats, setStats] = useState({ users: 0, premium: 0, plans: 0, payments: 0 });

  useEffect(() => {
    const supabase = createClient();
    async function load() {
      const [u, pr, pl, pay] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("is_premium", true),
        supabase.from("training_plans").select("id", { count: "exact", head: true }),
        supabase.from("payments").select("id", { count: "exact", head: true }).eq("status", "paid"),
      ]);
      setStats({
        users: u.count ?? 0,
        premium: pr.count ?? 0,
        plans: pl.count ?? 0,
        payments: pay.count ?? 0,
      });
    }
    load();
  }, []);

  const cards = [
    { label: "Usuarios totales", value: stats.users },
    { label: "Usuarios premium", value: stats.premium },
    { label: "Planes generados", value: stats.plans },
    { label: "Pagos completados", value: stats.payments },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8">Panel de administracion</h1>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-[#707070] bg-[#2a2b2d] p-6">
            <p className="text-sm text-[#B8B8B8] mb-1">{c.label}</p>
            <p className="text-3xl font-bold text-[#F16823]">{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
