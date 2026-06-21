import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "RunClub Panamá — Entrena más inteligente con Coach JJ",
    template: "%s | RunClub Panamá",
  },
  description: "Tu plan de entrenamiento personalizado con IA. Rutas locales de Panamá, adaptación continua y una comunidad que entrena contigo.",
  metadataBase: new URL("https://runclubpty.com"),
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "RunClub Panamá — Entrena más inteligente con Coach JJ",
    description: "Tu plan de entrenamiento personalizado con IA. Rutas locales de Panamá, adaptación continua y una comunidad que entrena contigo.",
    url: "https://runclubpty.com",
    siteName: "RunClub Panamá",
    locale: "es_PA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RunClub Panamá — Entrena más inteligente con Coach JJ",
    description: "Tu plan de entrenamiento personalizado con IA. Rutas locales de Panamá, adaptación continua y una comunidad que entrena contigo.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
