import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ExpenseForm } from "@/components/ExpenseForm";
import { Expense } from "@/types";
import { format, getMonth, getYear } from "date-fns";
import { useCurrency } from "@/context/CurrencyContext";
import { Repeat, Trash2, Calendar, Filter, Edit, Plus, DollarSign, Receipt } from "lucide-react";
import { useRecurringExpenseNotifications } from "@/hooks/useRecurringExpenseNotifications";
import { useExpenses } from "@/context/ExpenseContext";
import { BackButton } from "@/components/ui/back-button";
import { Badge } from "@/components/ui/badge";
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
  const displayExpenses = (Object.values(groupedExpenses) as Expense[][]).map(group => {
    if (group.length === 1) {
      return group[0];
    } else {
      // For recurring series, show the first expense with series info
      const sortedGroup = [...group].sort((a, b) => a.date.getTime() - b.date.getTime());
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
    <>
      <header className="p-3 sm:p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BackButton />
          <h1 className="text-xl sm:text-2xl font-bold">Expenses</h1>
        </div>
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <div className="flex items-center flex-1 sm:flex-initial bg-muted/50 p-1 rounded-md">
            <Filter className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground ml-1 sm:ml-2" />
            <Select onValueChange={setSelectedMonth} defaultValue={selectedMonth} >
              <SelectTrigger className="flex-1 sm:w-[130px] border-0 bg-transparent text-xs sm:text-sm h-8 sm:h-9">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {months.map(month => (
                  <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={setSelectedYear} defaultValue={selectedYear}>
              <SelectTrigger className="w-[70px] sm:w-[90px] border-0 bg-transparent text-xs sm:text-sm h-8 sm:h-9">
                <SelectValue placeholder="Year" />
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
              <Button size="sm" className="h-10 sm:h-10 px-3 sm:px-4">
                <Plus className="h-4 w-4 mr-1" /> Add
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
        <div className="bg-card p-4 sm:p-6 rounded-lg shadow-sm border border-border mb-4 sm:mb-6">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <div>
              <h2 className="text-sm sm:text-base font-medium text-muted-foreground uppercase tracking-wider">
                {selectedMonth === "all"
                  ? `Expenses for ${selectedYear}`
                  : `${months.find(m => m.value === selectedMonth)?.label} ${selectedYear}`}
              </h2>
              <div className="text-2xl sm:text-3xl font-bold text-destructive mt-1">
                {selectedCurrency.symbol}{totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
              <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-destructive" />
            </div>
          </div>

          {displayExpenses.length === 0 ? (
            <div className="text-center py-12 bg-muted/20 rounded-lg border-2 border-dashed border-muted">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-medium">No expenses for this period</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 mb-6">
                Click the "Add" button to track your first expense.
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" /> Add Expense
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {displayExpenses
                .sort((a, b) => b.date.getTime() - a.date.getTime())
                .map((expense) => (
                  <div key={expense.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border border-border rounded-xl hover:bg-muted/30 transition-colors gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm sm:text-base truncate">
                          {expense.description || expense.category}
                        </h4>
                        {expense.isRecurring && (
                          <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200">
                            <Repeat className="h-2.5 w-2.5 mr-1" /> Recurring
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] sm:text-xs text-muted-foreground">
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {format(expense.date, "dd MMM yyyy")}
                        </span>
                        <span className="flex items-center">
                          <Receipt className="h-3 w-3 mr-1" />
                          {expense.category}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-2 sm:pt-0">
                      <div className="text-right">
                        <div className="text-base sm:text-lg font-bold text-destructive">
                          {selectedCurrency.symbol}{expense.amount.toFixed(2)}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEditDialog(expense)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Expense</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this expense? This action cannot be undone.
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
                  </div>
                ))}
            </div>
          )}
        </div>
      </main>

      {/* Edit Expense Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
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
    </>
  );
};

export default Expenses;