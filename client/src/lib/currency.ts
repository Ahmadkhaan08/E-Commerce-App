export const BASE_CURRENCY = "PKR";
export const EXCHANGE_RATE_CACHE_TTL_MS = 20 * 60 * 1000;

export const SUPPORTED_CURRENCIES = [
  { code: "PKR", name: "Pakistani Rupee", symbol: "Rs" },
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ" },
  { code: "SAR", name: "Saudi Riyal", symbol: "ر.س" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
] as const;

export type SupportedCurrencyCode = (typeof SUPPORTED_CURRENCIES)[number]["code"];

export type CurrencyRates = Record<string, number>;

export const FALLBACK_RATES: CurrencyRates = {
  PKR: 1,              // Base currency
  USD: 1 / 278.5,      // Approx PKR to USD
  EUR: 1 / 302,        // Approx PKR to EUR
  GBP: 1 / 356,        // Approx PKR to GBP
  AED: 1 / 75.8,       // Approx PKR to AED
  SAR: 1 / 74.2,       // Approx PKR to SAR
  JPY: 1 / 2.03,       // Approx PKR to JPY
  CAD: 1 / 209.5,      // Approx PKR to CAD
  AUD: 1 / 188.0,      // Approx PKR to AUD
  INR: 1 / 3.35,       // Approx PKR to INR
  CNY: 1 / 39.8,       // Approx PKR to CNY
  CHF: 1 / 305.0,      // Approx PKR to CHF
};

export const isSupportedCurrency = (currency: string): currency is SupportedCurrencyCode =>
  SUPPORTED_CURRENCIES.some((item) => item.code === currency);

export const sanitizeRates = (rates: CurrencyRates): CurrencyRates => {
  const cleaned: CurrencyRates = { [BASE_CURRENCY]: 1 };
  for (const currency of SUPPORTED_CURRENCIES) {
    const code = currency.code;
    if (code === BASE_CURRENCY) {
      cleaned[code] = 1;
      continue;
    }
    const value = Number(rates[code]);
    if (Number.isFinite(value) && value > 0) {
      cleaned[code] = value;
    }
  }
  return cleaned;
};

export const convertFromBase = (
  baseAmount: number,
  targetCurrency: string,
  rates: CurrencyRates,
): number => {
  const safeAmount = Number(baseAmount) || 0;
  const rate = rates[targetCurrency] ?? 1;
  return safeAmount * rate;
};

export const formatCurrencyAmount = (
  amount: number,
  currencyCode: string,
  locale = "en",
): string => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount || 0);
};
