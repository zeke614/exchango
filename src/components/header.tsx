import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import countriesData from "./data.ts";

export default function Header() {
  const { t, i18n } = useTranslation();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setShowDropdown(false);
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
    <header className="bg-white sticky top-0 z-50 flex items-center justify-between p-4 border-b border-b-[#0000001f] shadow-sm">
      <div>
        <svg
          width="60"
          height="32"
          viewBox="0 0 60 32"
          xmlns="http://www.w3.org/2000/svg"
        >
          <text
            x="0"
            y="24"
            font-family="cursive"
            font-size="22"
            font-weight="500"
            fill="black"
          >
            x<tspan fill="#256F5C">G</tspan>
          </text>
        </svg>
      </div>

      <h1 className="text-[22px] font-medium ml-6">
        exchan<span className="text-[#256F5C]">go</span>
      </h1>

      <div
        className="relative flex items-center justify-center"
        ref={dropdownRef}
      >
        <button
          aria-label={t("aria.changeLanguage")}
          className="flex items-center gap-0 justify-center"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <i className="bx bx-globe-alt text-[16px] mr-0.5 leading-none align-middle"></i>
          <span className="uppercase text-[15px]">{i18n.language}</span>
          <i className="bx bx-chevron-down text-[22px]"></i>
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
              <h3 className="font-normal text-[17.5px]">
                Select your language
              </h3>
              <ul className="text-[16.5px] mt-2 font-light">
                {countriesData.languages.map(({ code, label }) => (
                  <li key={code}>
                    <button
                      onClick={() => changeLanguage(code)}
                      className="w-full flex items-center justify-between p-2 text-left hover:bg-gray-100 rounded-md"
                    >
                      <span>{label}</span>
                      {i18n.language === code && (
                        <i className="bx  bx-check font-normal text-[#256F5C]"></i>
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
  );
}
