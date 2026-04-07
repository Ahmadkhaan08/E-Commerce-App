import { NextRequest, NextResponse } from "next/server";
import {
  BASE_CURRENCY,
  EXCHANGE_RATE_CACHE_TTL_MS,
  FALLBACK_RATES,
  sanitizeRates,
} from "@/lib/currency";

type ExternalRatesResponse = {
  rates?: Record<string, number>;
  result?: string;
};

let ratesCache: {
  base: string;
  fetchedAt: number;
  rates: Record<string, number>;
} | null = null;

export async function GET(req: NextRequest) {
  const baseParam = req.nextUrl.searchParams.get("base") || BASE_CURRENCY;
  const base = baseParam.toUpperCase();

  if (base !== BASE_CURRENCY) {
    return NextResponse.json(
      {
        success: false,
        message: `Unsupported base currency. Use ${BASE_CURRENCY}.`,
      },
      { status: 400 },
    );
  }

  const now = Date.now();
  if (ratesCache && now - ratesCache.fetchedAt < EXCHANGE_RATE_CACHE_TTL_MS) {
    return NextResponse.json({
      success: true,
      base,
      rates: ratesCache.rates,
      fetchedAt: new Date(ratesCache.fetchedAt).toISOString(),
      source: "cache",
    });
  }

  try {
    const externalResponse = await fetch(`https://open.er-api.com/v6/latest/${base}`, {
      method: "GET",
      headers: { Accept: "application/json" },
      next: { revalidate: 60 * 15 },
    });

    if (!externalResponse.ok) {
      throw new Error(`Rate provider error: ${externalResponse.status}`);
    }

    const data = (await externalResponse.json()) as ExternalRatesResponse;
    if (!data || data.result === "error" || typeof data.rates !== "object") {
      throw new Error("Invalid exchange provider response");
    }

    const sanitized = sanitizeRates(data.rates);
    ratesCache = {
      base,
      fetchedAt: now,
      rates: sanitized,
    };

    return NextResponse.json({
      success: true,
      base,
      rates: sanitized,
      fetchedAt: new Date(now).toISOString(),
      source: "provider",
    });
  } catch (error) {
    console.error("Exchange rates API failed", error);
    const fallback = sanitizeRates(FALLBACK_RATES);

    return NextResponse.json(
      {
        success: true,
        base,
        rates: fallback,
        fetchedAt: new Date(now).toISOString(),
        source: "fallback",
        warning: "Live exchange rates unavailable. Using fallback rates.",
      },
      { status: 200 },
    );
  }
}
