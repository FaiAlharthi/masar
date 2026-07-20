"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { dictionaries, type Locale, type Dictionary } from "./dictionaries";

const STORAGE_KEY = "masar_locale";

type LocaleContextValue = {
  locale: Locale;
  dict: Dictionary;
  toggleLocale: () => void;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>("ar");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "ar" || stored === "en") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration-safe read from localStorage
      setLocale(stored);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
    window.localStorage.setItem(STORAGE_KEY, locale);
  }, [locale]);

  const toggleLocale = () => setLocale((prev) => (prev === "ar" ? "en" : "ar"));

  return (
    <LocaleContext.Provider
      value={{ locale, dict: dictionaries[locale], toggleLocale }}
    >
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
