import { AiHeader, k, T } from "@/components/ai/AiKit";
import { useLanguage } from "@/context/LanguageContext";
import i18n from "@/i18n";
import { fetchHealth } from "@/utils/aiApi";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// `feature` names /health flags; the tool is marked "not set up yet" when all are off.
type IconName = React.ComponentProps<typeof MaterialCommunityIcons>["name"];

// `upcoming` tools are listed but cannot be opened yet.
const TOOLS: { route: string; icon: IconName; key: string; feature?: string[]; upcoming?: boolean }[] = [
  { route: "/cropdiagnosis", icon: "microscope", key: "diagnosis", feature: ["disease_models"] },
  { route: "/climaterisk", icon: "weather-partly-rainy", key: "climate" },
  { route: "/yieldprediction", icon: "chart-line", key: "yield", feature: ["weather_harveststat_yield_model", "yield_model"] },
  { route: "/soiladvice", icon: "shovel", key: "soil" },
  { route: "/aisearch", icon: "magnify", key: "search", feature: ["search_index_documents"] },
  // Breeding data is hidden for now (CassavaBase trial loading is too slow on the hosted API).
  // { route: "/breeding", icon: "dna", key: "breeding" },
  // Upcoming: Ask IITA (needs a proper IITA assistant), Translate and Radio (need Claude API
  // access), Market prices (a price model will replace the CSV upload).
  { route: "/assistant", icon: "chat-question-outline", key: "assistant", upcoming: true },
  { route: "/marketprices", icon: "cash-multiple", key: "market", upcoming: true },
  { route: "/translate", icon: "translate", key: "translate", upcoming: true },
  { route: "/radiotranscribe", icon: "radio", key: "radio", upcoming: true },
];

const isOn = (v: any) => (Array.isArray(v) ? v.length > 0 : !!v);

export default function AiToolsScreen() {
  const router = useRouter();
  const { language } = useLanguage();
  const [features, setFeatures] = useState<any>(null);
  const [offline, setOffline] = useState(false);

  // Re-check the server every time the screen is shown, so a redeploy (e.g. a new
  // search index or model) shows up without restarting the app.
  useFocusEffect(
    useCallback(() => {
      let active = true;
      fetchHealth()
        .then((h) => {
          if (!active) return;
          setFeatures(h.features ?? {});
          setOffline(false);
        })
        .catch(() => active && setOffline(true));
      return () => {
        active = false;
      };
    }, [])
  );

  return (
    <SafeAreaView style={k.root}>
      <StatusBar barStyle="dark-content" backgroundColor={T.bg0} />
      <AiHeader titleKey="ai.hub.title" />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={[k.intro, { marginBottom: 12 }]}>
          {language && i18n.t("ai.hub.intro")}
        </Text>
        {offline && (
          <Text style={[k.intro, { color: T.red, marginTop: 0, marginBottom: 12 }]}>
            {i18n.t("ai.errorOffline")}
          </Text>
        )}
        {TOOLS.map((t) => {
          const off = !t.upcoming && !!(t.feature && features && !t.feature.some((f) => isOn(features[f])));
          return (
            <TouchableOpacity
              key={t.key}
              activeOpacity={0.8}
              style={[k.card, t.upcoming && { opacity: 0.6 }]}
              disabled={t.upcoming}
              onPress={() => router.push(t.route as any)}
            >
              <View style={k.cardTop}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    backgroundColor: T.accentDim,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MaterialCommunityIcons name={t.icon} size={22} color={T.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={k.cardTitle}>{i18n.t(`ai.hub.${t.key}`)}</Text>
                  <Text style={[k.mutedSmall, { marginTop: 2 }]}>
                    {i18n.t(`ai.hub.${t.key}Sub`)}
                  </Text>
                  {off && (
                    <Text style={[k.mutedSmall, { color: T.gold, marginTop: 4 }]}>
                      {i18n.t("ai.hub.notSetUp")}
                    </Text>
                  )}
                </View>
                {t.upcoming ? (
                  <View
                    style={{
                      backgroundColor: T.accentDim,
                      borderRadius: 100,
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                    }}
                  >
                    <Text style={{ color: T.accent, fontSize: 11, fontWeight: "700" }}>
                      {i18n.t("ai.hub.upcoming")}
                    </Text>
                  </View>
                ) : (
                  <Ionicons name="chevron-forward" size={18} color={T.accent} />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
