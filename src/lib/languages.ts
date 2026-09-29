/** Languages are stored as short codes for the common ones (en, ne …) and as the typed name for anything else. */
const NAMES: Record<string, string> = {
  en: "English", ne: "Nepali", hi: "Hindi", de: "German", fr: "French", es: "Spanish", zh: "Chinese", ja: "Japanese",
  ko: "Korean", it: "Italian", ru: "Russian", bo: "Tibetan", new: "Newari", mai: "Maithili", sherpa: "Sherpa", tamang: "Tamang", gurung: "Gurung",
};

export const languageLabel = (stored: string): string => NAMES[stored.toLowerCase()] ?? stored;
export const languageList = (stored: string[]): string => stored.map(languageLabel).join(", ");
export const LANGUAGE_SUGGESTIONS = ["English", "Nepali", "Hindi", "German", "French", "Spanish", "Chinese", "Japanese", "Korean", "Italian", "Russian", "Tibetan", "Sherpa", "Tamang", "Gurung"];
