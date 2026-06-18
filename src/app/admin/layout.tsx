"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/usuarios", label: "Usuarios" },
  { href: "/admin/carreras", label: "Carreras" },
  { href: "/admin/banners", label: "Banners" },
  { href: "/admin/promos", label: "Promos" },
  { href: "/admin/pagos", label: "Pagos" },
  { href: "/admin/spots", label: "Spots" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="flex min-h-screen" style={{ background: "#1B1C1E" }}>
      <aside className="w-56 shrink-0 border-r border-[#707070] p-6 flex flex-col gap-1">
        <p className="text-xs font-semibold text-[#B8B8B8] uppercase tracking-widest mb-4">Admin</p>
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              pathname === item.href
                ? "bg-[#F16823] text-white"
                : "text-[#B8B8B8] hover:text-white hover:bg-[#2a2b2d]"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </aside>
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
