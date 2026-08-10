import { NextResponse } from "next/server";

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

  const appId = process.env.OPEN_EXCHANGE_RATES_APP_ID;

  if (!appId) {
    console.error("Missing OPEN_EXCHANGE_RATES_APP_ID environment variable.");
    return NextResponse.json(
      { error: "Exchange rate configuration missing" },
      { status: 500 },
    );
  }

  try {
    const url = `https://openexchangerates.org/api/historical/${date}.json?app_id=${appId}&base=${base}&symbols=${target}`;
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`Open Exchange Rates returned status: ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("History API Proxy Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch historical rates" },
      { status: 500 },
    );
  }
}
