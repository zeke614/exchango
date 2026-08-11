"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import countriesData from "@/app/lib/data";

const themes = [
  { value: "light", label: "Light", icon: "bx bx-sun" },
  { value: "dark", label: "Dark", icon: "bx bx-moon" },
  { value: "system", label: "System", icon: "bx bx-desktop" },
];

export default function Header() {
  const { t, i18n } = useTranslation();

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [showDropdown, setShowDropdown] = useState(false);
  const [showLanguageOverlay, setShowLanguageOverlay] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
  const themeDropdownRef = useRef<HTMLDivElement>(null);

  // 2. Safely tell the component we are on the client
  useEffect(() => {
    setMounted(true);
  }, []);

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

  const getThemeIcon = (currentTheme: string | undefined) => {
    switch (currentTheme) {
      case "light":
        return "bx bx-sun";
      case "dark":
        return "bx bx-moon";
      default:
        return "bx bx-desktop";
    }
  };

  return (
    <>
      {/* Language Overlay */}
      <AnimatePresence>
        {showLanguageOverlay && (
          <motion.div
            key="language-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="fixed inset-0 z-100 flex items-center justify-center bg-white/60 dark:bg-black/60 backdrop-blur-md"
          >
            <i className="bx bx-translate text-[3rem] text-[#256F5C] animate-bounce"></i>
          </motion.div>
        )}
      </AnimatePresence>

      {!showLanguageOverlay && (
        <header className="sticky top-0 z-50 w-full mx-auto max-w-3xl bg-background/80 backdrop-blur-lg pt-[calc(env(safe-area-inset-top)-0.625rem)]">
          <div className="flex items-center justify-between h-15 px-5 sm:px-8 lg:px-0">
            <a href="/" className="text-lg font-bold leading-none">
              exchan<span className="text-[#256F5C]">go</span>
            </a>

            <div className="flex items-center gap-4">
              <div className="relative" ref={themeDropdownRef}>
                {/* 3. The Skeleton vs Button logic (borrowed from Assay) */}
                {mounted ? (
                  <button
                    aria-label="Change Theme"
                    className="flex items-center gap-1 font-bold uppercase cursor-pointer transition-colors duration-150"
                    onClick={() => {
                      setShowThemeDropdown(!showThemeDropdown);
                      setShowDropdown(false);
                    }}
                  >
                    <i
                      className={`${getThemeIcon(theme)} text-base leading-none`}
                    ></i>
                    <i
                      className={`bx bx-chevron-down text-xl leading-none transition-transform duration-200 ${showThemeDropdown ? "rotate-180" : ""}`}
                    ></i>
                  </button>
                ) : (
                  // A rigid skeleton block that perfectly mimics the size of the button
                  // to prevent any layout shifting when the JS finally executes.
                  <div className="w-8.5 h-5 rounded-none bg-black/5 dark:bg-white/5 animate-pulse"></div>
                )}

                <AnimatePresence>
                  {showThemeDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="absolute right-0 top-8 w-38 border-2 border-black/8 dark:border-white/8 bg-white dark:bg-[#242424] rounded-none p-1.5 shadow-lg z-10"
                    >
                      <ul className="text-[0.9375rem] space-y-0.5">
                        {themes.map((option) => (
                          <li key={option.value}>
                            <button
                              onClick={() => {
                                setTheme(option.value);
                                setShowThemeDropdown(false);
                              }}
                              className="w-full flex items-center justify-between px-2 py-1.5 text-left hover:bg-gray-50 dark:hover:bg-white/5 rounded-none transition-colors cursor-pointer"
                            >
                              <div className="flex items-center gap-2">
                                <i className={`${option.icon} text-[1rem]`}></i>
                                <span>{option.label}</span>
                              </div>
                              {mounted && theme === option.value && (
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
                  className="flex items-center gap-1 text-sm font-bold uppercase cursor-pointer transition-colors duration-150"
                  onClick={() => {
                    setShowDropdown(!showDropdown);
                    setShowThemeDropdown(false);
                  }}
                >
                  <i className="bx bx-globe-stand text-base leading-none"></i>
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
                      className="absolute right-0 top-8 w-42 border-2 border-black/8 dark:border-white/8 bg-white dark:bg-[#242424] rounded-none py-3 px-1.5 shadow-lg z-10"
                    >
                      <p className="font-bold text-[0.9375rem] mb-2 px-1">
                        {t("language.title")}
                      </p>
                      <ul className="text-[0.9375rem] space-y-0.5">
                        {countriesData.languages.map(({ code, label }) => (
                          <li key={code}>
                            <button
                              onClick={() => changeLanguage(code)}
                              className="w-full flex items-center justify-between px-2 py-1.5 text-left hover:bg-gray-50 dark:hover:bg-white/5 rounded-none transition-colors cursor-pointer"
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
          <div className="border-t border-[1.5px] border-black/6 dark:border-white/6"></div>
        </header>
      )}
    </>
  );
}
