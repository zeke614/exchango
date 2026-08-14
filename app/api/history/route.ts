import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";

// Past (closed) days are immutable — OER's historical data for a date
// that's already ended doesn't change. Only "today" is still live and
// could shift as the day progresses, so it gets a real revalidate
// window instead of a long one.
const TODAY_REVALIDATE_SECONDS = 3600; // matches lib/rates.ts's hourly cadence
const PAST_DAY_REVALIDATE_SECONDS = 60 * 60 * 24 * 30; // forever for a closed day, without touching revalidate:false (which needs manual invalidation to ever clear)

function isPastDay(date: string): boolean {
  const today = new Date().toISOString().slice(0, 10);
  return date < today;
}

async function fetchHistoricalRate(date: string, base: string, target: string) {
  const appId = process.env.OPEN_EXCHANGE_RATES_APP_ID;
  if (!appId) {
    throw new Error("OPEN_EXCHANGE_RATES_APP_ID is not set");
  }

  const url = `https://openexchangerates.org/api/historical/${date}.json?app_id=${appId}&base=${base}&symbols=${target}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Open Exchange Rates returned status: ${res.status}`);
  }

  return res.json();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const base = searchParams.get("base");
  const target = searchParams.get("target");

  if (!date || !base || !target) {
    return NextResponse.json(
      { error: "Missing required parameters (date, base, target)" },
      { status: 400 },
    );
  }

  // Cache key carries date/base/target so each combo gets its own entry.
  // Built inline per request (not at module scope like getCachedRates)
  // because the revalidate window itself depends on date — that's fine,
  // unstable_cache just resolves to the existing cache slot by key.
  const getCached = unstable_cache(
    () => fetchHistoricalRate(date, base, target),
    ["history", date, base, target],
    {
      revalidate: isPastDay(date)
        ? PAST_DAY_REVALIDATE_SECONDS
        : TODAY_REVALIDATE_SECONDS,
    },
  );

  try {
    const data = await getCached();
    return NextResponse.json(data);
  } catch (error) {
    console.error("History API Proxy Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch historical rates" },
      { status: 500 },
    );
  }
}
