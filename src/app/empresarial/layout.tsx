import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "RunClub Empresarial — Programa de Running Corporativo en Panamá",
  description: "Programa de bienestar corporativo para empresas en Panamá. Planes de entrenamiento personalizados por IA, reportes para RRHH y comunidad de equipo. Desde $15 por empleado activo.",
  metadataBase: new URL("https://runclubpty.com"),
  openGraph: {
    title: "RunClub Empresarial — Programa de Running Corporativo en Panamá",
    description: "Programa de bienestar corporativo para empresas en Panamá. Planes personalizados, reportes de RRHH y comunidad de equipo.",
    url: "https://runclubpty.com/empresarial",
    siteName: "RunClub Panamá",
    type: "website",
  },
  keywords: ["running corporativo Panamá", "bienestar empresarial Panamá", "programa running empresa", "beneficios empleados Panamá", "RunClub Empresarial"],
};

export default function EmpresarialLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
