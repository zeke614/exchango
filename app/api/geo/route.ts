import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const token = process.env.IPINFO_TOKEN;

  if (!token) {
    return NextResponse.json(
      { error: "Configuration missing" },
      { status: 500 },
    );
  }

  // 1. Extract the actual user's IP from Vercel's headers
  const forwardedFor = request.headers.get("x-forwarded-for");
  const clientIp = forwardedFor ? forwardedFor.split(",")[0].trim() : "";

  try {
    // 2. Explicitly pass the user's IP to IPInfo.
    // else IPInfo will geolocate the Vercel data center (US).
    const url = clientIp
      ? `https://ipinfo.io/${clientIp}/json?token=${token}`
      : `https://ipinfo.io/json?token=${token}`;

    const res = await fetch(url);

    if (!res.ok) throw new Error("IPInfo fetch failed");

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Geo Proxy Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch geolocation" },
      { status: 500 },
    );
  }
}
