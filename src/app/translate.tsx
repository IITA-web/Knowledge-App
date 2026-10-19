import {
  AiHeader,
  Dropdown,
  ErrorState,
  errorDetail,
  errorText,
  k,
  PrimaryButton,
  T,
} from "@/components/ai/AiKit";
import { useLanguage } from "@/context/LanguageContext";
import i18n from "@/i18n";
import { aiLanguage, translateTexts } from "@/utils/aiApi";
import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "yo", label: "Yorùbá" },
  { code: "ha", label: "Hausa" },
  { code: "ig", label: "Igbo" },
  { code: "fr", label: "Français" },
  { code: "sw", label: "Kiswahili" },
  { code: "pt", label: "Português" },
];

const MAX_CHARS = 40000;

export default function TranslateScreen() {
  const params = useLocalSearchParams();
  const { language } = useLanguage();
  const [text, setText] = useState(params?.text ? String(params.text) : "");
  const [target, setTarget] = useState(() => {
    const own = aiLanguage(i18n.locale);
    return own === "en" ? "yo" : own;
  });
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const translate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      // One text per paragraph keeps long content within the model's comfort zone.
      // The API takes at most 50 texts, so any extra paragraphs go in the last one.
      let paragraphs = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
      if (paragraphs.length > 50) {
        paragraphs = [...paragraphs.slice(0, 49), paragraphs.slice(49).join("\n\n")];
      }
      const res = await translateTexts(paragraphs, target);
      setResult(res.translations.join("\n\n"));
    } catch (e) {
      setError(e);
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={k.root}>
      <StatusBar barStyle="dark-content" backgroundColor={T.bg0} />
      <AiHeader titleKey="ai.translate.title" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          <Text style={k.intro}>{language && i18n.t("ai.translate.intro")}</Text>

          <Dropdown
            label={i18n.t("ai.translate.to")}
            value={target}
            style={{ marginTop: 16 }}
            onChange={(v) => {
              setTarget(v);
              setResult(null);
            }}
            options={LANGUAGES.map((l) => ({ value: l.code, label: l.label }))}
          />

          <TextInput
            style={[k.input, { minHeight: 140, textAlignVertical: "top" }]}
            value={text}
            onChangeText={(t) => {
              setText(t);
              setResult(null);
            }}
            placeholder={i18n.t("ai.translate.placeholder")}
            placeholderTextColor={T.mutedDark}
            multiline
            maxLength={MAX_CHARS}
          />

          <PrimaryButton
            label={i18n.t("ai.translate.translate")}
            onPress={translate}
            disabled={!text.trim()}
            loading={loading}
          />

          {error && <ErrorState error={errorText(error)} detail={errorDetail(error)} />}

          {result && (
            <View style={k.card}>
              <Text style={k.actionsTitle}>
                {LANGUAGES.find((l) => l.code === target)?.label}
              </Text>
              <Text style={[k.cardText, { fontSize: 14, lineHeight: 21 }]} selectable>
                {result}
              </Text>
            </View>
          )}
          {result && <Text style={k.footnote}>{i18n.t("ai.translate.disclaimer")}</Text>}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
