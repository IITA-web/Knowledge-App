import { useLanguage } from "@/context/LanguageContext";
import i18n, { APP_LANGUAGES } from "@/i18n";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const home = () => {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  // First launch = no language saved yet; show the picker so the user sets their default.
  const [firstRun, setFirstRun] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem("app-language")
      .then((saved) => {
        if (saved) return setFirstRun(false);
        setFirstRun(true);
        // Preselect the phone's language when the app supports it, else English.
        const code = APP_LANGUAGES.some((l) => l.code === language) ? language : "en";
        setLanguage(code);
      })
      .catch(() => setFirstRun(false));
  }, []);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        width: "100%",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: "#fff",
        alignItems: "center",
      }}
    >
      <View style={{ width: "100%" }}>
        <View
          style={{
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            marginTop: 40,
          }}
        >
          <Image
            source={require("../../assets/images/iita_logo.png")}
            style={{ width: "50%", objectFit: "contain" }}
          />
        </View>

        <Text
          style={{
            marginTop: 10,
            fontWeight: "700",
            fontSize: 36,
            textAlign: "center",
          }}
        >
          {language ? i18n.t("welcome.title") : "Welcome"}
        </Text>

        <Text
          style={{
            marginTop: 6,
            fontWeight: "600",
            fontSize: 14,
            textAlign: "center",
          }}
        >
          {language
            ? i18n.t("welcome.subtitle")
            : "Connecting You to Agricultural Insights"}
        </Text>

        {firstRun === false && (
          <View
            style={{
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Image
              source={require("../../assets/images/home_title_banner.png")}
              style={{ marginTop: 10, width: "70%", objectFit: "contain" }}
            />
          </View>
        )}
      </View>

      {firstRun && (
        <View style={{ flex: 1, width: "90%", marginTop: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: "700", marginBottom: 10 }}>
            {language && i18n.t("selectLanguage")}
          </Text>
          <ScrollView
            contentContainerStyle={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "space-between",
              paddingBottom: 12,
            }}
          >
            {APP_LANGUAGES.map((l) => {
              const selected = language === l.code;
              return (
                <TouchableOpacity
                  key={l.code}
                  onPress={() => setLanguage(l.code)}
                  style={{
                    width: "48%",
                    marginBottom: 10,
                    paddingVertical: 12,
                    paddingHorizontal: 12,
                    borderRadius: 8,
                    borderWidth: 1.5,
                    borderColor: selected ? "#D85016" : "#ddd",
                    backgroundColor: selected ? "#FDF0EA" : "#fff",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text
                    numberOfLines={1}
                    style={{ flexShrink: 1, fontWeight: selected ? "700" : "500" }}
                  >
                    {l.label}
                  </Text>
                  {selected && (
                    <Ionicons name="checkmark-circle" size={18} color="#D85016" />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      <View style={{ width: "90%", marginHorizontal: 16 }}>
        <TouchableOpacity
          style={{
            width: "100%",
            marginTop: 12,
            marginBottom: 40,
            backgroundColor: "#D85016",
            height: 60,
            borderRadius: 8,
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={() => router.replace({ pathname: "/home" })}
        >
          <Text
            style={{ textAlign: "center", fontWeight: "700", color: "#fff" }}
          >
            {language ? i18n.t("welcome.letsGo") : "Let's go"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default home;
