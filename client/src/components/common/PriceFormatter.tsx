"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useMemo } from "react";
import { useCurrencyStore } from "@/lib/currencyStore";
import { convertFromBase, formatCurrencyAmount } from "@/lib/currency";

interface Props {
  amount: number | null;
  className?: string;
}
const PriceFormatter = ({ amount, className }: Props) => {
  const { selectedCurrency, rates, isLoading, fetchRates } = useCurrencyStore();

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  if (amount === null || amount === undefined) return null;

  const formattedPrice = useMemo(() => {
    const converted = convertFromBase(amount, selectedCurrency, rates);
    return formatCurrencyAmount(converted, selectedCurrency, "en");
  }, [amount, selectedCurrency, rates]);

  return (
    <span
      className={cn("text-sm font-semibold text-babyshopRed", className)}
      title={isLoading ? "Refreshing exchange rates" : undefined}
    >
      {formattedPrice}
    </span>
  );
};

export default PriceFormatter;
