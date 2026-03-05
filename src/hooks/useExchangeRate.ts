import { useState, useEffect } from "react";
import axios from "axios";
import { CACHE_KEYS, CONVERSION_DECIMAL_PLACES } from "../constants";
import { readCache, readStaleCache, writeCache } from "../cache";

interface RatesMap {
  [currencyCode: string]: string;
}

interface UseExchangeRateResult {
  rate: number | null;
  convertedAmount: string;
  lastUpdated: Date | null;
  isLoading: boolean;
}

function computeRate(
  rates: RatesMap,
  fromCode: string,
  toCode: string,
): number {
  return parseFloat(rates[toCode]) / parseFloat(rates[fromCode]);
}

export function useExchangeRate(
  fromCode: string,
  toCode: string,
  amount: string,
  appId: string,
): UseExchangeRateResult {
  const [rate, setRate] = useState<number | null>(null);
  const [convertedAmount, setConvertedAmount] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Derive the converted amount whenever rate or amount changes
  useEffect(() => {
    const parsed = parseFloat(amount);
    if (!rate || !amount.trim() || isNaN(parsed)) {
      setConvertedAmount("");
      return;
    }
    setConvertedAmount((parsed * rate).toFixed(CONVERSION_DECIMAL_PLACES));
  }, [rate, amount]);

  // Fetch (or reuse cached) rates whenever currencies change
  useEffect(() => {
    async function loadRates() {
      setIsLoading(true);

      // 1. Try fresh cache first (avoids a network round-trip)
      const cached = readCache<RatesMap>(CACHE_KEYS.exchangeRates);
      if (cached) {
        applyRates(cached);
        setIsLoading(false);
        return;
      }

      // 2. Fetch fresh rates from the API
      try {
        const response = await axios.get<{ rates: RatesMap }>(
          `https://openexchangerates.org/api/latest.json?app_id=${appId}`,
        );
        const freshRates = response.data.rates;
        writeCache(CACHE_KEYS.exchangeRates, freshRates);
        applyRates(freshRates);
      } catch {
        // 3. Fall back to stale cache rather than showing nothing
        const stale = readStaleCache<RatesMap>(CACHE_KEYS.exchangeRates);
        if (stale) applyRates(stale);
      } finally {
        setIsLoading(false);
      }
    }

    function applyRates(rates: RatesMap) {
      setRate(computeRate(rates, fromCode, toCode));
      setLastUpdated(new Date());
    }

    loadRates();
  }, [fromCode, toCode, appId]);

  return { rate, convertedAmount, lastUpdated, isLoading };
}
