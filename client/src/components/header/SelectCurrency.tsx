import React from 'react'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '../ui/select';

const SelectCurrency = () => {
    const currencies = [
  { code: "USD", name: "US Dollar", symbol: "$", rate: 1.0 },
  { code: "EUR", name: "Euro", symbol: "€", rate: 0.92 },
  { code: "GBP", name: "British Pound", symbol: "£", rate: 0.78 },
  { code: "PKR", name: "Pakistani Rupee", symbol: "₨", rate: 278.5 },
  { code: "INR", name: "Indian Rupee", symbol: "₹", rate: 83.1 },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", rate: 150.3 },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥", rate: 7.2 },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", rate: 1.52 },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$", rate: 1.36 },
  { code: "SAR", name: "Saudi Riyal", symbol: "﷼", rate: 3.75 },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ", rate: 3.67 },
  { code: "TRY", name: "Turkish Lira", symbol: "₺", rate: 30.5 }
];
  return (
    <Select>
        <SelectTrigger className="border-none bg-transparent focus:ring-0 focus:outline-none shadow-none flex items-center justify-between px-2 py-1 data-[size=default]:h-6 dark:bg-transparent dark:hover:bg-transparent">
            <SelectValue placeholder="USD"></SelectValue>
        </SelectTrigger>
        <SelectContent>
            <SelectGroup>
                <SelectLabel>USD</SelectLabel>
                <SelectItem value='USD'>USD</SelectItem>
            </SelectGroup>
        </SelectContent>
    </Select>
  )
}

export default SelectCurrency