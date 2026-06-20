"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Race {
  id: string;
  name: string;
  distance_km: number;
  race_date: string;
  location: string;
  start_time: string;
  is_active: boolean;
  registration_url: string | null;
  is_trail: boolean;
}

const EMPTY: Omit<Race, "id" | "is_active"> = {
  name: "", distance_km: 0, race_date: "", location: "", start_time: "06:00", registration_url: "", is_trail: false,
};

export default function CarrerasPage() {
  const [races, setRaces] = useState<Race[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const supabase = createClient();
    const { data } = await supabase.from("races").select("*").order("race_date");
    setRaces((data as Race[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleSave() {
    setError(null);
    if (!form.name || !form.race_date || !form.location) {
      setError("Nombre, fecha y lugar son obligatorios.");
      return;
    }
    setSaving(true);
    const supabase = createClient();
    if (editing) {
      const { error } = await supabase.from("races").update(form).eq("id", editing);
      console.log("update result:", error);
    } else {
      const { error } = await supabase.from("races").insert({ ...form, is_active: true });
      console.log("insert result:", error);
    }
    setForm(EMPTY);
    setEditing(null);
    setSaving(false);
    load();
  }

  async function toggleActive(id: string, current: boolean) {
    const supabase = createClient();
    await supabase.from("races").update({ is_active: !current }).eq("id", id);
    load();
  }

  function startEdit(r: Race) {
    setEditing(r.id);
    setForm({ name: r.name, distance_km: r.distance_km, race_date: r.race_date, location: r.location, start_time: r.start_time ?? "06:00", registration_url: r.registration_url ?? "", is_trail: r.is_trail ?? false });
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
          <div>
            <label className="block text-xs text-[#B8B8B8] mb-1">Distancia (km)</label>
            <input type="number" value={form.distance_km} onChange={(e) => setForm({ ...form, distance_km: Number(e.target.value) })}
              className="w-full rounded-lg border border-[#707070] bg-[#1B1C1E] px-3 py-2 text-white outline-none focus:border-[#F16823]" />
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
            <input
              type="checkbox"
              id="is_trail"
              checked={form.is_trail}
              onChange={(e) => setForm({ ...form, is_trail: e.target.checked })}
              className="h-4 w-4 accent-[#F16823]"
            />
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
                <th className="px-4 py-3 text-left text-[#B8B8B8] font-medium">Nombre</th>
                <th className="px-4 py-3 text-left text-[#B8B8B8] font-medium">Distancia</th>
                <th className="px-4 py-3 text-left text-[#B8B8B8] font-medium">Tipo</th>
                <th className="px-4 py-3 text-left text-[#B8B8B8] font-medium">Fecha</th>
                <th className="px-4 py-3 text-left text-[#B8B8B8] font-medium">Salida</th>
                <th className="px-4 py-3 text-left text-[#B8B8B8] font-medium">Lugar</th>
                <th className="px-4 py-3 text-left text-[#B8B8B8] font-medium">Link</th>
                <th className="px-4 py-3 text-left text-[#B8B8B8] font-medium">Estado</th>
                <th className="px-4 py-3 text-left text-[#B8B8B8] font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {races.map((r) => (
                <tr key={r.id} className="border-b border-[#2a2b2d] hover:bg-[#2a2b2d] transition-colors">
                  <td className="px-4 py-3 text-white">{r.name}</td>
                  <td className="px-4 py-3 text-[#B8B8B8]">{r.distance_km}km</td>
                  <td className="px-4 py-3">
                    {r.is_trail ? (
                      <span className="rounded-full bg-green-500/20 text-green-400 px-2 py-0.5 text-xs">🏔️ Trail</span>
                    ) : (
                      <span className="rounded-full bg-[#2a2b2d] text-[#B8B8B8] border border-[#707070] px-2 py-0.5 text-xs">🏁 Road</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[#B8B8B8]">{r.race_date}</td>
                  <td className="px-4 py-3 text-[#B8B8B8]">{r.start_time ?? "—"}</td>
                  <td className="px-4 py-3 text-[#B8B8B8]">{r.location}</td>
                  <td className="px-4 py-3">
                    {r.registration_url ? (
                      <a href={r.registration_url} target="_blank" rel="noopener noreferrer"
                        className="text-[#F16823] hover:underline text-xs">
                        Inscribirse →
                      </a>
                    ) : (
                      <span className="text-[#707070] text-xs">—</span>
                    )}
                  </td>
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
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
