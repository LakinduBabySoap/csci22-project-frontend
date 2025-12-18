import { createContext, useContext, useState, useEffect } from "react";
import { translations, locationMap } from "@/lib/translations";

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  // Load from localStorage or default to English
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("app-language") || "en";
  });

  useEffect(() => {
    localStorage.setItem("app-language", language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "zh" : "en"));
  };

  // 1. Helper for Static Text: t('home.title')
  const t = (path) => {
    return path.split('.').reduce((obj, key) => obj?.[key], translations[language]) || path;
  };

  // 2. Helper for DB Data: resolve(event, 'title')
  // Automatically tries 'titleChinese' if lang is 'zh', falls back to 'title'
  const resolve = (obj, field) => {
    if (!obj) return "";
    if (language === "zh") {
      // Try to find the field ending in "Chinese" (e.g., nameChinese)
      // or "Chi" if your DB uses that suffix.
      const zhValue = obj[`${field}Chinese`] || obj[`${field}Chi`]; 
      if (zhValue) return zhValue;
    }
    return obj[field]; // Fallback to English
  };

  // 3. Helper for Missing DB Data (Districts/Areas)
  const translateLocation = (text) => {
    if (language === "en" || !text) {
      if (text === "中環") return "Central";
      if (text === "香港島") return "Hong Kong Island";
      return text;
    }
    return locationMap[text] || text;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t, resolve, translateLocation }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);