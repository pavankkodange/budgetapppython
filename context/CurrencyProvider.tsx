import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define types
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

// Available currencies
const CURRENCIES: Currency[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
];

// Create context
const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// Storage key
const STORAGE_KEY = 'selectedCurrency';

// Provider component
export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(CURRENCIES[0]);

  // Load saved currency on mount
  useEffect(() => {
    const loadCurrency = async () => {
      try {
        const savedCurrencyCode = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedCurrencyCode) {
          const currency = CURRENCIES.find(c => c.code === savedCurrencyCode);
          if (currency) {
            setSelectedCurrency(currency);
          }
        }
      } catch (error) {
        console.error('Failed to load currency preference', error);
      }
    };

    loadCurrency();
  }, []);

  // Set currency by code
  const setCurrency = async (currencyCode: string) => {
    const currency = CURRENCIES.find(c => c.code === currencyCode);
    if (currency) {
      setSelectedCurrency(currency);
      try {
        await AsyncStorage.setItem(STORAGE_KEY, currencyCode);
      } catch (error) {
        console.error('Failed to save currency preference', error);
      }
    }
  };

  return (
    <CurrencyContext.Provider value={{ selectedCurrency, setCurrency, currencies: CURRENCIES }}>
      {children}
    </CurrencyContext.Provider>
  );
};

// Hook for using the currency context
export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};