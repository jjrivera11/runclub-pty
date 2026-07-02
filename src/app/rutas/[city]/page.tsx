import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  findCityBySlug,
  getActiveSpotsWithSlugs,
  truncateDescription,
} from "@/lib/rutas";

type PageProps = {
  params: Promise<{ city: string }>;
};

export async function generateStaticParams() {
  const spots = await getActiveSpotsWithSlugs();
  const citySlugs = [...new Set(spots.map((spot) => spot.citySlug))];
  return citySlugs.map((city) => ({ city }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city: citySlug } = await params;
  const spots = await getActiveSpotsWithSlugs();
  const cityData = findCityBySlug(spots, citySlug);

  if (!cityData) {
    return {
      title: { absolute: "Ciudad no encontrada | RunClub Panamá" },
    };
  }

  const title = `Mejores rutas para correr en ${cityData.city}, Panamá | RunClub Panamá`;
  const description = `${cityData.spots.length} rutas verificadas para correr en ${cityData.city}. Road, trail y entrenamientos por objetivo — curadas por Coach JJ.`;

  return {
    title: { absolute: title },
    description,
    metadataBase: new URL("https://runclubpty.com"),
    openGraph: {
      title,
      description,
      url: `https://runclubpty.com/rutas/${citySlug}`,
      siteName: "RunClub Panamá",
      type: "website",
    },
  };
}

export default async function RutasCityPage({ params }: PageProps) {
  const { city: citySlug } = await params;
  const spots = await getActiveSpotsWithSlugs();
  const cityData = findCityBySlug(spots, citySlug);

  if (!cityData) {
    notFound();
  }

  return (
    <main className="min-h-screen min-h-dvh bg-[#1B1C1E] px-6 pt-28 pb-24">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/rutas"
          className="inline-block text-sm text-[#707070] hover:text-white transition-colors mb-6"
        >
          ← Todas las ciudades
        </Link>

        <p className="text-xs font-semibold text-[#F16823] uppercase tracking-widest mb-3">
          {cityData.city}
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Rutas para correr en {cityData.city}
        </h1>
        <p className="text-[#B8B8B8] leading-relaxed mb-10">
          {cityData.spots.length} rutas activas documentadas por Coach JJ en {cityData.city}.
        </p>

        <div className="flex flex-col gap-3">
          {cityData.spots.map((spot) => (
            <Link
              key={spot.id}
              href={`/rutas/${spot.citySlug}/${spot.slug}`}
              className="rounded-xl border border-[#707070]/40 bg-[#2a2b2d] p-5 hover:border-[#F16823]/40 transition-colors group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h2 className="text-base font-semibold text-white group-hover:text-[#F16823] transition-colors">
                    {spot.name}
                  </h2>
                  {spot.description && (
                    <p className="text-sm text-[#707070] mt-1 line-clamp-2">
                      {truncateDescription(spot.description, 120)}
                    </p>
                  )}
                  {spot.best_for?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {spot.best_for.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-[#1B1C1E] border border-[#707070]/40 px-2.5 py-0.5 text-xs text-[#B8B8B8]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-[#707070] group-hover:text-[#F16823] transition-colors shrink-0">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
