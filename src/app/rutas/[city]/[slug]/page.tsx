import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  findSpotBySlugs,
  getActiveSpotsWithSlugs,
  truncateDescription,
} from "@/lib/rutas";

type PageProps = {
  params: Promise<{ city: string; slug: string }>;
};

export async function generateStaticParams() {
  const spots = await getActiveSpotsWithSlugs();
  return spots.map((spot) => ({
    city: spot.citySlug,
    slug: spot.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city: citySlug, slug } = await params;
  const spots = await getActiveSpotsWithSlugs();
  const spot = findSpotBySlugs(spots, citySlug, slug);

  if (!spot) {
    return {
      title: { absolute: "Ruta no encontrada | RunClub Panamá" },
    };
  }

  const title = `${spot.name} — Correr en ${spot.city} | RunClub Panamá`;
  const description = truncateDescription(spot.description);

  return {
    title: { absolute: title },
    description,
    metadataBase: new URL("https://runclubpty.com"),
    openGraph: {
      title,
      description,
      url: `https://runclubpty.com/rutas/${citySlug}/${slug}`,
      siteName: "RunClub Panamá",
      type: "article",
    },
  };
}

export default async function RutaDetailPage({ params }: PageProps) {
  const { city: citySlug, slug } = await params;
  const spots = await getActiveSpotsWithSlugs();
  const spot = findSpotBySlugs(spots, citySlug, slug);

  if (!spot) {
    notFound();
  }

  return (
    <main className="min-h-screen min-h-dvh bg-[#1B1C1E] px-6 pt-28 pb-24">
      <div className="max-w-3xl mx-auto">
        <Link
          href={`/rutas/${spot.citySlug}`}
          className="inline-block text-sm text-[#707070] hover:text-white transition-colors mb-6"
        >
          ← Rutas en {spot.city}
        </Link>

        <p className="text-xs font-semibold text-[#F16823] uppercase tracking-widest mb-3">
          {spot.city}
          {spot.zone ? ` · ${spot.zone}` : ""}
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-6">{spot.name}</h1>

        <div className="flex flex-wrap gap-2 mb-8">
          {spot.surface && (
            <span className="rounded-full bg-[#F16823]/10 border border-[#F16823]/30 px-3 py-1 text-xs font-medium text-[#F16823]">
              {spot.surface}
            </span>
          )}
          {spot.best_for?.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-[#2a2b2d] border border-[#707070]/40 px-3 py-1 text-xs text-[#B8B8B8]"
            >
              {tag}
            </span>
          ))}
        </div>

        {spot.description && (
          <div className="prose prose-invert max-w-none mb-10">
            <p className="text-[#B8B8B8] leading-relaxed whitespace-pre-line">{spot.description}</p>
          </div>
        )}

        <div className="rounded-2xl border border-[#F16823]/30 bg-[#2a2b2d] p-6 text-center">
          <p className="text-white font-semibold mb-2">
            ¿Quieres entrenar en {spot.name}?
          </p>
          <p className="text-sm text-[#B8B8B8] mb-5">
            Coach JJ incluye rutas como esta en tu plan personalizado según tu objetivo y nivel.
          </p>
          <Link
            href="/register"
            className="inline-block rounded-lg bg-[#F16823] px-6 py-3 text-sm font-medium text-white hover:opacity-90 transition-opacity"
          >
            Empieza gratis — 7 días
          </Link>
        </div>
      </div>
    </main>
  );
}
