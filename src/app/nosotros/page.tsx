"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

function FadeInSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

const TIMELINE = [
  {
    year: "2008",
    title: "Co-Fundador de Trois",
    desc: "Parte del equipo fundador de Trois, uno de los primeros colectivos de running organizado en Panamá.",
  },
  {
    year: "2010",
    title: "IronMan 70.3 Miami & Iron Panama",
    desc: "Finisher en dos de las pruebas de triatlón más exigentes de la región.",
  },
  {
    year: "2011",
    title: "TR3MAX · Revista & Carreras",
    desc: "Fundador de TR3MAX — incluyendo una revista impresa dedicada al running y la organización de carreras locales en Panamá.",
  },
  {
    year: "2012",
    title: "Grupo Piazza · Saucony, Brooks & New Balance",
    desc: "Creador y organizador del Saucony Challenge, Brooks Happy Races y la carrera 15K para New Balance — eventos que marcaron la escena del running panameño.",
  },
  {
    year: "2014",
    title: "Fundación RunClub · Grupo Femenino",
    desc: "Coach de uno de los primeros grupos aficionados de running femenino en Panamá, operando desde 2014.",
  },
  {
    year: "2026",
    title: "RunClub Panamá — IA + Running",
    desc: "La evolución natural: tecnología de inteligencia artificial al servicio del corredor panameño. Planes personalizados, rutas locales y coaching accesible para todos.",
  },
];

export default function NosotrosPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#1B1C1E] overflow-x-hidden">

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-[#1B1C1E]/80 backdrop-blur-sm border-b border-[#707070]/20">
        <button onClick={() => router.push("/landing")} className="flex items-center gap-2">
          <img src="/logo.svg" alt="RunClub Panamá" className="h-8" />
        </button>
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/login")} className="text-sm text-[#B8B8B8] hover:text-white transition-colors">
            Iniciar sesión
          </button>
          <button onClick={() => router.push("/register")} className="rounded-lg bg-[#F16823] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity">
            Empieza gratis
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 pt-28 pb-24">

        {/* Hero */}
        <FadeInSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 items-center mb-20">
            <div className="rounded-2xl overflow-hidden aspect-[3/4] relative">
              <Image
                src="/jj-santiago.jpg"
                alt="José Javier Rivera y Santiago"
                fill
                className="object-cover object-top"
              />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-[#F16823] mb-3">Fundador</p>
              <h1 className="text-4xl font-light text-white leading-tight mb-2">
                José Javier<br /><strong className="font-bold">Rivera G.</strong>
              </h1>
              <p className="text-sm text-[#707070] mb-6">Ingeniero Electrónico · UX Engineer · Coach</p>
              <p className="text-[15px] text-[#B8B8B8] leading-relaxed mb-6">
                Corredor de ultra, maratonista, IronMan y padre. Llevo 20 años promoviendo el deporte y la vida sana en Panamá — y ahora con inteligencia artificial, quiero llevar esa misión a todo el país.
              </p>
              <div className="flex flex-wrap gap-2">
                {["🏅 IronMan 70.3 Miami 2010", "🏅 Iron Panama", "🏃 Ultra Runner", "🇵🇦 Coach desde 2014"].map((b) => (
                  <span key={b} className="bg-[#2a2b2d] border border-[#707070]/40 rounded-lg px-3 py-1.5 text-xs text-[#B8B8B8]">{b}</span>
                ))}
              </div>
            </div>
          </div>
        </FadeInSection>

        {/* Quote */}
        <FadeInSection delay={0.1}>
          <div className="border-l-4 border-[#F16823] bg-[#2a2b2d] rounded-xl px-7 py-6 mb-20">
            <p className="text-[15px] text-white leading-relaxed italic mb-4">
              "Desde mis inicios mi filosofía siempre ha sido la de dar exposición a la vida sana y deportiva. 20 años después sigo en la misma idea — y gracias a la IA, ahora puedo ayudar a más personas a nivel nacional a tener acceso a una guía para alcanzar una meta y un mejor estilo de vida."
            </p>
            <p className="text-xs text-[#707070]">— José Javier Rivera G., Fundador de RunClub Panamá</p>
          </div>
        </FadeInSection>

        {/* Timeline */}
        <FadeInSection delay={0.1}>
          <p className="text-xs uppercase tracking-widest text-[#707070] mb-8">Trayectoria</p>
          <div className="flex flex-col">
            {TIMELINE.map((item, i) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex gap-6 py-5 border-b border-[#2a2b2d] last:border-0"
              >
                <span className="text-xs font-bold text-[#F16823] min-w-[44px] pt-0.5">{item.year}</span>
                <div>
                  <p className="text-sm font-semibold text-white mb-1">{item.title}</p>
                  <p className="text-sm text-[#707070] leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </FadeInSection>

        {/* CTA */}
        <FadeInSection delay={0.2}>
          <div className="mt-20 text-center">
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(241,104,35,0.08) 0%, transparent 70%)" }} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">¿Listo para entrenar con Coach JJ?</h2>
            <p className="text-[#B8B8B8] mb-8">7 días gratis. Sin tarjeta. Sin excusas.</p>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(241,104,35,0.4)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/register")}
              className="rounded-xl bg-[#F16823] px-10 py-4 text-base font-semibold text-white hover:opacity-90 transition-opacity"
            >
              Crear mi cuenta gratis
            </motion.button>
          </div>
        </FadeInSection>

      </div>

      {/* Footer */}
      <footer className="border-t border-[#707070]/20 px-6 py-8 text-center">
        <p className="text-xs text-[#B8B8B8]/30">© 2026 RunClub Panamá · runclubpty.com</p>
      </footer>

    </main>
  );
}
