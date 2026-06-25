"use client";

import { useState, useEffect, useRef } from "react";

interface TourStep {
  target: string;
  title: string;
  description: string;
  position?: "top" | "bottom";
}

const TOUR_STEPS: TourStep[] = [
  {
    target: "[data-tour='progress-card']",
    title: "Tu progreso y ranking 🏆",
    description: "Aquí ves cuánto has avanzado en tu plan y tu posición en el ranking de runners. Cada sesión que completas te sube en la tabla.",
    position: "bottom",
  },
  {
    target: "[data-tour='leaderboard']",
    title: "Compite con otros runners 🥇",
    description: "Gana puntos completando días, semanas y manteniendo tu racha. El ícono ? te explica cómo funciona el sistema de puntos.",
    position: "bottom",
  },
  {
    target: "[data-tour='week-pills']",
    title: "Tus semanas de entrenamiento 📅",
    description: "Selecciona cualquier semana para ver tus sesiones. Verde = completada, naranja = en progreso, candado = próximamente.",
    position: "bottom",
  },
  {
    target: "[data-tour='week-card']",
    title: "Marca tus sesiones completadas ✅",
    description: "Toca el checkbox de cada sesión al terminarla. El plan registra tu progreso y adapta las próximas semanas.",
    position: "top",
  },
  {
    target: "[data-tour='test-week']",
    title: "Semanas de test 🧪",
    description: "Las semanas de test miden tu progreso real. Coach JJ usa esos datos para ajustar la intensidad de tu plan.",
    position: "top",
  },
  {
    target: "[data-tour='panama-context']",
    title: "Agrega una carrera a tu plan 🏁",
    description: "Selecciona una carrera local en Panamá y Coach JJ ajusta tu plan automáticamente con el tapering correcto.",
    position: "top",
  },
  {
    target: "[data-tour='calendar-export']",
    title: "Descarga tu plan al calendario 📲",
    description: "Exporta todas tus sesiones directamente a Google Calendar o Apple Calendar para no olvidar ningún entrenamiento.",
    position: "top",
  },
  {
    target: "[data-tour='share-card']",
    title: "Comparte tu logro 📸",
    description: "Genera una tarjeta personalizada para compartir tu plan, semanas completadas o tu logro final en redes sociales.",
    position: "bottom",
  },
  {
    target: "[data-tour='referral']",
    title: "Refiere a un amigo 👥",
    description: "Comparte tu link de referido. Cada amigo que se registra te da 75 puntos y un 20% de descuento en tu próximo mes.",
    position: "top",
  },
  {
    target: "[data-tour='pdf-export']",
    title: "Exporta tu plan en PDF 📄",
    description: "Descarga tu plan completo en PDF para tenerlo siempre disponible, aunque no tengas conexión.",
    position: "top",
  },
  {
    target: "[data-tour='settings']",
    title: "Configuración ⚙️",
    description: "Actualiza tu perfil, zona de entrenamiento y track en cualquier momento. Los cambios aplican a tu próximo plan.",
    position: "top",
  },
];

export function ProductTour({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [highlightStyle, setHighlightStyle] = useState<React.CSSProperties>({});
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const [arrowLeft, setArrowLeft] = useState(20);
  const [showAbove, setShowAbove] = useState(false);

  const current = TOUR_STEPS[step];
  const total = TOUR_STEPS.length;

  useEffect(() => {
    positionTooltip();
    window.addEventListener("resize", positionTooltip);
    return () => window.removeEventListener("resize", positionTooltip);
  }, [step]);

  function positionTooltip() {
    const el = document.querySelector(current.target);
    if (!el) {
      if (step < total - 1) setStep((s) => s + 1);
      else onComplete();
      return;
    }

    el.scrollIntoView({ behavior: "smooth", block: "center" });

    setTimeout(() => {
      const rect = el.getBoundingClientRect();
      const padding = 8;
      const tooltipWidth = Math.min(320, window.innerWidth - 32);

      setHighlightStyle({
        position: "fixed",
        top: rect.top - padding,
        left: rect.left - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
        borderRadius: 16,
        boxShadow: "0 0 0 4px #F16823, 0 0 0 8px rgba(241,104,35,0.3), 0 0 40px rgba(241,104,35,0.2), 0 0 0 9999px rgba(0,0,0,0.75)",
        zIndex: 9998,
        pointerEvents: "none",
      });

      let left = rect.left;
      if (left + tooltipWidth > window.innerWidth - 16) left = window.innerWidth - tooltipWidth - 16;
      if (left < 16) left = 16;

      const above = current.position === "top" || rect.bottom + 220 > window.innerHeight;
      const top = above
        ? rect.top + window.scrollY - 200
        : rect.bottom + window.scrollY + 16;

      setShowAbove(above);
      setArrowLeft(Math.min(Math.max(rect.left - left + rect.width / 2 - 6, 16), tooltipWidth - 32));
      setTooltipStyle({ position: "absolute", top, left, width: tooltipWidth, zIndex: 9999 });
    }, 300);
  }

  function handleNext() {
    if (step < total - 1) setStep((s) => s + 1);
    else onComplete();
  }

  return (
    <>
      <div style={highlightStyle} />
      <div style={tooltipStyle}>
        {!showAbove && (
          <div style={{ width: 12, height: 12, background: "#F16823", clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)", marginLeft: arrowLeft, marginBottom: -1 }} />
        )}
        <div style={{ background: "#1e1f21", border: "1px solid #F16823", borderRadius: 16, padding: 20, boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: "#F16823", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
            Paso {step + 1} de {total}
          </p>
          <p style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 6 }}>{current.title}</p>
          <p style={{ fontSize: 13, color: "#B8B8B8", lineHeight: 1.6, marginBottom: 16 }}>{current.description}</p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
              {TOUR_STEPS.map((_, i) => (
                <div key={i} style={{
                  width: i === step ? 20 : 7,
                  height: 7,
                  borderRadius: i === step ? 4 : "50%",
                  background: i < step ? "#10B981" : i === step ? "#F16823" : "#2a2b2d",
                  border: `1px solid ${i < step ? "#10B981" : i === step ? "#F16823" : "#707070"}`,
                  transition: "all 0.2s",
                }} />
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button onClick={onComplete} style={{ fontSize: 12, color: "#707070", background: "none", border: "none", cursor: "pointer", padding: "4px 8px" }}>
                Saltar tour
              </button>
              <button onClick={handleNext} style={{ background: "#F16823", color: "#fff", border: "none", borderRadius: 8, padding: "8px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                {step === total - 1 ? "¡Listo! 🎉" : "Siguiente →"}
              </button>
            </div>
          </div>
        </div>
        {showAbove && (
          <div style={{ width: 12, height: 12, background: "#F16823", clipPath: "polygon(50% 100%, 0% 0%, 100% 0%)", marginLeft: arrowLeft, marginTop: -1 }} />
        )}
      </div>
    </>
  );
}
