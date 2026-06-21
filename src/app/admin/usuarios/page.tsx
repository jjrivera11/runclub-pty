"use client";
import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin-api";

interface UserRow {
  id: string;
  full_name: string;
  track: string;
  is_premium: boolean;
  subscription_status: string;
  is_admin: boolean;
}

export default function UsuariosPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [processing, setProcessing] = useState<string | null>(null);

  async function load() {
    const data = await adminFetch("/usuarios");
    setUsers(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function togglePremium(id: string, current: boolean) {
    setProcessing(id + "_premium");
    await adminFetch("/usuarios", {
      method: "PATCH",
      body: JSON.stringify({ id, is_premium: !current }),
    });
    setProcessing(null);
    load();
  }

  async function changeTrack(id: string, newTrack: string) {
    if (!confirm(`¿Cambiar el plan a "${newTrack}"?`)) return;
    setProcessing(id + "_track");
    await adminFetch("/usuarios", {
      method: "PATCH",
      body: JSON.stringify({ id, track: newTrack }),
    });
    setProcessing(null);
    load();
  }

  async function regeneratePlan(id: string) {
    if (!confirm("¿Resetear el plan? El usuario será enviado al onboarding para elegir un nuevo objetivo.")) return;
    setProcessing(id + "_plan");
    await adminFetch("/usuarios", {
      method: "DELETE",
      body: JSON.stringify({ id }),
    });
    setProcessing(null);
    load();
  }

  const filtered = users.filter((u) =>
    u.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Usuarios</h1>
      <input
        type="text"
        placeholder="Buscar por nombre..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-6 w-full max-w-sm rounded-lg border border-[#707070] bg-[#2a2b2d] px-4 py-2 text-white placeholder:text-[#B8B8B8] outline-none focus:border-[#F16823]"
      />
      {loading ? (
        <p className="text-[#B8B8B8]">Cargando...</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#707070]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#707070] bg-[#2a2b2d]">
                <th className="px-4 py-3 text-left text-[#B8B8B8] font-medium">Nombre</th>
                <th className="px-4 py-3 text-left text-[#B8B8B8] font-medium">Track</th>
                <th className="px-4 py-3 text-left text-[#B8B8B8] font-medium">Estado</th>
                <th className="px-4 py-3 text-left text-[#B8B8B8] font-medium">Premium</th>
                <th className="px-4 py-3 text-left text-[#B8B8B8] font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-[#2a2b2d] hover:bg-[#2a2b2d] transition-colors">
                  <td className="px-4 py-3 text-white">{u.full_name ?? "—"}</td>
                  <td className="px-4 py-3">
                    <select
                      value={u.track ?? "runner"}
                      onChange={(e) => changeTrack(u.id, e.target.value)}
                      disabled={processing === u.id + "_track"}
                      className="rounded-lg border border-[#707070] bg-[#1B1C1E] px-2 py-1 text-xs text-white outline-none focus:border-[#F16823] disabled:opacity-50"
                    >
                      <option value="runner">Runner Pro</option>
                      <option value="transformacion">Transformación</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-[#B8B8B8] text-xs">{u.subscription_status ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      u.is_premium ? "bg-[#F16823] text-white" : "bg-[#2a2b2d] text-[#B8B8B8] border border-[#707070]"
                    }`}>
                      {u.is_premium ? "Premium" : "Free"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => togglePremium(u.id, u.is_premium)}
                        disabled={processing === u.id + "_premium"}
                        className="rounded-lg border border-[#707070] px-3 py-1 text-xs text-white hover:border-[#F16823] hover:text-[#F16823] transition-colors disabled:opacity-50"
                      >
                        {processing === u.id + "_premium" ? "..." : u.is_premium ? "Quitar premium" : "Dar premium"}
                      </button>
                      <button
                        onClick={() => regeneratePlan(u.id)}
                        disabled={processing === u.id + "_plan"}
                        className="rounded-lg border border-[#707070] px-3 py-1 text-xs text-white hover:border-yellow-500 hover:text-yellow-400 transition-colors disabled:opacity-50"
                      >
                        {processing === u.id + "_plan" ? "..." : "↺ Reset plan"}
                      </button>
                    </div>
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
