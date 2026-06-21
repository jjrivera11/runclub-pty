import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { renderToBuffer, Document, Page, Text, View, StyleSheet, Svg, Path } from "@react-pdf/renderer";
import type { TrainingPlan, PlanWeek, PlanDay } from "@/types/plan";

const ORANGE = "#F16823";
const BLACK = "#111111";
const DARK_GRAY = "#333333";
const MID_GRAY = "#666666";
const LIGHT_GRAY = "#999999";
const BORDER = "#e0e0e0";
const WHITE = "#ffffff";
const ACCENT_BG = "#fff7f3";

const styles = StyleSheet.create({
  page: {
    backgroundColor: WHITE,
    padding: 36,
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: ORANGE,
  },
  headerLeft: {
    flexDirection: "column",
  },
  logoText: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: BLACK,
    letterSpacing: 1,
  },
  logoSub: {
    fontSize: 7,
    color: MID_GRAY,
    letterSpacing: 1,
    marginTop: 1,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  headerRightText: {
    fontSize: 8,
    color: MID_GRAY,
    marginBottom: 1,
  },
  planTitle: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: BLACK,
    marginBottom: 3,
  },
  planMeta: {
    fontSize: 8,
    color: MID_GRAY,
    marginBottom: 2,
  },
  summaryBox: {
    backgroundColor: ACCENT_BG,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 12,
    marginBottom: 16,
    flexDirection: "row",
    gap: 12,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: ORANGE,
  },
  statLabel: {
    fontSize: 6,
    color: MID_GRAY,
    marginTop: 2,
    textAlign: "center",
  },
  weekContainer: {
    marginBottom: 14,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 6,
    overflow: "hidden",
  },
  weekHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: ACCENT_BG,
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  weekTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: BLACK,
  },
  weekMeta: {
    fontSize: 7,
    color: MID_GRAY,
    marginTop: 1,
  },
  dayRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    paddingVertical: 5,
    paddingHorizontal: 8,
    gap: 8,
    alignItems: "flex-start",
  },
  dayName: {
    width: 58,
    fontSize: 7,
    color: MID_GRAY,
    fontFamily: "Helvetica-Bold",
    paddingTop: 1,
  },
  dayTitle: {
    flex: 1,
    fontSize: 8,
    color: BLACK,
    fontFamily: "Helvetica-Bold",
  },
  dayType: {
    fontSize: 6,
    color: MID_GRAY,
    marginTop: 1,
  },
  dayMeta: {
    width: 70,
    fontSize: 7,
    color: ORANGE,
    textAlign: "right",
    fontFamily: "Helvetica-Bold",
    paddingTop: 1,
  },
  dayDesc: {
    fontSize: 6.5,
    color: DARK_GRAY,
    marginTop: 2,
    lineHeight: 1.4,
    paddingLeft: 66,
    paddingRight: 8,
    paddingBottom: 4,
  },
  localNote: {
    fontSize: 6,
    color: ORANGE,
    paddingLeft: 66,
    paddingRight: 8,
    paddingBottom: 5,
    fontFamily: "Helvetica-Oblique",
  },
  restDay: {
    opacity: 0.35,
  },
  coachNote: {
    borderLeftWidth: 3,
    borderLeftColor: ORANGE,
    backgroundColor: ACCENT_BG,
    padding: 8,
    marginBottom: 14,
    borderRadius: 4,
  },
  coachNoteLabel: {
    fontSize: 7,
    color: ORANGE,
    fontFamily: "Helvetica-Bold",
    marginBottom: 3,
  },
  coachNoteText: {
    fontSize: 7.5,
    color: DARK_GRAY,
    lineHeight: 1.5,
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 36,
    right: 36,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingTop: 6,
  },
  footerText: {
    fontSize: 6.5,
    color: LIGHT_GRAY,
  },
});

const WEEK_BADGE_COLORS: Record<string, { bg: string; text: string }> = {
  base: { bg: "#f3f4f6", text: "#374151" },
  construccion: { bg: "#eff6ff", text: "#1e40af" },
  pico: { bg: "#fff7ed", text: "#c2410c" },
  recuperacion: { bg: "#f0fdf4", text: "#166534" },
  tapering: { bg: "#faf5ff", text: "#6b21a8" },
};

function WeekBadge({ tipo }: { tipo: string }) {
  const colors = WEEK_BADGE_COLORS[tipo] ?? WEEK_BADGE_COLORS.base;
  return (
    <View style={{ backgroundColor: colors.bg, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: colors.text + "40" }}>
      <Text style={{ fontSize: 6.5, color: colors.text, fontFamily: "Helvetica-Bold", textTransform: "capitalize" }}>{tipo}</Text>
    </View>
  );
}

function DayBlock({ day }: { day: PlanDay }) {
  const isRest = day.tipo_sesion === "Descanso" || day.tipo_sesion === "Descanso activo";
  const meta = [
    day.distancia_km ? `${day.distancia_km}km` : null,
    day.duracion_min ? `${day.duracion_min}min` : null,
  ].filter(Boolean).join(" · ");

  return (
    <View style={isRest ? styles.restDay : {}}>
      <View style={styles.dayRow}>
        <Text style={styles.dayName}>{day.dia}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.dayTitle}>{day.titulo}</Text>
          <Text style={styles.dayType}>{day.tipo_sesion}</Text>
        </View>
        <Text style={styles.dayMeta}>{meta}</Text>
      </View>
      {!isRest && day.descripcion && (
        <Text style={styles.dayDesc}>{day.descripcion}</Text>
      )}
      {day.notas_locales && (
        <Text style={styles.localNote}>📍 {day.notas_locales}</Text>
      )}
    </View>
  );
}

function PlanDocument({ plan, userName, semanasGeneradas }: { plan: TrainingPlan; userName: string; semanasGeneradas: number }) {
  const semanas = plan.plan_json.semanas.slice(0, semanasGeneradas);
  const resumen = plan.plan_json.resumen;
  const totalKm = semanas.reduce((acc, w) => acc + (w.volumen_total_km ?? 0), 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={{ alignItems: "center" }}>
              <Svg width="24" height="32" viewBox="0 0 261 345">
                <Path d="M24.062 344.035C19.1167 342.881 15.3884 339.412 12.877 333.629C11.0977 329.539 9.90069 324.227 9.28603 317.693L0.575027 235.226C-0.89164 222.978 0.44736 213.178 4.59203 205.827C8.73669 198.476 16.249 192.664 27.129 188.39C33.729 185.785 39.286 184.639 43.836 184.894L29.581 69.9961C29.5748 69.8112 29.6245 69.6285 29.7241 69.4698C29.8237 69.311 29.9691 69.1827 30.143 69.1003L55.7 59.2637C62.7667 56.5411 68.516 55.4032 72.948 55.85C77.38 56.2968 80.6467 59.0013 82.748 63.9635C83.352 65.4102 83.8293 66.9019 84.175 68.4234C84.5714 70.1905 84.8612 71.9777 85.043 73.7763L86.776 87.5425C86.9702 89.2953 87.032 91.059 86.961 92.8202C86.8889 94.7366 86.6002 96.6401 86.1 98.4976C85.5761 100.439 84.761 102.299 83.68 104.019C82.5405 105.832 81.0665 107.435 79.329 108.749C84.0217 108.643 87.4607 111.168 89.646 116.324C91.0642 120.043 91.9586 123.924 92.306 127.866L95.484 152.959C95.824 156.112 96.1327 158.456 96.41 159.99C96.5941 161.171 96.9002 162.332 97.324 163.456C97.5516 163.893 97.8477 164.295 98.202 164.647C98.702 165.243 98.581 165.694 97.831 165.98L88.406 169.607L100.628 285.976L124.164 276.719C125.048 276.369 125.52 276.608 125.582 277.425L128.382 303.833C128.335 304.411 128.125 304.779 127.744 304.925L79.353 323.974C78.464 324.319 77.988 324.083 77.929 323.256L62.833 179.442L47.323 185.411C52.2057 186.674 55.9037 190.188 58.417 195.954C60.0937 199.81 61.3007 204.976 62.038 211.453L64.274 231.946C64.228 232.525 64.017 232.898 63.638 233.04L40.1 242.307C39.215 242.657 38.737 242.422 38.68 241.599L36.172 219.952C36.094 219.354 35.9835 218.761 35.841 218.174C35.6714 217.73 35.3893 217.332 35.0196 217.017C34.65 216.701 34.2043 216.477 33.722 216.365C32.7186 216.121 31.6584 216.204 30.71 216.6C28.9782 217.261 27.5795 218.53 26.803 220.145C25.975 221.815 25.758 224.467 26.161 228.123L34.311 305.735C34.5292 307.579 34.9464 309.398 35.556 311.161C36.396 313.087 37.9537 313.602 40.229 312.705C41.5471 312.172 42.7144 311.35 43.636 310.307C43.7293 310.136 43.875 309.997 44.0537 309.908C44.2324 309.818 44.4356 309.783 44.636 309.806C45.029 309.864 45.271 310.159 45.353 310.691L48.93 337.847C48.882 338.426 48.673 338.793 48.296 338.945C47.916 339.097 47.5483 339.276 47.196 339.481C46.8471 339.691 46.479 339.872 46.096 340.019L43.814 340.916C37.7554 343.304 32.586 344.497 28.306 344.495C26.8771 344.505 25.4521 344.35 24.062 344.035ZM58.424 81.9841L54.085 83.6547L65.422 176.28L75.949 172.134C75.789 171.754 75.634 171.39 75.476 171.014C75.3247 170.674 75.2059 170.321 75.121 169.961C75.0366 169.526 75.003 169.083 75.021 168.641L74.921 168.846L69.83 129.549C69.7274 128.976 69.5535 128.417 69.312 127.883C68.612 126.227 67.089 125.742 64.756 126.408C64.113 126.656 63.771 126.447 63.741 125.782L60.182 105.077C60.021 104.696 60.204 104.391 60.74 104.186C61.5852 103.893 62.3512 103.424 62.9823 102.814C63.6133 102.204 64.0936 101.468 64.388 100.659C64.9974 99.0117 65.0347 95.7998 64.5 91.0229C64.2933 88.4018 63.7602 85.8134 62.912 83.312C62.7519 82.7992 62.4203 82.3501 61.9676 82.0329C61.515 81.7158 60.966 81.5479 60.404 81.5547C59.7214 81.5773 59.0496 81.723 58.424 81.9841ZM144.379 297.426C139.17 296.861 135.206 293.447 132.488 287.185C131.513 284.868 130.768 282.468 130.265 280.019C129.615 276.917 129.145 273.783 128.858 270.632L117.135 160.141C114.694 160.666 112.184 160.838 109.69 160.649C105.331 160.233 102.08 157.495 99.935 152.434C99.1675 150.559 98.5938 148.618 98.222 146.638C97.7402 144.125 97.4123 141.587 97.24 139.038L89.531 46.9197C89.5261 46.7354 89.5762 46.5536 89.6755 46.3954C89.7748 46.2372 89.9192 46.109 90.092 46.0258L110.026 38.355C110.769 38.0694 111.167 38.2598 111.201 38.9214L118.501 127.461C118.58 129.509 118.939 131.539 119.567 133.499C119.981 134.473 120.516 135.002 121.173 135.088C122.127 135.12 123.075 134.93 123.934 134.533C124.745 134.267 125.491 133.846 126.125 133.296C126.759 132.745 127.269 132.078 127.622 131.333C128.257 129.901 128.443 127.255 128.178 123.394L120.878 34.8622C120.871 34.6784 120.92 34.4965 121.019 34.3382C121.117 34.1799 121.261 34.0519 121.434 33.9693L141.364 26.2975C142.117 26.0094 142.511 26.1975 142.546 26.862L150.246 118.982C150.673 123.838 150.489 128.725 149.697 133.539C149.071 137.288 147.674 140.883 145.587 144.118C144.675 145.478 143.625 146.749 142.454 147.915L153.854 256.564C154.019 259.099 154.511 261.605 155.321 264.025C155.84 265.231 156.497 265.891 157.291 266.007C158.421 266.057 159.545 265.831 160.557 265.35C161.524 265.021 162.407 264.502 163.149 263.827C163.891 263.152 164.476 262.336 164.865 261.432C165.574 259.674 165.711 256.412 165.276 251.645L153.806 142.336C153.789 142.114 153.84 141.892 153.952 141.697C154.065 141.502 154.234 141.342 154.44 141.237L156.94 140.255L147.4 24.6535C147.392 24.4694 147.441 24.2872 147.539 24.1287C147.638 23.9702 147.782 23.842 147.955 23.7596L173.348 13.9868C173.447 13.9293 173.559 13.8945 173.674 13.8852C173.79 13.8758 173.906 13.8921 174.014 13.9328C174.122 13.9735 174.218 14.0375 174.296 14.1197C174.373 14.2019 174.429 14.3001 174.46 14.4066L196.244 84.6362L190 8.26172C189.992 8.078 190.04 7.896 190.137 7.73713C190.234 7.57827 190.377 7.44916 190.549 7.36498L209.357 0.130115C210.105 -0.15801 210.497 0.0323808 210.532 0.701289L220 115.436L220.105 115.391C227.195 112.599 232.946 111.852 237.359 113.15C241.772 114.449 245.105 117.685 247.359 122.86C248.168 124.742 248.791 126.691 249.221 128.683C249.679 130.761 250.089 133.068 250.451 135.605L251.707 148.226C252.403 153.661 252.129 159.169 250.897 164.518C249.522 170.249 246.424 175.475 241.982 179.559C248.205 179.226 252.653 182.129 255.324 188.267C256.016 189.877 256.553 191.543 256.928 193.245C257.358 195.253 257.68 197.281 257.895 199.32L260.027 221.12C261.041 231.296 259.808 239.714 256.327 246.375C252.846 253.035 246.364 258.232 236.88 261.967L201.766 275.784C200.879 276.135 200.403 275.899 200.35 275.074L189.619 186.419C189.603 186.198 189.655 185.976 189.768 185.782C189.88 185.587 190.049 185.427 190.254 185.321L221.274 173.326C222.312 172.936 223.272 172.378 224.112 171.678C224.936 170.922 225.519 169.96 225.794 168.903C226.201 167.412 226.394 165.875 226.366 164.334C226.341 161.931 226.154 159.532 225.807 157.151C226.442 155.578 226.475 153.843 225.899 152.249C225.79 152.006 225.653 151.776 225.489 151.563C225.323 151.352 225.185 151.123 225.079 150.879C225.05 150.211 224.915 149.551 224.679 148.921C224.419 148.318 224.179 147.779 223.979 147.295C223.407 145.972 222.74 145.212 221.986 145.01C220.883 144.861 219.758 145.045 218.77 145.537L218.008 145.836C217.622 145.977 217.228 146.096 216.827 146.192C216.305 146.332 215.101 146.732 213.241 147.392C211.381 148.052 208.548 149.131 204.754 150.629C201.087 152.074 195.9 154.116 189.193 156.756C188.687 156.955 185.211 158.679 182.3 159.978L191.463 246.415C192.122 252.389 192.055 258.415 191.263 264.374C190.646 268.953 189.094 273.373 186.695 277.385C184.395 281.059 181.3 284.224 177.615 286.671C173.411 289.432 168.899 291.741 164.16 293.554C157.386 296.22 151.61 297.553 146.831 297.553C146.012 297.554 145.193 297.512 144.379 297.426ZM224.1 201.834L219.353 203.701L223.047 237.794L227.221 236.147C228.545 235.657 229.789 234.99 230.915 234.166C231.94 233.321 232.654 232.187 232.954 230.929C233.422 229.049 233.63 227.118 233.574 225.187C233.568 222.795 233.377 219.626 233 215.68L233.077 215.86C232.656 212.507 232.249 209.778 231.856 207.673C231.591 206.043 231.156 204.442 230.556 202.894C229.976 201.572 229.199 200.884 228.221 200.85C228.169 200.85 228.121 200.85 228.063 200.85C226.69 200.945 225.347 201.279 224.1 201.834ZM177.59 132.129L177.978 131.979C178 131.969 178.017 131.97 178.037 131.962L192.791 126.155L171.553 59.495L177.59 132.129Z" fill="#111111"/>
              </Svg>
              <Text style={{ fontSize: 8, color: MID_GRAY, marginTop: 2, textAlign: "center" }}>Panamá</Text>
              <Text style={{ fontSize: 7, color: MID_GRAY, marginTop: 1, textAlign: "center" }}>www.runclubpty.com</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.headerRightText}>{userName}</Text>
            <Text style={styles.headerRightText}>Generado: {new Date().toLocaleDateString("es-PA")}</Text>
          </View>
        </View>

        {/* Plan title */}
        <Text style={styles.planTitle}>{resumen.titulo}</Text>
        <Text style={styles.planMeta}>Carrera objetivo: {plan.race_name} — {plan.race_date}</Text>
        <Text style={[styles.planMeta, { marginBottom: 16 }]}>
          Mostrando semanas 1–{semanasGeneradas} de {plan.total_weeks} totales
        </Text>

        {/* Stats */}
        <View style={styles.summaryBox}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{plan.total_weeks}</Text>
            <Text style={styles.statLabel}>SEMANAS TOTALES</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{semanasGeneradas}</Text>
            <Text style={styles.statLabel}>SEMANAS EN ESTE PDF</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{totalKm.toFixed(0)}</Text>
            <Text style={styles.statLabel}>KM TOTALES</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{resumen.dias_por_semana}</Text>
            <Text style={styles.statLabel}>DÍAS/SEMANA</Text>
          </View>
        </View>

        {/* Coach note */}
        {plan.coach_note && (
          <View style={styles.coachNote}>
            <Text style={styles.coachNoteLabel}>🏃 Nota de Coach JJ</Text>
            <Text style={styles.coachNoteText}>{plan.coach_note}</Text>
          </View>
        )}

        {/* Weeks */}
        {semanas.map((week: PlanWeek) => (
          <View key={week.numero} style={styles.weekContainer} wrap={false}>
            <View style={styles.weekHeader}>
              <View>
                <Text style={styles.weekTitle}>Semana {week.numero} — {week.nombre}</Text>
                <Text style={styles.weekMeta}>{week.volumen_total_km} km totales</Text>
              </View>
              <WeekBadge tipo={week.tipo} />
            </View>
            {week.dias.map((day: PlanDay) => (
              <DayBlock key={day.dia} day={day} />
            ))}
          </View>
        ))}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>RunClub Panamá — runclubpty.com</Text>
          <Text style={styles.footerText}>Plan generado por Coach JJ IA</Text>
        </View>
      </Page>
    </Document>
  );
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { data: plan } = await supabase
      .from("training_plans")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .maybeSingle();

    if (!plan) return NextResponse.json({ error: "No se encontró el plan" }, { status: 404 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    const activePlan = plan as TrainingPlan;
    const semanasGeneradas = activePlan.semanas_generadas ?? activePlan.plan_json.semanas.length;

    const pdfStream = await renderToBuffer(
      <PlanDocument
        plan={activePlan}
        userName={profile?.full_name ?? "Atleta"}
        semanasGeneradas={semanasGeneradas}
      />
    );

    return new NextResponse(pdfStream.buffer as ArrayBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="plan-runclub-${new Date().toISOString().split("T")[0]}.pdf"`,
      },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("export-pdf error:", msg);
    return NextResponse.json({ error: "No se pudo generar el PDF.", detail: msg }, { status: 500 });
  }
}
