import { useEffect } from "react";
import countriesData from "../components/data";
import { CACHE_KEYS } from "../constants";
import { readCache, writeCache } from "../cache";

type Currency = (typeof countriesData.currencies)[number];

/**
 * On first load, detects the user's local currency via their IP address
 * and updates the `toCurrency` state. Result is cached so the API is
 * only called once per browser session.
 */

export function useDetectedCurrency(
  setCurrency: (currency: Currency) => void,
  ipInfoToken: string,
) {
  useEffect(() => {
    async function detect() {
      // Use cached result if available — avoids a network call on every visit
      const cached = readCache<Currency>(CACHE_KEYS.userCurrency);
      if (cached) {
        setCurrency(cached);
        return;
      }

      try {
        const res = await fetch(`https://ipinfo.io/json?token=${ipInfoToken}`);
        const { country } = await res.json();
        const countryCode = country?.toUpperCase();

        const currency = resolveCurrencyFromCountry(countryCode);
        if (currency) {
          setCurrency(currency);
          writeCache(CACHE_KEYS.userCurrency, currency);
        }
      } catch {
        // Silently fall back to the default currency set in App state
      }
    }

    detect();
  }, []);
}

function resolveCurrencyFromCountry(countryCode: string): Currency | undefined {
  // Euro-zone countries share a single currency
  if (countriesData.euroZone.includes(countryCode)) {
    return countriesData.currencies.find((c) => c.code === "EUR");
  }

  // Every other country maps with its unique flag code
  return countriesData.currencies.find(
    (c) => c.flag.toUpperCase() === countryCode,
  );
}
