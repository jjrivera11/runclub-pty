import type { MetadataRoute } from "next";
import { getActiveSpotsWithSlugs } from "@/lib/rutas";

const BASE_URL = "https://runclubpty.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/landing`, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/nosotros`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/empresarial`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/empresarial/features`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/register`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/login`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/rutas`, changeFrequency: "weekly", priority: 0.9 },
  ];

  const spots = await getActiveSpotsWithSlugs();
  const citySlugs = new Set<string>();

  const routePages: MetadataRoute.Sitemap = spots.map((spot) => {
    citySlugs.add(spot.citySlug);
    return {
      url: `${BASE_URL}/rutas/${spot.citySlug}/${spot.slug}`,
      changeFrequency: "monthly",
      priority: 0.7,
    };
  });

  const cityPages: MetadataRoute.Sitemap = [...citySlugs].map((citySlug) => ({
    url: `${BASE_URL}/rutas/${citySlug}`,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticPages, ...cityPages, ...routePages];
}
