import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCurrency } from '@/context/CurrencyContext';

export const CurrencySelector: React.FC = () => {
  const { selectedCurrency, setCurrency, currencies } = useCurrency();

  return (
    <Select onValueChange={setCurrency} defaultValue={selectedCurrency.code}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select currency" />
      </SelectTrigger>
      <SelectContent>
        {currencies.map((currency) => (
          <SelectItem key={currency.code} value={currency.code}>
            {currency.symbol} {currency.name} ({currency.code})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};