import Link from "next/link";
import { getActiveSpotsWithSlugs, groupSpotsByCity } from "@/lib/rutas";

export default async function RutasHubPage() {
  const spots = await getActiveSpotsWithSlugs();
  const cities = groupSpotsByCity(spots);

  return (
    <main className="min-h-screen min-h-dvh bg-[#1B1C1E] px-6 pt-28 pb-24">
      <div className="max-w-4xl mx-auto">
        <p className="text-xs font-semibold text-[#F16823] uppercase tracking-widest mb-3">
          Rutas verificadas
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Dónde correr en Panamá
        </h1>
        <p className="text-[#B8B8B8] leading-relaxed mb-10 max-w-2xl">
          Más de {spots.length} rutas documentadas por Coach JJ en {cities.length} ciudades.
          Elige tu ciudad y encuentra el spot ideal para tu próximo entrenamiento.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {cities.map(({ city, citySlug, count }) => (
            <Link
              key={citySlug}
              href={`/rutas/${citySlug}`}
              className="rounded-xl border border-[#707070]/40 bg-[#2a2b2d] p-5 hover:border-[#F16823]/40 transition-colors group"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-white group-hover:text-[#F16823] transition-colors">
                    {city}
                  </h2>
                  <p className="text-sm text-[#707070] mt-1">
                    {count} {count === 1 ? "ruta" : "rutas"}
                  </p>
                </div>
                <span className="text-[#707070] group-hover:text-[#F16823] transition-colors">→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
