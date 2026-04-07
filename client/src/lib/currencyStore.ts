"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  BASE_CURRENCY,
  CurrencyRates,
  EXCHANGE_RATE_CACHE_TTL_MS,
  FALLBACK_RATES,
  SupportedCurrencyCode,
  convertFromBase,
  formatCurrencyAmount,
  isSupportedCurrency,
  sanitizeRates,
} from "@/lib/currency";

type RatesApiResponse = {
  success: boolean;
  base: string;
  rates: Record<string, number>;
  fetchedAt: string;
  source?: string;
};

type CurrencyState = {
  selectedCurrency: SupportedCurrencyCode;
  rates: CurrencyRates;
  ratesUpdatedAt: number | null;
  isLoading: boolean;
  error: string | null;
  setCurrency: (currency: string) => void;
  fetchRates: (force?: boolean) => Promise<void>;
  convertPrice: (baseAmount: number) => number;
  formatBasePrice: (baseAmount: number, locale?: string) => string;
};

const isRatesFresh = (ratesUpdatedAt: number | null) => {
  if (!ratesUpdatedAt) return false;
  return Date.now() - ratesUpdatedAt < EXCHANGE_RATE_CACHE_TTL_MS;
};

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set, get) => ({
      selectedCurrency: BASE_CURRENCY,
      rates: { ...FALLBACK_RATES },
      ratesUpdatedAt: null,
      isLoading: false,
      error: null,

      setCurrency: (currency) => {
        if (!isSupportedCurrency(currency)) return;
        set({ selectedCurrency: currency, error: null });
      },

      fetchRates: async (force = false) => {
        const { isLoading, ratesUpdatedAt } = get();
        if (isLoading) return;
        if (!force && isRatesFresh(ratesUpdatedAt)) return;

        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`/api/exchange-rates?base=${BASE_CURRENCY}`, {
            method: "GET",
            cache: "no-store",
          });

          if (!response.ok) {
            throw new Error(`Failed to fetch exchange rates (${response.status})`);
          }

          const data = (await response.json()) as RatesApiResponse;
          if (!data?.success || typeof data?.rates !== "object") {
            throw new Error("Invalid exchange rates response");
          }

          const cleanedRates = sanitizeRates(data.rates);
          if (!cleanedRates[BASE_CURRENCY]) {
            cleanedRates[BASE_CURRENCY] = 1;
          }

          set({
            rates: { ...FALLBACK_RATES, ...cleanedRates },
            ratesUpdatedAt: Date.now(),
            isLoading: false,
            error: null,
          });
        } catch (error) {
          console.error("Currency rates fetch failed", error);
          set({
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch exchange rates",
            rates: { ...FALLBACK_RATES },
          });
        }
      },

      convertPrice: (baseAmount) => {
        const { selectedCurrency, rates } = get();
        return convertFromBase(baseAmount, selectedCurrency, rates);
      },

      formatBasePrice: (baseAmount, locale = "en") => {
        const { selectedCurrency, rates } = get();
        const converted = convertFromBase(baseAmount, selectedCurrency, rates);
        return formatCurrencyAmount(converted, selectedCurrency, locale);
      },
    }),
    {
      name: "currency-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedCurrency: state.selectedCurrency,
        rates: state.rates,
        ratesUpdatedAt: state.ratesUpdatedAt,
      }),
    },
  ),
);
