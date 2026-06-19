import Link from "next/link";
import { RunClubLogo } from "@/components/RunClubLogo";

export const metadata = {
  title: "Términos y Condiciones — RunClub Panamá",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#1B1C1E] px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-10 text-center">
          <RunClubLogo size="md" />
        </div>

        <h1 className="mb-2 text-2xl font-bold text-white">
          Términos y Condiciones de Uso
        </h1>
        <p className="mb-10 text-sm text-[#B8B8B8]">Última actualización: junio 2026</p>

        <div className="space-y-8 text-sm text-[#B8B8B8] leading-relaxed">
          <section>
            <h2 className="mb-3 text-base font-semibold text-white">1. Identificación</h2>
            <p>RunClub Panamá es operada por Jose Javier Rivera Gomez, persona natural, con domicilio en la República de Panamá. Para consultas: contacto@runclubpty.com.</p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-white">2. Aceptación</h2>
            <p>Al crear una cuenta en runclubpty.com, el usuario declara haber leído, entendido y aceptado estos Términos en su totalidad. Si no está de acuerdo, debe abstenerse de usar la Plataforma.</p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-white">3. Descripción del servicio</h2>
            <p>RunClub Panamá ofrece planes de entrenamiento personalizados generados por inteligencia artificial, seguimiento de progreso y contenido relacionado con running y acondicionamiento físico en Panamá. Los planes son informativos y de apoyo al entrenamiento personal — no constituyen asesoría médica ni reemplazan la orientación de un profesional de la salud.</p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-white">4. Suscripciones y pagos</h2>
            <p className="mb-2">La Plataforma ofrece dos planes de suscripción mensual:</p>
            <ul className="ml-4 space-y-1 list-disc">
              <li><span className="text-white font-medium">Runner Pro:</span> $12.00 USD/mes</li>
              <li><span className="text-white font-medium">Transformación:</span> $18.00 USD/mes</li>
            </ul>
            <p className="mt-2">Los pagos se realizan mediante transferencia bancaria a Banco General o Banistmo, o mediante tarjeta de crédito/débito (Visa/Mastercard). Al completar el pago el usuario obtiene acceso completo al plan contratado por el período correspondiente.</p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-white">5. Cancelación y reembolsos</h2>
            <p>El usuario puede cancelar su suscripción en cualquier momento desde su perfil. La cancelación aplica al siguiente período de facturación — no se emiten reembolsos por períodos ya pagados. El acceso se mantiene activo hasta el fin del período en curso.</p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-white">6. Conducta del usuario</h2>
            <p>El usuario se compromete a proporcionar información veraz durante el registro y onboarding, a usar la Plataforma exclusivamente para fines personales y no comerciales, y a no compartir su cuenta con terceros.</p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-white">7. Salud y responsabilidad</h2>
            <p>El entrenamiento físico conlleva riesgos inherentes. El usuario declara encontrarse en condiciones físicas aptas para realizar actividad física. RunClub Panamá no se responsabiliza por lesiones, daños o condiciones de salud derivadas del uso de los planes de entrenamiento. Se recomienda consultar a un médico antes de iniciar cualquier programa de ejercicio.</p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-white">8. Propiedad intelectual</h2>
            <p>Todo el contenido de la Plataforma — incluyendo planes, textos, diseño y código — es propiedad de Jose Javier Rivera Gomez. Queda prohibida su reproducción o distribución sin autorización expresa.</p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-white">9. Privacidad</h2>
            <p>La información personal del usuario se utiliza exclusivamente para operar el servicio. No se comparte con terceros salvo obligación legal. Los datos de pago son procesados por los proveedores bancarios correspondientes y no son almacenados por la Plataforma.</p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-white">10. Modificaciones</h2>
            <p>Estos Términos pueden actualizarse en cualquier momento. Los usuarios serán notificados por correo electrónico ante cambios sustanciales. El uso continuado de la Plataforma tras la notificación implica aceptación de los nuevos términos.</p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-white">11. Ley aplicable</h2>
            <p>Estos Términos se rigen por las leyes de la República de Panamá. Cualquier disputa será sometida a la jurisdicción de los tribunales competentes de la Ciudad de Panamá.</p>
          </section>
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/register"
            className="text-sm text-[#F16823] hover:underline"
          >
            ← Volver al registro
          </Link>
        </div>
      </div>
    </main>
  );
}
