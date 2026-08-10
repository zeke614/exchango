"use client";

import { useEffect } from "react";
import countriesData from "@/app/lib/data";
import { CACHE_KEYS } from "@/app/lib/constants";
import { readCache, writeCache } from "@/app/lib/cache";

type Currency = (typeof countriesData.currencies)[number];

export function useDetectedCurrency(setCurrency: (currency: Currency) => void) {
  useEffect(() => {
    async function detect() {
      const cached = readCache<Currency>(CACHE_KEYS.userCurrency);
      if (cached) {
        setCurrency(cached);
        return;
      }

      try {
        const res = await fetch("/api/geo");
        if (!res.ok) throw new Error("Failed to fetch geolocation");

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
  if (countriesData.euroZone.includes(countryCode)) {
    return countriesData.currencies.find((c) => c.code === "EUR");
  }

  return countriesData.currencies.find(
    (c) => c.flag.toUpperCase() === countryCode,
  );
}
