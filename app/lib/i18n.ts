import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "@/app/langs/en.json";
import fr from "@/app/langs/fr.json";
import es from "@/app/langs/es.json";
import de from "@/app/langs/de.json";
import it from "@/app/langs/it.json";

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources: {
      en: { translation: en },
      fr: { translation: fr },
      es: { translation: es },
      de: { translation: de },
      it: { translation: it },
    },
    lng: "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });
}

export default i18n;
