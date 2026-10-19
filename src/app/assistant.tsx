import { AiHeader, AiIcon, contentTypeIcon, errorText, k, T } from "@/components/ai/AiKit";
import { useLanguage } from "@/context/LanguageContext";
import i18n from "@/i18n";
import { aiLanguage, askAssistant } from "@/utils/aiApi";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Message =
  | { role: "user"; text: string }
  | { role: "assistant"; text: string; sources: any[] }
  | { role: "error"; text: string };

const SUGGESTIONS = ["ai.assistant.suggest1", "ai.assistant.suggest2", "ai.assistant.suggest3"];


export default function AssistantScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { language } = useLanguage();
  const scrollRef = useRef<ScrollView>(null);

  const crop = params?.cropKey ? String(params.cropKey) : undefined;
  const [input, setInput] = useState(params?.question ? String(params.question) : "");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages, loading]);

  const ask = async (question: string) => {
    const q = question.trim();
    if (q.length < 3 || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text: q }]);
    setLoading(true);
    try {
      const res = await askAssistant({
        question: q,
        language: aiLanguage(i18n.locale),
        crop,
      });
      setMessages((m) => [
        ...m,
        { role: "assistant", text: res.answer, sources: res.sources ?? [] },
      ]);
    } catch (e) {
      setMessages((m) => [...m, { role: "error", text: errorText(e) }]);
    }
    setLoading(false);
  };

  const openSource = (src: any) =>
    src.url && router.push({ pathname: "/inappbrowser", params: { url: src.url } });

  return (
    <SafeAreaView style={k.root} edges={["top", "left", "right", "bottom"]}>
      <StatusBar barStyle="dark-content" backgroundColor={T.bg0} />
      <AiHeader titleKey="ai.assistant.title" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingVertical: 12 }}
          keyboardShouldPersistTaps="handled"
        >
          {messages.length === 0 && (
            <View>
              <Text style={[k.intro, { marginTop: 0 }]}>
                {language && i18n.t("ai.assistant.intro")}
              </Text>
              <Text style={[k.sectionTitle, { marginTop: 16 }]}>
                {i18n.t("ai.assistant.tryAsking")}
              </Text>
              {SUGGESTIONS.map((key) => (
                <TouchableOpacity
                  key={key}
                  style={[k.card, { flexDirection: "row", alignItems: "center", gap: 10 }]}
                  onPress={() => ask(i18n.t(key))}
                >
                  <AiIcon name="lightbulb-on-outline" size={18} />
                  <Text style={[k.actionItem, { flex: 1 }]}>{i18n.t(key)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {messages.map((m, i) =>
            m.role === "user" ? (
              <View key={i} style={[s.bubble, s.userBubble]}>
                <Text style={s.userText}>{m.text}</Text>
              </View>
            ) : m.role === "error" ? (
              <View key={i} style={[s.bubble, s.botBubble, { borderColor: T.red + "44" }]}>
                <Text style={[s.botText, { color: T.red }]}>{m.text}</Text>
              </View>
            ) : (
              <View key={i} style={[s.bubble, s.botBubble]}>
                <Text style={s.botText} selectable>
                  {m.text}
                </Text>
                {m.sources.length > 0 && (
                  <View style={s.sources}>
                    <Text style={k.actionsTitle}>{i18n.t("ai.assistant.sources")}</Text>
                    {m.sources.map((src: any) => (
                      <TouchableOpacity
                        key={src.n}
                        onPress={() => openSource(src)}
                        disabled={!src.url}
                        style={s.sourceRow}
                      >
                        <Text style={s.sourceNum}>[{src.n}]</Text>
                        <AiIcon
                          name={contentTypeIcon(src.type)}
                          size={14}
                          color={T.muted}
                          style={{ marginTop: 1 }}
                        />
                        <Text style={s.sourceTitle} numberOfLines={2}>
                          {src.title}
                          {src.date ? ` · ${String(src.date).slice(0, 4)}` : ""}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )
          )}

          {loading && (
            <View style={[s.bubble, s.botBubble, { flexDirection: "row", gap: 8 }]}>
              <ActivityIndicator size="small" color={T.accent} />
              <Text style={k.mutedSmall}>{i18n.t("ai.assistant.thinking")}</Text>
            </View>
          )}

          {messages.length > 0 && (
            <Text style={k.footnote}>{i18n.t("ai.assistant.disclaimer")}</Text>
          )}
        </ScrollView>

        {/* Input bar */}
        <View style={s.inputBar}>
          <TextInput
            style={s.input}
            value={input}
            onChangeText={setInput}
            placeholder={i18n.t("ai.assistant.placeholder")}
            placeholderTextColor={T.mutedDark}
            multiline
            maxLength={2000}
          />
          <TouchableOpacity
            style={[s.sendBtn, (input.trim().length < 3 || loading) && { opacity: 0.4 }]}
            onPress={() => ask(input)}
            disabled={input.trim().length < 3 || loading}
          >
            <Ionicons name="send" size={18} color={T.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  bubble: {
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 14,
    padding: 12,
    maxWidth: "88%",
  },
  userBubble: { alignSelf: "flex-end", backgroundColor: T.accent },
  userText: { color: T.white, fontSize: 14, lineHeight: 20 },
  botBubble: {
    alignSelf: "flex-start",
    backgroundColor: T.bg1,
    borderWidth: 1,
    borderColor: "rgba(216,80,22,0.10)",
  },
  botText: { color: T.text, fontSize: 14, lineHeight: 21 },
  sources: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: T.border,
  },
  sourceRow: { flexDirection: "row", gap: 6, paddingVertical: 4 },
  sourceNum: { color: T.accent, fontSize: 12, fontWeight: "700" },
  sourceTitle: { flex: 1, color: T.blue, fontSize: 12, lineHeight: 17 },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    padding: 10,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: T.border,
    backgroundColor: T.bg0,
  },
  input: {
    flex: 1,
    maxHeight: 120,
    backgroundColor: T.bg1,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: T.border,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 14,
    color: T.text,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: T.accent,
    alignItems: "center",
    justifyContent: "center",
  },
});
