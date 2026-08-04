"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type ThemeContextValue = {
  isDark: boolean;
  toggle: () => void;
  setDark: (v: boolean) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem("funtush-theme");
      if (stored) return stored === "dark";
    } catch (e) {
      /* ignore */
      console.error("Error accessing localStorage:", e);
    }
    return false;
  });

  useEffect(() => {
    try {
      localStorage.setItem("funtush-theme", isDark ? "dark" : "light");
      if (isDark) {
        document.documentElement.dataset.theme = "dark";
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.dataset.theme = "light";
        document.documentElement.classList.remove("dark");
      }
    } catch (e) {
      console.error("Error accessing localStorage:", e);
      // noop
    }
  }, [isDark]);

  const value = {
    isDark,
    toggle: () => setIsDark((p) => !p),
    setDark: (v: boolean) => setIsDark(v),
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};

export default ThemeProvider;
