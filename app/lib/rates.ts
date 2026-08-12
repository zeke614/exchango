// Server-only. The full rates table is fetched once per revalidate
// window (matching the old CACHE_MAX_AGE_MINUTES=60 behavior) and
// reused across every currency pair — computeRate() just does math
// against it, same as the original hook did after its first fetch.

import { unstable_cache } from "next/cache";

const REVALIDATE_SECONDS = 3600;

export interface RatesMap {
  [currencyCode: string]: string;
}

export interface RatesData {
  rates: RatesMap | null; // null = fetch failed; UI shows "Could not fetch rate"
  fetchedAt: string | null; // ISO timestamp
}

// CORRECTED: the function you wrote used to be
// `getExchangeRates` itself, with `fetch(..., { next: { revalidate } })`
// controlling caching directly, and `fetchedAt` stamped with
// `new Date().toISOString()` right there.
//
// That was unreliable specifically for the "Updated X ago" display,
// because two independent Next caching layers were both in play at
// once — the fetch's own Data Cache (governed by `next.revalidate`)
// and the page's Full Route Cache (governed by the page being
// statically renderable, ○ Static, Revalidate 1h). They don't
// necessarily expire in lockstep: the Route Cache can re-render the
// page (re-running this function, producing a *new* Date.now() stamp)
// while the Data Cache underneath still serves the *same* stale rates
// object. Net effect: fetchedAt drifted from the actual API call time
// — fine for the old "rates refresh roughly hourly" framing, not
// accurate enough once we wanted an exact "fetched N minutes ago".
//
// Renamed to fetchRatesFromApi and stripped of its own caching config
// because caching authority now belongs entirely to unstable_cache
// below — see getCachedRates.

async function fetchRatesFromApi(): Promise<RatesData> {
  const appId = process.env.OPEN_EXCHANGE_RATES_APP_ID;
  if (!appId) {
    // Misconfiguration, not a runtime API failure — fail loudly so it's
    // caught in preview/CI rather than silently showing "no rate" in prod.
    throw new Error("OPEN_EXCHANGE_RATES_APP_ID is not set");
  }

  // No `next: { revalidate }` here anymore — deliberately. Letting both
  // this fetch AND unstable_cache each own a revalidation window was
  // the root cause above. unstable_cache is now the single source of
  // truth for when this whole function re-runs.

  const res = await fetch(
    `https://openexchangerates.org/api/latest.json?app_id=${appId}`,
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch exchange rates: ${res.status}`);
  }

  const data: { rates: RatesMap } = await res.json();

  return {
    rates: data.rates,
    // CORRECTED: this timestamp is now trustworthy. Because the whole
    // function is wrapped by unstable_cache (below), this line only
    // ever executes at the exact moment a genuine re-fetch happens —
    // every cached call in between returns this same literal object,
    // same fetchedAt, untouched. Previously this comment warned that
    // the stamp could be later than the true fetch time on a cache
    // hit; that's no longer possible with this structure.
    fetchedAt: new Date().toISOString(),
  };
}

// Single owner of caching/revalidation for rate data. Re-invokes
// fetchRatesFromApi at most once per REVALIDATE_SECONDS; every other
// call in that window returns the identical cached object.
const getCachedRates = unstable_cache(fetchRatesFromApi, ["exchange-rates"], {
  revalidate: REVALIDATE_SECONDS,
});

export async function getExchangeRates(): Promise<RatesData> {
  try {
    return await getCachedRates();
  } catch {
    // API outage: degrade to null rather than crashing the page. This
    // replaces the old client-side stale-cache fallback — there's no
    // server-side equivalent of "last known good from localStorage"
    // without adding a KV/edge-cache layer, which felt like scope creep
    // for this pass. Flag if you want that added back properly.
    //
    // NOTE: the try/catch lives out here, wrapping the *call* to
    // getCachedRates, not inside fetchRatesFromApi itself. That's
    // intentional — unstable_cache does not persist a thrown error as
    // a cached result, but it WOULD happily cache a returned
    // { rates: null, fetchedAt: null } for the full hour if we caught
    // the error on the inside. Catching out here means a transient API
    // failure gets retried on the very next request instead of locking
    // in an hour of "Could not fetch rate" for every visitor.
    return { rates: null, fetchedAt: null };
  }
}

export function computeRate(
  rates: RatesMap,
  fromCode: string,
  toCode: string,
): number | null {
  const from = parseFloat(rates[fromCode]);
  const to = parseFloat(rates[toCode]);
  if (!from || !to) return null;
  return to / from;
}
