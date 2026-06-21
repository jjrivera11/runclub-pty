"use client";
import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin-api";

interface PromoCode {
  id: string;
  code: string;
  type: string;
  value: number;
  sponsor: string;
  max_uses: number | null;
  times_used: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

const EMPTY = {
  code: "", type: "free_premium", value: 1, sponsor: "",
  max_uses: "", expires_at: "",
};

export default function PromosPage() {
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const data = await adminFetch("/promos");
    setPromos(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleSave() {
    setError(null);
    if (!form.code || !form.value) { setError("Codigo y valor son obligatorios."); return; }
    setSaving(true);
    const payload: Record<string, unknown> = {
      code: form.code.toUpperCase().trim(),
      type: form.type,
      value: Number(form.value),
      sponsor: form.sponsor || null,
      max_uses: form.max_uses ? Number(form.max_uses) : null,
      expires_at: form.expires_at || null,
      is_active: true,
    };
    try {
      await adminFetch("/promos", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear codigo.");
      setSaving(false);
      return;
    }
    setForm(EMPTY);
    setSaving(false);
    load();
  }

  async function toggleActive(id: string, current: boolean) {
    await adminFetch("/promos", {
      method: "PATCH",
      body: JSON.stringify({ id, is_active: !current }),
    });
    load();
  }

  async function deletePromo(id: string) {
    if (!confirm("¿Eliminar este código? Esta acción no se puede deshacer.")) return;
    await adminFetch("/promos", {
      method: "DELETE",
      body: JSON.stringify({ id }),
    });
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Codigos promocionales</h1>

      <div className="mb-8 rounded-xl border border-[#707070] bg-[#2a2b2d] p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Nuevo codigo</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[#B8B8B8] mb-1">Codigo</label>
            <input type="text" value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              placeholder="NEWBALANCE50"
              className="w-full rounded-lg border border-[#707070] bg-[#1B1C1E] px-3 py-2 text-white outline-none focus:border-[#F16823]" />
          </div>
          <div>
            <label className="block text-xs text-[#B8B8B8] mb-1">Tipo</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full rounded-lg border border-[#707070] bg-[#1B1C1E] px-3 py-2 text-white outline-none focus:border-[#F16823]">
              <option value="free_premium">Plan gratis (meses)</option>
              <option value="discount">Descuento (%)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-[#B8B8B8] mb-1">
              {form.type === "free_premium" ? "Meses gratis" : "Porcentaje de descuento"}
            </label>
            <input type="number" value={form.value} min={1}
              onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
              className="w-full rounded-lg border border-[#707070] bg-[#1B1C1E] px-3 py-2 text-white outline-none focus:border-[#F16823]" />
          </div>
          <div>
            <label className="block text-xs text-[#B8B8B8] mb-1">Sponsor</label>
            <input type="text" value={form.sponsor}
              onChange={(e) => setForm({ ...form, sponsor: e.target.value })}
              placeholder="New Balance"
              className="w-full rounded-lg border border-[#707070] bg-[#1B1C1E] px-3 py-2 text-white outline-none focus:border-[#F16823]" />
          </div>
          <div>
            <label className="block text-xs text-[#B8B8B8] mb-1">Usos maximos (vacio = ilimitado)</label>
            <input type="number" value={form.max_uses} min={1}
              onChange={(e) => setForm({ ...form, max_uses: e.target.value })}
              className="w-full rounded-lg border border-[#707070] bg-[#1B1C1E] px-3 py-2 text-white outline-none focus:border-[#F16823]" />
          </div>
          <div>
            <label className="block text-xs text-[#B8B8B8] mb-1">Fecha de vencimiento (opcional)</label>
            <input type="date" value={form.expires_at}
              onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
              className="w-full rounded-lg border border-[#707070] bg-[#1B1C1E] px-3 py-2 text-white outline-none focus:border-[#F16823] [color-scheme:dark]" />
          </div>
        </div>
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        <button onClick={handleSave} disabled={saving}
          className="mt-4 rounded-lg bg-[#F16823] px-5 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50">
          {saving ? "Guardando..." : "Crear codigo"}
        </button>
      </div>

      {loading ? <p className="text-[#B8B8B8]">Cargando...</p> : (
        <div className="overflow-x-auto rounded-xl border border-[#707070]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#707070] bg-[#2a2b2d]">
                {["Codigo","Tipo","Valor","Sponsor","Usos","Vence","Estado","Acciones"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[#B8B8B8] font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {promos.map((p) => (
                <tr key={p.id} className="border-b border-[#2a2b2d] hover:bg-[#2a2b2d] transition-colors">
                  <td className="px-4 py-3 font-mono text-[#F16823]">{p.code}</td>
                  <td className="px-4 py-3 text-[#B8B8B8]">{p.type === "free_premium" ? "Plan gratis" : "Descuento"}</td>
                  <td className="px-4 py-3 text-white">{p.type === "free_premium" ? `${p.value} mes(es)` : `${p.value}%`}</td>
                  <td className="px-4 py-3 text-[#B8B8B8]">{p.sponsor ?? "—"}</td>
                  <td className="px-4 py-3 text-[#B8B8B8]">{p.times_used}{p.max_uses ? `/${p.max_uses}` : ""}</td>
                  <td className="px-4 py-3 text-[#B8B8B8]">{p.expires_at ? new Date(p.expires_at).toLocaleDateString("es-PA") : "Sin vencimiento"}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      p.is_active ? "bg-green-500/20 text-green-400" : "bg-[#2a2b2d] text-[#B8B8B8] border border-[#707070]"
                    }`}>{p.is_active ? "Activo" : "Inactivo"}</span>
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <button onClick={() => toggleActive(p.id, p.is_active)}
                      className="rounded-lg border border-[#707070] px-3 py-1 text-xs text-white hover:border-[#F16823] hover:text-[#F16823] transition-colors">
                      {p.is_active ? "Desactivar" : "Activar"}
                    </button>
                    <button onClick={() => deletePromo(p.id)}
                      className="rounded-lg border border-red-500/30 px-3 py-1 text-xs text-red-400 hover:border-red-400 transition-colors">
                      Eliminar
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
