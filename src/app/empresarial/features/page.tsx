import Link from "next/link";

export default function EmpresarialFeaturesPage() {
  return (
    <main className="min-h-screen bg-[#111111] text-white font-sans">
      <div className="max-w-4xl mx-auto">

      {/* Nav */}
      <nav className="flex justify-between items-center px-8 py-5 border-b border-[#2a2b2d]">
        <Link href="/empresarial" className="text-sm text-[#707070] hover:text-white transition-colors">
          ← Volver al programa
        </Link>
        <span className="text-xs text-[#707070]">RunClub Empresarial</span>
      </nav>

      {/* Header */}
      <section className="px-8 py-12 border-b border-[#2a2b2d]">
        <p className="text-xs uppercase tracking-widest text-[#707070] mb-4">
          Para equipos de Gestión Humana
        </p>
        <h1 className="text-3xl font-light leading-tight max-w-xl mb-4">
          Funcionalidades{" "}
          <strong className="font-bold text-[#F16823]">del programa</strong>
        </h1>
        <p className="text-[#B8B8B8] text-[15px] leading-relaxed max-w-lg">
          Todo lo que su equipo y sus empleados tienen disponible desde el primer día.
        </p>
      </section>

      {/* Features */}
      <section className="px-8 py-12 border-b border-[#2a2b2d]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">

          {/* RRHH */}
          <div className="bg-[#1B1C1E] border border-[#2a2b2d] rounded-xl p-7">
            <div className="flex items-center gap-3 mb-6 pb-5 border-b border-[#2a2b2d]">
              <div className="w-9 h-9 bg-[#AF3F07]/20 rounded-lg flex items-center justify-center">
                <span className="text-[#F16823] text-base">▦</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Dashboard RRHH</p>
                <p className="text-xs text-[#707070]">Vista del administrador</p>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              {[
                { title: "Reporte de asistencia y adherencia", desc: "Por empleado, semana y mes — siempre actualizado." },
                { title: "Progreso grupal", desc: "Métricas por departamento o sede para seguimiento colectivo." },
                { title: "Métricas de actividad", desc: "Km totales, sesiones completadas y racha promedio del equipo." },
                { title: "Exportar reportes", desc: "Descarga en PDF o Excel para presentaciones internas." },
                { title: "Eventos internos", desc: "Coordina salidas grupales — \"Hoy corremos en el Parque Omar\"." },
                { title: "Gestión de empleados", desc: "Agrega, pausa o remueve usuarios del programa fácilmente." },
              ].map((f) => (
                <div key={f.title} className="flex gap-3 items-start">
                  <div className="w-1.5 h-1.5 bg-[#F16823] rounded-full mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-white mb-0.5">{f.title}</p>
                    <p className="text-xs text-[#A3A3A3] leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Empleado */}
          <div className="bg-[#1B1C1E] border border-[#2a2b2d] rounded-xl p-7">
            <div className="flex items-center gap-3 mb-6 pb-5 border-b border-[#2a2b2d]">
              <div className="w-9 h-9 bg-[#AF3F07]/20 rounded-lg flex items-center justify-center">
                <span className="text-[#F16823] text-base">▸</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Experiencia del empleado</p>
                <p className="text-xs text-[#707070]">Vista del usuario</p>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              {[
                { title: "Plan personalizado por IA", desc: "Generado según nivel, objetivos y disponibilidad de cada empleado." },
                { title: "Acceso a plan y progreso 24 horas", desc: "Disponible en cualquier momento desde la app." },
                { title: "Calendario de carreras locales", desc: "Eventos en Panamá integrados directamente al plan de entrenamiento." },
                { title: "Gamificación", desc: "Puntos, badges, racha y leaderboard interno de la empresa." },
                { title: "Retos de equipo", desc: "Competencias internas por km, sesiones completadas o racha." },
                { title: "Tarjetas para compartir logros", desc: "El empleado comparte su progreso en redes — visibilidad para la empresa." },
              ].map((f) => (
                <div key={f.title} className="flex gap-3 items-start">
                  <div className="w-1.5 h-1.5 bg-[#F16823] rounded-full mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-white mb-0.5">{f.title}</p>
                    <p className="text-xs text-[#A3A3A3] leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Implementación */}
      <section className="px-8 py-12 border-b border-[#2a2b2d]">
        <p className="text-xs uppercase tracking-widest text-[#707070] mb-7">
          Proceso de implementación
        </p>
        <div className="flex flex-col divide-y divide-[#1e1f21] max-w-2xl">
          {[
            { num: "01", title: "Coordinación inicial", desc: "Una llamada de 20 minutos para definir el alcance, número de empleados y objetivos del programa." },
            { num: "02", title: "Setup en 48 horas", desc: "Configuramos la plataforma con los datos de su empresa. Sin instalaciones ni integraciones complejas." },
            { num: "03", title: "Onboarding del equipo", desc: "Cada empleado recibe un link de acceso y completa su perfil en menos de 5 minutos." },
            { num: "04", title: "Seguimiento continuo", desc: "RRHH accede al dashboard en cualquier momento. Reportes automáticos mensuales incluidos." },
          ].map((item) => (
            <div key={item.num} className="flex gap-5 items-start py-5">
              <span className="text-xs font-bold text-[#F16823] min-w-[24px] pt-0.5">{item.num}</span>
              <div>
                <p className="text-[15px] font-medium text-white mb-1">{item.title}</p>
                <p className="text-sm text-[#A3A3A3] leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-8 py-16 text-center">
        <p className="text-xl font-medium text-white mb-2">
          ¿Listo para coordinar una demo?
        </p>
        <p className="text-sm text-[#A3A3A3] mb-7">
          Escríbanos y agendamos una sesión para mostrarle el programa en detalle.
        </p>
        <a
          href="mailto:empresas@runclubpty.com?subject=Demo%20RunClub%20Empresarial"
          className="inline-flex items-center gap-2 bg-[#F16823] hover:bg-[#FF4F26] text-white px-7 py-3.5 rounded-lg text-[15px] font-semibold transition-colors"
        >
          Coordinar una demo →
        </a>
      </section>

      {/* Footer */}
      <footer className="px-8 py-5 border-t border-[#2a2b2d] text-center">
        <p className="text-xs text-[#707070]">
          RunClub Panamá · runclubpty.com/empresarial · empresas@runclubpty.com
        </p>
      </footer>

      </div>
    </main>
  );
}
