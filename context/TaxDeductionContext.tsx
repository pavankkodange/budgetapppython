import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { TaxDeduction, DocumentAttachment } from '@/types';

interface TaxDeductionContextType {
  taxDeductions: TaxDeduction[];
  loading: boolean;
  error: string | null;
  addTaxDeduction: (deduction: Omit<TaxDeduction, 'id' | 'createdAt' | 'attachments'>) => void;
  updateTaxDeduction: (id: string, updates: Partial<TaxDeduction>) => void;
  removeTaxDeduction: (id: string) => void;
  getTaxDeductionsByYear: (year: number) => TaxDeduction[];
  getTaxDeductionsByType: (year: number, type: string) => TaxDeduction[];
  getTotalDeductionsForYear: (year: number) => number;
  uploadAttachment: (deductionId: string, attachment: Omit<DocumentAttachment, 'id' | 'uploadDate'>) => void;
  removeAttachment: (deductionId: string, attachmentId: string) => void;
}

// Storage key
const STORAGE_KEY = 'taxDeductions';

// Create context
const TaxDeductionContext = createContext<TaxDeductionContextType | undefined>(undefined);

// Provider component
export const TaxDeductionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [taxDeductions, setTaxDeductions] = useState<TaxDeduction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load saved deductions on mount
  useEffect(() => {
    const loadDeductions = async () => {
      try {
        setLoading(true);
        const savedDeductions = await AsyncStorage.getItem(STORAGE_KEY);
        
        if (savedDeductions) {
          const parsedDeductions = JSON.parse(savedDeductions);
          // Convert date strings back to Date objects
          const formattedDeductions = parsedDeductions.map((deduction: any) => ({
            ...deduction,
            createdAt: new Date(deduction.createdAt),
            attachments: deduction.attachments?.map((attachment: any) => ({
              ...attachment,
              uploadDate: new Date(attachment.uploadDate),
            })) || [],
          }));
          setTaxDeductions(formattedDeductions);
        }
      } catch (error) {
        console.error('Failed to load tax deductions', error);
        setError('Failed to load tax deductions. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadDeductions();
  }, []);

  // Save deductions whenever they change
  useEffect(() => {
    const saveDeductions = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(taxDeductions));
      } catch (error) {
        console.error('Failed to save tax deductions', error);
      }
    };

    if (!loading && taxDeductions.length > 0) {
      saveDeductions();
    }
  }, [taxDeductions, loading]);

  // Add a new tax deduction
  const addTaxDeduction = (deductionData: Omit<TaxDeduction, 'id' | 'createdAt' | 'attachments'>) => {
    try {
      const newDeduction: TaxDeduction = {
        id: Date.now().toString(),
        ...deductionData,
        createdAt: new Date(),
        attachments: [],
      };
      
      setTaxDeductions(prev => [...prev, newDeduction]);
      Alert.alert('Success', 'Tax deduction added successfully');
    } catch (error) {
      console.error('Failed to add tax deduction', error);
      Alert.alert('Error', 'Failed to add tax deduction. Please try again.');
    }
  };

  // Update an existing tax deduction
  const updateTaxDeduction = (id: string, updates: Partial<TaxDeduction>) => {
    try {
      setTaxDeductions(prev => 
        prev.map(deduction => 
          deduction.id === id ? { ...deduction, ...updates } : deduction
        )
      );
      Alert.alert('Success', 'Tax deduction updated successfully');
    } catch (error) {
      console.error('Failed to update tax deduction', error);
      Alert.alert('Error', 'Failed to update tax deduction. Please try again.');
    }
  };

  // Remove a tax deduction
  const removeTaxDeduction = (id: string) => {
    try {
      setTaxDeductions(prev => prev.filter(deduction => deduction.id !== id));
      Alert.alert('Success', 'Tax deduction removed successfully');
    } catch (error) {
      console.error('Failed to remove tax deduction', error);
      Alert.alert('Error', 'Failed to remove tax deduction. Please try again.');
    }
  };

  // Get tax deductions by year
  const getTaxDeductionsByYear = (year: number) => {
    return taxDeductions.filter(deduction => deduction.year === year);
  };

  // Get tax deductions by type for a specific year
  const getTaxDeductionsByType = (year: number, type: string) => {
    return taxDeductions.filter(
      deduction => deduction.year === year && deduction.deduction_type === type
    );
  };

  // Calculate total deductions for a year
  const getTotalDeductionsForYear = (year: number) => {
    return taxDeductions
      .filter(deduction => deduction.year === year)
      .reduce((sum, deduction) => sum + deduction.amount, 0);
  };

  // Upload an attachment to a deduction
  const uploadAttachment = (deductionId: string, attachmentData: Omit<DocumentAttachment, 'id' | 'uploadDate'>) => {
    try {
      const newAttachment: DocumentAttachment = {
        id: Date.now().toString(),
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
      
      Alert.alert('Success', 'Document uploaded successfully');
    } catch (error) {
      console.error('Failed to upload document', error);
      Alert.alert('Error', 'Failed to upload document. Please try again.');
    }
  };

  // Remove an attachment from a deduction
  const removeAttachment = (deductionId: string, attachmentId: string) => {
    try {
      setTaxDeductions(prev => prev.map(deduction => {
        if (deduction.id === deductionId) {
          return {
            ...deduction,
            attachments: deduction.attachments?.filter(
              attachment => attachment.id !== attachmentId
            ) || [],
          };
        }
        return deduction;
      }));
      
      Alert.alert('Success', 'Document removed successfully');
    } catch (error) {
      console.error('Failed to remove document', error);
      Alert.alert('Error', 'Failed to remove document. Please try again.');
    }
  };

  return (
    <TaxDeductionContext.Provider value={{
      taxDeductions,
      loading,
      error,
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

// Hook for using the tax deduction context
export const useTaxDeductions = () => {
  const context = useContext(TaxDeductionContext);
  if (context === undefined) {
    throw new Error('useTaxDeductions must be used within a TaxDeductionProvider');
  }
  return context;
};