"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

function countUp(el: HTMLElement, target: number, suffix: string, duration: number) {
  let start = 0;
  const step = target / (duration / 16);
  const timer = setInterval(() => {
    start += step;
    if (start >= target) { start = target; clearInterval(timer); }
    if (suffix === "%") el.textContent = Math.round(start) + "%";
    else if (suffix === "$") el.textContent = "$" + Math.round(start);
    else el.textContent = Math.round(start) + "+";
  }, 16);
}

export default function EmpresarialPage() {
  const s1 = useRef<HTMLSpanElement>(null);
  const s2 = useRef<HTMLSpanElement>(null);
  const s3 = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (s1.current) countUp(s1.current, 20, "+", 800);
      if (s2.current) countUp(s2.current, 27, "%", 1000);
      if (s3.current) countUp(s3.current, 15, "$", 600);
    }, 400);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <main className="min-h-screen bg-[#111111] text-white font-sans">
      <div className="max-w-4xl mx-auto">

      {/* Nav */}
      <nav className="flex justify-between items-center px-8 py-5 border-b border-[#2a2b2d]">
        <span className="text-sm font-bold tracking-wide">RunClub Panamá</span>
        <a href="/nosotros" className="text-sm text-[#707070] hover:text-white transition-colors">
          Nosotros
        </a>
        <span className="bg-[#F16823] text-white text-xs font-bold px-3 py-1 rounded">
          Empresarial
        </span>
      </nav>

      {/* Hero */}
      <section className="px-8 py-16 border-b border-[#2a2b2d]">
        <p className="text-xs uppercase tracking-widest text-[#707070] mb-5">
          Programa corporativo de bienestar
        </p>
        <h1 className="text-4xl font-light leading-tight max-w-xl mb-5">
          El equipo que corre junto{" "}
          <strong className="font-bold text-[#F16823]">trabaja mejor junto</strong>
        </h1>
        <p className="text-[#B8B8B8] text-[15px] leading-relaxed max-w-lg mb-8">
          RunClub Empresarial es un programa de running para empresas que entienden
          que un equipo activo es un equipo más comprometido, más presente y más
          productivo.
        </p>
        <a
          href="mailto:empresas@runclubpty.com?subject=Información%20RunClub%20Empresarial"
          className="inline-flex items-center gap-2 bg-[#F16823] hover:bg-[#FF4F26] text-white px-7 py-3.5 rounded-lg text-[15px] font-semibold transition-colors"
        >
          Solicitar información →
        </a>

        {/* Stats */}
        <div className="flex gap-0 mt-12 pt-8 border-t border-[#2a2b2d]">
          <div className="flex-1 pr-8">
            <span ref={s1} className="text-3xl font-bold text-[#F16823]">0+</span>
            <p className="text-xs text-[#707070] mt-1">Empleados mínimo</p>
          </div>
          <div className="flex-1 px-8 border-x border-[#2a2b2d]">
            <span ref={s2} className="text-3xl font-bold text-[#F16823]">0%</span>
            <p className="text-xs text-[#707070] mt-1">Menos ausentismo*</p>
          </div>
          <div className="flex-1 pl-8">
            <span ref={s3} className="text-3xl font-bold text-[#F16823]">$0</span>
            <p className="text-xs text-[#707070] mt-1">Por empleado activo/mes</p>
          </div>
        </div>
      </section>

      {/* Por qué funciona */}
      <section className="px-8 py-12 border-b border-[#2a2b2d]">
        <p className="text-xs uppercase tracking-widest text-[#707070] mb-7">
          Por qué funciona
        </p>
        <div className="flex flex-col divide-y divide-[#1e1f21]">
          {[
            {
              num: "01",
              title: "Reduce el ausentismo",
              text: "Equipos activos reportan hasta 27% menos días perdidos por salud. El movimiento diario impacta directamente en energía y asistencia.",
            },
            {
              num: "02",
              title: "Fortalece la cultura",
              text: "Entrenar juntos crea conexiones fuera del contexto laboral. El equipo que corre junto trabaja mejor junto.",
            },
            {
              num: "03",
              title: "Beneficio diferenciador",
              text: "En un mercado competitivo por talento, un programa estructurado con resultados medibles marca la diferencia al reclutar y retener.",
            },
          ].map((item) => (
            <div key={item.num} className="flex gap-5 items-start py-6">
              <span className="text-xs font-bold text-[#F16823] min-w-[24px] pt-0.5">
                {item.num}
              </span>
              <div>
                <p className="text-[15px] font-medium text-white mb-1">{item.title}</p>
                <p className="text-sm text-[#A3A3A3] leading-relaxed">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Qué incluye */}
      <section className="px-8 py-12 border-b border-[#2a2b2d]">
        <p className="text-xs uppercase tracking-widest text-[#707070] mb-7">
          Lo que incluye
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              title: "Planes personalizados",
              desc: "Cada empleado recibe su plan adaptado a su nivel, tiempo y objetivos.",
            },
            {
              title: "Reportes para RRHH",
              desc: "Dashboard de asistencia, adherencia y progreso por empleado y departamento.",
            },
            {
              title: "Comunidad de equipo",
              desc: "Grupos por sede, retos internos y participación en carreras locales.",
            },
            {
              title: "Coaching personalizado",
              desc: "Tecnología de IA que actúa como coach individual para cada empleado, 24 horas.",
            },
          ].map((item) => (
            <div key={item.title} className="bg-[#1B1C1E] border border-[#2a2b2d] rounded-xl p-5">
              <div className="w-8 h-8 bg-[#AF3F07]/20 rounded-lg flex items-center justify-center mb-3">
                <span className="text-[#F16823] text-sm">▸</span>
              </div>
              <p className="text-sm font-semibold text-white mb-1.5">{item.title}</p>
              <p className="text-xs text-[#A3A3A3] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="px-8 py-12 border-b border-[#2a2b2d]">
        <p className="text-xs uppercase tracking-widest text-[#707070] mb-7">
          Inversión
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-lg">
          <div className="bg-[#1B1C1E] border border-[#2a2b2d] rounded-xl p-6">
            <p className="text-xs text-[#707070] mb-1.5">Desde</p>
            <p className="text-3xl font-bold text-white">
              $15{" "}
              <span className="text-sm font-normal text-[#A3A3A3]">/empleado activo</span>
            </p>
            <p className="text-xs text-[#707070] mt-2">Mínimo 20 empleados</p>
          </div>
          <div className="bg-[#1B1C1E] border border-[#F16823] rounded-xl p-6 relative">
            <span className="absolute -top-px right-4 bg-[#F16823] text-white text-[10px] font-bold px-2.5 py-1 rounded-b-md tracking-wider">
              EJEMPLO
            </span>
            <p className="text-xs text-[#707070] mb-1.5">50 empleados</p>
            <p className="text-3xl font-bold text-white">
              $750{" "}
              <span className="text-sm font-normal text-[#A3A3A3]">/mes</span>
            </p>
            <p className="text-xs text-[#707070] mt-2">Acceso completo para todo el equipo</p>
          </div>
        </div>
        <p className="text-[11px] text-[#404040] mt-4">
          * Dato referencial basado en estudios de programas de bienestar corporativo.
        </p>
      </section>

      {/* CTA */}
      <section className="px-8 py-16 text-center border-b border-[#2a2b2d]">
        <p className="text-xl font-medium text-white mb-2">
          ¿Le interesa para su empresa?
        </p>
        <p className="text-sm text-[#A3A3A3] mb-7">
          Escríbanos y coordinamos una conversación de 20 minutos. Sin compromiso.
        </p>
        <a
          href="mailto:empresas@runclubpty.com?subject=Información%20RunClub%20Empresarial"
          className="inline-flex items-center gap-2 bg-[#F16823] hover:bg-[#FF4F26] text-white px-7 py-3.5 rounded-lg text-[15px] font-semibold transition-colors"
        >
          Solicitar información →
        </a>
      </section>

      {/* Link RRHH */}
      <section className="px-8 py-8 text-center">
        <p className="text-xs text-[#707070]">
          ¿Es usted parte del equipo de Gestión Humana?{" "}
          <Link
            href="/empresarial/features"
            className="text-[#F16823] hover:underline"
          >
            Ver funcionalidades detalladas →
          </Link>
        </p>
      </section>

      {/* Footer */}
      <footer className="px-8 py-5 border-t border-[#2a2b2d] text-center">
        <p className="text-xs text-[#404040]">
          RunClub Panamá · runclubpty.com/empresarial · empresas@runclubpty.com
        </p>
      </footer>

      </div>
    </main>
  );
}
