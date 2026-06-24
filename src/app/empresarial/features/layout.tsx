import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Funcionalidades — RunClub Empresarial Panamá",
  description: "Dashboard de RRHH, reportes de asistencia, planes personalizados por IA, gamificación y eventos internos. Todo lo que incluye el programa RunClub Empresarial.",
  metadataBase: new URL("https://runclubpty.com"),
  openGraph: {
    title: "Funcionalidades — RunClub Empresarial Panamá",
    description: "Dashboard de RRHH, reportes de asistencia, planes personalizados por IA, gamificación y eventos internos.",
    url: "https://runclubpty.com/empresarial/features",
    siteName: "RunClub Panamá",
    type: "website",
  },
};

export default function FeaturesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
