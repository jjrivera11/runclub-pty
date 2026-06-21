"use client";
import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin-api";

interface Payment {
  id: string;
  user_id: string;
  amount_usd: number;
  status: string;
  provider: string;
  plan: string;
  created_at: string;
  profiles: { full_name: string; is_premium: boolean } | { full_name: string; is_premium: boolean }[] | null;
}

export default function PagosPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending_verification" | "paid" | "rejected">("pending_verification");

  async function load() {
    const data = await adminFetch(`/pagos${filter !== "all" ? `?status=${filter}` : ""}`);
    setPayments(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, [filter]);

  async function handleApprove(payment: Payment) {
    setProcessing(payment.id);
    await adminFetch("/pagos", {
      method: "PATCH",
      body: JSON.stringify({
        id: payment.id,
        status: "paid",
        user_id: payment.user_id,
        amount_usd: payment.amount_usd,
        plan: payment.plan,
      }),
    });
    setProcessing(null);
    load();
  }

  async function handleReject(paymentId: string) {
    setProcessing(paymentId);
    await adminFetch("/pagos", {
      method: "PATCH",
      body: JSON.stringify({ id: paymentId, status: "rejected" }),
    });
    setProcessing(null);
    load();
  }

  const getName = (p: Payment) =>
    Array.isArray(p.profiles) ? (p.profiles[0]?.full_name ?? "—") : (p.profiles?.full_name ?? "—");

  const total = payments.filter((p) => p.status === "paid").reduce((acc, p) => acc + p.amount_usd, 0);
  const pendingCount = payments.filter((p) => p.status === "pending_verification").length;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-white">Pagos</h1>
        {pendingCount > 0 && filter !== "pending_verification" && (
          <span className="rounded-full bg-yellow-500/20 border border-yellow-500/40 px-3 py-1 text-xs font-medium text-yellow-400">
            {pendingCount} pendiente{pendingCount > 1 ? "s" : ""} de aprobar
          </span>
        )}
      </div>
      <p className="text-[#B8B8B8] mb-6">
        Total recaudado: <span className="text-[#F16823] font-semibold">${total.toFixed(2)}</span>
      </p>

      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { key: "pending_verification", label: "⏳ Pendientes" },
          { key: "paid", label: "✅ Aprobados" },
          { key: "rejected", label: "❌ Rechazados" },
          { key: "all", label: "Todos" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key as typeof filter)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filter === f.key
                ? "bg-[#F16823] text-white"
                : "border border-[#707070] text-[#B8B8B8] hover:text-white"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? <p className="text-[#B8B8B8]">Cargando...</p> : payments.length === 0 ? (
        <p className="text-[#B8B8B8] text-center py-12">No hay pagos en este estado.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#707070]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#707070] bg-[#2a2b2d]">
                <th className="px-4 py-3 text-left text-[#B8B8B8] font-medium">Usuario</th>
                <th className="px-4 py-3 text-left text-[#B8B8B8] font-medium">Plan</th>
                <th className="px-4 py-3 text-left text-[#B8B8B8] font-medium">Monto</th>
                <th className="px-4 py-3 text-left text-[#B8B8B8] font-medium">Estado</th>
                <th className="px-4 py-3 text-left text-[#B8B8B8] font-medium">Fecha</th>
                <th className="px-4 py-3 text-left text-[#B8B8B8] font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-b border-[#2a2b2d] hover:bg-[#2a2b2d] transition-colors">
                  <td className="px-4 py-3 text-white">{getName(p)}</td>
                  <td className="px-4 py-3 text-[#B8B8B8] capitalize">{p.plan ?? "—"}</td>
                  <td className="px-4 py-3 text-white">${p.amount_usd}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      p.status === "paid" ? "bg-green-500/20 text-green-400" :
                      p.status === "pending_verification" ? "bg-yellow-500/20 text-yellow-400" :
                      p.status === "rejected" ? "bg-red-500/20 text-red-400" :
                      "bg-[#2a2b2d] text-[#B8B8B8] border border-[#707070]"
                    }`}>
                      {p.status === "pending_verification" ? "Pendiente" :
                       p.status === "paid" ? "Aprobado" :
                       p.status === "rejected" ? "Rechazado" : p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#B8B8B8]">
                    {new Date(p.created_at).toLocaleDateString("es-PA")}
                  </td>
                  <td className="px-4 py-3">
                    {p.status === "pending_verification" ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(p)}
                          disabled={processing === p.id}
                          className="rounded-lg bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-500 transition-colors disabled:opacity-50"
                        >
                          {processing === p.id ? "..." : "✓ Aprobar"}
                        </button>
                        <button
                          onClick={() => handleReject(p.id)}
                          disabled={processing === p.id}
                          className="rounded-lg border border-red-500/40 px-3 py-1 text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                        >
                          ✕ Rechazar
                        </button>
                      </div>
                    ) : (
                      <span className="text-[#707070] text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
