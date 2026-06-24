"use client";
import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useRouter } from "next/navigation";
import { CoachJJChat } from "@/components/CoachJJChat";

const TYPEWRITER_TEXTS = [
  "Corre más rápido.",
  "Entrena más inteligente.",
  "Conoce tus rutas.",
  "Alcanza tu meta.",
];

const FLOATING_ELEMENTS = [
  { text: "5K", x: "8%", y: "20%", size: "text-6xl", delay: 0 },
  { text: "10K", x: "85%", y: "15%", size: "text-5xl", delay: 0.3 },
  { text: "21K", x: "90%", y: "65%", size: "text-4xl", delay: 0.6 },
  { text: "42K", x: "5%", y: "70%", size: "text-3xl", delay: 0.9 },
  { text: "🏃", x: "75%", y: "35%", size: "text-5xl", delay: 0.4 },
  { text: "📍", x: "15%", y: "45%", size: "text-3xl", delay: 0.7 },
  { text: "⚡", x: "50%", y: "10%", size: "text-4xl", delay: 0.2 },
  { text: "🌴", x: "30%", y: "80%", size: "text-3xl", delay: 1.0 },
];

function TypewriterText() {
  const [index, setIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = TYPEWRITER_TEXTS[index];
    if (!deleting && displayed.length < current.length) {
      const t = setTimeout(() => setDisplayed(current.slice(0, displayed.length + 1)), 60);
      return () => clearTimeout(t);
    }
    if (!deleting && displayed.length === current.length) {
      const t = setTimeout(() => setDeleting(true), 1800);
      return () => clearTimeout(t);
    }
    if (deleting && displayed.length > 0) {
      const t = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 30);
      return () => clearTimeout(t);
    }
    if (deleting && displayed.length === 0) {
      setDeleting(false);
      setIndex((i) => (i + 1) % TYPEWRITER_TEXTS.length);
    }
  }, [displayed, deleting, index]);

  return (
    <span className="text-[#F16823]">
      {displayed}
      <span className="animate-pulse">|</span>
    </span>
  );
}

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

const BENEFITS = [
  { icon: "🤖", title: "Plan generado por IA", desc: "Coach JJ analiza tu nivel, objetivo y disponibilidad para crear un plan único para ti." },
  { icon: "🗺️", title: "+56 rutas en todo Panamá", desc: "Desde la Cinta Costera hasta el Cerro Tute en Santa Fe. Coach JJ conoce tu ciudad." },
  { icon: "🏔️", title: "Road y Trail", desc: "Entrena para carreras de asfalto o aventúrate al trail running. Coach JJ adapta tu plan al terreno." },
  { icon: "📈", title: "Adaptación continua", desc: "El plan evoluciona con tu rendimiento. Cada bloque mejora con tus datos reales." },
  { icon: "🏁", title: "Carreras de práctica", desc: "Agrega carreras locales a tu plan. Coach JJ ajusta el tapering y la carga automáticamente." },
];

const LEADERBOARD_PREVIEW = [
  { pos: 1, name: "Valeria Ríos", pts: 580, arrow: "↑" },
  { pos: 2, name: "Rodrigo Fábrega", pts: 510, arrow: "↑" },
  { pos: 3, name: "Sofía Martínez", pts: 480, arrow: "↓" },
  { pos: 4, name: "Tú", pts: 420, arrow: "↑", isMe: true },
  { pos: 5, name: "Andrés Solís", pts: 390, arrow: "↓" },
];

const STEPS = [
  { n: "01", title: "Cuéntale a Coach JJ", desc: "Completa el onboarding en 3 minutos. Tu objetivo, nivel y disponibilidad." },
  { n: "02", title: "Recibe tu plan", desc: "Coach JJ genera tu plan personalizado al instante. Semana por semana." },
  { n: "03", title: "Entrena y evoluciona", desc: "Registra tus marcas cada semana. El plan se ajusta automáticamente." },
];

export default function LandingPage() {
  const router = useRouter();
  const [showChat, setShowChat] = useState(false);

  return (
    <main className="min-h-screen bg-[#1B1C1E] overflow-x-hidden">
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-[#1B1C1E]/80 backdrop-blur-sm border-b border-[#707070]/20">
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="RunClub Panamá" className="h-8" />
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/nosotros")} className="text-sm text-[#B8B8B8] hover:text-white transition-colors">
            Nosotros
          </button>
          <button onClick={() => router.push("/login")} className="text-sm text-[#B8B8B8] hover:text-white transition-colors">
            Iniciar sesión
          </button>
          <button onClick={() => router.push("/register")} className="rounded-lg bg-[#F16823] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity">
            Empieza gratis
          </button>
        </div>
      </nav>

      <section className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-20 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none select-none">
          {FLOATING_ELEMENTS.map((el, i) => (
            <motion.div
              key={i}
              className={"absolute font-black text-white/5 " + el.size}
              style={{ left: el.x, top: el.y }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{
                opacity: [0, 0.08, 0.05, 0.08],
                scale: [0.5, 1, 0.95, 1],
                y: [0, -12, 0, -8, 0],
              }}
              transition={{
                delay: el.delay,
                duration: 6,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut",
              }}
            >
              {el.text}
            </motion.div>
          ))}
          <motion.div
            className="absolute inset-0"
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            style={{
              background: "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(241,104,35,0.06) 0%, transparent 70%)",
            }}
          />
        </div>

        <div className="relative z-10 max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mb-8"
          >
            <img src="/logo.svg" alt="RunClub Panamá" className="h-20 sm:h-28 mx-auto" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-4"
          >
            <div className="flex items-center justify-center mb-2">
              <span className="text-4xl sm:text-6xl font-black leading-tight">
                <TypewriterText />
              </span>
            </div>
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-2xl sm:text-3xl font-bold text-white/70 leading-tight mt-6 tracking-wide"
            >
              Con Coach JJ en Panamá.
            </motion.h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-[#B8B8B8] text-base sm:text-lg max-w-md mx-auto mb-10 leading-relaxed"
          >
            Tu plan de entrenamiento personalizado con IA. Rutas locales de Panamá, adaptación continua y una comunidad que entrena contigo.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(241,104,35,0.4)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/register")}
              className="rounded-xl bg-[#F16823] px-8 py-4 text-base font-semibold text-white hover:opacity-90 transition-opacity w-full sm:w-auto"
            >
              Empieza gratis — 7 días
            </motion.button>
            <button
              onClick={() => router.push("/login")}
              className="text-sm text-[#B8B8B8] hover:text-white transition-colors"
            >
              Ya tengo cuenta →
            </button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-5 text-xs text-[#B8B8B8]/50"
          >
            Sin tarjeta de crédito · Cancela cuando quieras
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
            className="text-[#B8B8B8]/30 text-2xl"
          >
            ↓
          </motion.div>
        </motion.div>
      </section>

      <section className="px-6 py-24 max-w-5xl mx-auto">
        <FadeInSection>
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-4">
            Todo lo que necesitas para correr mejor en Panamá
          </h2>
          <p className="text-[#B8B8B8] text-center mb-12 max-w-lg mx-auto">
            No es una app genérica. Es un coach que conoce tus rutas.
          </p>
        </FadeInSection>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {BENEFITS.map((b, i) => (
            <FadeInSection key={i} delay={i * 0.15}>
              <motion.div
                whileHover={{ y: -4, borderColor: "rgba(241,104,35,0.4)" }}
                transition={{ duration: 0.2 }}
                className="rounded-2xl border border-[#707070]/40 bg-[#2a2b2d] p-6 space-y-3 h-full cursor-default"
              >
                <span className="text-4xl">{b.icon}</span>
                <h3 className="text-base font-semibold text-white">{b.title}</h3>
                <p className="text-sm text-[#B8B8B8] leading-relaxed">{b.desc}</p>
              </motion.div>
            </FadeInSection>
          ))}
        </div>
      </section>

      {/* Gamificación */}
      <section className="px-6 py-24 bg-[#2a2b2d]">
        <div className="max-w-5xl mx-auto">
          <FadeInSection>
            <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-4">
              Entrena, compite y sube en el ranking
            </h2>
            <p className="text-[#B8B8B8] text-center mb-12 max-w-lg mx-auto">
              Cada sesión completada, cada semana cerrada y cada racha mantenida te da puntos. Compite con runners de Panamá y sube posiciones.
            </p>
          </FadeInSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-center max-w-3xl mx-auto">

            {/* Leaderboard preview */}
            <FadeInSection delay={0.1}>
              <div className="rounded-2xl border border-[#707070]/40 bg-[#1B1C1E] p-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs uppercase tracking-widest text-[#707070]">Runner Pro · Ranking</span>
                </div>
                <div className="flex flex-col gap-1">
                  {LEADERBOARD_PREVIEW.map((row) => (
                    <div
                      key={row.pos}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg ${row.isMe ? "bg-[#F16823]/10 border border-[#F16823]/20" : ""}`}
                    >
                      <span className={`text-sm font-bold min-w-[20px] ${row.isMe ? "text-[#F16823]" : "text-[#707070]"}`}>
                        {row.pos}
                      </span>
                      <span className={`text-sm flex-1 ${row.isMe ? "text-white font-bold" : "text-[#B8B8B8]"}`}>
                        {row.name}
                      </span>
                      <span className={`text-xs ${row.isMe ? "text-[#F16823]" : "text-[#707070]"}`}>
                        {row.pts} pts
                      </span>
                      <span style={{ color: row.arrow === "↑" ? "#10B981" : "#ef4444", fontSize: "11px" }}>
                        {row.arrow}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeInSection>

            {/* Puntos */}
            <FadeInSection delay={0.2}>
              <div className="flex flex-col gap-4">
                {[
                  { icon: "✅", label: "Día completado", pts: "+10 pts" },
                  { icon: "🏅", label: "Semana 100% cerrada", pts: "+50 pts" },
                  { icon: "🔥", label: "Racha de 7 días", pts: "+30 pts" },
                  { icon: "👥", label: "Amigo referido", pts: "+75 pts" },
                  { icon: "📲", label: "Compartir tu logro", pts: "+20 pts" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-sm text-[#B8B8B8] flex-1">{item.label}</span>
                    <span className="text-sm font-bold text-[#F16823]">{item.pts}</span>
                  </div>
                ))}
              </div>
            </FadeInSection>

          </div>
        </div>
      </section>

      <section className="px-6 py-24 max-w-5xl mx-auto">
        <FadeInSection>
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-2">
            ¿Por qué no usar ChatGPT?
          </h2>
          <p className="text-[#B8B8B8] text-center mb-12 max-w-lg mx-auto">
            ChatGPT sabe de todo. Coach JJ sabe de ti.
          </p>
        </FadeInSection>
        <FadeInSection delay={0.1}>
          <div className="overflow-x-auto rounded-2xl border border-[#707070]/40">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#707070]/40 bg-[#2a2b2d]">
                  <th className="px-6 py-4 text-left text-[#B8B8B8] font-medium w-1/3"></th>
                  <th className="px-6 py-4 text-center text-[#B8B8B8] font-medium w-1/3">ChatGPT</th>
                  <th className="px-6 py-4 text-center text-[#F16823] font-semibold w-1/3">Coach JJ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#707070]/20">
                {[
                  { icon: "🗺️", label: "Rutas", chatgpt: "Rutas genéricas de cualquier ciudad", jj: "Cinta Costera, Parque Omar, Causeway" },
                  { icon: "🧠", label: "Memoria", chatgpt: "Olvida todo en cada conversación", jj: "Recuerda tu progreso semana a semana" },
                  { icon: "📅", label: "Plan", chatgpt: "Te da un plan si se lo pides bien", jj: "Tu plan listo al instante, adaptado a tu carrera" },
                  { icon: "📈", label: "Adaptación", chatgpt: "No sabe si entrenaste o no", jj: "Ajusta tu plan según tus marcas reales" },
                  { icon: "🇵🇦", label: "Contexto", chatgpt: "No sabe que en Panamá llueve a las 3pm", jj: "Diseñado para el clima y carreras locales" },
                ].map((row, i) => (
                  <tr key={i} className="bg-[#1B1C1E] hover:bg-[#2a2b2d]/50 transition-colors">
                    <td className="px-6 py-4 text-white font-medium">
                      <span className="mr-2">{row.icon}</span>{row.label}
                    </td>
                    <td className="px-6 py-4 text-center text-[#B8B8B8]">{row.chatgpt}</td>
                    <td className="px-6 py-4 text-center text-white font-medium">
                      <span className="text-[#F16823] mr-1">✓</span>{row.jj}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </FadeInSection>
        <FadeInSection delay={0.2}>
          <p className="text-center text-[#B8B8B8] mt-8 text-sm italic">
            "ChatGPT es una herramienta increíble. Pero no es tu coach. Coach JJ sí lo es."
          </p>
        </FadeInSection>
      </section>

      <section className="px-6 py-24 bg-[#2a2b2d]">
        <div className="max-w-3xl mx-auto">
          <FadeInSection>
            <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-16">
              Tres pasos para empezar
            </h2>
          </FadeInSection>
          <div className="space-y-14">
            {STEPS.map((s, i) => (
              <FadeInSection key={i} delay={i * 0.2}>
                <div className="flex items-start gap-6">
                  <motion.span
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="text-6xl sm:text-8xl font-black text-[#F16823]/15 leading-none shrink-0 tabular-nums"
                  >
                    {s.n}
                  </motion.span>
                  <div className="pt-2">
                    <h3 className="text-lg font-semibold text-white mb-2">{s.title}</h3>
                    <p className="text-[#B8B8B8] leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-24 max-w-4xl mx-auto">
        <FadeInSection>
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-4">
            Planes simples, sin sorpresas
          </h2>
          <p className="text-[#B8B8B8] text-center mb-12 max-w-lg mx-auto">
            7 días gratis. Después elige el plan que va con tu objetivo.
          </p>
        </FadeInSection>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <FadeInSection delay={0.1}>
            <div className="relative rounded-2xl border-2 border-[#F16823] bg-[#2a2b2d] p-6 flex flex-col">
              <span className="absolute -top-3 left-4 rounded-full bg-[#F16823] px-3 py-0.5 text-xs font-medium text-white">
                Más popular
              </span>
              <h3 className="text-lg font-bold text-white mt-2">Runner Pro</h3>
              <p className="text-sm text-[#B8B8B8] mt-1 mb-4">Para corredores que quieren terminar o mejorar su tiempo en carrera</p>
              <p className="text-4xl font-black text-white mb-6">
                $12<span className="text-lg font-normal text-[#B8B8B8]">/mes</span>
              </p>
              <ul className="space-y-2 text-sm text-[#B8B8B8] mb-8">
                <li className="flex items-center gap-2"><span className="text-[#F16823]">✓</span> Plan personalizado con IA</li>
                <li className="flex items-center gap-2"><span className="text-[#F16823]">✓</span> Rutas locales de Panamá</li>
                <li className="flex items-center gap-2"><span className="text-[#F16823]">✓</span> Adaptación continua</li>
                <li className="flex items-center gap-2"><span className="text-[#F16823]">✓</span> Seguimiento semanal</li>
              </ul>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => router.push("/register")}
                className="mt-auto w-full rounded-xl bg-[#F16823] py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
              >
                Empezar gratis
              </motion.button>
            </div>
          </FadeInSection>
          <FadeInSection delay={0.2}>
            <div className="rounded-2xl border border-[#707070]/40 bg-[#2a2b2d] p-6 flex flex-col">
              <h3 className="text-lg font-bold text-white mt-2">Transformación</h3>
              <p className="text-sm text-[#B8B8B8] mt-1 mb-4">Para quienes buscan bajar de peso combinando cardio y fuerza</p>
              <p className="text-4xl font-black text-white mb-6">
                $18<span className="text-lg font-normal text-[#B8B8B8]">/mes</span>
              </p>
              <ul className="space-y-2 text-sm text-[#B8B8B8] mb-8">
                <li className="flex items-center gap-2"><span className="text-[#F16823]">✓</span> Plan combinado running y pesas</li>
                <li className="flex items-center gap-2"><span className="text-[#F16823]">✓</span> Rutinas para gym o casa</li>
                <li className="flex items-center gap-2"><span className="text-[#F16823]">✓</span> Progresión de carga calculada</li>
                <li className="flex items-center gap-2"><span className="text-[#F16823]">✓</span> Seguimiento semanal</li>
              </ul>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => router.push("/register")}
                className="mt-auto w-full rounded-xl border border-[#F16823] py-3 text-sm font-semibold text-[#F16823] hover:bg-[#F16823]/10 transition-colors"
              >
                Empezar gratis
              </motion.button>
            </div>
          </FadeInSection>
        </div>
        <FadeInSection delay={0.3}>
          <p className="text-center text-xs text-[#B8B8B8]/50 mt-8">
            Sin tarjeta de crédito · Cancela cuando quieras · Pago por transferencia bancaria o tarjeta
          </p>
        </FadeInSection>
      </section>

      <section className="relative px-6 py-32 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(241,104,35,0.08) 0%, transparent 70%)" }} />
        <FadeInSection>
          <div className="relative z-10 max-w-lg mx-auto space-y-6">
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              ¿Listo para correr con Coach JJ?
            </h2>
            <p className="text-[#B8B8B8] text-lg">
              7 días gratis. Sin tarjeta. Sin excusas.
            </p>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(241,104,35,0.4)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/register")}
              className="rounded-xl bg-[#F16823] px-10 py-4 text-base font-semibold text-white hover:opacity-90 transition-opacity"
            >
              Crear mi cuenta gratis
            </motion.button>
            <p className="text-xs text-[#B8B8B8]/50">
              Cancela cuando quieras · Acceso completo por 7 días
            </p>
          </div>
        </FadeInSection>
      </section>

      <footer className="border-t border-[#707070]/20 px-6 py-8 text-center">
        <p className="text-xs text-[#B8B8B8]/30">
          © 2026 RunClub Panamá · runclubpty.com
        </p>
      </footer>

      {showChat && <CoachJJChat onClose={() => setShowChat(false)} />}

      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowChat(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-[#F16823] px-5 py-3 text-white font-semibold text-sm shadow-lg hover:opacity-90 transition-opacity"
      >
        <span>💬</span>
        <span>Habla con Coach JJ</span>
      </motion.button>
    </main>
  );
}
