import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { showSuccess, showError } from '@/utils/toast';
import { SavingsEntry } from '@/types';
import { useSavingsInstruments } from './SavingsInstrumentContext'; // Import useSavingsInstruments

interface SavingsEntryContextType {
  savingsEntries: SavingsEntry[];
  addSavingsEntry: (entry: Omit<SavingsEntry, 'id'>) => void;
  removeSavingsEntry: (entryId: string) => void;
}

const LOCAL_STORAGE_KEY = 'savingsEntries';

const SavingsEntryContext = createContext<SavingsEntryContextType | undefined>(undefined);

export const SavingsEntryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { savingsInstruments, updateSavingsInstrumentTotalInvested } = useSavingsInstruments(); // Use savings instruments context
  const [savingsEntries, setSavingsEntries] = useState<SavingsEntry[]>(() => {
    try {
      const savedEntries = localStorage.getItem(LOCAL_STORAGE_KEY);
      return savedEntries ? JSON.parse(savedEntries).map((item: SavingsEntry) => ({
        ...item,
        date: new Date(item.date), // Convert date string back to Date object
      })) : [];
    } catch (e) {
      console.error("Failed to parse savings entries from localStorage:", e);
      return []; // Return empty array on error
    }
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(savingsEntries));
  }, [savingsEntries]);

  const addSavingsEntry = (newEntryData: Omit<SavingsEntry, 'id'>) => {
    const newEntry: SavingsEntry = {
      id: crypto.randomUUID(),
      ...newEntryData,
    };
    setSavingsEntries((prevEntries) => [...prevEntries, newEntry]);
    showSuccess("Savings contribution added successfully!");

    // Find the corresponding instrument and update its totalInvested
    const instrument = savingsInstruments.find(inst => inst.name === newEntryData.instrument);
    if (instrument) {
      updateSavingsInstrumentTotalInvested(instrument.id, instrument.totalInvested + newEntryData.amount);
    }
  };

  const removeSavingsEntry = (entryId: string) => {
    const entryToRemove = savingsEntries.find(e => e.id === entryId);
    if (!entryToRemove) {
      showError("Savings entry not found.");
      return;
    }
    setSavingsEntries((prev) => prev.filter((e) => e.id !== entryId));
    showSuccess(`Savings entry removed.`);

    // Decrement the totalInvested for the corresponding instrument
    const instrument = savingsInstruments.find(inst => inst.name === entryToRemove.instrument);
    if (instrument) {
      updateSavingsInstrumentTotalInvested(instrument.id, instrument.totalInvested - entryToRemove.amount);
    }
  };

  return (
    <SavingsEntryContext.Provider value={{ savingsEntries, addSavingsEntry, removeSavingsEntry }}>
      {children}
    </SavingsEntryContext.Provider>
  );
};

export const useSavingsEntries = () => {
  const context = useContext(SavingsEntryContext);
  if (context === undefined) {
    throw new Error('useSavingsEntries must be used within a SavingsEntryProvider');
  }
  return context;
};