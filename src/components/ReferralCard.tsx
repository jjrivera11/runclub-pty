"use client";
import { useEffect, useState } from "react";

export function ReferralCard() {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [linkRes, profileRes] = await Promise.all([
        fetch("/api/referral/link"),
        import("@/lib/supabase/client").then(async ({ createClient }) => {
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return null;
          const { data } = await supabase
            .from("profiles")
            .select("referral_discount_pct, referral_discount_used")
            .eq("id", user.id)
            .single();
          return data;
        }),
      ]);

      const linkData = await linkRes.json();
      if (linkData.url) setUrl(linkData.url);
      if (profileRes && !profileRes.referral_discount_used) {
        setDiscount(profileRes.referral_discount_pct ?? 0);
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) return null;

  return (
    <div className="rounded-xl border border-[#707070] bg-[#2a2b2d] p-4 space-y-3">
      {discount > 0 && (
        <div className="rounded-lg border border-[#F16823]/30 bg-[#F16823]/10 px-4 py-3">
          <p className="text-sm text-[#F16823] font-medium">
            Tu proximo mes tiene {discount}% de descuento
          </p>
          <p className="text-xs text-[#B8B8B8] mt-0.5">
            Un amigo que referiste se unio a RunClub Panama
          </p>
        </div>
      )}

      <div>
        <p className="text-sm font-medium text-white mb-1">
          Invita a un amigo
        </p>
        <p className="text-xs text-[#B8B8B8] mb-3">
          Cuando tu amigo pague su plan, recibiras 20% de descuento en tu proxima renovacion.
        </p>
        <div className="flex gap-2">
          <input
            readOnly
            value={url}
            className="flex-1 rounded-lg border border-[#707070] bg-[#1B1C1E] px-3 py-2 text-xs text-[#B8B8B8] outline-none truncate"
          />
          <button
            onClick={handleCopy}
            className="shrink-0 rounded-lg bg-[#F16823] px-4 py-2 text-xs font-medium text-white hover:opacity-90 transition-opacity"
          >
            {copied ? "Copiado" : "Copiar"}
          </button>
        </div>
      </div>
    </div>
  );
}
