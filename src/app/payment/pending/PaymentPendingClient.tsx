"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type PaymentPlan = "runner" | "transformacion";

const PLAN_AMOUNTS: Record<PaymentPlan, number> = {
  runner: 12,
  transformacion: 18,
};

interface PaymentPendingClientProps {
  plan: PaymentPlan;
  email: string;
  userId: string;
}

export default function PaymentPendingClient({
  plan,
  email,
  userId,
}: PaymentPendingClientProps) {
  const amount = PLAN_AMOUNTS[plan];
  const formattedAmount = `$${amount.toFixed(2)}`;

  const [selectedOption, setSelectedOption] = useState<
    "card" | "bank" | null
  >(null);
  const [bankExpanded, setBankExpanded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleCardPayment() {
    // TODO: iniciar checkout Neopayment
    alert("Neopayment próximamente");
  }

  function handleBankCardClick() {
    setSelectedOption("bank");
    setBankExpanded(true);
  }

  async function handleNotifyTransfer() {
    setError(null);
    setSubmitting(true);

    const supabase = createClient();
    const { error: insertError } = await supabase.from("payments").insert({
      user_id: userId,
      status: "pending_verification",
      provider: "bank_transfer",
      amount_usd: amount,
      plan,
    });

    if (insertError) {
      setError("No se pudo registrar tu pago. Intenta de nuevo.");
      setSubmitting(false);
      return;
    }

    // TODO: enviar email de confirmación con Resend
    setConfirmed(true);
    setSubmitting(false);
  }

  if (confirmed) {
    return (
      <div className="min-h-full bg-[#1B1C1E] text-white">
        <nav className="fixed inset-x-0 top-0 z-40 border-b border-[#707070]/30 bg-[#1B1C1E]">
          <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
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

        <main className="mx-auto flex max-w-2xl flex-col items-center px-4 pb-16 pt-32 text-center">
          <span className="text-5xl">✅</span>
          <p className="mt-6 text-lg text-white">
            ¡Gracias! Revisaremos tu pago y activaremos tu cuenta en menos de 24
            horas. Te notificaremos por email.
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#1B1C1E] text-white">
      <nav className="fixed inset-x-0 top-0 z-40 border-b border-[#707070]/30 bg-[#1B1C1E]">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
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

      <main className="mx-auto max-w-2xl px-4 pb-16 pt-24">
        <section className="mb-10 text-center">
          <span className="text-5xl text-[#F16823]">⏳</span>
          <h2 className="mt-4 text-3xl font-bold text-white">
            Completa tu pago
          </h2>
          <p className="mt-2 text-[#B8B8B8]">
            Elige cómo quieres pagar y sigue las instrucciones
          </p>
        </section>

        <div className="space-y-4">
          <div
            className={`rounded-xl border bg-[#2a2b2d] p-5 transition-colors ${
              selectedOption === "card"
                ? "border-[#F16823]"
                : "border-[#707070]"
            }`}
          >
            <button
              type="button"
              onClick={() => setSelectedOption("card")}
              className="w-full text-left"
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl">💳</span>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold text-white">
                      Pagar con tarjeta
                    </h3>
                    <span className="rounded-full bg-green-900/50 px-2.5 py-0.5 text-xs text-green-300">
                      Activación inmediata
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-[#B8B8B8]">
                    Pago inmediato y seguro. Activa tu plan al instante.
                  </p>
                </div>
              </div>
            </button>
            {selectedOption === "card" && (
              <button
                type="button"
                onClick={handleCardPayment}
                className="mt-4 w-full rounded-lg bg-[#F16823] px-4 py-3 font-medium text-white transition-opacity hover:opacity-90"
              >
                Pagar con tarjeta
              </button>
            )}
          </div>

          <div
            className={`rounded-xl border bg-[#2a2b2d] p-5 transition-colors ${
              selectedOption === "bank"
                ? "border-[#F16823]"
                : "border-[#707070]"
            }`}
          >
            <button
              type="button"
              onClick={handleBankCardClick}
              className="w-full text-left"
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl">🏦</span>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold text-white">
                      Transferencia bancaria
                    </h3>
                    <span className="rounded-full bg-[#374151] px-2.5 py-0.5 text-xs text-[#B8B8B8]">
                      Activación en 24 horas
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-[#B8B8B8]">
                    Transfiere a Banco General o Banistmo y sube tu comprobante.
                  </p>
                </div>
              </div>
            </button>

            {bankExpanded && selectedOption === "bank" && (
              <div className="mt-5 space-y-5 border-t border-[#707070]/40 pt-5">
                <div className="rounded-lg border border-[#707070]/40 bg-[#1B1C1E] p-4">
                  <h4 className="font-medium text-white">Banco General</h4>
                  <dl className="mt-2 space-y-1 text-sm">
                    <div className="flex justify-between gap-4">
                      <dt className="text-[#B8B8B8]">Cuenta:</dt>
                      <dd className="text-white">[04-01-02-013430-1]</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-[#B8B8B8]">Tipo:</dt>
                      <dd className="text-white">Ahorros</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-[#B8B8B8]">A nombre de:</dt>
                      <dd className="text-white">[JOSE JAVIER RIVERA GOMEZ]</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-[#B8B8B8]">Monto:</dt>
                      <dd className="font-medium text-[#F16823]">
                        {formattedAmount}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="rounded-lg border border-[#707070]/40 bg-[#1B1C1E] p-4">
                  <h4 className="font-medium text-white">Banistmo</h4>
                  <dl className="mt-2 space-y-1 text-sm">
                    <div className="flex justify-between gap-4">
                      <dt className="text-[#B8B8B8]">Cuenta:</dt>
                      <dd className="text-white">[0106785554]</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-[#B8B8B8]">Tipo:</dt>
                      <dd className="text-white">Corriente</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-[#B8B8B8]">A nombre de:</dt>
                      <dd className="text-white">[JOSE JAVIER RIVERA GOMEZ]</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-[#B8B8B8]">Monto:</dt>
                      <dd className="font-medium text-[#F16823]">
                        {formattedAmount}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="rounded-lg border border-[#707070]/40 bg-[#1B1C1E] p-4 text-sm">
                  <p className="text-[#B8B8B8]">
                    Referencia de pago:{" "}
                    <span className="font-medium text-white">{email}</span>
                  </p>
                  <p className="mt-2 text-[#B8B8B8]">
                    Una vez realizada la transferencia, envía el comprobante a{" "}
                    <span className="text-white">pagos@runclubpty.com</span> con
                    tu email como asunto.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="receipt"
                    className="mb-1.5 block text-sm text-[#B8B8B8]"
                  >
                    Adjunta tu comprobante (opcional)
                  </label>
                  <input
                    id="receipt"
                    type="file"
                    accept="image/*,.pdf"
                    className="w-full rounded-lg border border-[#707070] bg-[#1B1C1E] px-3 py-2 text-sm text-white file:mr-3 file:rounded file:border-0 file:bg-[#F16823] file:px-3 file:py-1 file:text-sm file:text-white"
                    onChange={() => {
                      // TODO: subir comprobante a Supabase Storage
                    }}
                  />
                  <p className="mt-1 text-xs text-[#B8B8B8]">
                    También puedes enviarlo directo al correo
                  </p>
                </div>

                {error && (
                  <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    {error}
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleNotifyTransfer}
                  disabled={submitting}
                  className="w-full rounded-lg bg-[#F16823] px-4 py-3 font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting
                    ? "Enviando..."
                    : "Ya realicé mi transferencia — Notificar al equipo"}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
