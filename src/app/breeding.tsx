import {
  AiHeader,
  AiIconName,
  IconLabel,
  ErrorState,
  errorDetail,
  errorText,
  k,
  Loading,
  T,
} from "@/components/ai/AiKit";
import { useLanguage } from "@/context/LanguageContext";
import i18n from "@/i18n";
import {
  BreedingDb,
  fetchStudies,
  fetchStudyTraits,
  fetchTraitRanking,
} from "@/utils/aiApi";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const DATABASES: { key: BreedingDb; label: string; icon: AiIconName }[] = [
  { key: "cassavabase", label: "CassavaBase", icon: "sprout" },
  { key: "yambase", label: "YamBase", icon: "seed" },
  { key: "musabase", label: "MusaBase", icon: "leaf" },
];

const fmt = (v: any) => (v == null ? "—" : Number(v).toLocaleString(i18n.locale || "en"));

export default function BreedingScreen() {
  const navigation = useNavigation();
  const { language } = useLanguage();

  const [db, setDb] = useState<BreedingDb>("cassavabase");
  const [search, setSearch] = useState("");
  const [study, setStudy] = useState<any>(null);
  const [trait, setTrait] = useState<string | null>(null);
  const [higherIsBetter, setHigherIsBetter] = useState(true);

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const level = study && trait ? "rank" : study ? "traits" : "studies";

  // One loader for whichever level is showing: studies → traits → ranking.
  // Responses are tagged with their level so a level never renders another level's data
  // (on the first render after a tap, `data` still holds the previous level's response).
  const load = async () => {
    const forLevel = level;
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const res =
        forLevel === "rank"
          ? await fetchTraitRanking(db, study.studyDbId, trait!, higherIsBetter)
          : forLevel === "traits"
            ? await fetchStudyTraits(db, study.studyDbId)
            : await fetchStudies(db, search.trim() || undefined);
      setData({ ...res, _level: forLevel });
    } catch (e) {
      setError(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [db, study?.studyDbId, trait, higherIsBetter]);

  const back = () => {
    if (trait) setTrait(null);
    else if (study) setStudy(null);
    else navigation.goBack();
  };

  return (
    <SafeAreaView style={k.root}>
      <StatusBar barStyle="dark-content" backgroundColor={T.bg0} />
      <AiHeader titleKey="ai.breeding.title" onBack={back} />

      {level === "studies" && (
        <>
          <View style={[k.segment, { marginTop: 12 }]}>
            {DATABASES.map((d) => (
              <TouchableOpacity
                key={d.key}
                style={[k.segmentBtn, db === d.key && k.segmentBtnActive]}
                onPress={() => setDb(d.key)}
              >
                <IconLabel
                  icon={d.icon}
                  size={14}
                  label={d.label}
                  color={db === d.key ? T.white : T.accent}
                  textStyle={[k.segmentText, db === d.key && k.segmentTextActive]}
                />
              </TouchableOpacity>
            ))}
          </View>
          <View style={s.searchBox}>
            <Ionicons name="search" size={18} color={T.muted} />
            <TextInput
              style={s.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder={language && i18n.t("ai.breeding.searchTrials")}
              placeholderTextColor={T.mutedDark}
              returnKeyType="search"
              onSubmitEditing={load}
            />
          </View>
        </>
      )}

      {level !== "studies" && (
        <View style={[k.card, { marginTop: 12 }]}>
          <Text style={k.mutedSmall}>{DATABASES.find((d) => d.key === db)?.label}</Text>
          <Text style={k.cardTitle}>{study.name}</Text>
          {(study.location || study.season) && (
            <Text style={k.mutedSmall}>
              {[study.location, study.season].filter(Boolean).join(" · ")}
            </Text>
          )}
          {trait && <Text style={[k.cardText, { color: T.accent, fontWeight: "700" }]}>{trait}</Text>}
        </View>
      )}

      {level === "rank" && (
        <View style={k.segment}>
          {[true, false].map((hib) => (
            <TouchableOpacity
              key={String(hib)}
              style={[k.segmentBtn, higherIsBetter === hib && k.segmentBtnActive]}
              onPress={() => setHigherIsBetter(hib)}
            >
              <Text style={[k.segmentText, higherIsBetter === hib && k.segmentTextActive]}>
                {i18n.t(hib ? "ai.breeding.higherBetter" : "ai.breeding.lowerBetter")}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {loading || (data && data._level !== level) ? (
        <Loading text={level === "studies" ? undefined : i18n.t("ai.breeding.loadingObs")} />
      ) : error ? (
        <ErrorState icon="dna" error={errorText(error)} detail={errorDetail(error)} onRetry={load} />
      ) : !data ? null : level === "studies" ? (
        <FlatList
          data={data.studies ?? []}
          keyExtractor={(st) => String(st.studyDbId)}
          contentContainerStyle={{ paddingBottom: 40 }}
          ListEmptyComponent={<ErrorState icon="dna" error={i18n.t("ai.breeding.noTrials")} />}
          renderItem={({ item }) => (
            <TouchableOpacity style={k.card} onPress={() => setStudy(item)} activeOpacity={0.8}>
              <View style={k.cardTop}>
                <View style={{ flex: 1 }}>
                  <Text style={k.cardTitle}>{item.name}</Text>
                  <Text style={k.mutedSmall}>
                    {[item.location, item.season, item.type].filter(Boolean).join(" · ")}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={T.accent} />
              </View>
            </TouchableOpacity>
          )}
        />
      ) : level === "traits" ? (
        <FlatList
          data={data.traits ?? []}
          keyExtractor={(t) => t.trait}
          contentContainerStyle={{ paddingBottom: 40 }}
          ListHeaderComponent={
            <Text style={k.sectionTitle}>
              {i18n.t("ai.breeding.traitsTitle", { count: data.observations ?? 0 })}
            </Text>
          }
          ListEmptyComponent={<ErrorState icon="dna" error={i18n.t("ai.breeding.noTraits")} />}
          renderItem={({ item }) => (
            <TouchableOpacity style={k.card} onPress={() => setTrait(item.trait)} activeOpacity={0.8}>
              <View style={k.cardTop}>
                <Text style={[k.cardTitle, { flex: 1 }]}>{item.trait}</Text>
                <Ionicons name="podium-outline" size={18} color={T.accent} />
              </View>
              <Text style={[k.mutedSmall, { marginTop: 4 }]}>
                n = {item.n} · {i18n.t("ai.breeding.mean")} {fmt(item.mean)} · sd {fmt(item.sd)} ·{" "}
                {fmt(item.min)}–{fmt(item.max)}
              </Text>
            </TouchableOpacity>
          )}
        />
      ) : (
        <FlatList
          data={data.ranked ?? []}
          keyExtractor={(r) => r.germplasm}
          contentContainerStyle={{ paddingBottom: 40 }}
          ListHeaderComponent={
            <Text style={k.sectionTitle}>
              {i18n.t("ai.breeding.trialMean", { mean: fmt(data.trial_mean) })}
            </Text>
          }
          ListEmptyComponent={<ErrorState icon="dna" error={i18n.t("ai.breeding.noRanking")} />}
          ListFooterComponent={<Text style={k.footnote}>{data.note}</Text>}
          renderItem={({ item, index }) => (
            <View style={[k.card, s.rankRow]}>
              <Text style={s.rankNum}>{index + 1}</Text>
              <View style={{ flex: 1 }}>
                <Text style={k.cardTitle}>{item.germplasm}</Text>
                <Text style={k.mutedSmall}>
                  {i18n.t("ai.breeding.reps", { count: item.reps ?? 0 })} · sd {fmt(item.sd)}
                </Text>
              </View>
              <Text style={s.rankValue}>{fmt(item.mean)}</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: T.bg1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: T.border,
    paddingHorizontal: 12,
  },
  searchInput: { flex: 1, paddingVertical: 11, fontSize: 14, color: T.text },
  rankRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  rankNum: { width: 26, color: T.accent, fontSize: 16, fontWeight: "800", textAlign: "center" },
  rankValue: { color: T.text, fontSize: 16, fontWeight: "800" },
});
