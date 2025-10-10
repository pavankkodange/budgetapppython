import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { showSuccess, showError } from '@/utils/toast';
import { IncomeSource, IncomeSourceType, DeductionCategory } from '@/types'; // Import DeductionCategory

interface IncomeSourceContextType {
  incomeSources: IncomeSource[];
  addIncomeSource: (name: string, type: IncomeSourceType, deductionCategory?: DeductionCategory) => void; // Updated signature
  removeIncomeSource: (id: string) => void; // Updated signature to use id
}

const defaultIncomeSources: IncomeSource[] = [
  { id: crypto.randomUUID(), name: "Salary", type: "income" },
  { id: crypto.randomUUID(), name: "Freelance", type: "income" },
  { id: crypto.randomUUID(), name: "Bonus", type: "income" },
  { id: crypto.randomUUID(), name: "Investment", type: "income" },
  { id: crypto.randomUUID(), name: "Other Income", type: "income" },
  { id: crypto.randomUUID(), name: "Tax", type: "deduction", deductionCategory: "tax_or_actual_deduction" },
  { id: crypto.randomUUID(), name: "Health Insurance", type: "deduction", deductionCategory: "tax_or_actual_deduction" },
  { id: crypto.randomUUID(), name: "Retirement", type: "deduction", deductionCategory: "tax_or_actual_deduction" },
  { id: crypto.randomUUID(), name: "Saving Contributions", type: "deduction", deductionCategory: "employer_contribution" }, // Added Saving Contributions as employer_contribution
  { id: crypto.randomUUID(), name: "Other Deduction", type: "deduction", deductionCategory: "tax_or_actual_deduction" },
];
const LOCAL_STORAGE_KEY = 'incomeSources';

const IncomeSourceContext = createContext<IncomeSourceContextType | undefined>(undefined);

export const IncomeSourceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>(() => {
    try {
      const savedSources = localStorage.getItem(LOCAL_STORAGE_KEY);
      return savedSources ? JSON.parse(savedSources) : defaultIncomeSources;
    } catch (e) {
      console.error("Failed to parse income sources from localStorage:", e);
      return defaultIncomeSources;
    }
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(incomeSources));
  }, [incomeSources]);

  const addIncomeSource = (name: string, type: IncomeSourceType, deductionCategory?: DeductionCategory) => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      showError(`${type === 'income' ? 'Income source' : 'Deduction'} name cannot be empty.`);
      return;
    }
    if (incomeSources.some(s => s.name === trimmedName && s.type === type && s.deductionCategory === deductionCategory)) {
      showError(`${type === 'income' ? 'Income source' : 'Deduction'} "${trimmedName}" already exists.`);
      return;
    }
    const newSource: IncomeSource = { id: crypto.randomUUID(), name: trimmedName, type, deductionCategory };
    setIncomeSources((prev) => [...prev, newSource]);
    showSuccess(`${type === 'income' ? 'Income source' : 'Deduction'} "${trimmedName}" added.`);
  };

  const removeIncomeSource = (id: string) => {
    const sourceToRemove = incomeSources.find(s => s.id === id);
    if (!sourceToRemove) {
      showError("Income source or deduction not found.");
      return;
    }
    setIncomeSources((prev) => prev.filter((s) => s.id !== id));
    showSuccess(`${sourceToRemove.type === 'income' ? 'Income source' : 'Deduction'} "${sourceToRemove.name}" removed.`);
  };

  return (
    <IncomeSourceContext.Provider value={{ incomeSources, addIncomeSource, removeIncomeSource }}>
      {children}
    </IncomeSourceContext.Provider>
  );
};

export const useIncomeSources = () => {
  const context = useContext(IncomeSourceContext);
  if (context === undefined) {
    throw new Error('useIncomeSources must be used within an IncomeSourceProvider');
  }
  return context;
};