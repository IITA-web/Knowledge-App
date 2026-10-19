import {
  AiHeader,
  AiIcon,
  IconTile,
  SectionTitle,
  Dropdown,
  ErrorState,
  errorDetail,
  errorText,
  k,
  Loading,
  PrimaryButton,
  T,
} from "@/components/ai/AiKit";
import { useLanguage } from "@/context/LanguageContext";
import i18n from "@/i18n";
import { aiLanguage, transcribeAudio } from "@/utils/aiApi";
import * as DocumentPicker from "expo-document-picker";
import React, { useState } from "react";
import { ScrollView, StatusBar, Switch, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Languages the speech model understands (Igbo is not supported by Whisper).
const SPEECH_LANGUAGES = [
  { code: undefined, labelKey: "ai.radio.autoDetect" },
  { code: "en", label: "English" },
  { code: "yo", label: "Yorùbá" },
  { code: "ha", label: "Hausa" },
  { code: "fr", label: "Français" },
  { code: "sw", label: "Kiswahili" },
  { code: "pt", label: "Português" },
];

const MAX_BYTES = 200 * 1024 * 1024;

const clock = (sec: number) => {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
};

export default function RadioTranscribeScreen() {
  const { language } = useLanguage();
  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [speechLang, setSpeechLang] = useState<string | undefined>(undefined);
  const [summarize, setSummarize] = useState(true);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [showSegments, setShowSegments] = useState(false);

  const pickFile = async () => {
    const res = await DocumentPicker.getDocumentAsync({
      type: "audio/*",
      copyToCacheDirectory: true,
    });
    if (res.canceled || !res.assets?.[0]) return;
    const asset = res.assets[0];
    if (asset.size && asset.size > MAX_BYTES) {
      setNotice(i18n.t("ai.radio.tooLarge"));
      return;
    }
    setNotice(null);
    setFile(asset);
    setResult(null);
    setError(null);
  };

  const transcribe = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      setResult(
        await transcribeAudio(
          { uri: file.uri, name: file.name || "audio.mp3", type: file.mimeType || "audio/mpeg" },
          {
            language: speechLang,
            summarize,
            summary_language: aiLanguage(i18n.locale),
          }
        )
      );
    } catch (e) {
      setError(e);
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={k.root}>
      <StatusBar barStyle="dark-content" backgroundColor={T.bg0} />
      <AiHeader titleKey="ai.radio.title" />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={k.intro}>{language && i18n.t("ai.radio.intro")}</Text>

        <TouchableOpacity style={[k.card, { marginTop: 16 }]} onPress={pickFile} activeOpacity={0.8}>
          <View style={k.cardTop}>
            <IconTile name="microphone-outline" />
            <View style={{ flex: 1 }}>
              <Text style={k.cardTitle} numberOfLines={1}>
                {file ? file.name : i18n.t("ai.radio.chooseFile")}
              </Text>
              <Text style={k.mutedSmall}>
                {file?.size
                  ? `${(file.size / 1024 / 1024).toFixed(1)} MB`
                  : i18n.t("ai.radio.formats")}
              </Text>
            </View>
{file ? (
              <Text style={k.secondaryBtnText}>{i18n.t("ai.radio.change")}</Text>
            ) : (
              <AiIcon name="plus-circle-outline" size={22} />
            )}
          </View>
        </TouchableOpacity>
        {notice && <Text style={[k.locLine, { color: T.red }]}>{notice}</Text>}

        <Dropdown
          label={i18n.t("ai.radio.spokenLanguage")}
          value={speechLang}
          onChange={setSpeechLang}
          options={SPEECH_LANGUAGES.map((l) => ({
            value: l.code,
            label: l.labelKey ? i18n.t(l.labelKey) : l.label!,
          }))}
        />

        <View style={[k.card, { flexDirection: "row", alignItems: "center", gap: 8 }]}>
          <AiIcon name="creation" size={18} />
          <Text style={[k.cardTitle, { flex: 1, fontWeight: "600" }]}>
            {i18n.t("ai.radio.addSummary")}
          </Text>
          <Switch
            value={summarize}
            onValueChange={setSummarize}
            trackColor={{ true: T.accent, false: T.border }}
          />
        </View>

        <PrimaryButton
          label={i18n.t("ai.radio.transcribe")}
          onPress={transcribe}
          disabled={!file}
          loading={loading}
          style={{ marginTop: 6 }}
        />

        {loading && <Loading text={i18n.t("ai.radio.loading")} />}
        {error && <ErrorState icon="radio" error={errorText(error)} detail={errorDetail(error)} />}

        {result && (
          <>
            <Text style={[k.mutedSmall, { marginHorizontal: 16, marginBottom: 10 }]}>
              {i18n.t("ai.radio.detected", {
                language: result.language,
                duration: clock(result.duration_s ?? 0),
              })}
            </Text>

            {result.summary && (
              <>
                <SectionTitle icon="creation">{i18n.t("ai.radio.summary")}</SectionTitle>
                <View style={k.card}>
                  <Text style={[k.cardText, { marginTop: 0, fontSize: 14, lineHeight: 21 }]} selectable>
                    {result.summary}
                  </Text>
                </View>
              </>
            )}

            <View style={{ flexDirection: "row", alignItems: "center", marginRight: 16 }}>
              <SectionTitle icon="text-box-outline" style={{ flex: 1 }}>
                {i18n.t("ai.radio.transcript")}
              </SectionTitle>
              {result.segments?.length > 0 && (
                <TouchableOpacity onPress={() => setShowSegments(!showSegments)}>
                  <Text style={[k.secondaryBtnText, { marginBottom: 10 }]}>
                    {i18n.t(showSegments ? "ai.radio.plainText" : "ai.radio.withTimes")}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={k.card}>
              {!result.text ? (
                <Text style={k.mutedSmall}>{i18n.t("ai.radio.noSpeech")}</Text>
              ) : showSegments ? (
                result.segments.map((seg: any, i: number) => (
                  <View key={i} style={{ flexDirection: "row", gap: 10, paddingVertical: 3 }}>
                    <Text style={[k.mutedSmall, { width: 44, color: T.accent }]}>
                      {clock(seg.start)}
                    </Text>
                    <Text style={[k.actionItem, { flex: 1 }]}>{seg.text}</Text>
                  </View>
                ))
              ) : (
                <Text style={[k.cardText, { marginTop: 0 }]} selectable>
                  {result.text}
                </Text>
              )}
            </View>
            <Text style={k.footnote}>{i18n.t("ai.radio.disclaimer")}</Text>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
