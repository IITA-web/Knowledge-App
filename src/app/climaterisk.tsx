import { useLanguage } from "@/context/LanguageContext";
import {
  AiIcon,
  AiIconName,
  CropPicker,
  IconLabel,
  IconTile,
  LocationPicker,
  PickerRow,
  SectionTitle,
} from "@/components/ai/AiKit";
import i18n from "@/i18n";
import {
  AiApiError,
  ClimateHorizon,
  fetchClimateRisk,
} from "@/utils/aiApi";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { useLocalSearchParams, useNavigation } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Theme (same palette as the Weather screen) ───────────────────────────────
const T = {
  bg0: "rgb(242, 242, 242)",
  bg1: "#FFFFFF",
  accent: "#D85016",
  accentDim: "rgba(216, 80, 22, 0.10)",
  accentDimBorder: "rgba(216, 80, 22, 0.25)",
  blue: "#1A6FBF",
  green: "#2E7D32",
  gold: "#B85C00",
  red: "#C0392B",
  white: "#FFFFFF",
  muted: "#7A6A60",
  mutedDark: "#B5A49A",
  text: "#2C1A10",
  textSub: "#5C4A40",
  border: "#E8E8E8",
};

const LEVEL_COLOR: any = { low: T.green, moderate: T.gold, high: T.red };
const LEVEL_ORDER: any = { high: 0, moderate: 1, low: 2 };

const RISK_ICON: Record<string, AiIconName> = {
  heat_stress: "fire",
  cold_stress: "snowflake",
  dry_spell: "cactus",
  water_deficit: "water-off-outline",
  excess_rain: "weather-pouring",
  strong_wind: "weather-windy",
};
const riskIcon = (id: string): AiIconName =>
  RISK_ICON[id] ?? (id.startsWith("disease_") ? "bacteria-outline" : "alert-outline");

const TREND_ICON: Record<string, AiIconName> = {
  increasing: "trending-up",
  decreasing: "trending-down",
};

// Risk titles come from the API in English; translate the ones we know by id.
const TRANSLATED_RISKS = new Set([
  "heat_stress", "cold_stress", "dry_spell", "water_deficit", "excess_rain",
  "strong_wind", "disease_whitefly", "disease_cbb", "disease_nlb", "disease_gls",
  "disease_faw", "disease_leafdisease", "disease_pests", "disease_rust",
  "disease_anthracnose", "disease_sigatoka", "disease_blackpod",
]);
const riskTitle = (risk: any) =>
  TRANSLATED_RISKS.has(risk.id) ? i18n.t(`climate.risk.${risk.id}`) : risk.title;

const HORIZONS: { key: ClimateHorizon; labelKey: string; subKey: string }[] = [
  { key: "short", labelKey: "climate.horizonShort", subKey: "climate.horizonShortSub" },
  { key: "seasonal", labelKey: "climate.horizonSeasonal", subKey: "climate.horizonSeasonalSub" },
  { key: "long", labelKey: "climate.horizonLong", subKey: "climate.horizonLongSub" },
];

// Languages the AI summary supports; anything else falls back to English.
const SUMMARY_LANGUAGES = ["en", "yo", "ha", "ig", "fr", "sw", "pt"];
const summaryLanguage = () => {
  const code = (i18n.locale || "en").split("-")[0].toLowerCase();
  return SUMMARY_LANGUAGES.includes(code) ? code : "en";
};

const STORAGE_KEY = "farm_locations_v1"; // shared with the Weather screen

const loadLocations = async () => {
  try {
    const r = await AsyncStorage.getItem(STORAGE_KEY);
    return r ? JSON.parse(r) : [];
  } catch {
    return [];
  }
};

const pct = (x: number) => `${Math.round((x ?? 0) * 100)}%`;

const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString(i18n.locale || "en", {
    weekday: "short",
    day: "numeric",
  });

const monthLabel = (ym: string) =>
  new Date(`${ym}-01`).toLocaleDateString(i18n.locale || "en", {
    month: "short",
  });

// ════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════════════
export default function ClimateRiskScreen() {
  const navigation = useNavigation();
  const { language } = useLanguage();
  const params = useLocalSearchParams();

  const [crop, setCrop] = useState<string>(String(params?.cropKey || "cassava"));
  const [horizon, setHorizon] = useState<ClimateHorizon>("short");
  const [locations, setLocations] = useState<any[]>([]);
  const [locIdx, setLocIdx] = useState(0);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  // ── Locations: one passed in from Weather, saved farms, or GPS ─────────────
  useEffect(() => {
    (async () => {
      const saved = await loadLocations();
      if (params?.lat && params?.lon) {
        const passed = {
          id: "passed",
          name: String(params.locName || i18n.t("weather.myFarm")),
          lat: Number(params.lat),
          lon: Number(params.lon),
        };
        const rest = saved.filter(
          (l: any) => !(l.lat === passed.lat && l.lon === passed.lon)
        );
        setLocations([passed, ...rest]);
        return;
      }
      if (saved.length) {
        setLocations(saved);
        return;
      }
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") throw new Error("denied");
        const pos = await Location.getCurrentPositionAsync({});
        setLocations([
          {
            id: "gps",
            name: i18n.t("weather.myFarm"),
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
          },
        ]);
      } catch {
        setLoading(false);
        setError(i18n.t("weather.locationRequired"));
      }
    })();
  }, []);

  const location = locations[locIdx];

  const load = async () => {
    if (!location) return;
    setLoading(true);
    setError(null);
    setData(null);
    setSummary(null);
    setSummaryError(null);
    try {
      setData(
        await fetchClimateRisk({
          lat: location.lat,
          lon: location.lon,
          crop,
          horizon,
        })
      );
    } catch (e: any) {
      setError(
        e instanceof AiApiError && e.status === 0
          ? i18n.t("climate.errorOffline")
          : i18n.t("climate.errorGeneric")
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [location?.id, location?.lat, crop, horizon]);

  const explain = async () => {
    if (!location) return;
    setSummaryLoading(true);
    setSummaryError(null);
    try {
      const res = await fetchClimateRisk({
        lat: location.lat,
        lon: location.lon,
        crop,
        horizon,
        explain: true,
        language: summaryLanguage(),
      });
      setSummary(res.summary);
    } catch (e: any) {
      setSummaryError(
        e instanceof AiApiError && e.status === 503
          ? i18n.t("climate.summaryUnavailable")
          : i18n.t("climate.errorGeneric")
      );
    }
    setSummaryLoading(false);
  };

  const risks = [...(data?.risks ?? [])].sort(
    (a: any, b: any) => LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level]
  );
  const highCount = risks.filter((r: any) => r.level === "high").length;
  const modCount = risks.filter((r: any) => r.level === "moderate").length;

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={T.bg0} />

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <View style={s.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={s.headerBackBtn}
        >
          <Ionicons name="arrow-back" size={20} color={"#000"} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>
          {language ? i18n.t("climate.screenTitle") : "Climate Risk"}
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Crop and location pickers ───────────────────────────────── */}
        <PickerRow>
          <CropPicker value={crop} onChange={setCrop} />
          <LocationPicker locations={locations} index={locIdx} setIndex={setLocIdx} />
        </PickerRow>

        {/* ── Horizon selector ─────────────────────────────────────────── */}
        <View style={s.segment}>
          {HORIZONS.map((h) => (
            <TouchableOpacity
              key={h.key}
              style={[s.segmentBtn, horizon === h.key && s.segmentBtnActive]}
              onPress={() => setHorizon(h.key)}
            >
              <Text
                style={[
                  s.segmentText,
                  horizon === h.key && s.segmentTextActive,
                ]}
              >
                {i18n.t(h.labelKey)}
              </Text>
              <Text
                style={[
                  s.segmentSub,
                  horizon === h.key && { color: "rgba(255,255,255,0.8)" },
                ]}
              >
                {i18n.t(h.subKey)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Content ──────────────────────────────────────────────────── */}
        {loading ? (
          <View style={s.center}>
            <ActivityIndicator size="large" color={T.accent} />
            <Text style={s.mutedText}>
              {i18n.t(
                horizon === "long"
                  ? "climate.loadingLong"
                  : "climate.loading"
              )}
            </Text>
          </View>
        ) : error ? (
          <View style={s.center}>
            <IconTile name="weather-partly-rainy" size={56} />
            <Text style={[s.mutedText, { textAlign: "center" }]}>{error}</Text>
            {location && (
              <TouchableOpacity style={s.primaryBtn} onPress={load}>
                <Text style={s.primaryBtnText}>{i18n.t("climate.retry")}</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : data ? (
          <>
            {/* Overview */}
            <View
              style={[
                s.overview,
                {
                  borderColor:
                    (highCount ? T.red : modCount ? T.gold : T.green) + "55",
                },
              ]}
            >
              <Text
                style={[
                  s.overviewTitle,
                  { color: highCount ? T.red : modCount ? T.gold : T.green },
                ]}
              >
                {highCount
                  ? i18n.t("climate.overviewHigh", { count: highCount })
                  : modCount
                  ? i18n.t("climate.overviewModerate", { count: modCount })
                  : i18n.t("climate.overviewLow")}
              </Text>
              <Text style={s.mutedSmall}>
                {data.horizon === "long"
                  ? i18n.t("climate.periodLong", {
                      baseline: data.period?.baseline,
                      future: data.period?.future,
                    })
                  : `${data.period?.start} → ${data.period?.end}`}
              </Text>

              {/* AI summary in the user's language */}
              {summary ? (
                <Text style={s.summaryText}>{summary}</Text>
              ) : (
                <TouchableOpacity
                  style={s.explainBtn}
                  onPress={explain}
                  disabled={summaryLoading}
                >
                  {summaryLoading ? (
                    <ActivityIndicator size="small" color={T.accent} />
                  ) : (
                    <IconLabel
                      icon="creation"
                      label={i18n.t("climate.explain")}
                      textStyle={s.explainBtnText}
                    />
                  )}
                </TouchableOpacity>
              )}
              {summaryError && (
                <Text style={[s.mutedSmall, { marginTop: 6 }]}>
                  {summaryError}
                </Text>
              )}
            </View>

            {data.horizon === "short" && <PracticeCalendar data={data} />}
            {data.horizon === "seasonal" && <SeasonalOutlook data={data} />}

            <SectionTitle icon="alert-outline">{i18n.t("climate.risksTitle")}</SectionTitle>
            {risks.map((r: any) => (
              <RiskCard key={r.id} risk={r} horizon={data.horizon} />
            ))}

            {data.horizon === "long" && <LongTermChanges data={data} />}

            <Text style={s.footnote}>
              {data.note ? `${data.note}\n\n` : ""}
              {data.source}. {data.disclaimer}
            </Text>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Risk card ────────────────────────────────────────────────────────────────
function RiskCard({ risk, horizon }: any) {
  const [open, setOpen] = useState(risk.level !== "low");
  const color = LEVEL_COLOR[risk.level];
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => setOpen(!open)}
      style={s.card}
    >
      <View style={s.cardTop}>
        <IconTile name={riskIcon(risk.id)} color={color} bg={color + "1A"} />
        <View style={{ flex: 1 }}>
          <Text style={s.cardTitle}>{riskTitle(risk)}</Text>
          <Text style={s.mutedSmall}>
            {risk.value} {risk.unit}
          </Text>
        </View>
        <View style={[s.badge, { backgroundColor: color + "1A" }]}>
          <Text style={[s.badgeText, { color }]}>
            {i18n.t(`climate.level.${risk.level}`)}
          </Text>
        </View>
      </View>

      {horizon === "seasonal" && risk.probability_moderate_or_high != null && (
        <View style={{ marginTop: 10 }}>
          <Text style={s.mutedSmall}>
            {i18n.t("climate.chanceModerateOrHigh", {
              pct: pct(risk.probability_moderate_or_high),
            })}
          </Text>
          <View style={s.barBg}>
            <View
              style={[
                s.barFill,
                {
                  width: pct(risk.probability_moderate_or_high) as any,
                  backgroundColor: color,
                },
              ]}
            />
          </View>
        </View>
      )}

      {horizon === "long" && risk.trend && (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8 }}>
          <AiIcon
            name={TREND_ICON[risk.trend] ?? "trending-neutral"}
            size={16}
            color={T.muted}
          />
          <Text style={[s.mutedSmall, { flex: 1 }]}>
            {i18n.t(`climate.trend.${risk.trend}`)} ·{" "}
            {i18n.t("climate.today")}: {risk.baseline_value} →{" "}
            {i18n.t("climate.future")}: {risk.value}
          </Text>
        </View>
      )}

      {open && (
        <>
          <Text style={s.cardText}>{risk.explanation}</Text>
          {risk.actions?.length > 0 && (
            <View style={{ marginTop: 8 }}>
              <Text style={s.actionsTitle}>{i18n.t("climate.whatToDo")}</Text>
              {risk.actions.map((a: string) => (
                <Text key={a} style={s.actionItem}>
                  • {a}
                </Text>
              ))}
            </View>
          )}
        </>
      )}
    </TouchableOpacity>
  );
}

// ─── 16-day practice calendar ─────────────────────────────────────────────────
const PRACTICES: { key: string; icon: AiIconName; labelKey: string }[] = [
  { key: "planting_ok", icon: "seed-outline", labelKey: "climate.practice.plant" },
  { key: "spraying_ok", icon: "spray-bottle", labelKey: "climate.practice.spray" },
  { key: "field_work_ok", icon: "tractor", labelKey: "climate.practice.fieldWork" },
  { key: "drying_harvest_ok", icon: "barley", labelKey: "climate.practice.harvest" },
  { key: "irrigation_needed", icon: "sprinkler-variant", labelKey: "climate.practice.irrigate" },
];

function PracticeCalendar({ data }: any) {
  const cal = data.practice_calendar ?? [];
  return (
    <View style={s.section}>
      <SectionTitle icon="calendar-month-outline">{i18n.t("climate.calendarTitle")}</SectionTitle>
      <View style={s.card}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View style={s.calRow}>
              <View style={s.calLabelCell} />
              {cal.map((d: any) => (
                <View key={d.date} style={s.calCell}>
                  <Text style={s.calDay}>{shortDate(d.date)}</Text>
                  <Text style={s.calRain}>{d.rain_mm} mm</Text>
                </View>
              ))}
            </View>
            {PRACTICES.map((p) => (
              <View key={p.key} style={s.calRow}>
                <View style={s.calLabelCell}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                    <AiIcon name={p.icon} size={14} />
                    <Text style={[s.calLabel, { flexShrink: 1 }]}>{i18n.t(p.labelKey)}</Text>
                  </View>
                </View>
                {cal.map((d: any) => (
                  <View key={d.date} style={s.calCell}>
                    <View
                      style={[
                        s.calDot,
                        d[p.key] && {
                          backgroundColor:
                            p.key === "irrigation_needed" ? T.blue : T.green,
                        },
                      ]}
                    />
                  </View>
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
        <Text style={[s.mutedSmall, { marginTop: 8 }]}>
          {i18n.t("climate.calendarLegend")}
        </Text>
      </View>
    </View>
  );
}

// ─── Seasonal outlook ─────────────────────────────────────────────────────────
function SeasonalOutlook({ data }: any) {
  const o = data.rainfall_outlook;
  const monthly = data.monthly ?? [];
  const onset = data.rainfall_onset;
  const maxRain = Math.max(
    1,
    ...monthly.map((m: any) => Math.max(m.rain_mm, m.normal_rain_mm))
  );
  return (
    <View style={s.section}>
      <SectionTitle icon="weather-rainy">{i18n.t("climate.outlookTitle")}</SectionTitle>
      {o && (
        <View style={s.card}>
          <Text style={s.cardText}>
            {i18n.t("climate.outlookText", {
              forecast: o.forecast_rain_mm_median,
              normal: o.normal_rain_mm,
              years: o.climatology_years,
            })}
          </Text>
          <View style={s.tercile}>
            {[
              ["probability_below_normal", T.gold, "climate.below"],
              ["probability_near_normal", T.mutedDark, "climate.near"],
              ["probability_above_normal", T.blue, "climate.above"],
            ].map(([k, color, label]) => (
              <View
                key={k}
                style={{
                  flex: Math.max(o[k], 0.02),
                  backgroundColor: color,
                  paddingVertical: 6,
                  alignItems: "center",
                }}
              >
                <Text style={s.tercileText} numberOfLines={1}>
                  {pct(o[k])}
                </Text>
              </View>
            ))}
          </View>
          <View style={s.legendRow}>
            <Text style={[s.mutedSmall, { color: T.gold }]}>
              ■ {i18n.t("climate.below")}
            </Text>
            <Text style={s.mutedSmall}>■ {i18n.t("climate.near")}</Text>
            <Text style={[s.mutedSmall, { color: T.blue }]}>
              ■ {i18n.t("climate.above")}
            </Text>
          </View>
          {o.temperature_anomaly_c != null && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginTop: 8 }}>
              <AiIcon name="thermometer" size={14} color={T.muted} />
              <Text style={[s.mutedSmall, { flex: 1 }]}>
                {i18n.t("climate.tempAnomaly", {
                  value: `${o.temperature_anomaly_c > 0 ? "+" : ""}${o.temperature_anomaly_c}`,
                })}
              </Text>
            </View>
          )}
        </View>
      )}

      {monthly.length > 0 && (
        <View style={s.card}>
          <Text style={s.actionsTitle}>{i18n.t("climate.monthlyRain")}</Text>
          <View style={s.monthRow}>
            {monthly.map((m: any) => (
              <View key={m.month} style={s.monthCol}>
                <View style={s.monthBars}>
                  <View
                    style={[
                      s.monthBar,
                      {
                        height: (m.rain_mm / maxRain) * 80,
                        backgroundColor: T.blue,
                      },
                    ]}
                  />
                  <View
                    style={[
                      s.monthBar,
                      {
                        height: (m.normal_rain_mm / maxRain) * 80,
                        backgroundColor: T.mutedDark,
                      },
                    ]}
                  />
                </View>
                <Text style={s.calDay}>{monthLabel(m.month)}</Text>
                <Text style={s.calRain}>{m.rain_mm}</Text>
              </View>
            ))}
          </View>
          <View style={s.legendRow}>
            <Text style={[s.mutedSmall, { color: T.blue }]}>
              ■ {i18n.t("climate.forecast")} (mm)
            </Text>
            <Text style={s.mutedSmall}>■ {i18n.t("climate.normal")}</Text>
          </View>
        </View>
      )}

      {onset && (
        <View style={s.card}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 4 }}>
            <AiIcon name="sprout-outline" size={14} />
            <Text style={[s.actionsTitle, { marginBottom: 0 }]}>{i18n.t("climate.onsetTitle")}</Text>
          </View>
          <Text style={s.cardText}>
            {onset.median_date
              ? i18n.t("climate.onsetText", {
                  date: new Date(onset.median_date).toLocaleDateString(
                    i18n.locale || "en",
                    { day: "numeric", month: "long" }
                  ),
                  members: onset.members_with_onset,
                })
              : i18n.t("climate.onsetNone")}
          </Text>
        </View>
      )}
      {data.coverage_note && (
        <Text style={s.mutedSmall}>{data.coverage_note}</Text>
      )}
    </View>
  );
}

// ─── Long-term changes ────────────────────────────────────────────────────────
const METRIC_KEY: any = {
  mean_tmax_c: "climate.metric.tmax",
  mean_tmin_c: "climate.metric.tmin",
  heat_stress_days: "climate.metric.heatDays",
  rain_total_mm: "climate.metric.rain",
  rainy_days: "climate.metric.rainyDays",
  longest_dry_spell_days: "climate.metric.drySpell",
  heavy_rain_days: "climate.metric.heavyRainDays",
  max_3day_rain_mm: "climate.metric.max3day",
  et0_total_mm: "climate.metric.et0",
};

function LongTermChanges({ data }: any) {
  return (
    <View style={s.section}>
      <SectionTitle icon="chart-line">{i18n.t("climate.changesTitle")}</SectionTitle>
      <View style={s.card}>
        {(data.changes ?? []).map((c: any) => {
          const delta =
            c.change_percent != null
              ? `${c.change_percent > 0 ? "+" : ""}${c.change_percent}%`
              : `${c.change > 0 ? "+" : ""}${c.change}`;
          return (
            <View key={c.metric} style={s.changeRow}>
              <Text style={[s.cardText, { flex: 1, marginTop: 0 }]}>
                {METRIC_KEY[c.metric] ? i18n.t(METRIC_KEY[c.metric]) : c.metric}
              </Text>
              <Text style={s.changeValues}>
                {c.baseline} → {c.future}
              </Text>
              <Text style={s.changeDelta}>{delta}</Text>
              <Text style={s.changeAgree}>
                {Math.round(c.model_agreement * (data.climate_models?.length ?? 3))}/
                {data.climate_models?.length ?? 3}
              </Text>
            </View>
          );
        })}
        <Text style={[s.mutedSmall, { marginTop: 8 }]}>
          {i18n.t("climate.agreementLegend")}
        </Text>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bg0 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: T.border,
    backgroundColor: T.bg0,
    gap: 12,
  },
  headerBackBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: T.bg1,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },
  headerTitle: {
    flex: 1,
    color: T.text,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.3,
  },


  segment: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: T.bg1,
    borderRadius: 14,
    padding: 4,
    gap: 4,
  },
  segmentBtn: { flex: 1, paddingVertical: 9, borderRadius: 10, alignItems: "center" },
  segmentBtnActive: { backgroundColor: T.accent },
  segmentText: { color: T.text, fontSize: 13, fontWeight: "700" },
  segmentTextActive: { color: T.white },
  segmentSub: { color: T.muted, fontSize: 10, marginTop: 2 },

  center: { alignItems: "center", justifyContent: "center", padding: 40, gap: 10 },
  mutedText: { color: T.muted, fontSize: 14, marginTop: 6 },
  mutedSmall: { color: T.muted, fontSize: 12, lineHeight: 17 },
  primaryBtn: {
    marginTop: 10,
    backgroundColor: T.accent,
    paddingHorizontal: 24,
    paddingVertical: 11,
    borderRadius: 12,
  },
  primaryBtnText: { color: T.white, fontWeight: "700", fontSize: 14 },

  overview: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: T.bg1,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  overviewTitle: { fontSize: 16, fontWeight: "800", marginBottom: 4 },
  summaryText: { color: T.textSub, fontSize: 14, lineHeight: 21, marginTop: 10 },
  explainBtn: {
    marginTop: 12,
    alignSelf: "flex-start",
    backgroundColor: T.accentDim,
    borderColor: T.accentDimBorder,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    minWidth: 120,
    alignItems: "center",
  },
  explainBtnText: { color: T.accent, fontWeight: "700", fontSize: 13 },

  section: { marginBottom: 4 },
  sectionTitle: {
    color: T.text,
    fontSize: 14,
    fontWeight: "700",
    marginHorizontal: 16,
    marginBottom: 10,
    marginTop: 4,
    letterSpacing: 0.3,
  },

  card: {
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: T.bg1,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(216,80,22,0.10)",
  },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  cardIcon: { fontSize: 24, width: 32 },
  cardTitle: { color: T.text, fontSize: 14, fontWeight: "700" },
  cardText: { color: T.textSub, fontSize: 13, lineHeight: 19, marginTop: 8 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  badgeText: { fontSize: 11, fontWeight: "800", textTransform: "uppercase" },
  actionsTitle: { color: T.text, fontSize: 12, fontWeight: "700", marginBottom: 4 },
  actionItem: { color: T.textSub, fontSize: 13, lineHeight: 19 },

  barBg: {
    height: 6,
    backgroundColor: "rgba(0,0,0,0.06)",
    borderRadius: 3,
    marginTop: 4,
    overflow: "hidden",
  },
  barFill: { height: 6, borderRadius: 3 },

  calRow: { flexDirection: "row", alignItems: "center" },
  calLabelCell: { width: 110, paddingVertical: 6 },
  calLabel: { color: T.text, fontSize: 12 },
  calCell: { width: 44, alignItems: "center", paddingVertical: 6 },
  calDay: { color: T.text, fontSize: 10, fontWeight: "600" },
  calRain: { color: T.blue, fontSize: 9, marginTop: 1 },
  calDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "rgba(0,0,0,0.07)",
  },

  tercile: {
    flexDirection: "row",
    borderRadius: 8,
    overflow: "hidden",
    marginTop: 12,
  },
  tercileText: { color: T.white, fontSize: 11, fontWeight: "700" },
  legendRow: { flexDirection: "row", gap: 14, marginTop: 6, flexWrap: "wrap" },

  monthRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  monthCol: { alignItems: "center", flex: 1 },
  monthBars: { flexDirection: "row", alignItems: "flex-end", height: 84, gap: 2 },
  monthBar: { width: 9, borderRadius: 3, minHeight: 2 },

  changeRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: T.border,
    gap: 8,
  },
  changeValues: { color: T.muted, fontSize: 12, minWidth: 78, textAlign: "right" },
  changeDelta: { color: T.accent, fontSize: 12, fontWeight: "700", minWidth: 52, textAlign: "right" },
  changeAgree: { color: T.muted, fontSize: 11, minWidth: 26, textAlign: "right" },

  footnote: {
    color: T.mutedDark,
    fontSize: 11,
    lineHeight: 16,
    marginHorizontal: 16,
    marginTop: 12,
  },
});
