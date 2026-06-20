"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { RunClubLogo } from "@/components/RunClubLogo";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log("signInWithPassword data:", data);
    console.log("signInWithPassword error:", authError);

    if (authError) {
      setError("Correo o contraseña incorrectos. Intenta de nuevo.");
      setLoading(false);
      return;
    }

    console.log("Login exitoso, redirigiendo...");
    router.push("/dashboard");
    router.refresh();
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResetLoading(true);
    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    if (resetError) {
      setError("No se pudo enviar el correo. Verifica tu email e intenta de nuevo.");
    } else {
      setResetSent(true);
    }
    setResetLoading(false);
  }

  return (
    <main className="flex min-h-full flex-1 items-center justify-center bg-[#1B1C1E] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <RunClubLogo size="lg" />
          <p className="mt-2 text-sm text-[#B8B8B8]">
            La comunidad de running de Panamá
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </p>
          )}

          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm text-[#B8B8B8]">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              className="w-full rounded-lg border border-[#707070] bg-[#2a2b2d] px-4 py-3 text-white placeholder:text-[#B8B8B8] outline-none focus:border-[#F16823] focus:ring-1 focus:ring-[#F16823]"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm text-[#B8B8B8]">
              Contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-[#707070] bg-[#2a2b2d] px-4 py-3 pr-12 text-white placeholder:text-[#B8B8B8] outline-none focus:border-[#F16823] focus:ring-1 focus:ring-[#F16823]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-lg text-[#B8B8B8] transition-colors hover:text-white"
                aria-label={
                  showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
              >
                {showPassword ? "👁‍🗨" : "👁"}
              </button>
            </div>
          </div>

          <div className="text-right">
            <button
              type="button"
              onClick={() => { setResetMode(true); setError(null); }}
              className="text-xs text-[#B8B8B8] hover:text-[#F16823] transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#F16823] px-4 py-3 font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#B8B8B8]">
          ¿No tienes cuenta?{" "}
          <Link href="/register" className="text-[#F16823] hover:underline">
            Regístrate
          </Link>
        </p>
      </div>

      {resetMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm bg-[#1B1C1E] rounded-2xl border border-[#707070]/40 p-6">
            {resetSent ? (
              <div className="text-center space-y-4">
                <span className="text-4xl">📬</span>
                <h3 className="text-lg font-semibold text-white">Revisa tu correo</h3>
                <p className="text-sm text-[#B8B8B8]">
                  Te enviamos un link para restablecer tu contraseña a <span className="text-white">{email}</span>.
                </p>
                <button
                  onClick={() => { setResetMode(false); setResetSent(false); }}
                  className="w-full rounded-lg bg-[#F16823] py-3 text-sm font-medium text-white hover:opacity-90 transition-opacity"
                >
                  Volver al login
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Restablecer contraseña</h3>
                  <button onClick={() => setResetMode(false)} className="text-[#B8B8B8] hover:text-white text-xl">✕</button>
                </div>
                <p className="text-sm text-[#B8B8B8]">
                  Ingresa tu correo y te enviaremos un link para crear una nueva contraseña.
                </p>
                {error && (
                  <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    {error}
                  </p>
                )}
                <form onSubmit={handleReset} className="space-y-4">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    className="w-full rounded-lg border border-[#707070] bg-[#2a2b2d] px-4 py-3 text-white placeholder:text-[#B8B8B8] outline-none focus:border-[#F16823] focus:ring-1 focus:ring-[#F16823]"
                  />
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full rounded-lg bg-[#F16823] py-3 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {resetLoading ? "Enviando..." : "Enviar link de recuperación"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
