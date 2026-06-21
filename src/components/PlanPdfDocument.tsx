import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type { PlanDay, PlanWeek, TrainingPlan } from "@/types/plan";

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

function WeekBlock({ week }: { week: PlanWeek }) {
  return (
    <View style={styles.weekContainer} wrap={false}>
      <View style={styles.weekHeader}>
        <View>
          <Text style={styles.weekTitle}>
            Semana {week.numero}: {week.nombre}
          </Text>
          <Text style={styles.weekMeta}>{week.volumen_total_km}km total</Text>
        </View>
        <WeekBadge tipo={week.tipo} />
      </View>
      {week.dias.map((day) => (
        <DayBlock key={day.dia} day={day} />
      ))}
    </View>
  );
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("es-PA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function PlanPdfDocument({
  plan,
  athleteName,
}: {
  plan: TrainingPlan;
  athleteName?: string;
}) {
  const { resumen, semanas } = plan.plan_json;
  const generatedDate = new Date(plan.generated_at).toLocaleDateString("es-PA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Document title={`Plan — ${plan.race_name}`} author="RunClub Panamá">
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.logoText}>
              RUN<Text style={{ color: ORANGE }}>CLUB</Text>{" "}
              <Text style={{ fontSize: 10, color: MID_GRAY }}>PANAMÁ</Text>
            </Text>
            <Text style={styles.logoSub}>COACH JJ · runclubpty.com</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.headerRightText}>Generado: {generatedDate}</Text>
            {athleteName ? (
              <Text style={styles.headerRightText}>{athleteName}</Text>
            ) : null}
          </View>
        </View>

        <Text style={styles.planTitle}>{resumen.titulo}</Text>
        <Text style={styles.planMeta}>
          Carrera: {plan.race_name} · {formatDate(plan.race_date)}
        </Text>
        <Text style={styles.planMeta}>
          {resumen.duracion_semanas} semanas · {resumen.dias_por_semana} días/semana
        </Text>

        <View style={styles.summaryBox}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{resumen.duracion_semanas}</Text>
            <Text style={styles.statLabel}>Semanas</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{resumen.volumen_inicial_km}</Text>
            <Text style={styles.statLabel}>Km inicial</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{resumen.volumen_pico_km}</Text>
            <Text style={styles.statLabel}>Km pico</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{resumen.dias_por_semana}</Text>
            <Text style={styles.statLabel}>Días/semana</Text>
          </View>
        </View>

        {plan.coach_note ? (
          <View style={styles.coachNote}>
            <Text style={styles.coachNoteLabel}>NOTA DE COACH JJ</Text>
            <Text style={styles.coachNoteText}>{plan.coach_note}</Text>
          </View>
        ) : null}

        {semanas.map((week) => (
          <WeekBlock key={week.numero} week={week} />
        ))}

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>RunClub Panamá · runclubpty.com</Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
}
