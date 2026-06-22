"use client";
import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin-api";

interface Spot {
  id: string;
  name: string;
  city: string;
  zone: string;
  surface: string;
  description: string;
  best_for: string[];
  is_active: boolean;
}

export default function SpotsPage() {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("all");

  async function load() {
    const data = await adminFetch("/spots");
    setSpots(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function toggleActive(id: string, current: boolean) {
    await adminFetch("/spots", {
      method: "PATCH",
      body: JSON.stringify({ id, is_active: !current }),
    });
    load();
  }

  async function deleteSpot(id: string, name: string) {
    if (!confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`)) return;
    await adminFetch("/spots", {
      method: "DELETE",
      body: JSON.stringify({ id }),
    });
    load();
  }

  const cities = ["all", ...Array.from(new Set(spots.map((s) => s.city))).sort()];

  const filtered = spots.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.city.toLowerCase().includes(search.toLowerCase());
    const matchesCity = cityFilter === "all" || s.city === cityFilter;
    return matchesSearch && matchesCity;
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">Spots de entrenamiento</h1>
      <p className="text-[#B8B8B8] mb-6">{spots.filter(s => s.is_active).length} activos · {spots.length} total</p>

      <div className="flex gap-3 mb-6 flex-wrap">
        <input
          type="text"
          placeholder="Buscar por nombre o ciudad..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-48 rounded-lg border border-[#707070] bg-[#2a2b2d] px-4 py-2 text-white placeholder:text-[#B8B8B8] outline-none focus:border-[#F16823]"
        />
        <select
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          className="rounded-lg border border-[#707070] bg-[#2a2b2d] px-4 py-2 text-white outline-none focus:border-[#F16823]"
        >
          {cities.map((c) => (
            <option key={c} value={c}>{c === "all" ? "Todas las ciudades" : c}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-[#B8B8B8]">Cargando...</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#707070]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#707070] bg-[#2a2b2d]">
                {["Nombre", "Ciudad", "Zona", "Superficie", "Estado", "Acciones"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[#B8B8B8] font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-b border-[#2a2b2d] hover:bg-[#2a2b2d] transition-colors">
                  <td className="px-4 py-3 text-white font-medium">{s.name}</td>
                  <td className="px-4 py-3 text-[#B8B8B8]">{s.city}</td>
                  <td className="px-4 py-3 text-[#B8B8B8]">{s.zone}</td>
                  <td className="px-4 py-3 text-[#B8B8B8]">{s.surface}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      s.is_active ? "bg-green-500/20 text-green-400" : "bg-[#2a2b2d] text-[#B8B8B8] border border-[#707070]"
                    }`}>
                      {s.is_active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleActive(s.id, s.is_active)}
                        className="rounded-lg border border-[#707070] px-3 py-1 text-xs text-white hover:border-[#F16823] hover:text-[#F16823] transition-colors"
                      >
                        {s.is_active ? "Desactivar" : "Activar"}
                      </button>
                      <button
                        onClick={() => deleteSpot(s.id, s.name)}
                        className="rounded-lg border border-red-500/30 px-3 py-1 text-xs text-red-400 hover:border-red-400 transition-colors"
                      >
                        Eliminar
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
