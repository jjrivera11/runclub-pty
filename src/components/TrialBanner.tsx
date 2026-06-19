"use client";

import Link from "next/link";

interface TrialBannerProps {
  trialEndsAt: string | null;
}

export function TrialBanner({ trialEndsAt }: TrialBannerProps) {
  if (!trialEndsAt) return null;

  const trialEnd = new Date(trialEndsAt);
  const now = new Date();
  const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysLeft > 7) return null;

  const isExpired = daysLeft <= 0;
  const isUrgent = daysLeft <= 2;

  if (isExpired) return null; // middleware ya redirige

  return (
    <div className={`w-full px-4 py-3 text-center text-sm font-medium ${
      isUrgent
        ? "bg-red-500/20 border-b border-red-500/30 text-red-300"
        : "bg-[#F16823]/10 border-b border-[#F16823]/20 text-[#F16823]"
    }`}>
      {isUrgent
        ? `⚠️ Tu prueba gratuita termina ${daysLeft === 0 ? "hoy" : `en ${daysLeft} día${daysLeft > 1 ? "s" : ""}`} — `
        : `Tu prueba gratuita termina en ${daysLeft} días — `
      }
      <Link href="/pricing" className="underline hover:no-underline">
        Suscríbete ahora
      </Link>
    </div>
  );
}
