import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Modal, Pressable, Text, TouchableOpacity, View } from "react-native";

import { useLanguage } from "@/context/LanguageContext";
import i18n from "@/i18n";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "yo", label: "Yorùbá" },
  { code: "ha", label: "Hausa" },
  { code: "ig", label: "Igbo" },
  { code: "fr", label: "Français" },
  { code: "sw", label: "Kiswahili" },
  { code: "pt", label: "Português" },
];

const LanguageSwitcher = () => {
  const [visible, setVisible] = useState(false);

  const { language, setLanguage } = useLanguage();

  return (
    <>
      {/* Floating Button */}
      <TouchableOpacity
        onPress={() => setVisible(true)}
        style={{
          position: "absolute",
          bottom: 120,
          right: 20,
          backgroundColor: "#111",
          padding: 14,
          borderRadius: 40,
          zIndex: 9999,

          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 6,

          elevation: 8,
        }}
      >
        <Ionicons name="language-outline" size={22} color="#fff" />
      </TouchableOpacity>

      {/* Modal */}
      <Modal visible={visible} transparent animationType="slide">
        <Pressable
          onPress={() => setVisible(false)}
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              padding: 20,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                marginBottom: 15,
              }}
            >
              {i18n.t("selectLanguage")}
            </Text>

            {LANGUAGES.map((l) => (
              <TouchableOpacity
                key={l.code}
                onPress={() => {
                  setLanguage(l.code);
                  setVisible(false);
                }}
                style={{
                  paddingVertical: 14,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text>{l.label}</Text>

                {language === l.code ? (
                  <Ionicons name="radio-button-on" size={22} color="#F26522" />
                ) : (
                  <Ionicons name="radio-button-off" size={22} color="#999" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

export default LanguageSwitcher;
