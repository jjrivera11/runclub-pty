"use client";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { adminFetch } from "@/lib/admin-api";

interface Banner {
  id: string;
  title: string;
  image_url: string;
  link_url: string;
  audience: string;
  placement: string;
  is_active: boolean;
  created_at: string;
}

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: "", link_url: "", audience: "free", placement: "dashboard",
  });

  async function load() {
    const data = await adminFetch("/banners");
    setBanners(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleUpload() {
    setError(null);
    const file = fileRef.current?.files?.[0];
    if (!file) { setError("Selecciona una imagen."); return; }
    if (!form.title) { setError("El titulo es obligatorio."); return; }
    const maxKb = form.placement === "generating" ? 200 : 300;
    if (file.size > maxKb * 1024) { setError(`La imagen debe pesar menos de ${maxKb}kb para esta ubicacion.`); return; }

    setUploading(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage.from("banners").upload(path, file);
    if (uploadError) { setError("Error subiendo imagen."); setUploading(false); return; }

    const { data: urlData } = supabase.storage.from("banners").getPublicUrl(path);

    await adminFetch("/banners", {
      method: "POST",
      body: JSON.stringify({
        ...form,
        image_url: urlData.publicUrl,
        is_active: true,
      }),
    });

    setForm({ title: "", link_url: "", audience: "free", placement: "dashboard" });
    if (fileRef.current) fileRef.current.value = "";
    setUploading(false);
    load();
  }

  async function toggleActive(id: string, current: boolean) {
    await adminFetch("/banners", {
      method: "PATCH",
      body: JSON.stringify({ id, is_active: !current }),
    });
    load();
  }

  async function deleteBanner(id: string, title: string) {
    if (!confirm(`¿Deseas eliminar el banner "${title}"? Esta acción no se puede deshacer.`)) return;
    await adminFetch("/banners", {
      method: "DELETE",
      body: JSON.stringify({ id }),
    });
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Banners publicitarios</h1>

      <div className="mb-8 rounded-xl border border-[#707070] bg-[#2a2b2d] p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Subir nuevo banner</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-xs text-[#B8B8B8] mb-1">Titulo</label>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Ej: New Balance Enero 2025"
              className="w-full rounded-lg border border-[#707070] bg-[#1B1C1E] px-3 py-2 text-white outline-none focus:border-[#F16823]" />
          </div>
          <div>
            <label className="block text-xs text-[#B8B8B8] mb-1">Audiencia</label>
            <select value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })}
              className="w-full rounded-lg border border-[#707070] bg-[#1B1C1E] px-3 py-2 text-white outline-none focus:border-[#F16823]">
              <option value="free">Solo free</option>
              <option value="premium">Solo premium</option>
              <option value="all">Todos</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-[#B8B8B8] mb-1">Ubicacion</label>
            <select value={form.placement} onChange={(e) => setForm({ ...form, placement: e.target.value })}
              className="w-full rounded-lg border border-[#707070] bg-[#1B1C1E] px-3 py-2 text-white outline-none focus:border-[#F16823]">
              <option value="dashboard">Dashboard</option>
              <option value="preview">Preview</option>
              <option value="generating">Generating</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-xs text-[#B8B8B8] mb-1">URL destino (opcional)</label>
            <input type="text" value={form.link_url} onChange={(e) => setForm({ ...form, link_url: e.target.value })}
              placeholder="https://newbalance.com.pa"
              className="w-full rounded-lg border border-[#707070] bg-[#1B1C1E] px-3 py-2 text-white outline-none focus:border-[#F16823]" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs text-[#B8B8B8] mb-1">
              Imagen (WebP o PNG) — Dashboard/Preview: 1200×300px max 300kb · Generating: 900×300px max 200kb
            </label>
            <input ref={fileRef} type="file" accept="image/webp,image/png,image/jpeg"
              className="w-full rounded-lg border border-[#707070] bg-[#1B1C1E] px-3 py-2 text-white outline-none focus:border-[#F16823]" />
          </div>
        </div>
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        <button onClick={handleUpload} disabled={uploading}
          className="mt-4 rounded-lg bg-[#F16823] px-5 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50">
          {uploading ? "Subiendo..." : "Subir banner"}
        </button>
      </div>

      {loading ? <p className="text-[#B8B8B8]">Cargando...</p> : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {banners.map((b) => (
            <div key={b.id} className="rounded-xl border border-[#707070] bg-[#2a2b2d] overflow-hidden">
              <div className="relative w-full h-32 pointer-events-none">
                <img src={b.image_url} alt={b.title} className="w-full h-32 object-cover" />
              </div>
              <div className="p-4 relative z-10">
                <p className="font-medium text-white mb-1">{b.title}</p>
                <div className="flex gap-2 mb-3 flex-wrap">
                  <span className="rounded-full bg-[#1B1C1E] border border-[#707070] px-2 py-0.5 text-xs text-[#B8B8B8]">{b.audience}</span>
                  <span className="rounded-full bg-[#1B1C1E] border border-[#707070] px-2 py-0.5 text-xs text-[#B8B8B8]">{b.placement}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    b.is_active ? "bg-green-500/20 text-green-400" : "bg-[#2a2b2d] text-[#B8B8B8] border border-[#707070]"
                  }`}>{b.is_active ? "Activo" : "Inactivo"}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => toggleActive(b.id, b.is_active)}
                    className="rounded-lg border border-[#707070] px-3 py-1 text-xs text-white hover:border-[#F16823] hover:text-[#F16823] transition-colors">
                    {b.is_active ? "Desactivar" : "Activar"}
                  </button>
                  <button onClick={() => deleteBanner(b.id, b.title)}
                    className="rounded-lg border border-red-500/30 px-3 py-1 text-xs text-red-400 hover:border-red-400 transition-colors">
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
