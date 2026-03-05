// Cache
export const CACHE_KEYS = {
  exchangeRates: "exchange_rates",
  userCurrency: "user_currency",
} as const;

export const CACHE_MAX_AGE_MINUTES = 60;

// Layout
export const MOBILE_BREAKPOINT_PX = 770;

// Formatting
export const CONVERSION_DECIMAL_PLACES = 2;
export const RATE_DECIMAL_PLACES = 4;

// Polling
export const RELATIVE_TIME_REFRESH_MS = 10_000;
