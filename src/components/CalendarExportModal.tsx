"use client";

import { useState } from "react";

interface CalendarExportModalProps {
  onClose: () => void;
  onDownload: () => void;
}

const TABS = ["iPhone", "Android", "Mac", "Windows"] as const;
type Tab = typeof TABS[number];

const INSTRUCTIONS: Record<Tab, { steps: string[] }> = {
  iPhone: {
    steps: [
      "Toca el botón 'Descargar archivo .ics' abajo.",
      "Tu iPhone te preguntará qué hacer con el archivo — toca 'Abrir en Calendario'.",
      "Aparecerá un resumen de los eventos — toca 'Agregar todos'.",
      "¡Listo! Todas tus sesiones aparecen en tu app Calendario.",
    ],
  },
  Android: {
    steps: [
      "Toca el botón 'Descargar archivo .ics' abajo.",
      "Abre el archivo descargado desde las notificaciones.",
      "Si tienes Google Calendar, se abrirá automáticamente para importar.",
      "Acepta la importación y elige el calendario donde guardar.",
    ],
  },
  Mac: {
    steps: [
      "Toca el botón 'Descargar archivo .ics' abajo.",
      "Doble click en el archivo descargado.",
      "La app Calendario se abre y pregunta si agregar los eventos.",
      "Click en 'Agregar' y tus sesiones aparecen en el calendario.",
    ],
  },
  Windows: {
    steps: [
      "Toca el botón 'Descargar archivo .ics' abajo.",
      "Doble click en el archivo — Outlook lo importa automáticamente.",
      "Si no tienes Outlook: abre el Calendario de Windows → Importar → selecciona el archivo.",
      "También puedes importarlo en Google Calendar desde calendar.google.com → Configuración → Importar.",
    ],
  },
};

export function CalendarExportModal({ onClose, onDownload }: CalendarExportModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>("iPhone");

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm px-4 pb-4 sm:pb-0">
      <div className="w-full max-w-md bg-[#1B1C1E] rounded-2xl border border-[#707070]/40 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#707070]/40">
          <div>
            <h3 className="text-white font-semibold">Exportar a tu calendario</h3>
            <p className="text-[#B8B8B8] text-xs mt-0.5">Elige tu dispositivo y sigue los pasos</p>
          </div>
          <button onClick={onClose} className="text-[#B8B8B8] hover:text-white text-xl transition-colors">✕</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#707070]/40">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "text-[#F16823] border-b-2 border-[#F16823]"
                  : "text-[#B8B8B8] hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Steps */}
        <div className="px-5 py-5 space-y-3">
          {INSTRUCTIONS[activeTab].steps.map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#F16823]/20 text-[#F16823] text-xs font-bold mt-0.5">
                {i + 1}
              </span>
              <p className="text-sm text-[#B8B8B8] leading-relaxed">{step}</p>
            </div>
          ))}
        </div>

        {/* Download button */}
        <div className="px-5 pb-5">
          <button
            onClick={() => { onDownload(); onClose(); }}
            className="w-full rounded-xl bg-[#F16823] py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
          >
            📅 Descargar archivo .ics
          </button>
          <p className="text-center text-xs text-[#B8B8B8]/50 mt-2">
            El archivo contiene todas las sesiones de tu plan
          </p>
        </div>
      </div>
    </div>
  );
}
