import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { MonthlyIncomeSummary, DocumentAttachment } from '@/types';
import { showSuccess } from '@/utils/toast';

interface IncomeSummaryContextType {
  monthlyIncomeSummaries: MonthlyIncomeSummary[];
  saveMonthlyIncomeSummary: (summary: Omit<MonthlyIncomeSummary, 'id'>) => void;
  getMonthlyIncomeSummary: (month: number, year: number) => MonthlyIncomeSummary | undefined;
  addDocumentToSummary: (month: number, year: number, document: Omit<DocumentAttachment, 'id' | 'uploadDate'>) => void;
  removeDocumentFromSummary: (month: number, year: number, documentId: string) => void;
}

const LOCAL_STORAGE_KEY = 'monthlyIncomeSummaries';

const IncomeSummaryContext = createContext<IncomeSummaryContextType | undefined>(undefined);

export const IncomeSummaryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [monthlyIncomeSummaries, setMonthlyIncomeSummaries] = useState<MonthlyIncomeSummary[]>(() => {
    try {
      const savedSummaries = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedSummaries) {
        const parsedSummaries = JSON.parse(savedSummaries);
        return parsedSummaries.map((summary: any) => ({
          ...summary,
          // Convert date strings back to Date objects for additional incomes if they exist
          additionalIncomes: summary.additionalIncomes ? summary.additionalIncomes.map((income: any) => ({
            ...income,
            date: new Date(income.date)
          })) : undefined,
          // Convert upload dates for attachments
          attachments: summary.attachments ? summary.attachments.map((doc: any) => ({
            ...doc,
            uploadDate: new Date(doc.uploadDate)
          })) : []
        }));
      }
      return [];
    } catch (e) {
      console.error("Failed to parse monthly income summaries from localStorage:", e);
      return []; // Return empty array on error
    }
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(monthlyIncomeSummaries));
  }, [monthlyIncomeSummaries]);

  const saveMonthlyIncomeSummary = (newSummaryData: Omit<MonthlyIncomeSummary, 'id'>) => {
    const newSummary: MonthlyIncomeSummary = {
      id: crypto.randomUUID(),
      ...newSummaryData,
    };

    setMonthlyIncomeSummaries((prevSummaries) => {
      const existingIndex = prevSummaries.findIndex(
        (s) => s.month === newSummary.month && s.year === newSummary.year
      );

      if (existingIndex > -1) {
        return prevSummaries.map((s, index) =>
          index === existingIndex ? newSummary : s
        );
      } else {
        return [...prevSummaries, newSummary];
      }
    });
    showSuccess("Monthly income saved successfully!");
  };

  const getMonthlyIncomeSummary = (month: number, year: number) => {
    return monthlyIncomeSummaries.find(s => s.month === month && s.year === year);
  };

  const addDocumentToSummary = (month: number, year: number, document: Omit<DocumentAttachment, 'id' | 'uploadDate'>) => {
    setMonthlyIncomeSummaries((prevSummaries) => {
      return prevSummaries.map((summary) => {
        if (summary.month === month && summary.year === year) {
          const newDocument: DocumentAttachment = {
            ...document,
            id: crypto.randomUUID(),
            uploadDate: new Date()
          };
          return {
            ...summary,
            attachments: [...(summary.attachments || []), newDocument]
          };
        }
        return summary;
      });
    });
    showSuccess("Document uploaded successfully!");
  };

  const removeDocumentFromSummary = (month: number, year: number, documentId: string) => {
    setMonthlyIncomeSummaries((prevSummaries) => {
      return prevSummaries.map((summary) => {
        if (summary.month === month && summary.year === year) {
          return {
            ...summary,
            attachments: (summary.attachments || []).filter(doc => doc.id !== documentId)
          };
        }
        return summary;
      });
    });
    showSuccess("Document removed successfully!");
  };

  return (
    <IncomeSummaryContext.Provider value={{
      monthlyIncomeSummaries,
      saveMonthlyIncomeSummary,
      getMonthlyIncomeSummary,
      addDocumentToSummary,
      removeDocumentFromSummary
    }}>
      {children}
    </IncomeSummaryContext.Provider>
  );
};

export const useIncomeSummaries = () => {
  const context = useContext(IncomeSummaryContext);
  if (context === undefined) {
    throw new Error('useIncomeSummaries must be used within an IncomeSummaryProvider');
  }
  return context;
};