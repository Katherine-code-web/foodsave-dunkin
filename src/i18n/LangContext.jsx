import { createContext, useContext, useState } from "react";
import { T, t as interpolate } from "./translations";

const LangContext = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem("fs_lang") || "zh"; } catch { return "zh"; }
  });

  const toggle = () => {
    const next = lang === "zh" ? "en" : "zh";
    setLang(next);
    try { localStorage.setItem("fs_lang", next); } catch {}
  };

  // t("key") → translated string
  // t("key", { n: 5 }) → translated string with interpolation
  const t = (key, vars) => {
    const entry = T[key];
    if (!entry) return key;
    const str = entry[lang] ?? entry["zh"] ?? key;
    return vars ? interpolate(str, vars) : str;
  };

  return (
    <LangContext.Provider value={{ lang, toggle, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
