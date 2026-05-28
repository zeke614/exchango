import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import countriesData from "./data.ts";

type Theme = "light" | "dark" | "system";

export default function Header() {
  const { t, i18n } = useTranslation();

  // Language Dropdown State
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLanguageOverlay, setShowLanguageOverlay] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Theme Dropdown State
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
  const themeDropdownRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("theme") as Theme) || "system";
    }
    return "system";
  });

  // Apply Theme Effect & Listen for System Changes
  useEffect(() => {
    const root = window.document.documentElement;

    const applyTheme = (currentTheme: Theme) => {
      root.classList.remove("light", "dark");
      if (currentTheme === "system") {
        const systemIsDark = window.matchMedia(
          "(prefers-color-scheme: dark)",
        ).matches;
        root.classList.add(systemIsDark ? "dark" : "light");
      } else {
        root.classList.add(currentTheme);
      }
    };

    applyTheme(theme);
    localStorage.setItem("theme", theme);

    // If "system" is active, listen for OS-level theme changes in real-time
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemThemeChange = () => {
      if (theme === "system") applyTheme("system");
    };

    mediaQuery.addEventListener("change", handleSystemThemeChange);
    return () =>
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
  }, [theme]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
      if (
        themeDropdownRef.current &&
        !themeDropdownRef.current.contains(event.target as Node)
      ) {
        setShowThemeDropdown(false);
      }
    }

    if (showDropdown || showThemeDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown, showThemeDropdown]);

  const changeLanguage = (lang: string) => {
    setShowLanguageOverlay(true);
    setTimeout(() => {
      i18n.changeLanguage(lang);
      setShowLanguageOverlay(false);
      setShowDropdown(false);
    }, 1000);
  };

  // Helper to get the correct icon for the header based on active theme
  const getThemeIcon = (currentTheme: Theme) => {
    switch (currentTheme) {
      case "light":
        return "bx bx-sun";
      case "dark":
        return "bx bx-moon";
      case "system":
        return "bx bx-desktop";
    }
  };

  return (
    <>
      <AnimatePresence>
        {showLanguageOverlay && (
          <motion.div
            key="language-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/60 dark:bg-black/60 backdrop-blur-sm"
          >
            <i className="bx bx-translate text-[3rem] text-[#256F5C] animate-bounce"></i>
          </motion.div>
        )}
      </AnimatePresence>

      {!showLanguageOverlay && (
        <header className="sticky top-0 z-50 px-5 sm:px-8 lg:px-0 w-full mx-auto max-w-4xl">
          <div className=" flex items-center justify-between h-13 bg-transparent backdrop-blur-md">
            <a href="/" className="text-lg font-bold leading-none">
              exchan<span className="text-[#256F5C]">go</span>
            </a>

            <div className="flex items-center gap-4">
              <div className="relative" ref={themeDropdownRef}>
                <button
                  aria-label="Change Theme"
                  className="flex items-center gap-1 font-semibold uppercase cursor-pointer transition-colors duration-150"
                  onClick={() => {
                    setShowThemeDropdown(!showThemeDropdown);
                    setShowDropdown(false);
                  }}
                >
                  <i
                    className={`${getThemeIcon(theme)} text-base leading-none`}
                  ></i>
                  <i
                    className={`bx bx-chevron-down text-[1.25rem] leading-none transition-transform duration-200 ${
                      showThemeDropdown ? "rotate-180" : ""
                    }`}
                  ></i>
                </button>

                <AnimatePresence>
                  {showThemeDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="absolute right-0 top-8 w-38 border border-black/8 dark:border-white/8 bg-white dark:bg-[#242424] rounded-xl p-1.5 shadow-lg z-10"
                    >
                      <ul className="text-[0.9375rem] space-y-0.5">
                        {[
                          { value: "light", label: "Light", icon: "bx bx-sun" },
                          { value: "dark", label: "Dark", icon: "bx bx-moon" },
                          {
                            value: "system",
                            label: "System",
                            icon: "bx bx-desktop",
                          },
                        ].map((option) => (
                          <li key={option.value}>
                            <button
                              onClick={() => {
                                setTheme(option.value as Theme);
                                setShowThemeDropdown(false);
                              }}
                              className="w-full flex items-center justify-between px-2 py-1.5 text-left hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                            >
                              <div className="flex items-center gap-2">
                                <i className={`${option.icon} text-[1rem]`}></i>
                                <span>{option.label}</span>
                              </div>
                              {theme === option.value && (
                                <i className="bx bx-check text-[#256F5C] text-lg"></i>
                              )}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="relative" ref={dropdownRef}>
                <button
                  aria-label={t("aria.changeLanguage")}
                  className="flex items-center gap-1 text-sm font-semibold uppercase cursor-pointer transition-colors duration-150"
                  onClick={() => {
                    setShowDropdown(!showDropdown);
                    setShowThemeDropdown(false);
                  }}
                >
                  <i className="bx bx-globe-alt text-base leading-none"></i>
                  <span>{i18n.language}</span>
                  <i
                    className={`bx bx-chevron-down text-[1.25rem] leading-none transition-transform duration-200 ${
                      showDropdown ? "rotate-180" : ""
                    }`}
                  ></i>
                </button>

                <AnimatePresence>
                  {showDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="absolute right-0 top-8 w-44 border border-black/8 dark:border-white/8 bg-white dark:bg-[#242424] rounded-xl py-3 px-1.5 shadow-lg z-10"
                    >
                      <p className="font-semibold text-[0.9375rem] mb-2 px-1">
                        Pick your language
                      </p>
                      <ul className="text-[0.9375rem] space-y-0.5">
                        {countriesData.languages.map(({ code, label }) => (
                          <li key={code}>
                            <button
                              onClick={() => changeLanguage(code)}
                              className="w-full flex items-center justify-between px-2 py-1.5 text-left hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                            >
                              <span>{label}</span>
                              {i18n.language === code && (
                                <i className="bx bx-check text-[#256F5C] text-lg"></i>
                              )}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="border-t border-black/6 dark:border-white/6"></div>
        </header>
      )}
    </>
  );
}
