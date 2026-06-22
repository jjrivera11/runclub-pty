"use client";
import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RunClubLogo } from "@/components/RunClubLogo";

const ZONAS_PANAMA = ["Panama Ciudad","La Chorrera","Playas del Este","Penonome","Santiago","Chitre","Chiriqui","Colon","David"];

interface Props {
  userId: string;
  email: string;
  profile: {
    full_name?: string;
    avatar_url?: string;
    partner_zona?: string;
    partner_whatsapp?: string;
    busca_partner?: boolean;
    email_notifications?: boolean;
    is_premium?: boolean;
    subscription_status?: string;
    talla_zapatillas?: string;
    talla_camiseta?: string;
    is_verified?: boolean;
    zona_entrenamiento?: string;
  } | null;
  subscription: {
    status: string;
    current_period_end?: string;
    amount_usd?: number;
  } | null;
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[#707070]/40 bg-[#2a2b2d] p-5 space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-white">{title}</h2>
        {description && <p className="text-xs text-[#B8B8B8] mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-[#B8B8B8]">{label}</label>
      {hint && <p className="text-xs text-[#B8B8B8]/60">{hint}</p>}
      {children}
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={"w-11 h-6 rounded-full transition-colors shrink-0 " + (value ? "bg-[#F16823]" : "bg-[#707070]")}
    >
      <span className={"block w-4 h-4 rounded-full bg-white transition-transform mx-1 " + (value ? "translate-x-5" : "translate-x-0")} />
    </button>
  );
}

export default function SettingsClient({ userId, email, profile, subscription }: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? "");
  const [partnerZona, setPartnerZona] = useState(profile?.partner_zona ?? "");
  const [partnerWhatsapp, setPartnerWhatsapp] = useState(profile?.partner_whatsapp ?? "");
  const [buscaPartner, setBuscaPartner] = useState(profile?.busca_partner ?? false);
  const [emailNotifications, setEmailNotifications] = useState(profile?.email_notifications ?? true);
  const [tallaZapatillas, setTallaZapatillas] = useState(profile?.talla_zapatillas ?? "");
  const [tallaCamiseta, setTallaCamiseta] = useState(profile?.talla_camiseta ?? "");
  const [zonaEntrenamiento, setZonaEntrenamiento] = useState<string | null>(profile?.zona_entrenamiento ?? null);

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setError("La foto debe pesar menos de 2MB."); return; }
    setUploading(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = userId + "/avatar." + ext;
    const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (upErr) { setError("Error subiendo foto."); setUploading(false); return; }
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    setAvatarUrl(data.publicUrl);
    await supabase.from("profiles").update({ avatar_url: data.publicUrl }).eq("id", userId);
    setUploading(false);
  }

  async function handleSavePerfil() {
    setSaving(true); setError(null);
    const supabase = createClient();
    const { error: err } = await supabase.from("profiles").update({
      full_name: fullName,
      partner_zona: partnerZona || null,
      partner_whatsapp: partnerWhatsapp || null,
      talla_zapatillas: tallaZapatillas || null,
      talla_camiseta: tallaCamiseta || null,
    }).eq("id", userId);

    const isNowVerified = !!(
      fullName.trim() &&
      avatarUrl &&
      partnerZona &&
      partnerWhatsapp &&
      tallaZapatillas &&
      tallaCamiseta
    );

    await supabase
      .from("profiles")
      .update({ is_verified: isNowVerified })
      .eq("id", userId);

    setSaving(false);
    if (err) { setError("No se pudo guardar. Intenta de nuevo."); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  async function handleSavePreferencias() {
    setSaving(true); setError(null);
    const supabase = createClient();
    await supabase.from("profiles").update({
      busca_partner: buscaPartner,
      email_notifications: emailNotifications,
    }).eq("id", userId);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  async function handleUpdateZona(zona: string) {
    setZonaEntrenamiento(zona);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from("profiles")
      .update({ zona_entrenamiento: zona })
      .eq("id", user.id);
  }

  async function handleCancelSubscription() {
    if (!confirm("Vas a cancelar tu suscripcion. Mantendras el acceso hasta el fin del periodo actual.")) return;
    const supabase = createClient();
    await supabase.from("subscriptions").update({ status: "cancelled" }).eq("user_id", userId).eq("status", "active");
    await supabase.from("profiles").update({ subscription_status: "cancelled" }).eq("id", userId);
    router.refresh();
  }

  async function handleDeleteAccount() {
    if (!confirm("Vas a eliminar tu cuenta permanentemente. Todos tus datos seran borrados.")) return;
    const code = prompt("Escribe ELIMINAR para confirmar:");
    if (code !== "ELIMINAR") return;
    const supabase = createClient();
    await supabase.from("profiles").delete().eq("id", userId);
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <main className="min-h-screen bg-[#1B1C1E] px-4 py-8">
      <div className="mx-auto max-w-lg space-y-6 pb-12">
        <div className="flex items-center justify-between mb-2">
          <button type="button" onClick={() => router.push("/dashboard")} className="flex items-center gap-1.5 text-[#B8B8B8] hover:text-white transition-colors text-sm">
            <i className="ti ti-arrow-left" style={{ fontSize: 18 }}></i>
            Volver
          </button>
          <h1 className="text-base font-semibold text-white">Configuración</h1>
          <div className="w-16" />
        </div>

        {saved && (
          <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
            Cambios guardados correctamente.
          </div>
        )}
        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <Section title="Perfil" description="Tu nombre e informacion de contacto. Tu foto solo es visible para partners que aceptes mutuamente.">
          {profile?.is_verified ? (
            <div className="flex items-center gap-3 rounded-lg border border-[#F16823]/30 bg-[#F16823]/5 px-4 py-3">
              <span className="text-xl">🏅</span>
              <div>
                <p className="text-sm font-semibold text-[#F16823]">Corredor Verificado</p>
                <p className="text-xs text-[#B8B8B8]">Tu perfil esta completo. Tendras acceso prioritario a promociones y la tienda RunClub.</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-lg border border-[#707070]/40 bg-[#1B1C1E] px-4 py-3">
              <span className="text-xl">⭕</span>
              <div>
                <p className="text-sm font-medium text-white">Completa tu perfil para verificarte</p>
                <p className="text-xs text-[#B8B8B8] mt-0.5">Agrega foto, zona, WhatsApp, talla de zapatillas y camiseta.</p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-16 h-16 rounded-full object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-[#F16823]/20 flex items-center justify-center">
                  <span className="text-xl font-bold text-[#F16823]">{fullName.charAt(0).toUpperCase() || "?"}</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#F16823] flex items-center justify-center text-white text-xs hover:opacity-90"
              >
                {uploading ? "..." : "+"}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </div>
            <div>
              <p className="text-xs text-[#B8B8B8]">Foto de perfil</p>
              <p className="text-xs text-[#B8B8B8]/60 mt-0.5">JPG o PNG, max 2MB.</p>
            </div>
          </div>

          <Field label="Nombre completo">
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-lg border border-[#707070] bg-[#1B1C1E] px-3 py-2.5 text-sm text-white outline-none focus:border-[#F16823]" />
          </Field>

          <Field label="Correo electronico" hint="No se puede cambiar desde aqui.">
            <input type="email" value={email} disabled className="w-full rounded-lg border border-[#707070]/40 bg-[#1B1C1E] px-3 py-2.5 text-sm text-[#B8B8B8]/50 cursor-not-allowed" />
          </Field>

          <Field label="Zona de entrenamiento" hint="Se usa para encontrar partners cerca de ti.">
            <select value={partnerZona} onChange={(e) => setPartnerZona(e.target.value)}
              className="w-full rounded-lg border border-[#707070] bg-[#1B1C1E] px-3 py-2.5 text-sm text-white outline-none focus:border-[#F16823]">
              <option value="">Selecciona tu zona</option>
              {ZONAS_PANAMA.map((z) => <option key={z} value={z}>{z}</option>)}
            </select>
          </Field>

          <Field label="WhatsApp" hint="Solo se comparte con partners que aceptes mutuamente.">
            <input type="tel" value={partnerWhatsapp} onChange={(e) => setPartnerWhatsapp(e.target.value)}
              placeholder="+507 6000-0000"
              className="w-full rounded-lg border border-[#707070] bg-[#1B1C1E] px-3 py-2.5 text-sm text-white placeholder:text-[#B8B8B8]/40 outline-none focus:border-[#F16823]" />
          </Field>

          <Field label="Talla de zapatillas (US)" hint="Ej: 7.5, 9, 10.5, 11">
            <select
              value={tallaZapatillas}
              onChange={(e) => setTallaZapatillas(e.target.value)}
              className="w-full rounded-lg border border-[#707070] bg-[#1B1C1E] px-3 py-2.5 text-sm text-white outline-none focus:border-[#F16823]"
            >
              <option value="">Selecciona tu talla</option>
              {["6","6.5","7","7.5","8","8.5","9","9.5","10","10.5","11","11.5","12","13"].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </Field>

          <Field label="Talla de camiseta">
            <div className="grid grid-cols-6 gap-2">
              {["XS","S","M","L","XL","XXL"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTallaCamiseta(t)}
                  className={"rounded-lg border py-2 text-sm font-medium transition-colors " + (tallaCamiseta === t ? "border-[#F16823] bg-[#F16823]/10 text-[#F16823]" : "border-[#707070] bg-transparent text-[#B8B8B8] hover:border-[#F16823] hover:text-white")}
                >
                  {t}
                </button>
              ))}
            </div>
          </Field>

          <button type="button" onClick={handleSavePerfil} disabled={saving}
            className="w-full rounded-lg bg-[#F16823] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 transition-opacity">
            {saving ? "Guardando..." : "Guardar perfil"}
          </button>
        </Section>

        <Section title="Zona de entrenamiento" description="¿Dónde entrenas normalmente? Lo usamos para sugerirte rutas locales.">
          <div className="rounded-lg border border-[#707070]/40 bg-[#2a2b2d] px-4 py-3 mb-3">
            <p className="text-xs text-[#B8B8B8] leading-relaxed">
              ⚠️ Tu zona de entrenamiento se usará en tu <span className="text-white font-medium">próxima generación de plan</span>. Si ya tienes un plan activo, los lugares sugeridos actuales no cambiarán hasta que generes uno nuevo.
            </p>
          </div>
          <div className="space-y-2">
            {[
              "Panama Ciudad",
              "La Chorrera",
              "Playas del Este",
              "Penonome",
              "Santiago",
              "Chitre",
              "Chiriqui",
              "Colon",
              "David",
            ].map((zona) => (
              <button
                key={zona}
                type="button"
                onClick={() => handleUpdateZona(zona)}
                className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                  zonaEntrenamiento === zona
                    ? "border-[#F16823] bg-[#2a2b2d] text-white"
                    : "border-[#707070] bg-transparent text-[#B8B8B8] hover:border-[#909090]"
                }`}
              >
                {zona}
              </button>
            ))}
          </div>
        </Section>

        <Section title="Plan activo" description="Detalles de tu suscripcion actual.">
          {profile?.is_premium && subscription ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#B8B8B8]">Estado</span>
                <span className="text-sm font-medium text-green-400">Activo</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#B8B8B8]">Monto</span>
                <span className="text-sm font-medium text-white">${subscription.amount_usd}/mes</span>
              </div>
              {subscription.current_period_end && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#B8B8B8]">Vence el</span>
                  <span className="text-sm font-medium text-white">
                    {new Date(subscription.current_period_end).toLocaleDateString("es-PA", { day: "numeric", month: "long", year: "numeric" })}
                  </span>
                </div>
              )}
              <div className="pt-2 border-t border-[#707070]/30">
                <p className="text-xs text-[#B8B8B8]/60 mb-3">Si cancelas, mantendras acceso hasta el fin del periodo actual.</p>
                <button type="button" onClick={handleCancelSubscription} className="text-sm text-red-400 hover:text-red-300 transition-colors">
                  Cancelar suscripcion
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-[#B8B8B8]">No tienes un plan activo.</p>
              <button type="button" onClick={() => router.push("/pricing")}
                className="w-full rounded-lg bg-[#F16823] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity">
                Ver planes
              </button>
            </div>
          )}
        </Section>

        <Section title="Preferencias" description="Controla como RunClub se comunica contigo.">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-white">Notificaciones por email</p>
                <p className="text-xs text-[#B8B8B8]/60 mt-0.5">Recordatorios semanales y novedades de tu plan.</p>
              </div>
              <Toggle value={emailNotifications} onChange={() => setEmailNotifications(!emailNotifications)} />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-white">Buscar partner de entrenamiento</p>
                <p className="text-xs text-[#B8B8B8]/60 mt-0.5">Aparecer en la seccion de Rutas Compartidas.</p>
              </div>
              <Toggle value={buscaPartner} onChange={() => setBuscaPartner(!buscaPartner)} />
            </div>
          </div>
          <button type="button" onClick={handleSavePreferencias} disabled={saving}
            className="w-full rounded-lg bg-[#F16823] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 transition-opacity">
            {saving ? "Guardando..." : "Guardar preferencias"}
          </button>
        </Section>

        <Section title="Cuenta" description="Opciones de seguridad y acceso.">
          <div className="space-y-3">
            <Link
              href="/help"
              className="flex w-full items-center gap-2 rounded-lg border border-[#707070] px-4 py-2.5 text-sm text-[#B8B8B8] hover:text-white hover:border-[#B8B8B8] transition-colors"
            >
              ❓ Centro de ayuda
            </Link>
            <form action="/auth/signout" method="POST">
              <button type="submit" className="w-full rounded-lg border border-[#707070] px-4 py-2.5 text-sm text-[#B8B8B8] hover:text-white hover:border-[#B8B8B8] transition-colors text-left">
                Cerrar sesion
              </button>
            </form>
            <div className="pt-2 border-t border-[#707070]/30">
              <p className="text-xs text-[#B8B8B8]/60 mb-3">La eliminacion de cuenta es permanente e irreversible. Todos tus datos y plan de entrenamiento seran borrados.</p>
              <button type="button" onClick={handleDeleteAccount} className="text-sm text-red-400 hover:text-red-300 transition-colors">
                Eliminar mi cuenta
              </button>
            </div>
          </div>
        </Section>

        <Section title="¿Quieres cambiar tu plan?" description="Contáctanos y te ayudamos a cambiar entre Runner Pro y Transformación.">
          <p className="text-sm text-[#B8B8B8]">
            El cambio de plan implica ajuste de precio y regeneración de tu plan de entrenamiento. Te guiamos en el proceso.
          </p>
          <a
            href="https://wa.me/14038998916?text=Hola%20Coach%20JJ%2C%20quiero%20cambiar%20mi%20plan%20de%20entrenamiento."
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity"
          >
            <span>💬</span>
            Contactar por WhatsApp
          </a>
        </Section>

      </div>
    </main>
  );
}
