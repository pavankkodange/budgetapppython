import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface Currency {
  code: string;
  name: string;
  symbol: string;
}

interface CurrencyContextType {
  selectedCurrency: Currency;
  setCurrency: (currencyCode: string) => void;
  currencies: Currency[];
}

const currencies: Currency[] = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$" },
  { code: "RUB", name: "Russian Ruble", symbol: "₽" },
  { code: "ZAR", name: "South African Rand", symbol: "R" },
  { code: "MXN", name: "Mexican Peso", symbol: "Mex$" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
  { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$" },
  { code: "SEK", name: "Swedish Krona", symbol: "kr" },
  { code: "NOK", name: "Norwegian Krone", symbol: "kr" },
  { code: "DKK", name: "Danish Krone", symbol: "kr" },
  { code: "KRW", name: "South Korean Won", symbol: "₩" },
  { code: "TRY", name: "Turkish Lira", symbol: "₺" },
  { code: "SAR", name: "Saudi Riyal", symbol: "﷼" },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ" },
  { code: "PLN", name: "Polish Złoty", symbol: "zł" },
  { code: "THB", name: "Thai Baht", symbol: "฿" },
  { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp" },
  { code: "MYR", name: "Malaysian Ringgit", symbol: "RM" },
  { code: "PHP", name: "Philippine Peso", symbol: "₱" },
  { code: "EGP", name: "Egyptian Pound", symbol: "E£" },
  { code: "CLP", name: "Chilean Peso", symbol: "CLP$" },
  { code: "COP", name: "Colombian Peso", symbol: "COL$" },
  { code: "ARS", name: "Argentine Peso", symbol: "ARS$" },
];

const LOCAL_STORAGE_KEY = 'selectedCurrencyCode';

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(() => {
    const savedCurrencyCode = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedCurrencyCode) {
      const savedCurrency = currencies.find(c => c.code === savedCurrencyCode);
      if (savedCurrency) {
        return savedCurrency;
      }
    }
    return currencies[0]; // Default to USD if no saved currency or if saved currency is invalid
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, selectedCurrency.code);
  }, [selectedCurrency]);

  const setCurrency = (currencyCode: string) => {
    const currency = currencies.find(c => c.code === currencyCode);
    if (currency) {
      setSelectedCurrency(currency);
    } else {
      console.warn(`Currency with code ${currencyCode} not found.`);
    }
  };

  return (
    <CurrencyContext.Provider value={{ selectedCurrency, setCurrency, currencies }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};