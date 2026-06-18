"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

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

  async function load() {
    const supabase = createClient();
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, track, is_premium, subscription_status, is_admin")
      .order("full_name");
    setUsers((data as UserRow[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function togglePremium(id: string, current: boolean) {
    const supabase = createClient();
    await supabase.from("profiles").update({ is_premium: !current }).eq("id", id);
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
                <th className="px-4 py-3 text-left text-[#B8B8B8] font-medium">Accion</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-[#2a2b2d] hover:bg-[#2a2b2d] transition-colors">
                  <td className="px-4 py-3 text-white">{u.full_name ?? "—"}</td>
                  <td className="px-4 py-3 text-[#B8B8B8]">{u.track ?? "—"}</td>
                  <td className="px-4 py-3 text-[#B8B8B8]">{u.subscription_status ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      u.is_premium ? "bg-[#F16823] text-white" : "bg-[#2a2b2d] text-[#B8B8B8] border border-[#707070]"
                    }`}>
                      {u.is_premium ? "Premium" : "Free"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => togglePremium(u.id, u.is_premium)}
                      className="rounded-lg border border-[#707070] px-3 py-1 text-xs text-white hover:border-[#F16823] hover:text-[#F16823] transition-colors"
                    >
                      {u.is_premium ? "Quitar premium" : "Dar premium"}
                    </button>
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
