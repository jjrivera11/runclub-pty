import Link from "next/link";
import { RunClubLogo } from "@/components/RunClubLogo";

export const metadata = {
  title: "Ayuda — RunClub Panamá",
};

const FAQ = [
  {
    category: "Cuenta y acceso",
    items: [
      {
        q: "¿Cómo recupero mi contraseña?",
        a: "Ve a la pantalla de inicio de sesión y haz click en '¿Olvidaste tu contraseña?'. Ingresa tu correo y te enviaremos un link para crear una nueva. Revisa tu carpeta de spam si no lo ves en unos minutos.",
      },
      {
        q: "¿Por qué no llegó el correo de verificación?",
        a: "El correo puede tardar hasta 2 minutos. Revisa tu carpeta de spam o correo no deseado y busca un mensaje de noreply@runclubpty.com. Si usas Yahoo o Hotmail, es más probable que caiga en spam.",
      },
      {
        q: "¿Cómo elimino mi cuenta?",
        a: "Ve a Configuración → Cuenta → Eliminar mi cuenta. Esta acción es permanente e irreversible. Todos tus datos y plan de entrenamiento serán borrados.",
      },
    ],
  },
  {
    category: "Plan y entrenamiento",
    items: [
      {
        q: "¿Cómo funciona el plan generado por IA?",
        a: "Coach JJ analiza tu objetivo, nivel, disponibilidad y carrera meta para crear un plan semana a semana adaptado a ti. El plan se genera en segundos y se ajusta automáticamente con tu progreso real.",
      },
      {
        q: "¿Puedo cambiar mi objetivo de entrenamiento?",
        a: "Sí. El cambio implica ajuste de precio y regeneración de tu plan. Contáctanos por WhatsApp y te ayudamos en el proceso.",
      },
      {
        q: "¿Qué pasa si me salto una semana?",
        a: "No pasa nada — el plan sigue donde lo dejaste. Coach JJ no te penaliza por pausas. Si necesitas ajustar el ritmo, puedes hacer el check-in semanal y el plan se adapta.",
      },
      {
        q: "¿Cómo exporto mi plan al calendario?",
        a: "En tu dashboard, toca el botón 'Menú' en la esquina superior derecha. Selecciona 'Exportar calendario' y aparecerán instrucciones paso a paso según tu dispositivo (iPhone, Android, Mac o Windows) para descargar el archivo .ics con todas tus sesiones.",
      },
      {
        q: "¿Las rutas son reales y actualizadas?",
        a: "Sí. Coach JJ conoce las rutas locales de Panamá — Cinta Costera, Parque Omar, Causeway Amador, Cerro Ancón y más. Las sesiones incluyen notas específicas sobre cada spot según el tipo de entrenamiento.",
      },
      {
        q: "¿Funciona fuera de Panamá?",
        a: "El plan de entrenamiento funciona en cualquier lugar del mundo. Las recomendaciones de rutas locales están optimizadas para Panamá, pero puedes sustituirlas por rutas de tu ciudad.",
      },
    ],
  },
  {
    category: "Pagos y suscripción",
    items: [
      {
        q: "¿Cuánto cuesta?",
        a: "Runner Pro cuesta $12/mes y Transformación $18/mes. Ambos planes incluyen 7 días de prueba gratuita sin tarjeta de crédito.",
      },
      {
        q: "¿Cómo pago por transferencia bancaria?",
        a: "Selecciona 'Transferencia bancaria' en la pantalla de pago. Verás los datos de Banco General y Banistmo. Realiza la transferencia, haz click en 'Ya realicé mi transferencia' y activamos tu cuenta en menos de 24 horas.",
      },
      {
        q: "¿Puedo cancelar en cualquier momento?",
        a: "Sí. Ve a Configuración → Plan activo → Cancelar suscripción. Mantendrás acceso completo hasta el fin del período ya pagado. No se emiten reembolsos por períodos en curso.",
      },
      {
        q: "¿Qué pasa cuando termina mi prueba de 7 días?",
        a: "Recibirás un email de recordatorio en el día 5 y otro el día 7. Al vencer la prueba, serás redirigido a la página de planes para suscribirte. Tu progreso se mantiene guardado.",
      },
    ],
  },
  {
    category: "Sobre Coach JJ",
    items: [
      {
        q: "¿Qué es Coach JJ?",
        a: "Coach JJ es tu entrenador personal con IA, especializado en running y fitness en Panamá. Conoce las rutas locales, el clima tropical y el calendario de carreras panameño. A diferencia de ChatGPT, Coach JJ recuerda tu progreso semana a semana y adapta tu plan con datos reales.",
      },
      {
        q: "¿Por qué Coach JJ en vez de ChatGPT?",
        a: "ChatGPT te da planes genéricos sin memoria ni adaptación. Coach JJ sabe que entrenaste el martes, que tienes una carrera el 5 de julio en la Cinta Costera, y que la semana pasada te costó el rodaje largo. Todo eso importa para un plan real.",
      },
    ],
  },
];

export default function HelpPage() {
  return (
    <main className="min-h-screen bg-[#1B1C1E] px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-10">
          <Link href="/dashboard" className="flex items-center gap-1.5 text-sm text-[#B8B8B8] hover:text-white transition-colors mb-8">
            ← Volver al dashboard
          </Link>
          <div className="text-center">
            <RunClubLogo size="md" />
            <h1 className="mt-6 text-2xl font-bold text-white">Centro de ayuda</h1>
            <p className="mt-2 text-sm text-[#B8B8B8]">
              Encuentra respuestas rápidas o contáctanos directamente.
            </p>
          </div>
        </div>

        {/* WhatsApp CTA */}
        <div className="mb-10 rounded-xl border border-green-500/20 bg-green-500/5 p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-white">¿No encuentras lo que buscas?</p>
            <p className="text-xs text-[#B8B8B8] mt-0.5">Coach JJ te responde por WhatsApp.</p>
          </div>
          <a
            href="https://wa.me/14038998916?text=Hola%2C%20necesito%20ayuda%20con%20RunClub%20Panamá."
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
          >
            💬 WhatsApp
          </a>
        </div>

        {/* FAQ */}
        <div className="space-y-10">
          {FAQ.map((section) => (
            <div key={section.category}>
              <h2 className="text-xs font-semibold text-[#F16823] uppercase tracking-widest mb-4">
                {section.category}
              </h2>
              <div className="space-y-4">
                {section.items.map((item) => (
                  <div key={item.q} className="rounded-xl border border-[#707070]/40 bg-[#2a2b2d] p-5">
                    <p className="text-sm font-semibold text-white mb-2">{item.q}</p>
                    <p className="text-sm text-[#B8B8B8] leading-relaxed">{item.a}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Formulario de sugerencia/reporte */}
        <div className="mt-12 rounded-xl border border-[#707070]/40 bg-[#2a2b2d] p-6">
          <h2 className="text-base font-semibold text-white mb-1">¿Tienes una sugerencia o encontraste un problema?</h2>
          <p className="text-sm text-[#B8B8B8] mb-5">Cuéntanos — cada mensaje lo leemos personalmente.</p>
          <ContactForm />
        </div>

        <div className="mt-8 text-center">
          <Link href="/dashboard" className="text-sm text-[#F16823] hover:underline">
            ← Volver al dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}

function ContactForm() {
  "use client";
  return (
    <form
      action="https://formsubmit.co/josejavier.riveragomez@gmail.com"
      method="POST"
      className="space-y-4"
    >
      <input type="hidden" name="_subject" value="RunClub Panamá — Mensaje de usuario" />
      <input type="hidden" name="_captcha" value="false" />
      <input type="hidden" name="_next" value="https://runclubpty.com/help?sent=true" />

      <div>
        <label className="block text-xs text-[#B8B8B8] mb-1.5">Tipo</label>
        <select
          name="tipo"
          required
          className="w-full rounded-lg border border-[#707070] bg-[#1B1C1E] px-3 py-2.5 text-sm text-white outline-none focus:border-[#F16823]"
        >
          <option value="">Selecciona...</option>
          <option value="sugerencia">💡 Sugerencia</option>
          <option value="problema">🐛 Reportar un problema</option>
          <option value="pregunta">❓ Pregunta general</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-[#B8B8B8] mb-1.5">Tu nombre</label>
        <input
          type="text"
          name="nombre"
          required
          placeholder="Tu nombre completo"
          className="w-full rounded-lg border border-[#707070] bg-[#1B1C1E] px-3 py-2.5 text-sm text-white placeholder:text-[#707070] outline-none focus:border-[#F16823]"
        />
      </div>

      <div>
        <label className="block text-xs text-[#B8B8B8] mb-1.5">Tu correo</label>
        <input
          type="email"
          name="email"
          required
          placeholder="tu@correo.com"
          className="w-full rounded-lg border border-[#707070] bg-[#1B1C1E] px-3 py-2.5 text-sm text-white placeholder:text-[#707070] outline-none focus:border-[#F16823]"
        />
      </div>

      <div>
        <label className="block text-xs text-[#B8B8B8] mb-1.5">Mensaje</label>
        <textarea
          name="mensaje"
          required
          rows={4}
          placeholder="Cuéntanos qué pasó o qué mejorarías..."
          className="w-full rounded-lg border border-[#707070] bg-[#1B1C1E] px-3 py-2.5 text-sm text-white placeholder:text-[#707070] outline-none focus:border-[#F16823] resize-none"
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-lg bg-[#F16823] py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
      >
        Enviar mensaje
      </button>
    </form>
  );
}
