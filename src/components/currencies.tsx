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
      currency.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={toggleDropdown}
        className="flex items-center w-fit gap-2"
      >
        <img
          src={`https://flagcdn.com/${selected.flag}.svg`}
          alt={selected.code}
          className="w-5 h-[0.9375rem] rounded-sm object-cover"
        />
        <span className="text-xl font-medium">{selected.code}</span>
        <i className="bx bx-chevron-down text-2xl"></i>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute mt-[1.25rem] -left-[1.625rem] z-50 bg-white space-y-3 shadow-md rounded-xl px-[0.5rem] pt-[1rem] w-[21.25rem] h-[17.1875rem] border border-gray-300 overflow-y-auto max-h-[18rem] thin-scrollbar"
          >
            <div className="relative">
              <div className="absolute left-0 text-lg inset-y-0 flex items-center pl-[0.5rem] pointer-events-none">
                <i className="bx bx-search-alt text-gray-500"></i>
              </div>
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-[1.875rem] pr-[0.75rem] py-[0.5rem] border border-gray-300 rounded-md outline-none transition-all duration-300 ease-in-out focus:border-gray-600 text-lg"
              />
            </div>

            <ul className="space-y-1 max-h-[11.25rem] overflow-y-auto">
              {filteredCurrencies.length > 0 ? (
                filteredCurrencies.map((currency) => (
                  <li key={currency.code}>
                    <button
                      onClick={() => {
                        setSelected(currency);
                        setOpen(false);
                        setSearchTerm("");
                      }}
                      className="w-full flex items-center justify-between p-[0.25rem] rounded hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={`https://flagcdn.com/${currency.flag}.svg`}
                          alt={currency.code}
                          className="w-5 h-4 object-cover rounded"
                        />
                        <span className="text-[1.0625rem]">
                          {currency.code}
                        </span>
                        <span className="text-gray-600">{currency.name}</span>
                      </div>
                      {selected.code === currency.code && (
                        <i className="bx bx-check font-normal text-[#256F5C]"></i>
                      )}
                    </button>
                  </li>
                ))
              ) : (
                <li className="text-xl text-gray-500 text-center py-[0.5rem]">
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
