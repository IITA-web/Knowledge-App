import {
  AiHeader,
  AiIconName,
  IconTile,
  SectionTitle,
  CropPicker,
  PickerRow,
  ErrorState,
  errorDetail,
  errorText,
  k,
  Loading,
  LocationPicker,
  STATUS_COLOR,
  T,
  useFarmLocations,
} from "@/components/ai/AiKit";
import { useLanguage } from "@/context/LanguageContext";
import i18n from "@/i18n";
import { AiApiError, fetchSoilAdvice } from "@/utils/aiApi";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PROPERTIES: { key: string; labelKey: string; unit: string; digits: number }[] = [
  { key: "ph", labelKey: "ai.soil.ph", unit: "", digits: 1 },
  { key: "organic_carbon_g_kg", labelKey: "ai.soil.organicCarbon", unit: "g/kg", digits: 0 },
  { key: "nitrogen_g_kg", labelKey: "ai.soil.nitrogen", unit: "g/kg", digits: 2 },
  { key: "cec_cmol_kg", labelKey: "ai.soil.cec", unit: "cmol/kg", digits: 0 },
  { key: "clay_pct", labelKey: "ai.soil.clay", unit: "%", digits: 0 },
  { key: "sand_pct", labelKey: "ai.soil.sand", unit: "%", digits: 0 },
];

const TOPIC_ICON: Record<string, AiIconName> = {
  pH: "test-tube",
  "Organic matter": "leaf-maple",
  Nitrogen: "sprout",
  "Nutrient holding (CEC)": "magnet",
  Texture: "texture-box",
};

export default function SoilAdviceScreen() {
  const params = useLocalSearchParams();
  const { language } = useLanguage();
  const { locations, location, index, setIndex, error: locError } = useFarmLocations();

  const [crop, setCrop] = useState(String(params?.cropKey || "cassava"));
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const load = async () => {
    if (!location) return;
    setLoading(true);
    setError(null);
    setData(null);
    try {
      setData(await fetchSoilAdvice({ lat: location.lat, lon: location.lon, crop }));
    } catch (e) {
      setError(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [location?.id, location?.lat, crop]);

  const soil = data?.soil_0_30cm;

  return (
    <SafeAreaView style={k.root}>
      <StatusBar barStyle="dark-content" backgroundColor={T.bg0} />
      <AiHeader titleKey="ai.soil.title" />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={k.intro}>{language && i18n.t("ai.soil.intro")}</Text>
        <PickerRow>
          <CropPicker value={crop} onChange={setCrop} />
          {!locError && (
            <LocationPicker locations={locations} index={index} setIndex={setIndex} />
          )}
        </PickerRow>

        {locError ? (
          <ErrorState icon="map-marker-off-outline" error={locError} />
        ) : loading || (!data && !error) ? (
          <Loading text={i18n.t("ai.soil.loading")} />
        ) : error instanceof AiApiError && error.status === 404 ? (
          // SoilGrids has no data for built-up areas, water and roads
          <ErrorState icon="home-city-outline" error={i18n.t("ai.soil.noData")} />
        ) : error ? (
          <ErrorState icon="shovel" error={errorText(error)} detail={errorDetail(error)} onRetry={load} />
        ) : (
          <>
            {data.data_distance_m > 0 && (
              <Text style={[k.intro, { color: T.gold, marginTop: 0 }]}>
                {i18n.t("ai.soil.nearby", { distance: data.data_distance_m })}
              </Text>
            )}
            <SectionTitle icon="layers-outline">{i18n.t("ai.soil.properties")}</SectionTitle>
            <View style={[k.card, s.grid]}>
              {PROPERTIES.map((p) => (
                <View key={p.key} style={s.cell}>
                  <Text style={s.value}>
                    {soil?.[p.key] != null ? Number(soil[p.key]).toFixed(p.digits) : "—"}
                    {p.unit && soil?.[p.key] != null ? (
                      <Text style={s.unit}> {p.unit}</Text>
                    ) : null}
                  </Text>
                  <Text style={k.mutedSmall}>{i18n.t(p.labelKey)}</Text>
                </View>
              ))}
              {soil?.texture && (
                <View style={[s.cell, { width: "100%" }]}>
                  <Text style={s.value}>{soil.texture}</Text>
                  <Text style={k.mutedSmall}>{i18n.t("ai.soil.texture")}</Text>
                </View>
              )}
            </View>

            <SectionTitle icon="sprout-outline">{i18n.t("ai.soil.advice")}</SectionTitle>
            {(data.findings ?? []).map((f: any) => {
              const color = STATUS_COLOR[f.status] ?? T.muted;
              return (
                <View key={f.topic} style={k.card}>
                  <View style={k.cardTop}>
                    <IconTile name={TOPIC_ICON[f.topic] ?? "test-tube"} color={color} bg={color + "1A"} />
                    <Text style={[k.cardTitle, { flex: 1 }]}>{f.topic}</Text>
                    <View style={[k.badge, { backgroundColor: color + "1A" }]}>
                      <Text style={[k.badgeText, { color }]}>
                        {i18n.t(`ai.soil.status.${f.status}`)}
                      </Text>
                    </View>
                  </View>
                  <Text style={k.cardText}>{f.finding}</Text>
                  {f.actions?.length > 0 && (
                    <View style={{ marginTop: 8 }}>
                      <Text style={k.actionsTitle}>{i18n.t("ai.whatToDo")}</Text>
                      {f.actions.map((a: string) => (
                        <Text key={a} style={k.actionItem}>
                          • {a}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
            <Text style={k.footnote}>
              {data.source}. {data.disclaimer}
            </Text>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", rowGap: 14 },
  cell: { width: "33.33%" },
  value: { color: T.text, fontSize: 18, fontWeight: "800" },
  unit: { color: T.muted, fontSize: 11, fontWeight: "500" },
});
