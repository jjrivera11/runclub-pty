"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { RunClubLogo } from "@/components/RunClubLogo";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    // Leer el hash de la URL y establecer la sesión
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");

      if (accessToken && refreshToken) {
        supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
      }
    }

    supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        // Sesión activa con token de recovery
      }
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("La contraseña debe tener mínimo 8 caracteres.");
      return;
    }

    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError("No se pudo actualizar la contraseña. El enlace puede haber expirado.");
      setLoading(false);
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/dashboard"), 2500);
  }

  return (
    <main className="flex min-h-full flex-1 items-center justify-center bg-[#1B1C1E] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <RunClubLogo size="lg" />
          <p className="mt-2 text-sm text-[#B8B8B8]">Restablece tu contraseña</p>
        </div>

        {success ? (
          <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-6 text-center">
            <p className="text-green-400 font-medium mb-1">¡Contraseña actualizada!</p>
            <p className="text-sm text-[#B8B8B8]">Redirigiendo a tu dashboard...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </p>
            )}
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm text-[#B8B8B8]">
                Nueva contraseña
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                className="w-full rounded-lg border border-[#707070] bg-[#2a2b2d] px-4 py-3 text-white placeholder:text-[#B8B8B8] outline-none focus:border-[#F16823] focus:ring-1 focus:ring-[#F16823]"
              />
            </div>
            <div>
              <label htmlFor="confirm" className="mb-1.5 block text-sm text-[#B8B8B8]">
                Confirmar contraseña
              </label>
              <input
                id="confirm"
                type="password"
                required
                minLength={8}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repite tu nueva contraseña"
                className="w-full rounded-lg border border-[#707070] bg-[#2a2b2d] px-4 py-3 text-white placeholder:text-[#B8B8B8] outline-none focus:border-[#F16823] focus:ring-1 focus:ring-[#F16823]"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#F16823] px-4 py-3 font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Actualizando..." : "Actualizar contraseña"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
