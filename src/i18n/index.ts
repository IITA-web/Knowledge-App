import { getLocales } from "expo-localization";
import { I18n } from "i18n-js";
import { translations } from "./translations";

const deviceLanguage = getLocales()[0]?.languageCode || "en";

const i18n = new I18n(translations);

i18n.enableFallback = true;

i18n.defaultLocale = "en";

i18n.locale = deviceLanguage;

export default i18n;
