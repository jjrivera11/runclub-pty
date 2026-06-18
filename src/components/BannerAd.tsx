"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Banner {
  id: string;
  image_url: string;
  link_url: string;
  title: string;
}

interface BannerAdProps {
  placement: "dashboard" | "preview" | "generating";
  isPremium: boolean;
}

export function BannerAd({ placement, isPremium }: BannerAdProps) {
  const [banner, setBanner] = useState<Banner | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const audience = isPremium ? ["premium", "all"] : ["free", "all"];
      const { data } = await supabase
        .from("banners")
        .select("id, image_url, link_url, title")
        .eq("placement", placement)
        .eq("is_active", true)
        .in("audience", audience)
        .order("created_at", { ascending: false })
        .limit(1);
      if (data && data.length > 0) setBanner(data[0] as Banner);
    }
    load();
  }, [placement, isPremium]);

  if (!banner) return null;

  const isGenerating = placement === "generating";

  const img = (
    <img
      src={banner.image_url}
      alt={banner.title}
      className="w-full rounded-xl object-cover"
      style={{
        aspectRatio: isGenerating ? "3/1" : "4/1",
        opacity: isGenerating ? 0.7 : 1,
      }}
    />
  );

  return (
    <div className="w-full">
      {isPremium && (
        <p className="text-xs text-[#B8B8B8] mb-1 text-right">Patrocinado</p>
      )}
      {banner.link_url ? (
        <a href={banner.link_url} target="_blank" rel="noopener noreferrer">
          {img}
        </a>
      ) : img}
      {!isPremium && (
        <p className="text-xs text-[#B8B8B8] mt-1 text-right">Publicidad</p>
      )}
    </div>
  );
}
