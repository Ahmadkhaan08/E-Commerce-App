"use client";

import React, { useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { SUPPORTED_CURRENCIES } from "@/lib/currency";
import { useCurrencyStore } from "@/lib/currencyStore";
import { Loader2 } from "lucide-react";

const SelectCurrency = () => {
  const {
    selectedCurrency,
    isLoading,
    error,
    setCurrency,
    fetchRates,
  } = useCurrencyStore();

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  return (
    <div className="flex items-center gap-2">
      <Select
        value={selectedCurrency}
        onValueChange={(value) => {
          setCurrency(value);
          fetchRates();
        }}
      >
        <SelectTrigger className="border-none bg-transparent focus:ring-0 focus:outline-none shadow-none flex items-center justify-between px-2 py-1 data-[size=default]:h-6 dark:bg-transparent dark:hover:bg-transparent">
          <SelectValue placeholder="Currency" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Currency</SelectLabel>
            {SUPPORTED_CURRENCIES.map((currency) => (
              <SelectItem key={currency.code} value={currency.code}>
                {currency.symbol} {currency.code} - {currency.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-label="Loading exchange rates" />}
      {error && <span className="text-[10px] text-red-200">Offline rates</span>}
    </div>
  );
};

export default SelectCurrency;