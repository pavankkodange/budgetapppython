import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { TaxDeduction, DocumentAttachment } from '@/types';
import { showSuccess, showError } from '@/utils/toast';

interface TaxDeductionContextType {
  taxDeductions: TaxDeduction[];
  addTaxDeduction: (deduction: Omit<TaxDeduction, 'id' | 'createdAt' | 'attachments'>) => void;
  updateTaxDeduction: (id: string, updates: Partial<TaxDeduction>) => void;
  removeTaxDeduction: (id: string) => void;
  getTaxDeductionsByYear: (year: number) => TaxDeduction[];
  getTaxDeductionsByType: (year: number, type: string) => TaxDeduction[];
  getTotalDeductionsForYear: (year: number) => number;
  uploadAttachment: (deductionId: string, attachment: Omit<DocumentAttachment, 'id' | 'uploadDate'>) => void;
  removeAttachment: (deductionId: string, attachmentId: string) => void;
}

const TAX_DEDUCTIONS_KEY = 'taxDeductions';

const TaxDeductionContext = createContext<TaxDeductionContextType | undefined>(undefined);

export const TaxDeductionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [taxDeductions, setTaxDeductions] = useState<TaxDeduction[]>(() => {
    try {
      const saved = localStorage.getItem(TAX_DEDUCTIONS_KEY);
      return saved ? JSON.parse(saved).map((deduction: any) => ({
        ...deduction,
        createdAt: new Date(deduction.createdAt),
        attachments: deduction.attachments?.map((attachment: any) => ({
          ...attachment,
          uploadDate: new Date(attachment.uploadDate),
        })) || [],
      })) : [];
    } catch (e) {
      console.error("Failed to parse tax deductions from localStorage:", e);
      return [];
    }
  });

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem(TAX_DEDUCTIONS_KEY, JSON.stringify(taxDeductions));
  }, [taxDeductions]);

  const addTaxDeduction = (deductionData: Omit<TaxDeduction, 'id' | 'createdAt' | 'attachments'>) => {
    const newDeduction: TaxDeduction = {
      id: crypto.randomUUID(),
      ...deductionData,
      createdAt: new Date(),
      attachments: [],
    };
    setTaxDeductions(prev => [...prev, newDeduction]);
    showSuccess(`Tax deduction for ${deductionData.deductionType} added successfully!`);
  };

  const updateTaxDeduction = (id: string, updates: Partial<TaxDeduction>) => {
    setTaxDeductions(prev => prev.map(deduction => 
      deduction.id === id ? { ...deduction, ...updates } : deduction
    ));
    showSuccess('Tax deduction updated successfully!');
  };

  const removeTaxDeduction = (id: string) => {
    const deduction = taxDeductions.find(d => d.id === id);
    if (!deduction) {
      showError('Tax deduction not found.');
      return;
    }
    setTaxDeductions(prev => prev.filter(d => d.id !== id));
    showSuccess(`Tax deduction for ${deduction.deductionType} removed.`);
  };

  const getTaxDeductionsByYear = (year: number) => {
    return taxDeductions.filter(deduction => deduction.year === year);
  };

  const getTaxDeductionsByType = (year: number, type: string) => {
    return taxDeductions.filter(deduction => deduction.year === year && deduction.deductionType === type);
  };

  const getTotalDeductionsForYear = (year: number) => {
    return taxDeductions
      .filter(deduction => deduction.year === year)
      .reduce((sum, deduction) => sum + deduction.amount, 0);
  };

  const uploadAttachment = (deductionId: string, attachmentData: Omit<DocumentAttachment, 'id' | 'uploadDate'>) => {
    const newAttachment: DocumentAttachment = {
      id: crypto.randomUUID(),
      ...attachmentData,
      uploadDate: new Date(),
    };
    
    setTaxDeductions(prev => prev.map(deduction => {
      if (deduction.id === deductionId) {
        return {
          ...deduction,
          attachments: [...(deduction.attachments || []), newAttachment],
        };
      }
      return deduction;
    }));
    
    showSuccess('Document uploaded successfully!');
  };

  const removeAttachment = (deductionId: string, attachmentId: string) => {
    setTaxDeductions(prev => prev.map(deduction => {
      if (deduction.id === deductionId) {
        return {
          ...deduction,
          attachments: deduction.attachments?.filter(attachment => attachment.id !== attachmentId) || [],
        };
      }
      return deduction;
    }));
    showSuccess('Document removed successfully!');
  };

  return (
    <TaxDeductionContext.Provider value={{
      taxDeductions,
      addTaxDeduction,
      updateTaxDeduction,
      removeTaxDeduction,
      getTaxDeductionsByYear,
      getTaxDeductionsByType,
      getTotalDeductionsForYear,
      uploadAttachment,
      removeAttachment,
    }}>
      {children}
    </TaxDeductionContext.Provider>
  );
};

export const useTaxDeductions = () => {
  const context = useContext(TaxDeductionContext);
  if (context === undefined) {
    throw new Error('useTaxDeductions must be used within a TaxDeductionProvider');
  }
  return context;
};