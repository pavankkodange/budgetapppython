import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Expense } from '@/types';
import { showSuccess, showError } from '@/utils/toast';
import { addMonths, startOfDay, isBefore } from 'date-fns';

interface ExpenseContextType {
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id' | 'nextDueDate'> & { isRecurring?: boolean; recurrenceInterval?: 'monthly'; endDate?: Date }) => void;
  removeExpense: (expenseId: string) => void;
  updateExpense: (expenseId: string, updatedData: Partial<Expense> & { endDate?: Date }) => void;
  generateRecurringExpenses: () => void;
}

const LOCAL_STORAGE_KEY = 'expenses';

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const ExpenseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try {
      const savedExpenses = localStorage.getItem(LOCAL_STORAGE_KEY);
      return savedExpenses ? JSON.parse(savedExpenses).map((item: Expense) => ({
        ...item,
        date: new Date(item.date),
        nextDueDate: item.nextDueDate ? new Date(item.nextDueDate) : undefined,
        endDate: item.endDate ? new Date(item.endDate) : undefined,
      })) : [];
    } catch (e) {
      console.error("Failed to parse expenses from localStorage:", e);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(expenses));
  }, [expenses]);

  const generateRecurringExpenseInstances = (
    baseExpense: Expense,
    startDate: Date,
    endDate?: Date
  ): Expense[] => {
    const instances: Expense[] = [];
    let currentDate = new Date(startDate);
    const today = new Date();
    const maxEndDate = endDate || addMonths(today, 24); // Default to 2 years if no end date

    // Create the first instance (original date)
    const firstInstance: Expense = {
      ...baseExpense,
      id: `${baseExpense.id}-${currentDate.getFullYear()}-${currentDate.getMonth()}`,
      date: new Date(currentDate),
      nextDueDate: isBefore(addMonths(currentDate, 1), maxEndDate)
        ? startOfDay(addMonths(currentDate, 1))
        : undefined,
    };
    instances.push(firstInstance);

    // Move to the next month for subsequent instances
    currentDate = addMonths(currentDate, 1);

    // Generate all future instances up to the end date
    while (isBefore(currentDate, maxEndDate)) {
      const instance: Expense = {
        ...baseExpense,
        id: `${baseExpense.id}-${currentDate.getFullYear()}-${currentDate.getMonth()}`,
        date: new Date(currentDate),
        nextDueDate: isBefore(addMonths(currentDate, 1), maxEndDate)
          ? startOfDay(addMonths(currentDate, 1))
          : undefined,
      };

      instances.push(instance);
      currentDate = addMonths(currentDate, 1);
    }

    return instances;
  };

  const addExpense = (newExpenseData: Omit<Expense, 'id' | 'nextDueDate'> & { isRecurring?: boolean; recurrenceInterval?: 'monthly'; endDate?: Date }) => {
    const baseId = crypto.randomUUID();

    if (newExpenseData.isRecurring && newExpenseData.recurrenceInterval === 'monthly') {
      // Create the base recurring expense
      const baseExpense: Expense = {
        id: baseId,
        ...newExpenseData,
        nextDueDate: startOfDay(addMonths(newExpenseData.date, 1)),
      };

      // Generate all recurring instances
      const recurringInstances = generateRecurringExpenseInstances(
        baseExpense,
        newExpenseData.date,
        newExpenseData.endDate
      );

      setExpenses((prevExpenses) => [...prevExpenses, ...recurringInstances]);

      const endDateText = newExpenseData.endDate
        ? ` until ${newExpenseData.endDate.toLocaleDateString()}`
        : ' (ongoing)';

      showSuccess(`Recurring expense created with ${recurringInstances.length} instances${endDateText}!`);
    } else {
      // Create a single expense
      const newExpense: Expense = {
        id: baseId,
        ...newExpenseData,
        nextDueDate: undefined,
      };

      setExpenses((prevExpenses) => [...prevExpenses, newExpense]);
      showSuccess("Expense added successfully!");
    }
  };

  const removeExpense = (expenseId: string) => {
    const expenseToRemove = expenses.find(e => e.id === expenseId);
    if (!expenseToRemove) {
      showError("Expense not found.");
      return;
    }

    // If this is a recurring expense, ask if user wants to remove all instances
    const baseId = expenseId.split('-')[0];
    const relatedExpenses = expenses.filter(e => e.id.startsWith(baseId));

    if (relatedExpenses.length > 1) {
      const confirmRemoveAll = window.confirm(
        `This appears to be part of a recurring expense series (${relatedExpenses.length} total). Do you want to remove all instances? Click OK to remove all, or Cancel to remove only this instance.`
      );

      if (confirmRemoveAll) {
        setExpenses((prev) => prev.filter((e) => !e.id.startsWith(baseId)));
        showSuccess(`All ${relatedExpenses.length} instances of the recurring expense removed.`);
      } else {
        setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
        showSuccess(`Single expense instance removed.`);
      }
    } else {
      setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
      showSuccess(`Expense for ${expenseToRemove.category} removed.`);
    }
  };

  const updateExpense = (expenseId: string, updatedData: Partial<Expense> & { endDate?: Date }) => {
    // Check if this is part of a recurring series
    const baseId = expenseId.split('-')[0];
    const isPartOfSeries = expenses.filter(e => e.id.startsWith(baseId)).length > 1;

    if (isPartOfSeries) {
      const confirmUpdateAll = window.confirm(
        `This is part of a recurring expense series. Do you want to update all instances? Click OK to update all, or Cancel to update only this instance.`
      );

      if (confirmUpdateAll) {
        // Update all instances in the series
        const updatedExpenses = expenses.map(expense => {
          if (expense.id.startsWith(baseId)) {
            // For recurring series, we need to preserve the original dates
            // but update other properties
            return {
              ...expense,
              ...updatedData,
              // Keep original date and nextDueDate
              date: expense.date,
              nextDueDate: expense.nextDueDate
            };
          }
          return expense;
        });

        // If the isRecurring status changed or endDate changed, we need to regenerate the series
        if (updatedData.isRecurring === false || updatedData.endDate) {
          // Find the base expense (first in the series)
          const baseExpense = expenses.find(e => e.id === baseId || e.id.startsWith(`${baseId}-`));

          if (baseExpense) {
            // If recurring is turned off, convert to a single expense
            if (updatedData.isRecurring === false) {
              // Keep only the first instance and remove recurring properties
              const nonRecurringExpense = {
                ...baseExpense,
                ...updatedData,
                isRecurring: false,
                recurrenceInterval: undefined,
                nextDueDate: undefined,
                endDate: undefined
              };

              // Filter out all instances of this series and add back the single non-recurring expense
              setExpenses(prev => [
                ...prev.filter(e => !e.id.startsWith(baseId)),
                nonRecurringExpense
              ]);

              showSuccess("Expense updated and converted to non-recurring.");
              return;
            }

            // If end date changed, regenerate the series with the new end date
            if (updatedData.endDate) {
              // Remove all existing instances
              const filteredExpenses = expenses.filter(e => !e.id.startsWith(baseId));

              // Find the earliest date in the series to use as the start date
              const allSeriesExpenses = expenses.filter(e => e.id.startsWith(baseId));
              const earliestExpense = allSeriesExpenses.reduce(
                (earliest, current) => (current.date < earliest.date ? current : earliest),
                allSeriesExpenses[0]
              );

              // Create updated base expense
              const updatedBaseExpense: Expense = {
                ...earliestExpense,
                ...updatedData,
                id: baseId,
                nextDueDate: startOfDay(addMonths(earliestExpense.date, 1))
              };

              // Generate new instances with updated end date
              const newInstances = generateRecurringExpenseInstances(
                updatedBaseExpense,
                earliestExpense.date,
                updatedData.endDate
              );

              // Add new instances to the filtered expenses
              setExpenses([...filteredExpenses, ...newInstances]);

              showSuccess(`Recurring expense updated with ${newInstances.length} instances.`);
              return;
            }
          }
        }

        // If no special handling needed, just update all instances
        setExpenses(updatedExpenses);
        showSuccess("All instances in the series updated successfully!");
      } else {
        // Update only this specific instance
        setExpenses(prev =>
          prev.map(expense =>
            expense.id === expenseId ? { ...expense, ...updatedData } : expense
          )
        );
        showSuccess("Expense updated successfully!");
      }
    } else {
      // Update a single expense
      setExpenses(prev =>
        prev.map(expense =>
          expense.id === expenseId ? { ...expense, ...updatedData } : expense
        )
      );
      showSuccess("Expense updated successfully!");
    }
  };

  const generateRecurringExpenses = () => {
    // Find all recurring expenses
    const recurringExpenses = expenses.filter(e => e.isRecurring && e.recurrenceInterval);

    // Group by base ID to avoid duplicates
    const baseExpenses = new Map<string, Expense>();
    recurringExpenses.forEach(expense => {
      const baseId = expense.id.split('-')[0];
      if (!baseExpenses.has(baseId)) {
        // Find the earliest expense in this series to use as the base
        const seriesExpenses = expenses.filter(e => e.id.startsWith(baseId));
        const earliestExpense = seriesExpenses.reduce(
          (earliest, current) => (current.date < earliest.date ? current : earliest),
          seriesExpenses[0]
        );
        baseExpenses.set(baseId, earliestExpense);
      }
    });

    let newExpensesAdded = 0;

    // For each base expense, check if we need to generate more instances
    baseExpenses.forEach(baseExpense => {
      const baseId = baseExpense.id.split('-')[0];
      const existingInstances = expenses.filter(e => e.id.startsWith(baseId));

      // Find the latest instance
      const latestInstance = existingInstances.reduce(
        (latest, current) => (current.date > latest.date ? current : latest),
        existingInstances[0]
      );

      // If the latest instance doesn't have a nextDueDate, it's the last one
      if (!latestInstance.nextDueDate) return;

      // Check if we need to generate more instances
      const endDate = baseExpense.endDate || addMonths(new Date(), 24);

      // Regenerate all instances from the original start date to ensure complete coverage
      const originalStartDate = existingInstances.reduce(
        (earliest, current) => (current.date < earliest.date ? current : earliest),
        existingInstances[0]
      ).date;

      // Remove all existing instances
      const filteredExpenses = expenses.filter(e => !e.id.startsWith(baseId));

      // Create a clean base expense
      const cleanBaseExpense: Expense = {
        ...baseExpense,
        id: baseId,
      };

      // Generate all instances from start to end
      const allInstances = generateRecurringExpenseInstances(
        cleanBaseExpense,
        originalStartDate,
        endDate
      );

      // Only add instances that don't already exist
      const newInstancesCount = allInstances.length - existingInstances.length;
      if (newInstancesCount > 0) {
        newExpensesAdded += newInstancesCount;
        setExpenses([...filteredExpenses, ...allInstances]);
      }
    });

    if (newExpensesAdded > 0) {
      showSuccess(`Generated ${newExpensesAdded} new recurring expense instances.`);
    }
  };

  // Generate recurring expenses on component mount
  useEffect(() => {
    generateRecurringExpenses();
    // Set up interval to check for new recurring expenses daily
    const interval = setInterval(generateRecurringExpenses, 24 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <ExpenseContext.Provider value={{
      expenses,
      addExpense,
      removeExpense,
      updateExpense,
      generateRecurringExpenses
    }}>
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (context === undefined) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
};