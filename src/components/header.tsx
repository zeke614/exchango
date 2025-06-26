import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import countriesData from "./data.ts";

export default function Header() {
  const { t, i18n } = useTranslation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLanguageOverlay, setShowLanguageOverlay] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const changeLanguage = (lang: string) => {
    setShowLanguageOverlay(true);

    setTimeout(() => {
      i18n.changeLanguage(lang);
      setShowLanguageOverlay(false);
      setShowDropdown(false);
    }, 1000);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

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
            className="fixed inset-0 z-[9999] bg-white flex items-center justify-center"
          >
            <i className="bx bx-translate text-[3.5rem] text-[#256F5C] animate-bounce"></i>
          </motion.div>
        )}
      </AnimatePresence>

      {!showLanguageOverlay && (
        <header className="bg-white sticky top-0 z-50 flex items-center justify-between p-4 border-b border-b-[#0000001f]">
          <h1 className="text-[1.375rem] font-medium">
            exchan<span className="text-[#256F5C]">go</span>
          </h1>

          <div
            className="relative flex flex-row items-center justify-center gap-[0.625rem]"
            ref={dropdownRef}
          >
            <button
              aria-label={t("aria.changeLanguage")}
              className="flex items-center gap-0 justify-center"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <i className="bx bx-globe-alt text-[1rem] mr-[0.125rem] leading-none align-middle"></i>
              <span className="uppercase text-[0.9375rem]">
                {i18n.language}
              </span>
              <i className="bx bx-chevron-down text-[1.375rem]"></i>
            </button>

            <AnimatePresence>
              {showDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="absolute -right-2 top-10 bg-white w-52 border border-gray-300 rounded-xl px-3 py-4 shadow-lg z-10"
                >
                  <h3 className="font-normal text-[1.09375rem]">
                    Select your language
                  </h3>
                  <ul className="text-[1.03125rem] mt-2 font-light">
                    {countriesData.languages.map(({ code, label }) => (
                      <li key={code}>
                        <button
                          onClick={() => changeLanguage(code)}
                          className="w-full flex items-center justify-between p-2 text-left hover:bg-gray-100 rounded-md"
                        >
                          <span>{label}</span>
                          {i18n.language === code && (
                            <i className="bx bx-check font-normal text-[#256F5C]"></i>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>
      )}
    </>
  );
}
