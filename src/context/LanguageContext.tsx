import React, { createContext, useContext, useEffect, useState } from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "../i18n";

type LanguageContextType = {
  language: string;
  setLanguage: (lang: string) => Promise<void>;
};

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: async () => {},
});

export const LanguageProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [language, setLanguageState] = useState(i18n.locale);

  const loadLanguage = async () => {
    const saved = await AsyncStorage.getItem("app-language");

    if (saved) {
      i18n.locale = saved;
      setLanguageState(saved);
    }
  };

  useEffect(() => {
    loadLanguage();
  }, []);

  const setLanguage = async (lang: string) => {
    setLanguageState(lang);
    i18n.locale = lang;
    await AsyncStorage.setItem("app-language", lang);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
