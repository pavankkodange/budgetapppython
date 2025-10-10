import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { showSuccess, showError } from '@/utils/toast';
import { SavingsInstrument } from '@/types';

interface SavingsInstrumentContextType {
  savingsInstruments: SavingsInstrument[];
  addSavingsInstrument: (name: string) => void;
  removeSavingsInstrument: (id: string) => void;
  updateSavingsInstrumentValue: (id: string, newValue: number) => void;
  updateSavingsInstrumentTotalInvested: (id: string, newTotalInvested: number) => void; // New function
}

const defaultSavingsInstruments: SavingsInstrument[] = [
  { id: crypto.randomUUID(), name: "High-Yield Savings Account", totalInvested: 0, currentValue: 0 },
  { id: crypto.randomUUID(), name: "Stock Portfolio", totalInvested: 0, currentValue: 0 },
  { id: crypto.randomUUID(), name: "Retirement Fund", totalInvested: 0, currentValue: 0 },
  { id: crypto.randomUUID(), name: "Emergency Fund", totalInvested: 0, currentValue: 0 },
];
const LOCAL_STORAGE_KEY = 'savingsInstruments';

const SavingsInstrumentContext = createContext<SavingsInstrumentContextType | undefined>(undefined);

export const SavingsInstrumentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [savingsInstruments, setSavingsInstruments] = useState<SavingsInstrument[]>(() => {
    try {
      const savedInstruments = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedInstruments) {
        const parsedInstruments = JSON.parse(savedInstruments);
        // Ensure totalInvested and currentValue are numbers, default to 0 if missing or invalid
        return parsedInstruments.map((instrument: any) => ({
          ...instrument,
          totalInvested: typeof instrument.totalInvested === 'number' && !isNaN(instrument.totalInvested) ? instrument.totalInvested : 0,
          currentValue: typeof instrument.currentValue === 'number' && !isNaN(instrument.currentValue) ? instrument.currentValue : 0,
        }));
      }
    } catch (e) {
      console.error("Failed to parse saved savings instruments from localStorage:", e);
    }
    return defaultSavingsInstruments; // Fallback to defaults on error or no saved data
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(savingsInstruments));
  }, [savingsInstruments]);

  const addSavingsInstrument = (name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      showError("Savings instrument name cannot be empty.");
      return;
    }
    if (savingsInstruments.some(s => s.name === trimmedName)) {
      showError(`Savings instrument "${trimmedName}" already exists.`);
      return;
    }
    const newInstrument: SavingsInstrument = { id: crypto.randomUUID(), name: trimmedName, totalInvested: 0, currentValue: 0 };
    setSavingsInstruments((prev) => [...prev, newInstrument]);
    showSuccess(`Savings instrument "${trimmedName}" added.`);
  };

  const removeSavingsInstrument = (id: string) => {
    const instrumentToRemove = savingsInstruments.find(s => s.id === id);
    if (!instrumentToRemove) {
      showError("Savings instrument not found.");
      return;
    }
    setSavingsInstruments((prev) => prev.filter((s) => s.id !== id));
    showSuccess(`Savings instrument "${instrumentToRemove.name}" removed.`);
  };

  const updateSavingsInstrumentValue = (id: string, newValue: number) => {
    setSavingsInstruments((prev) =>
      prev.map((instrument) =>
        instrument.id === id ? { ...instrument, currentValue: newValue } : instrument
      )
    );
  };

  const updateSavingsInstrumentTotalInvested = (id: string, newTotalInvested: number) => {
    setSavingsInstruments((prev) =>
      prev.map((instrument) =>
        instrument.id === id ? { ...instrument, totalInvested: newTotalInvested } : instrument
      )
    );
  };

  return (
    <SavingsInstrumentContext.Provider value={{ savingsInstruments, addSavingsInstrument, removeSavingsInstrument, updateSavingsInstrumentValue, updateSavingsInstrumentTotalInvested }}>
      {children}
    </SavingsInstrumentContext.Provider>
  );
};

export const useSavingsInstruments = () => {
  const context = useContext(SavingsInstrumentContext);
  if (context === undefined) {
    throw new Error('useSavingsInstruments must be used within a SavingsInstrumentProvider');
  }
  return context;
};