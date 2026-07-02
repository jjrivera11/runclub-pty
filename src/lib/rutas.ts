import { createServiceClient } from "@/lib/supabase/server";
import type { TrainingSpot, TrainingSpotWithSlugs } from "@/types/training-spot";

export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function truncateDescription(text: string, max = 155): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1).trimEnd()}…`;
}

export async function getActiveSpots(): Promise<TrainingSpot[]> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("training_spots")
    .select("id, name, city, zone, surface, description, best_for, is_active")
    .eq("is_active", true)
    .order("city")
    .order("name");

  return (data ?? []) as TrainingSpot[];
}

export function assignSlugs(spots: TrainingSpot[]): TrainingSpotWithSlugs[] {
  const byCity = new Map<string, TrainingSpot[]>();

  for (const spot of spots) {
    const list = byCity.get(spot.city) ?? [];
    list.push(spot);
    byCity.set(spot.city, list);
  }

  const result: TrainingSpotWithSlugs[] = [];

  for (const [city, citySpots] of [...byCity.entries()].sort(([a], [b]) =>
    a.localeCompare(b, "es")
  )) {
    const citySlug = slugify(city);
    const slugCounts = new Map<string, number>();

    for (const spot of citySpots.sort((a, b) => a.name.localeCompare(b.name, "es"))) {
      const base = slugify(spot.name);
      const count = slugCounts.get(base) ?? 0;
      slugCounts.set(base, count + 1);
      const slug = count === 0 ? base : `${base}-${count + 1}`;

      result.push({ ...spot, slug, citySlug });
    }
  }

  return result;
}

export async function getActiveSpotsWithSlugs(): Promise<TrainingSpotWithSlugs[]> {
  return assignSlugs(await getActiveSpots());
}

export function groupSpotsByCity(spots: TrainingSpotWithSlugs[]) {
  const map = new Map<string, TrainingSpotWithSlugs[]>();

  for (const spot of spots) {
    const list = map.get(spot.citySlug) ?? [];
    list.push(spot);
    map.set(spot.citySlug, list);
  }

  return [...map.entries()]
    .sort(([a], [b]) => {
      const cityA = map.get(a)?.[0]?.city ?? a;
      const cityB = map.get(b)?.[0]?.city ?? b;
      return cityA.localeCompare(cityB, "es");
    })
    .map(([citySlug, citySpots]) => ({
      city: citySpots[0].city,
      citySlug,
      count: citySpots.length,
      spots: citySpots,
    }));
}

export function findSpotBySlugs(
  spots: TrainingSpotWithSlugs[],
  citySlug: string,
  slug: string
): TrainingSpotWithSlugs | null {
  return spots.find((spot) => spot.citySlug === citySlug && spot.slug === slug) ?? null;
}

export function findCityBySlug(
  spots: TrainingSpotWithSlugs[],
  citySlug: string
): { city: string; citySlug: string; spots: TrainingSpotWithSlugs[] } | null {
  const citySpots = spots.filter((spot) => spot.citySlug === citySlug);
  if (citySpots.length === 0) return null;

  return {
    city: citySpots[0].city,
    citySlug,
    spots: citySpots,
  };
}
