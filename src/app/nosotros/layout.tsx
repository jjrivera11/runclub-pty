import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nosotros — José Javier Rivera G. · RunClub Panamá",
  description: "Conoce al fundador de RunClub Panamá. Ingeniero Electrónico, UX Engineer, corredor de ultra, maratonista, IronMan y coach con 20 años promoviendo el running en Panamá.",
  metadataBase: new URL("https://runclubpty.com"),
  openGraph: {
    title: "Nosotros — José Javier Rivera G. · RunClub Panamá",
    description: "Ingeniero, corredor de ultra, IronMan y coach con 20 años promoviendo el deporte en Panamá. Fundador de RunClub Panamá.",
    url: "https://runclubpty.com/nosotros",
    siteName: "RunClub Panamá",
    type: "profile",
    images: [{ url: "/jj-santiago.jpg", width: 900, height: 1200, alt: "José Javier Rivera y Santiago" }],
  },
  keywords: ["Coach JJ Panamá", "RunClub Panamá", "running Panamá", "IronMan Panamá", "entrenamiento running Panamá"],
};

export default function NosotrosLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
