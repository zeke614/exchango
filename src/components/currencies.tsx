import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import countriesData from "./data.ts";

interface Currency {
  code: string;
  name: string;
  flag: string;
  symbol: string;
}

interface Props {
  selected: Currency;
  setSelected: (currency: Currency) => void;
}

export default function CurrencyDropdown({ selected, setSelected }: Props) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => setOpen((prev) => !prev);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCurrencies = countriesData.currencies.filter(
    (currency) =>
      currency.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      currency.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={toggleDropdown}
        className="flex font- items-center w-fit gap-2 cursor-pointer"
      >
        <img
          src={`https://flagcdn.com/${selected.flag}.svg`}
          alt="Flag"
          className="w-5 h-3.5 rounded-sm object-cover"
        />
        <span className="text-[17px] font-medium">{selected.code}</span>
        <i
          className={`bx bx-chevron-down text-2xl transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        ></i>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="absolute mt-4.5 left-0 z-30 bg-white dark:bg-[#242424] space-y-3 shadow-md rounded-xl px-2 pt-4 w-80 h-68.5 border border-black/6 dark:border-white/6 overflow-y-auto max-h-[18rem] thin-scrollbar"
          >
            <div className="relative">
              <div className="absolute left-0 text-lg inset-y-0 flex items-center pl-2 pointer-events-none">
                <i className="bx bx-search text-black/50 dark:text-gray-400"></i>
              </div>
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-[1.875rem] pr-3 py-2 border border-black/6 dark:border-white/6 rounded-md outline-none transition-all duration-300 ease-in-out focus:border-black/15 dark:focus:border-white/15"
              />
            </div>

            <ul className="space-y-1 max-h-47.5 overflow-y-auto">
              {filteredCurrencies.length > 0 ? (
                filteredCurrencies.map((currency) => (
                  <li key={currency.code}>
                    <button
                      onClick={() => {
                        setSelected(currency);
                        setOpen(false);
                        setSearchTerm("");
                      }}
                      className="w-full flex items-center justify-between p-1 rounded hover:bg-gray-50 dark:hover:bg-white/5.5 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={`https://flagcdn.com/${currency.flag}.svg`}
                          alt={`${currency.name} flag`}
                          className="w-5 h-4 object-cover rounded"
                        />
                        <span>{currency.code}</span>
                        <span className="text-black/65 dark:text-gray-200 text-sm">
                          {currency.name}
                        </span>
                      </div>
                      {selected.code === currency.code && (
                        <i className="bx bx-check font-normal text-[#256F5C]"></i>
                      )}
                    </button>
                  </li>
                ))
              ) : (
                <li className="text-black/65 dark:text-gray-200 text-center py-2">
                  No results
                </li>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
