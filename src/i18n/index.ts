import { getLocales } from "expo-localization";
import { I18n } from "i18n-js";
import { aiTranslations } from "./aiTranslations";
import ak from "./locales/ak";
import bm from "./locales/bm";
import ff from "./locales/ff";
import lg from "./locales/lg";
import ln from "./locales/ln";
import ny from "./locales/ny";
import pcm from "./locales/pcm";
import rn from "./locales/rn";
import rw from "./locales/rw";
import vmw from "./locales/vmw";
import { translations } from "./translations";

// Languages offered in the in-app language pickers.
export const APP_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "yo", label: "Yorùbá" },
  { code: "ha", label: "Hausa" },
  { code: "ig", label: "Igbo" },
  { code: "pcm", label: "Naijá (Pidgin)" },
  { code: "ff", label: "Fulfulde" },
  { code: "fr", label: "Français" },
  { code: "pt", label: "Português" },
  { code: "sw", label: "Kiswahili" },
  { code: "ak", label: "Twi (Akan)" },
  { code: "bm", label: "Bamanankan" },
  { code: "ln", label: "Lingála" },
  { code: "rw", label: "Ikinyarwanda" },
  { code: "rn", label: "Ikirundi" },
  { code: "lg", label: "Luganda" },
  { code: "ny", label: "Chichewa" },
  { code: "vmw", label: "Emakhuwa" },
];

const deviceLanguage = getLocales()[0]?.languageCode || "en";

const i18n = new I18n(translations);
i18n.store(aiTranslations); // AI feature screens
i18n.store({ ak, bm, ff, lg, ln, ny, pcm, rn, rw, vmw }); // regional languages (main + AI strings)

i18n.enableFallback = true;

i18n.defaultLocale = "en";

i18n.locale = deviceLanguage;

export default i18n;
