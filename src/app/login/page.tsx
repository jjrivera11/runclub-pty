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
    </main>
  );
}
