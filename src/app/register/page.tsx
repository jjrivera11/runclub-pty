"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { sendWelcomeEmail } from "@/lib/email";
import { RunClubLogo } from "@/components/RunClubLogo";

export default function RegisterPage() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!acceptedTerms) {
      setError("Debes aceptar los Términos y Condiciones para continuar.");
      return;
    }

    if (!nombre.trim()) {
      setError("Ingresa tu nombre completo.");
      return;
    }

    if (password.length < 8) {
      setError("La contraseña debe tener mínimo 8 caracteres.");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: nombre.trim(),
        },
      },
    });

    if (authError) {
      setError(
        authError.message.includes("already registered")
          ? "Este correo ya está registrado. Intenta iniciar sesión."
          : "No se pudo crear la cuenta. Intenta de nuevo."
      );
      setLoading(false);
      return;
    }

    const refCode = new URLSearchParams(window.location.search).get("ref");
    if (refCode) {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data: referrer } = await supabase
        .from("profiles")
        .select("id")
        .eq("referral_code", refCode)
        .single();
      if (referrer) {
        await supabase
          .from("profiles")
          .update({ referred_by: referrer.id })
          .eq("id", data.user!.id);
      }
    }

    if (data?.user?.email) {
      sendWelcomeEmail(data.user.email, nombre.trim()).catch(() => {});
    }

    router.push("/verify-email");
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
            <label htmlFor="nombre" className="mb-1.5 block text-sm text-[#B8B8B8]">
              Nombre completo
            </label>
            <input
              id="nombre"
              type="text"
              autoComplete="name"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Tu nombre"
              className="w-full rounded-lg border border-[#707070] bg-[#2a2b2d] px-4 py-3 text-white placeholder:text-[#B8B8B8] outline-none focus:border-[#F16823] focus:ring-1 focus:ring-[#F16823]"
            />
          </div>

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
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
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

          <div className="flex items-start gap-3">
            <input
              id="terms"
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-[#F16823] cursor-pointer"
            />
            <label htmlFor="terms" className="text-sm text-[#B8B8B8] leading-relaxed">
              He leído y acepto los{" "}
              <Link href="/terms" target="_blank" className="text-[#F16823] hover:underline">
                Términos y Condiciones
              </Link>{" "}
              de RunClub Panamá.
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#F16823] px-4 py-3 font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#B8B8B8]">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-[#F16823] hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </main>
  );
}
