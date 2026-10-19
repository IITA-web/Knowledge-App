import {
  AiHeader,
  AiIcon,
  AiIconName,
  contentTypeIcon,
  Dropdown,
  ErrorState,
  errorText,
  k,
  Loading,
  T,
} from "@/components/ai/AiKit";
import { useLanguage } from "@/context/LanguageContext";
import i18n from "@/i18n";
import { ContentType, searchContent } from "@/utils/aiApi";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
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

const TYPES: { key?: ContentType; labelKey: string; icon: AiIconName }[] = [
  { key: undefined, labelKey: "ai.search.all", icon: "view-grid-outline" },
  { key: "news", labelKey: "news", icon: contentTypeIcon("news") },
  { key: "project", labelKey: "projects", icon: contentTypeIcon("project") },
  { key: "publication", labelKey: "publications", icon: contentTypeIcon("publication") },
];

export default function AiSearchScreen() {
  const router = useRouter();
  const { language } = useLanguage();
  const [query, setQuery] = useState("");
  const [type, setType] = useState<ContentType | undefined>(undefined);
  const [results, setResults] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const run = async (q = query, t = type) => {
    if (q.trim().length < 2) return;
    setLoading(true);
    setError(null);
    try {
      const res = await searchContent(q.trim(), t);
      setResults(res.results ?? []);
    } catch (e) {
      setError(e);
      setResults(null);
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={k.root}>
      <StatusBar barStyle="dark-content" backgroundColor={T.bg0} />
      <AiHeader titleKey="ai.search.title" />

      <View style={s.searchBox}>
        <Ionicons name="search" size={18} color={T.muted} />
        <TextInput
          style={s.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder={language && i18n.t("ai.search.placeholder")}
          placeholderTextColor={T.mutedDark}
          returnKeyType="search"
          onSubmitEditing={() => run()}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery("")}>
            <Ionicons name="close-circle" size={18} color={T.mutedDark} />
          </TouchableOpacity>
        )}
      </View>

      <Dropdown
        label={i18n.t("ai.pick.type")}
        value={type}
        style={{ marginTop: 12 }}
        onChange={(v) => {
          setType(v);
          if (results) run(query, v);
        }}
        options={TYPES.map((t) => ({
          value: t.key,
          label: i18n.t(t.labelKey),
          icon: <AiIcon name={t.icon} size={18} />,
        }))}
      />

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState icon="cloud-alert" error={errorText(error)} onRetry={() => run()} />
      ) : results === null ? (
        <Text style={k.intro}>{i18n.t("ai.search.intro")}</Text>
      ) : results.length === 0 ? (
        <ErrorState icon="file-search-outline" error={i18n.t("ai.search.noResults")} />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(r) => r.id}
          contentContainerStyle={{ paddingBottom: 40 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={k.card}
              activeOpacity={0.8}
              disabled={!item.url}
              onPress={() =>
                router.push({ pathname: "/inappbrowser", params: { url: item.url } })
              }
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                <AiIcon name={contentTypeIcon(item.type)} size={14} color={T.muted} />
                <Text style={k.mutedSmall}>
                  {i18n.t(`ai.search.type.${item.type}`)}
                  {item.date ? ` · ${item.date}` : ""}
                </Text>
              </View>
              <Text style={[k.cardTitle, { marginTop: 4 }]}>{item.title}</Text>
              {item.summary ? (
                <Text style={k.cardText} numberOfLines={3}>
                  {item.summary}
                </Text>
              ) : null}
            </TouchableOpacity>
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
    margin: 16,
    marginBottom: 0,
    backgroundColor: T.bg1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: T.border,
    paddingHorizontal: 12,
  },
  searchInput: { flex: 1, paddingVertical: 11, fontSize: 14, color: T.text },
});
