import { NextResponse } from "next/server";

export async function GET() {
  const token = process.env.IPINFO_TOKEN;

  if (!token) {
    console.error("Missing IPINFO_TOKEN environment variable.");
    return NextResponse.json(
      { error: "Geolocation configuration missing" },
      { status: 500 },
    );
  }

  try {
    const res = await fetch(`https://ipinfo.io/json?token=${token}`);

    if (!res.ok) {
      throw new Error(`IPInfo returned status: ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Geo API Proxy Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch geolocation" },
      { status: 500 },
    );
  }
}
