import React, { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ExpenseForm } from "@/components/ExpenseForm";
import { Expense } from "@/types";
import { format, getMonth, getYear } from "date-fns";
import { useCurrency } from "@/context/CurrencyContext";
import { Repeat, Trash2, Calendar, Clock, Filter, Edit } from "lucide-react";
import { useRecurringExpenseNotifications } from "@/hooks/useRecurringExpenseNotifications";
import { useExpenses } from "@/context/ExpenseContext";
import { BackButton } from "@/components/ui/back-button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Expenses = () => {
  const isMobile = useIsMobile();
  const { expenses, addExpense, removeExpense, updateExpense } = useExpenses();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const { selectedCurrency } = useCurrency();

  // Get current month and year for default filter values
  const currentMonth = getMonth(new Date());
  const currentYear = getYear(new Date());

  // State for month and year filters
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth.toString());
  const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString());

  useRecurringExpenseNotifications(expenses);

  const handleAddExpense = (newExpenseData: Omit<Expense, 'id' | 'nextDueDate'> & { isRecurring?: boolean; recurrenceInterval?: 'monthly'; endDate?: Date }) => {
    addExpense(newExpenseData);
    setIsAddDialogOpen(false);
  };

  const handleEditExpense = (updatedExpenseData: Omit<Expense, 'id' | 'nextDueDate'> & { isRecurring?: boolean; recurrenceInterval?: 'monthly'; endDate?: Date }) => {
    if (editingExpense) {
      updateExpense(editingExpense.id, updatedExpenseData);
      setEditingExpense(null);
      setIsEditDialogOpen(false);
    }
  };

  const openEditDialog = (expense: Expense) => {
    setEditingExpense(expense);
    setIsEditDialogOpen(true);
  };

  // Filter expenses based on selected month and year
  const filteredExpenses = expenses.filter(expense => {
    const expenseMonth = getMonth(expense.date);
    const expenseYear = getYear(expense.date);
    
    // If "All Months" is selected, only filter by year
    if (selectedMonth === "all") {
      return expenseYear === parseInt(selectedYear);
    }
    
    // Otherwise filter by both month and year
    return expenseMonth === parseInt(selectedMonth) && expenseYear === parseInt(selectedYear);
  });

  // Group expenses by base ID to show recurring series
  const groupedExpenses = filteredExpenses.reduce((groups, expense) => {
    const baseId = expense.id.split('-')[0];
    if (!groups[baseId]) {
      groups[baseId] = [];
    }
    groups[baseId].push(expense);
    return groups;
  }, {} as Record<string, Expense[]>);

  // Convert grouped expenses back to a flat array for display, showing series info
  const displayExpenses = Object.values(groupedExpenses).map(group => {
    if (group.length === 1) {
      return group[0];
    } else {
      // For recurring series, show the first expense with series info
      const sortedGroup = group.sort((a, b) => a.date.getTime() - b.date.getTime());
      const firstExpense = sortedGroup[0];
      const lastExpense = sortedGroup[sortedGroup.length - 1];
      
      return {
        ...firstExpense,
        isRecurringSeries: true,
        seriesCount: group.length,
        seriesEndDate: lastExpense.date,
      };
    }
  });

  // Calculate total expenses for the selected period
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Generate month options
  const months = [
    { value: "all", label: "All Months" },
    { value: "0", label: "January" },
    { value: "1", label: "February" },
    { value: "2", label: "March" },
    { value: "3", label: "April" },
    { value: "4", label: "May" },
    { value: "5", label: "June" },
    { value: "6", label: "July" },
    { value: "7", label: "August" },
    { value: "8", label: "September" },
    { value: "9", label: "October" },
    { value: "10", label: "November" },
    { value: "11", label: "December" },
  ];

  // Generate year options (from 2000 to current year + 5)
  const currentFullYear = new Date().getFullYear();
  const years = Array.from({ length: currentFullYear - 2000 + 6 }, (_, i) => (2000 + i).toString());

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className={`flex-1 flex flex-col ${isMobile ? "pt-14" : "ml-64"}`}>
        <header className="p-3 sm:p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-1 sm:gap-2">
            <BackButton className="h-8 w-8" />
            <h1 className="text-xl sm:text-2xl font-bold">Expenses</h1>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <div className="flex items-center space-x-1 sm:space-x-2 bg-muted/50 p-1 rounded-md">
              <Filter className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground ml-1 sm:ml-2" />
              <Select onValueChange={setSelectedMonth} defaultValue={selectedMonth} >
                <SelectTrigger className="w-[90px] sm:w-[140px] border-0 bg-transparent text-xs sm:text-sm h-7 sm:h-9">
                  <SelectValue placeholder="Select Month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map(month => (
                    <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select onValueChange={setSelectedYear} defaultValue={selectedYear}>
                <SelectTrigger className="w-[70px] sm:w-[100px] border-0 bg-transparent text-xs sm:text-sm h-7 sm:h-9">
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {years.map(year => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild >
                <Button size={isMobile ? "sm" : "default"}>
                  {isMobile ? "Add" : "Add New Expense"}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Expense</DialogTitle>
                </DialogHeader>
                <ExpenseForm onSubmit={handleAddExpense} />
              </DialogContent>
            </Dialog>
          </div>
        </header>
        <main className="flex-1 p-3 sm:p-6 overflow-auto">
          <div className="bg-card p-3 sm:p-6 rounded-lg shadow-sm border border-border mb-4 sm:mb-6">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <h2 className="text-lg sm:text-xl font-semibold">
                {selectedMonth === "all" 
                  ? `Expenses for ${selectedYear}` 
                  : `Expenses for ${months.find(m => m.value === selectedMonth)?.label} ${selectedYear}`}
              </h2>
              <div className="text-lg sm:text-xl font-bold text-destructive">
                {selectedCurrency.symbol}{totalExpenses.toFixed(2)}
              </div>
            </div>
            {displayExpenses.length === 0 ? (
              <p className="text-muted-foreground text-center py-6 sm:py-8 text-sm sm:text-base">
                No expenses recorded for this period. Click "Add New Expense" to get started!
              </p>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {displayExpenses
                  .sort((a, b) => b.date.getTime() - a.date.getTime())
                  .map((expense) => (
                    <div key={expense.id} className="flex justify-between items-center py-2 sm:py-3 border-b border-border last:border-b-0">
                      <div className="flex-1">
                        <div className="flex items-center space-x-1 sm:space-x-2 mb-0.5 sm:mb-1">
                          <p className="font-medium text-sm sm:text-base">
                            {expense.description || expense.category}
                          </p>
                          {expense.isRecurring && (
                            <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              <Repeat className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                              Recurring
                            </span>
                          )}
                          {(expense as any).isRecurringSeries && (
                            <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                              <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                              {(expense as any).seriesCount} instances
                            </span>
                          )}
                        </div>
                        <div className="text-xs sm:text-sm text-muted-foreground space-y-0.5 sm:space-y-1">
                          <p className="flex items-center flex-wrap">
                            <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1 flex-shrink-0" />
                            {(expense as any).isRecurringSeries 
                              ? `${format(expense.date, "PPP")} - ${format((expense as any).seriesEndDate, "PPP")}`
                              : format(expense.date, "PPP")
                            } - {expense.category}
                          </p>
                          {expense.isRecurring && expense.nextDueDate && (
                            <p className="flex items-center flex-wrap">
                              <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1 flex-shrink-0" />
                              Next due: {format(expense.nextDueDate, "PPP")}
                            </p>
                          )}
                          {expense.endDate && (
                            <p className="flex items-center flex-wrap">
                              <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1 flex-shrink-0" />
                              Ends: {format(expense.endDate, "PPP")}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 sm:space-x-3 ml-2">
                        <div className="text-right">
                          <span className="font-bold text-destructive text-sm sm:text-base">
                            {selectedCurrency.symbol}{expense.amount.toFixed(2)}
                          </span>
                          {(expense as any).isRecurringSeries && (
                            <p className="text-[10px] sm:text-xs text-muted-foreground">
                              Total: {selectedCurrency.symbol}{(expense.amount * (expense as any).seriesCount).toFixed(2)}
                            </p>
                          )}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-6 w-6 sm:h-7 sm:w-7"
                          onClick={() => openEditDialog(expense)}
                        >
                          <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="icon" className="h-6 w-6 sm:h-7 sm:w-7">
                              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently remove this expense
                                {(expense as any).isRecurringSeries && ` series (${(expense as any).seriesCount} instances)`}.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => removeExpense(expense.id)}>
                                Continue
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Edit Expense Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} >
        <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
          </DialogHeader>
          {editingExpense && (
            <ExpenseForm 
              onSubmit={handleEditExpense} 
              initialData={editingExpense}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Expenses;