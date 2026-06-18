"use client";

import { useRouter } from "next/navigation";
import { PromoCodeInput } from "@/components/PromoCodeInput";
import { useState } from "react";
import type { Track } from "@/types/onboarding";

const RUNNER_BENEFITS = [
  "Plan de entrenamiento personalizado completo",
  "Seguimiento de progreso semana a semana",
  "Ajustado a carreras de Panamá",
  "Zonas de ritmo calculadas para tu nivel",
  "Acceso desde cualquier dispositivo",
];

const TRANSFORMACION_BENEFITS = [
  "Plan combinado de running y pesas",
  "Seguimiento de progreso semana a semana",
  "Rutinas adaptadas a gym o casa",
  "Progresión de carga calculada",
  "Acceso desde cualquier dispositivo",
];

const FAQ_ITEMS = [
  {
    question: "¿Puedo cancelar en cualquier momento?",
    answer:
      "Sí, puedes cancelar tu suscripción cuando quieras desde tu perfil.",
  },
  {
    question: "¿Qué pasa si ya tengo un plan generado?",
    answer:
      "Tu plan generado se mantiene. Al suscribirte obtienes acceso completo a todas las semanas.",
  },
  {
    question: "¿Cómo funcionan los pagos con banco?",
    answer:
      "Puedes hacer una transferencia a Banco General o Banistmo y subir el comprobante. Activamos tu cuenta en menos de 24 horas.",
  },
];

function BenefitList({ items }: { items: string[] }) {
  return (
    <ul className="mt-6 space-y-3">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2 text-sm text-white">
          <span className="mt-0.5 shrink-0 text-[#F16823]">✓</span>
          {item}
        </li>
      ))}
    </ul>
  );
}

function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-2">
      {FAQ_ITEMS.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={item.question}
            className="overflow-hidden rounded-lg border border-[#707070] bg-[#2a2b2d]"
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-white"
            >
              {item.question}
              <span className="ml-2 text-[#B8B8B8]">{isOpen ? "▲" : "▼"}</span>
            </button>
            {isOpen && (
              <div className="border-t border-[#707070]/40 px-4 py-3 text-sm text-[#B8B8B8]">
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

interface PricingClientProps {
  track: Track;
}

export default function PricingClient({ track }: PricingClientProps) {
  const router = useRouter();
  const isRunnerRecommended = track === "runner";
  const isTransformacionRecommended = track === "transformacion";

  function handleSelectPlan(plan: "runner" | "transformacion") {
    // TODO: integrar Neopayment checkout aquí
    router.push(`/payment/pending?plan=${plan}`);
  }

  return (
    <div className="min-h-full bg-[#1B1C1E] text-white">
      <nav className="fixed inset-x-0 top-0 z-40 border-b border-[#707070]/30 bg-[#1B1C1E]">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <h1 className="text-lg font-bold text-[#F16823]">RunClub Panamá</h1>
          <form action="/auth/signout" method="POST">
            <button
              type="submit"
              className="text-sm text-[#B8B8B8] transition-colors hover:text-white"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-4 pb-16 pt-24">
        <section className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-white">Elige tu plan</h2>
          <p className="mt-2 text-[#B8B8B8]">
            Acceso completo a tu plan de entrenamiento personalizado
          </p>
        </section>

        <section className="mb-16 grid gap-6 md:grid-cols-2">
          <div
            className={`relative flex flex-col rounded-xl border-2 border-[#F16823] bg-[#2a2b2d] p-6 md:order-none ${
              isTransformacionRecommended ? "order-2" : "order-1"
            }`}
          >
            <span className="absolute -top-3 left-4 rounded-full bg-[#F16823] px-3 py-0.5 text-xs font-medium text-white">
              Más popular
            </span>
            {isRunnerRecommended && (
              <span className="absolute -top-3 right-4 rounded-full border border-[#F16823] bg-[#1B1C1E] px-3 py-0.5 text-xs text-[#F16823]">
                Recomendado para ti
              </span>
            )}
            <div className="mt-2">
              <p className="text-4xl font-bold text-white">
                $12
                <span className="text-lg font-normal text-[#B8B8B8]">/mes</span>
              </p>
              <h3 className="mt-2 text-xl font-semibold text-white">
                Runner Pro
              </h3>
              <p className="mt-2 text-sm text-[#B8B8B8]">
                Para corredores que quieren terminar o mejorar su tiempo en
                carrera
              </p>
            </div>
            <BenefitList items={RUNNER_BENEFITS} />
            <button
              type="button"
              onClick={() => handleSelectPlan("runner")}
              className="mt-8 w-full rounded-lg bg-[#F16823] px-4 py-3 font-medium text-white transition-opacity hover:opacity-90"
            >
              Comenzar Runner Pro
            </button>
          </div>

          <div
            className={`relative flex flex-col rounded-xl border border-[#707070] bg-[#2a2b2d] p-6 md:order-none ${
              isTransformacionRecommended ? "order-1" : "order-2"
            }`}
          >
            {isTransformacionRecommended && (
              <span className="absolute -top-3 right-4 rounded-full border border-[#F16823] bg-[#1B1C1E] px-3 py-0.5 text-xs text-[#F16823]">
                Recomendado para ti
              </span>
            )}
            <div className="mt-2">
              <p className="text-4xl font-bold text-white">
                $18
                <span className="text-lg font-normal text-[#B8B8B8]">/mes</span>
              </p>
              <h3 className="mt-2 text-xl font-semibold text-white">
                Transformación
              </h3>
              <p className="mt-2 text-sm text-[#B8B8B8]">
                Para quienes buscan bajar de peso combinando cardio y fuerza
              </p>
            </div>
            <BenefitList items={TRANSFORMACION_BENEFITS} />
            <button
              type="button"
              onClick={() => handleSelectPlan("transformacion")}
              className="mt-8 w-full rounded-lg border border-[#F16823] bg-[#2a2b2d] px-4 py-3 font-medium text-[#F16823] transition-opacity hover:opacity-90"
            >
              Comenzar Transformación
            </button>
          </div>
        </section>

        <section className="mb-8">
          <div className="mx-auto max-w-sm">
            <p className="mb-3 text-sm text-white font-medium">¿Tienes un codigo promocional?</p>
            <PromoCodeInput onApplied={(result) => {
              if (result.type === "free_premium") {
                router.push("/dashboard");
              }
            }} />
          </div>
        </section>

        <section className="mb-16 text-center">
          <p className="mb-4 text-sm text-[#B8B8B8]">
            Métodos de pago aceptados
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {["💳 Visa / Mastercard", "🏦 Banco General", "🏦 Banistmo"].map(
              (method) => (
                <span
                  key={method}
                  className="rounded-full border border-[#707070] bg-[#2a2b2d] px-4 py-2 text-sm text-white"
                >
                  {method}
                </span>
              )
            )}
          </div>
          <p className="mt-4 text-xs text-[#B8B8B8]">
            Pagos procesados de forma segura. Cancela cuando quieras.
          </p>
        </section>

        <section>
          <h3 className="mb-4 text-center text-lg font-semibold text-white">
            Preguntas frecuentes
          </h3>
          <FaqAccordion />
        </section>
      </main>
    </div>
  );
}
