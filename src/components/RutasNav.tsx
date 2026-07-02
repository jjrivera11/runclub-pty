import Image from "next/image";
import Link from "next/link";

export function RutasNav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-[#1B1C1E]/80 backdrop-blur-sm border-b border-[#707070]/20">
      <Link href="/landing" className="flex items-center gap-2">
        <Image
          src="/logo.svg"
          alt="RunClub Panamá"
          width={32}
          height={32}
          className="h-8 w-auto"
        />
      </Link>
      <div className="flex items-center gap-4">
        <Link href="/rutas" className="text-sm text-[#F16823] hover:text-white transition-colors">
          Rutas
        </Link>
        <Link href="/nosotros" className="text-sm text-[#B8B8B8] hover:text-white transition-colors">
          Nosotros
        </Link>
        <Link href="/login" className="text-sm text-[#B8B8B8] hover:text-white transition-colors">
          Iniciar sesión
        </Link>
        <Link
          href="/register"
          className="rounded-lg bg-[#F16823] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
        >
          Empieza gratis
        </Link>
      </div>
    </nav>
  );
}
