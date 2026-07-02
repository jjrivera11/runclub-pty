import type { Metadata } from "next";
import { RutasNav } from "@/components/RutasNav";

export const metadata: Metadata = {
  title: {
    absolute: "Rutas para correr en Panamá | RunClub Panamá",
  },
  description:
    "Explora más de 50 rutas verificadas para correr en Panamá. Ciudad de Panamá, interior, playa y montaña — curadas por Coach JJ para cada tipo de entrenamiento.",
  metadataBase: new URL("https://runclubpty.com"),
  openGraph: {
    title: "Rutas para correr en Panamá | RunClub Panamá",
    description:
      "Más de 50 rutas verificadas en 12 ciudades de Panamá. Road, trail y entrenamientos por objetivo.",
    url: "https://runclubpty.com/rutas",
    siteName: "RunClub Panamá",
    type: "website",
  },
  keywords: [
    "rutas running Panamá",
    "correr en Panamá",
    "Cinta Costera",
    "Parque Omar",
    "trail running Panamá",
    "RunClub Panamá",
  ],
};

export default function RutasLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <RutasNav />
      {children}
    </>
  );
}
