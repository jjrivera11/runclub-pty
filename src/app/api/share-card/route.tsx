import { ImageResponse } from "@vercel/og";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") ?? "start";
  const name = searchParams.get("name") ?? "Atleta";
  const race = searchParams.get("race") ?? "";
  const weeks = searchParams.get("weeks") ?? "0";
  const streak = searchParams.get("streak") ?? "0";
  const track = searchParams.get("track") ?? "runner";
  const weekNumber = searchParams.get("week") ?? "1";
  const weekKm = searchParams.get("km") ?? "0";
  const completionPercent = searchParams.get("pct") ?? "0";
  const totalKm = searchParams.get("totalkm") ?? "0";

  const isRunner = track === "runner";
  const trackLabel = isRunner ? "🏃 Runner Pro" : "💪 Transformación";
  const firstName = name.split(" ")[0];
  const origin = new URL(request.url).origin;

  const Logo = () => (
    <div style={{ display: "flex", width: "160px", justifyContent: "flex-start" }}>
      <img src={`${origin}/logo.png`} width={120} height={40} style={{ objectFit: "contain" }} />
    </div>
  );

  const Footer = () => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ color: "#404040", fontSize: "11px" }}>runclubpty.com</span>
      <span style={{ color: "#404040", fontSize: "11px" }}>Coach JJ · Panamá</span>
    </div>
  );

  try {
    if (type === "week") {
      return new ImageResponse(
        (
          <div style={{ width: "400px", height: "400px", background: "#111111", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "36px", fontFamily: "Arial Black, sans-serif", position: "relative" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: "#10B981" }} />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                <Logo />
                <div style={{ background: "#10B981", borderRadius: "6px", padding: "4px 10px", display: "flex" }}>
                  <span style={{ color: "#ffffff", fontSize: "11px", fontWeight: 700 }}>✅ Semana completada</span>
                </div>
              </div>
              <p style={{ color: "#707070", fontSize: "12px", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "1px" }}>Semana {weekNumber} de {weeks}</p>
              <h1 style={{ color: "#ffffff", fontSize: "36px", margin: "0 0 4px", lineHeight: 1.1 }}>{firstName}</h1>
              {race && <p style={{ color: "#10B981", fontSize: "16px", margin: 0 }}>{race}</p>}
            </div>
            <div style={{ display: "flex", gap: "16px" }}>
              <div style={{ flex: 1, background: "#1B1C1E", borderRadius: "10px", padding: "14px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <span style={{ color: "#10B981", fontSize: "28px", lineHeight: 1 }}>{weekKm}</span>
                <span style={{ color: "#707070", fontSize: "10px", marginTop: "3px", textTransform: "uppercase", letterSpacing: "0.5px" }}>km semana</span>
              </div>
              <div style={{ flex: 1, background: "#1B1C1E", borderRadius: "10px", padding: "14px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <span style={{ color: "#10B981", fontSize: "28px", lineHeight: 1 }}>🔥 {streak}</span>
                <span style={{ color: "#707070", fontSize: "10px", marginTop: "3px", textTransform: "uppercase", letterSpacing: "0.5px" }}>días racha</span>
              </div>
              <div style={{ flex: 1, background: "#1B1C1E", borderRadius: "10px", padding: "14px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <span style={{ color: "#10B981", fontSize: "28px", lineHeight: 1 }}>{completionPercent}%</span>
                <span style={{ color: "#707070", fontSize: "10px", marginTop: "3px", textTransform: "uppercase", letterSpacing: "0.5px" }}>completado</span>
              </div>
            </div>
            <Footer />
          </div>
        ),
        { width: 400, height: 400 }
      );
    }

    if (type === "complete") {
      return new ImageResponse(
        (
          <div style={{ width: "400px", height: "400px", background: "#111111", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "36px", fontFamily: "Arial Black, sans-serif", position: "relative" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: "#F16823" }} />
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "4px", background: "#F16823" }} />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                <Logo />
                <div style={{ background: "#F16823", borderRadius: "6px", padding: "4px 10px", display: "flex" }}>
                  <span style={{ color: "#ffffff", fontSize: "11px", fontWeight: 700 }}>🏁 Plan completado</span>
                </div>
              </div>
              <p style={{ color: "#707070", fontSize: "12px", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "1px" }}>Lo logré</p>
              <h1 style={{ color: "#ffffff", fontSize: "36px", margin: "0 0 4px", lineHeight: 1.1 }}>{firstName}</h1>
              {race && <p style={{ color: "#F16823", fontSize: "16px", margin: 0 }}>{race}</p>}
            </div>
            <div style={{ display: "flex", gap: "16px" }}>
              <div style={{ flex: 1, background: "#1B1C1E", borderRadius: "10px", padding: "14px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <span style={{ color: "#F16823", fontSize: "28px", lineHeight: 1 }}>{weeks}</span>
                <span style={{ color: "#707070", fontSize: "10px", marginTop: "3px", textTransform: "uppercase", letterSpacing: "0.5px" }}>semanas</span>
              </div>
              <div style={{ flex: 1, background: "#1B1C1E", borderRadius: "10px", padding: "14px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <span style={{ color: "#F16823", fontSize: "28px", lineHeight: 1 }}>{totalKm}</span>
                <span style={{ color: "#707070", fontSize: "10px", marginTop: "3px", textTransform: "uppercase", letterSpacing: "0.5px" }}>km totales</span>
              </div>
              <div style={{ flex: 1, background: "#1B1C1E", borderRadius: "10px", padding: "14px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <span style={{ color: "#F16823", fontSize: "28px", lineHeight: 1 }}>🔥 {streak}</span>
                <span style={{ color: "#707070", fontSize: "10px", marginTop: "3px", textTransform: "uppercase", letterSpacing: "0.5px" }}>racha máx</span>
              </div>
            </div>
            <Footer />
          </div>
        ),
        { width: 400, height: 400 }
      );
    }

    // Default: start
    return new ImageResponse(
      (
        <div style={{ width: "400px", height: "400px", background: "#111111", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "36px", fontFamily: "Arial Black, sans-serif", position: "relative" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: "#F16823" }} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
              <Logo />
              <div style={{ background: "#F16823", borderRadius: "6px", padding: "4px 10px", display: "flex" }}>
                <span style={{ color: "#ffffff", fontSize: "11px", fontWeight: 700 }}>{trackLabel}</span>
              </div>
            </div>
            <p style={{ color: "#707070", fontSize: "12px", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "1px" }}>Empecé mi plan</p>
            <h1 style={{ color: "#ffffff", fontSize: "36px", margin: "0 0 4px", lineHeight: 1.1 }}>{firstName}</h1>
            {race && <p style={{ color: "#F16823", fontSize: "16px", margin: 0 }}>{race}</p>}
          </div>
          <div style={{ display: "flex", gap: "16px" }}>
            <div style={{ flex: 1, background: "#1B1C1E", borderRadius: "10px", padding: "14px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <span style={{ color: "#F16823", fontSize: "28px", lineHeight: 1 }}>{weeks}</span>
              <span style={{ color: "#707070", fontSize: "10px", marginTop: "3px", textTransform: "uppercase", letterSpacing: "0.5px" }}>semanas</span>
            </div>
            <div style={{ flex: 1, background: "#1B1C1E", borderRadius: "10px", padding: "14px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <span style={{ color: "#F16823", fontSize: "28px", lineHeight: 1 }}>🔥 {streak}</span>
              <span style={{ color: "#707070", fontSize: "10px", marginTop: "3px", textTransform: "uppercase", letterSpacing: "0.5px" }}>días racha</span>
            </div>
            <div style={{ flex: 1, background: "#1B1C1E", borderRadius: "10px", padding: "14px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <span style={{ color: "#F16823", fontSize: "28px", lineHeight: 1 }}>0%</span>
              <span style={{ color: "#707070", fontSize: "10px", marginTop: "3px", textTransform: "uppercase", letterSpacing: "0.5px" }}>completado</span>
            </div>
          </div>
          <Footer />
        </div>
      ),
      { width: 400, height: 400 }
    );
  } catch (e) {
    console.error("share-card error:", e);
    return new Response("Error generando imagen", { status: 500 });
  }
}
