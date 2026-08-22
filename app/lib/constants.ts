export const CACHE_KEYS = {
  userCurrency: "user_currency",
} as const;

export const CACHE_MAX_AGE_MINUTES = 60;

// History-chart cache lifetimes. "Today" (still live, can move) needs a
// short window matching the server's TODAY_REVALIDATE_SECONDS in route.ts.
// A closed day is immutable once OER settles it, so it can be cached long.

export const HISTORY_LIVE_DAY_CACHE_MINUTES = 60;
export const HISTORY_CLOSED_DAY_CACHE_MINUTES = 60 * 24 * 30;

export const MOBILE_BREAKPOINT_PX = 770;

export const CONVERSION_DECIMAL_PLACES = 2;
export const RATE_DECIMAL_PLACES = 4;

// Polling
export const RELATIVE_TIME_REFRESH_MS = 10_000;

export const PH_EVENTS = {
  currencyConverted: "currency_converted",
  currencySwapped: "currency_swapped",
  chartViewed: "chart_viewed",
  pwaInstalled: "pwa_installed",
} as const;
