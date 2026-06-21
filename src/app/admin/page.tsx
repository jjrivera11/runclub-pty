"use client";
import { useEffect, useState } from "react";

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
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      setStats(data);
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
