import {
  AiIcon,
  AiIconName,
  AiHeader,
  CropPicker,
  Dropdown,
  ErrorState,
  errorDetail,
  errorText,
  IconTile,
  k,
  Loading,
  LocationPicker,
  PickerRow,
  PrimaryButton,
  SectionTitle,
  T,
  useFarmLocations,
} from "@/components/ai/AiKit";
import { useLanguage } from "@/context/LanguageContext";
import i18n from "@/i18n";
import { AiApiError, apiCrop, fetchYieldModel, predictYield, YieldWeather } from "@/utils/aiApi";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// API docs: crop_yield_api.md (GET /v1/yield/model, POST /v1/yield/predict). The weather
// and soil model at /v1/yield/weather/* takes the same request and returns the same shape.

// Planting month options: this month and the next 11 (1st of each month).
const plantingMonths = () => {
  const now = new Date();
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
    return {
      iso,
      label: d.toLocaleDateString(i18n.locale || "en", { month: "long", year: "numeric" }),
    };
  });
};

const WEATHER_MODES: { value: YieldWeather; icon: AiIconName }[] = [
  { value: "auto", icon: "auto-fix" },
  { value: "seasonal", icon: "weather-partly-rainy" },
  { value: "climatology", icon: "history" },
  { value: "year", icon: "calendar-search" },
];

// Past years for weather="year": last year back 15 years.
const PAST_YEARS = Array.from({ length: 15 }, (_, i) => new Date().getFullYear() - 1 - i);

// inputs_median keys the screen knows how to label; other keys are shown as sent.
type InputSpec = { key: string; labelKey: string; unit?: string; unitKey?: string; digits: number; icon: AiIconName };
const WEATHER_INPUTS: InputSpec[] = [
  { key: "rain_total_mm", labelKey: "ai.yield.input.rain_total_mm", unit: "mm", digits: 0, icon: "weather-rainy" },
  { key: "rainy_days", labelKey: "ai.yield.input.rainy_days", unitKey: "ai.yield.days", digits: 0, icon: "calendar-blank-outline" },
  { key: "longest_dry_spell_days", labelKey: "ai.yield.input.longest_dry_spell_days", unitKey: "ai.yield.days", digits: 0, icon: "cactus" },
  { key: "heavy_rain_days", labelKey: "ai.yield.input.heavy_rain_days", unitKey: "ai.yield.days", digits: 0, icon: "weather-pouring" },
  { key: "heat_stress_days", labelKey: "ai.yield.input.heat_stress_days", unitKey: "ai.yield.days", digits: 0, icon: "fire" },
  { key: "mean_tmax_c", labelKey: "ai.yield.input.mean_tmax_c", unit: "°C", digits: 1, icon: "thermometer-chevron-up" },
  { key: "mean_tmin_c", labelKey: "ai.yield.input.mean_tmin_c", unit: "°C", digits: 1, icon: "thermometer-chevron-down" },
  { key: "et0_total_mm", labelKey: "ai.yield.input.et0_total_mm", unit: "mm", digits: 0, icon: "water-outline" },
  { key: "water_balance_mm", labelKey: "ai.yield.input.water_balance_mm", unit: "mm", digits: 0, icon: "scale-balance" },
];
const SOIL_INPUTS: InputSpec[] = [
  { key: "ph", labelKey: "ai.soil.ph", digits: 1, icon: "test-tube" },
  { key: "organic_carbon_g_kg", labelKey: "ai.soil.organicCarbon", unit: "g/kg", digits: 1, icon: "leaf-maple" },
  { key: "nitrogen_g_kg", labelKey: "ai.soil.nitrogen", unit: "g/kg", digits: 2, icon: "sprout" },
  { key: "cec_cmol_kg", labelKey: "ai.soil.cec", unit: "cmol/kg", digits: 1, icon: "magnet" },
  { key: "clay_pct", labelKey: "ai.soil.clay", unit: "%", digits: 0, icon: "texture-box" },
  { key: "sand_pct", labelKey: "ai.soil.sand", unit: "%", digits: 0, icon: "grain" },
];
const KNOWN_INPUTS = new Set([...WEATHER_INPUTS, ...SOIL_INPUTS].map((i) => i.key).concat("latitude", "longitude"));

const formatDate = (iso?: string) =>
  iso
    ? new Date(`${iso}T00:00:00`).toLocaleDateString(i18n.locale || "en", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "—";

export default function YieldPredictionScreen() {
  const params = useLocalSearchParams();
  const { language } = useLanguage();
  const { locations, location, index, setIndex, error: locError } = useFarmLocations();

  const [model, setModel] = useState<any>(null);
  const [modelError, setModelError] = useState<any>(null);
  const [crop, setCrop] = useState(String(params?.cropKey || "maize"));
  const [planting, setPlanting] = useState<string | undefined>(undefined);
  const [weather, setWeather] = useState<YieldWeather>("auto");
  const [year, setYear] = useState(PAST_YEARS[0]);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [errorMode, setErrorMode] = useState<YieldWeather>("auto");

  const months = plantingMonths();

  const loadModel = () => {
    setModelError(null);
    fetchYieldModel()
      .then((m) => {
        setModel(m);
        const crops: string[] = m.crops ?? [];
        if (crops.length && !crops.includes(apiCrop(crop))) {
          setCrop(crops[0] === "banana" ? "banana_plantain" : crops[0]);
        }
      })
      .catch(setModelError);
  };
  useEffect(loadModel, []);

  // The model's crop list is authoritative for this deployment.
  const trained = (key: string) => !!model?.crops?.includes(apiCrop(key));

  const clear = () => {
    setResult(null);
    setError(null);
  };

  const predict = async (mode: YieldWeather = weather) => {
    if (!location) return;
    setLoading(true);
    clear();
    setErrorMode(mode);
    try {
      setResult(
        await predictYield(model.engine, {
          crop,
          lat: location.lat,
          lon: location.lon,
          planting_date: planting,
          weather: mode,
          year: mode === "year" ? year : undefined,
        })
      );
    } catch (e) {
      setError(e);
    }
    setLoading(false);
  };

  const usePastClimate = () => {
    setWeather("climatology");
    predict("climatology");
  };

  const y = result?.yield_t_ha;
  const maxBar = y ? Math.max(y.p90, 0.1) * 1.15 : 1;
  const singleScenario = y && (result.scenarios === 1 || y.p10 === y.p90);
  const inputs = result?.inputs_median ?? {};
  const otherInputs = Object.keys(inputs).filter(
    (key) => !KNOWN_INPUTS.has(key) && typeof inputs[key] === "number"
  );
  const mae = model?.metrics?.mae_t_ha;

  return (
    <SafeAreaView style={k.root}>
      <StatusBar barStyle="dark-content" backgroundColor={T.bg0} />
      <AiHeader titleKey="ai.yield.title" />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={k.intro}>{language && i18n.t("ai.yield.intro")}</Text>

        {modelError ? (
          <ErrorState icon="chart-line" error={errorText(modelError)} onRetry={loadModel} />
        ) : !model ? (
          <Loading />
        ) : !model.installed ? (
          <ErrorState icon="chart-line" error={i18n.t("ai.yield.noModel")} />
        ) : (
          <>
            {/* Model summary */}
            <View style={[k.card, k.cardTop, { marginTop: 12 }]}>
              <IconTile name="brain" />
              <View style={{ flex: 1 }}>
                <Text style={k.cardTitle}>{model.model || i18n.t("ai.yield.modelName")}</Text>
                <Text style={[k.mutedSmall, { marginTop: 2 }]}>
                  {[
                    model.trained_rows
                      ? i18n.t("ai.yield.trainedRows", {
                          rows: Number(model.trained_rows).toLocaleString(i18n.locale || "en"),
                        })
                      : null,
                    mae != null ? i18n.t("ai.yield.avgError", { mae }) : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </Text>
              </View>
            </View>

            <PickerRow>
              <CropPicker
                value={crop}
                isEnabled={trained}
                onChange={(c) => {
                  setCrop(c);
                  clear();
                }}
              />
              {!locError && (
                <LocationPicker
                  locations={locations}
                  index={index}
                  setIndex={(i: number) => {
                    setIndex(i);
                    clear();
                  }}
                />
              )}
            </PickerRow>
            {locError && <Text style={[k.locLine, { color: T.red }]}>{locError}</Text>}

            <Dropdown
              label={i18n.t("ai.yield.plantingMonth")}
              value={planting}
              onChange={(v) => {
                setPlanting(v);
                clear();
              }}
              options={[
                {
                  value: undefined,
                  label: i18n.t("ai.yield.typical"),
                  sub: i18n.t("ai.yield.typicalSub"),
                  icon: <AiIcon name="calendar-star" size={18} />,
                },
                ...months.map((m) => ({
                  value: m.iso as string | undefined,
                  label: m.label,
                  icon: <AiIcon name="calendar-month-outline" size={18} />,
                })),
              ]}
            />

            <PickerRow>
              <Dropdown
                label={i18n.t("ai.yield.weather")}
                value={weather}
                onChange={(v) => {
                  setWeather(v);
                  clear();
                }}
                options={WEATHER_MODES.map((m) => ({
                  value: m.value,
                  label: i18n.t(`ai.yield.mode.${m.value}`),
                  sub: i18n.t(`ai.yield.modeSub.${m.value}`),
                  icon: <AiIcon name={m.icon} size={18} />,
                }))}
              />
              {weather === "year" && (
                <Dropdown
                  label={i18n.t("ai.yield.pastYear")}
                  value={year}
                  onChange={(v) => {
                    setYear(v);
                    clear();
                  }}
                  options={PAST_YEARS.map((yr) => ({ value: yr, label: String(yr) }))}
                />
              )}
            </PickerRow>

            <PrimaryButton
              label={i18n.t("ai.yield.predict")}
              onPress={() => predict()}
              disabled={!location || !trained(crop)}
              loading={loading}
            />

            {loading && <Loading text={i18n.t("ai.yield.loading")} />}

            {error && <YieldError error={error} mode={errorMode} onUsePastClimate={usePastClimate} onRetry={() => predict()} />}

            {y && (
              <>
                {/* Central estimate and p10–p90 range */}
                <View style={[k.card, { alignItems: "center", paddingVertical: 20 }]}>
                  <Text style={k.mutedSmall}>{i18n.t("ai.yield.expected")}</Text>
                  <Text style={{ fontSize: 40, fontWeight: "800", color: T.accent }}>
                    {y.median}
                    <Text style={{ fontSize: 16, color: T.muted }}> t/ha</Text>
                  </Text>
                  <Text style={k.mutedSmall}>
                    {singleScenario
                      ? i18n.t("ai.yield.singleScenario")
                      : i18n.t("ai.yield.range", { low: y.p10, high: y.p90 })}
                  </Text>

                  <View style={{ width: "100%", marginTop: 16 }}>
                    <View style={[k.barBg, { height: 14, borderRadius: 7 }]}>
                      <View
                        style={{
                          position: "absolute",
                          left: `${(y.p10 / maxBar) * 100}%`,
                          width: `${Math.max(((y.p90 - y.p10) / maxBar) * 100, 1)}%`,
                          height: 14,
                          borderRadius: 7,
                          backgroundColor: T.accentDimBorder,
                        }}
                      />
                      <View
                        style={{
                          position: "absolute",
                          left: `${(y.median / maxBar) * 100}%`,
                          width: 4,
                          marginLeft: -2,
                          height: 14,
                          backgroundColor: T.accent,
                        }}
                      />
                    </View>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 4 }}>
                      <Text style={k.mutedSmall}>0</Text>
                      <Text style={k.mutedSmall}>{maxBar.toFixed(1)} t/ha</Text>
                    </View>
                  </View>
                </View>

                <View style={k.card}>
                  <Row icon="sprout-outline" label={i18n.t("ai.yield.plantingDate")} value={formatDate(result.planting_date)} />
                  {result.weather_source != null && (
                    <Row
                      icon="weather-partly-cloudy"
                      label={i18n.t("ai.yield.weatherSource")}
                      value={i18n.t(`ai.yield.source.${result.weather_source}`, {
                        defaultValue: String(result.weather_source),
                      })}
                    />
                  )}
                  {result.scenarios != null && (
                    <Row icon="layers-outline" label={i18n.t("ai.yield.scenarios")} value={String(result.scenarios)} />
                  )}
                  {result.model_test_mae_t_ha != null && (
                    <Row
                      icon="target"
                      label={i18n.t("ai.yield.modelError")}
                      value={`± ${result.model_test_mae_t_ha} t/ha`}
                      last
                    />
                  )}
                </View>

                {/* What the model used (median across weather scenarios) */}
                {Object.keys(inputs).length > 0 && (
                  <>
                    <SectionTitle icon="tune-variant">{i18n.t("ai.yield.inputsTitle")}</SectionTitle>
                    <InputGrid title={i18n.t("ai.yield.inputsWeather")} specs={WEATHER_INPUTS} inputs={inputs} />
                    <InputGrid title={i18n.t("ai.yield.inputsSoil")} specs={SOIL_INPUTS} inputs={inputs} />
                    {otherInputs.length > 0 && (
                      <InputGrid
                        title={i18n.t("ai.yield.inputsOther")}
                        specs={otherInputs.map((key) => ({ key, labelKey: "", digits: 2, icon: "circle-small" }))}
                        inputs={inputs}
                      />
                    )}
                  </>
                )}

                <Text style={k.footnote}>
                  {i18n.t("ai.yield.note")}
                  {result.training_weather_source ? `\n\n${i18n.t("ai.yield.weatherNote")}` : ""}
                </Text>
              </>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Errors from POST /v1/yield/predict (see crop_yield_api.md, "Errors").
function YieldError({
  error,
  mode,
  onUsePastClimate,
  onRetry,
}: {
  error: any;
  mode: YieldWeather;
  onUsePastClimate: () => void;
  onRetry: () => void;
}) {
  const status = error instanceof AiApiError ? error.status : -1;

  // Seasonal forecast does not cover the whole crop season.
  if (status === 422 && mode === "seasonal") {
    return (
      <View style={[k.card, { borderColor: T.gold + "55" }]}>
        <View style={k.cardTop}>
          <IconTile name="calendar-alert" color={T.gold} bg={T.gold + "1A"} />
          <Text style={[k.cardTitle, { flex: 1 }]}>{i18n.t("ai.yield.seasonalTooShort")}</Text>
        </View>
        <TouchableOpacity style={[k.secondaryBtn, { marginTop: 12 }]} onPress={onUsePastClimate}>
          <Text style={k.secondaryBtnText}>{i18n.t("ai.yield.usePastClimate")}</Text>
        </TouchableOpacity>
      </View>
    );
  }
  if (status === 503) return <ErrorState icon="chart-line" error={i18n.t("ai.yield.noModel")} />;
  if (status === 404) return <ErrorState icon="sprout-outline" error={i18n.t("ai.yield.unknownCrop")} />;
  if (status === 422) return <ErrorState icon="alert-circle-outline" error={i18n.t("ai.yield.cannotPredict")} detail={errorDetail(error)} />;
  // 502/504 (weather or soil service) and network errors can be retried.
  return <ErrorState error={errorText(error)} detail={errorDetail(error)} onRetry={onRetry} />;
}

function InputGrid({ title, specs, inputs }: { title: string; specs: InputSpec[]; inputs: any }) {
  const shown = specs.filter((s) => typeof inputs[s.key] === "number");
  if (!shown.length) return null;
  return (
    <View style={k.card}>
      <Text style={k.actionsTitle}>{title}</Text>
      <View style={s.grid}>
        {shown.map((spec) => {
          const v = Number(inputs[spec.key]);
          const unit = spec.unitKey ? i18n.t(spec.unitKey) : spec.unit;
          return (
            <View key={spec.key} style={s.cell}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                <AiIcon name={spec.icon} size={14} color={T.muted} />
                <Text style={[k.mutedSmall, { flexShrink: 1 }]} numberOfLines={2}>
                  {spec.labelKey ? i18n.t(spec.labelKey) : spec.key.replace(/_/g, " ")}
                </Text>
              </View>
              <Text style={s.value}>
                {v.toFixed(spec.digits)}
                {unit ? <Text style={s.unit}> {unit}</Text> : null}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function Row({ icon, label, value, last }: { icon: AiIconName; label: string; value: string; last?: boolean }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: T.border,
        gap: 8,
      }}
    >
      <AiIcon name={icon} size={16} color={T.muted} />
      <Text style={[k.mutedSmall, { flex: 1 }]}>{label}</Text>
      <Text style={[k.mutedSmall, { color: T.text, fontWeight: "700", flexShrink: 1, textAlign: "right" }]}>
        {value}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", marginTop: 4 },
  cell: { width: "50%", paddingVertical: 8, paddingRight: 8, gap: 2 },
  value: { color: T.text, fontSize: 18, fontWeight: "800" },
  unit: { color: T.muted, fontSize: 12, fontWeight: "600" },
});
