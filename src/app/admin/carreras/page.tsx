"use client";
import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin-api";

interface Race {
  id: string;
  name: string;
  distance_km: number;
  distances: number[];
  race_date: string;
  location: string;
  start_time: string;
  is_active: boolean;
  registration_url: string | null;
  is_trail: boolean;
}

const COMMON_DISTANCES = [5, 10, 15, 21, 42];

const EMPTY: {
  name: string; distance_km: number; distances: number[]; race_date: string;
  location: string; start_time: string; registration_url: string | null; is_trail: boolean;
} = {
  name: "", distance_km: 0, distances: [] as number[], race_date: "",
  location: "", start_time: "06:00", registration_url: null, is_trail: false,
};

export default function CarrerasPage() {
  const [races, setRaces] = useState<Race[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customDist, setCustomDist] = useState("");

  async function load() {
    const data = await adminFetch("/carreras");
    setRaces(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function addDistance(km: number) {
    if (!km || km <= 0) return;
    if (form.distances.includes(km)) return;
    const updated = [...form.distances, km].sort((a, b) => a - b);
    setForm({ ...form, distances: updated, distance_km: updated[0] ?? km });
  }

  function removeDistance(km: number) {
    const updated = form.distances.filter((d) => d !== km);
    setForm({ ...form, distances: updated, distance_km: updated[0] ?? 0 });
  }

  async function handleSave() {
    setError(null);
    if (!form.name || !form.race_date || !form.location) {
      setError("Nombre, fecha y lugar son obligatorios.");
      return;
    }
    if (form.distances.length === 0) {
      setError("Agrega al menos una distancia.");
      return;
    }
    setSaving(true);
    const payload = {
      ...form,
      distance_km: form.distances[0],
      distances: form.distances,
    };
    if (editing) {
      await adminFetch("/carreras", { method: "PATCH", body: JSON.stringify({ id: editing, ...payload }) });
    } else {
      await adminFetch("/carreras", { method: "POST", body: JSON.stringify({ ...payload, is_active: true }) });
    }
    setForm(EMPTY);
    setEditing(null);
    setSaving(false);
    load();
  }

  async function toggleActive(id: string, current: boolean) {
    await adminFetch("/carreras", { method: "PATCH", body: JSON.stringify({ id, is_active: !current }) });
    load();
  }

  function startEdit(r: Race) {
    setEditing(r.id);
    setForm({
      name: r.name,
      distance_km: r.distance_km,
      distances: r.distances?.length ? r.distances : [r.distance_km],
      race_date: r.race_date,
      location: r.location,
      start_time: r.start_time ?? "06:00",
      registration_url: r.registration_url ?? "",
      is_trail: r.is_trail ?? false,
    });
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Carreras</h1>

      <div className="mb-8 rounded-xl border border-[#707070] bg-[#2a2b2d] p-6">
        <h2 className="text-lg font-semibold text-white mb-4">{editing ? "Editar carrera" : "Nueva carrera"}</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-xs text-[#B8B8B8] mb-1">Nombre</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-lg border border-[#707070] bg-[#1B1C1E] px-3 py-2 text-white outline-none focus:border-[#F16823]" />
          </div>

          <div className="col-span-2">
            <label className="block text-xs text-[#B8B8B8] mb-2">Distancias disponibles</label>
            {/* Chips de distancias seleccionadas */}
            <div className="flex flex-wrap gap-2 mb-3 min-h-8">
              {form.distances.map((d) => (
                <span key={d} className="flex items-center gap-1 rounded-full bg-[#F16823]/20 border border-[#F16823]/40 px-3 py-1 text-sm text-[#F16823]">
                  {d}K
                  <button type="button" onClick={() => removeDistance(d)} className="hover:text-white ml-1">×</button>
                </span>
              ))}
              {form.distances.length === 0 && (
                <span className="text-xs text-[#707070]">Ninguna distancia agregada</span>
              )}
            </div>
            {/* Distancias comunes */}
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="text-xs text-[#B8B8B8] self-center">Comunes:</span>
              {COMMON_DISTANCES.map((d) => (
                <button key={d} type="button" onClick={() => addDistance(d)}
                  disabled={form.distances.includes(d)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    form.distances.includes(d)
                      ? "bg-[#F16823]/10 text-[#F16823]/40 cursor-not-allowed"
                      : "bg-[#1B1C1E] border border-[#707070] text-white hover:border-[#F16823] hover:text-[#F16823]"
                  }`}>
                  {d}K
                </button>
              ))}
            </div>
            {/* Custom */}
            <div className="flex gap-2">
              <input
                type="number"
                value={customDist}
                onChange={(e) => setCustomDist(e.target.value)}
                placeholder="Ej: 8"
                className="w-24 rounded-lg border border-[#707070] bg-[#1B1C1E] px-3 py-2 text-white outline-none focus:border-[#F16823] text-sm"
              />
              <span className="text-[#B8B8B8] self-center text-sm">km</span>
              <button type="button"
                onClick={() => { addDistance(Number(customDist)); setCustomDist(""); }}
                className="rounded-lg border border-[#707070] px-3 py-2 text-xs text-white hover:border-[#F16823] hover:text-[#F16823] transition-colors">
                + Agregar
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#B8B8B8] mb-1">Hora de salida</label>
            <input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })}
              className="w-full rounded-lg border border-[#707070] bg-[#1B1C1E] px-3 py-2 text-white outline-none focus:border-[#F16823]" />
          </div>
          <div>
            <label className="block text-xs text-[#B8B8B8] mb-1">Fecha</label>
            <input type="date" value={form.race_date} onChange={(e) => setForm({ ...form, race_date: e.target.value })}
              className="w-full rounded-lg border border-[#707070] bg-[#1B1C1E] px-3 py-2 text-white outline-none focus:border-[#F16823] [color-scheme:dark]" />
          </div>
          <div>
            <label className="block text-xs text-[#B8B8B8] mb-1">Lugar</label>
            <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full rounded-lg border border-[#707070] bg-[#1B1C1E] px-3 py-2 text-white outline-none focus:border-[#F16823]" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs text-[#B8B8B8] mb-1">Link de inscripciones <span className="text-[#707070]">(opcional)</span></label>
            <input type="url" value={form.registration_url ?? ""} onChange={(e) => setForm({ ...form, registration_url: e.target.value || null })}
              placeholder="https://..."
              className="w-full rounded-lg border border-[#707070] bg-[#1B1C1E] px-3 py-2 text-white outline-none focus:border-[#F16823] placeholder:text-[#707070]" />
          </div>
          <div className="col-span-2 flex items-center gap-3">
            <input type="checkbox" id="is_trail" checked={form.is_trail}
              onChange={(e) => setForm({ ...form, is_trail: e.target.checked })}
              className="h-4 w-4 accent-[#F16823]" />
            <label htmlFor="is_trail" className="text-sm text-[#B8B8B8]">🏔️ Es una carrera trail</label>
          </div>
        </div>
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        <div className="mt-4 flex gap-3">
          <button onClick={handleSave} disabled={saving}
            className="rounded-lg bg-[#F16823] px-5 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50">
            {saving ? "Guardando..." : editing ? "Actualizar" : "Crear carrera"}
          </button>
          {editing && (
            <button onClick={() => { setEditing(null); setForm(EMPTY); }}
              className="rounded-lg border border-[#707070] px-5 py-2 text-sm text-[#B8B8B8] hover:text-white">
              Cancelar
            </button>
          )}
        </div>
      </div>

      {loading ? <p className="text-[#B8B8B8]">Cargando...</p> : (
        <div className="overflow-x-auto rounded-xl border border-[#707070]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#707070] bg-[#2a2b2d]">
                {["Nombre", "Distancias", "Tipo", "Fecha", "Lugar", "Estado", "Acciones"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[#B8B8B8] font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {races.map((r) => {
                const dists = r.distances?.length ? r.distances : [r.distance_km];
                return (
                  <tr key={r.id} className="border-b border-[#2a2b2d] hover:bg-[#2a2b2d] transition-colors">
                    <td className="px-4 py-3 text-white">{r.name}</td>
                    <td className="px-4 py-3 text-[#B8B8B8]">
                      <div className="flex flex-wrap gap-1">
                        {dists.map((d) => (
                          <span key={d} className="rounded-full bg-[#1B1C1E] border border-[#707070] px-2 py-0.5 text-xs text-white">
                            {d}K
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {r.is_trail ? (
                        <span className="rounded-full bg-green-500/20 text-green-400 px-2 py-0.5 text-xs">🏔️ Trail</span>
                      ) : (
                        <span className="rounded-full bg-[#2a2b2d] text-[#B8B8B8] border border-[#707070] px-2 py-0.5 text-xs">🏁 Road</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[#B8B8B8]">{r.race_date}</td>
                    <td className="px-4 py-3 text-[#B8B8B8]">{r.location}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        r.is_active ? "bg-green-500/20 text-green-400" : "bg-[#2a2b2d] text-[#B8B8B8] border border-[#707070]"
                      }`}>
                        {r.is_active ? "Activa" : "Inactiva"}
                      </span>
                    </td>
                    <td className="px-4 py-3 flex gap-2">
                      <button onClick={() => startEdit(r)}
                        className="rounded-lg border border-[#707070] px-3 py-1 text-xs text-white hover:border-[#F16823] hover:text-[#F16823] transition-colors">
                        Editar
                      </button>
                      <button onClick={() => toggleActive(r.id, r.is_active)}
                        className="rounded-lg border border-[#707070] px-3 py-1 text-xs text-white hover:border-[#F16823] hover:text-[#F16823] transition-colors">
                        {r.is_active ? "Desactivar" : "Activar"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
