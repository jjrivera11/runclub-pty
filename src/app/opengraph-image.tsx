import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "RunClub Panamá — Entrena más inteligente con Coach JJ";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#1B1C1E",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Fondo con gradiente naranja sutil */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(241,104,35,0.12) 0%, transparent 70%)",
          }}
        />

        {/* Logo texto */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 0,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 900,
              color: "#ffffff",
              letterSpacing: "-2px",
              lineHeight: 1,
            }}
          >
            RUN
          </div>
          <div
            style={{
              fontSize: 72,
              fontWeight: 900,
              color: "#F16823",
              letterSpacing: "-2px",
              lineHeight: 1,
            }}
          >
            CLUB
          </div>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 40,
            fontWeight: 700,
            color: "#F16823",
            textAlign: "center",
            marginBottom: 16,
            letterSpacing: "-1px",
          }}
        >
          Entrena más inteligente.
        </div>

        {/* Subtítulo */}
        <div
          style={{
            fontSize: 24,
            fontWeight: 400,
            color: "#B8B8B8",
            textAlign: "center",
            marginBottom: 48,
          }}
        >
          Con Coach JJ en Panamá 🇵🇦
        </div>

        {/* Pills */}
        <div
          style={{
            display: "flex",
            gap: 16,
          }}
        >
          {["🤖 IA personalizada", "🗺️ Rutas locales", "📈 Adaptación continua"].map((text) => (
            <div
              key={text}
              style={{
                background: "rgba(241,104,35,0.15)",
                border: "1px solid rgba(241,104,35,0.3)",
                borderRadius: 100,
                padding: "8px 20px",
                fontSize: 18,
                color: "#ffffff",
              }}
            >
              {text}
            </div>
          ))}
        </div>

        {/* URL */}
        <div
          style={{
            position: "absolute",
            bottom: 32,
            fontSize: 18,
            color: "#707070",
          }}
        >
          runclubpty.com
        </div>
      </div>
    ),
    { ...size }
  );
}
