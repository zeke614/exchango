// Server-only. The full rates table is fetched once per revalidate
// window (matching the old CACHE_MAX_AGE_MINUTES=60 behavior) and
// reused across every currency pair — computeRate() just does math
// against it, same as the original hook did after its first fetch.

const REVALIDATE_SECONDS = 3600;

export interface RatesMap {
  [currencyCode: string]: string;
}

export interface RatesData {
  rates: RatesMap | null; // null = fetch failed; UI shows "Could not fetch rate"
  fetchedAt: string | null; // ISO timestamp
}

export async function getExchangeRates(): Promise<RatesData> {
  const appId = process.env.OPEN_EXCHANGE_RATES_APP_ID;
  if (!appId) {
    // Misconfiguration, not a runtime API failure — fail loudly so it's
    // caught in preview/CI rather than silently showing "no rate" in prod.
    throw new Error("OPEN_EXCHANGE_RATES_APP_ID is not set");
  }

  try {
    const res = await fetch(
      `https://openexchangerates.org/api/latest.json?app_id=${appId}`,
      { next: { revalidate: REVALIDATE_SECONDS } },
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch exchange rates: ${res.status}`);
    }

    const data: { rates: RatesMap } = await res.json();

    return {
      rates: data.rates,
      // NOTE (flagged, not silently glossed over): this is the time this
      // function ran, not necessarily the time the underlying fetch()
      // actually hit the network. Next's fetch cache can serve a cached
      // response without re-running the network call, so on a cache hit
      // this timestamp is later than the true fetch time. Good enough
      // for "rates refresh roughly hourly" framing; NOT accurate for a
      // precise "updated N minutes ago" display. See chat for the
      // unstable_cache-based alternative if exact freshness matters.
      fetchedAt: new Date().toISOString(),
    };
  } catch {
    // API outage: degrade to null rather than crashing the page. This
    // replaces the old client-side stale-cache fallback — there's no
    // server-side equivalent of "last known good from localStorage"
    // without adding a KV/edge-cache layer, which felt like scope creep
    // for this pass. Flag if you want that added back properly.
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
