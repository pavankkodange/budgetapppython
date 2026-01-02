import { useCurrency } from "@/context/CurrencyContext";
import { useRecurringExpenseNotifications } from "@/hooks/useRecurringExpenseNotifications";
import { useState } from "react";
import { useExpenses } from "@/context/ExpenseContext";
import { useIncomeSummaries } from "@/context/IncomeSummaryContext";
import { useIncomeSources } from "@/context/IncomeSourceContext";
import { useSavingsEntries } from "@/context/SavingsEntryContext";
import { useSavingsInstruments } from "@/context/SavingsInstrumentContext";
import { getMonth, getYear, format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, PiggyBank, Receipt, Target, Calendar, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

const Index = () => {
  const { selectedCurrency } = useCurrency();
  const { expenses } = useExpenses();
  const { monthlyIncomeSummaries, getMonthlyIncomeSummary } = useIncomeSummaries();
  const { incomeSources } = useIncomeSources();
  const { savingsEntries } = useSavingsEntries();
  const { savingsInstruments } = useSavingsInstruments();

  useRecurringExpenseNotifications(expenses);

  const currentMonthIndex = getMonth(new Date());
  const currentYearValue = getYear(new Date());

  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthIndex.toString());
  const [selectedYear, setSelectedYear] = useState<string>(currentYearValue.toString());

  const isYearlyView = selectedMonth === "all";
  const displayPeriod = isYearlyView ? selectedYear : format(new Date(parseInt(selectedYear), parseInt(selectedMonth)), "MMMM yyyy");

  // Calculate expenses for the selected period
  const expensesForSelectedPeriod = expenses
    .filter(expense => {
      const expenseYear = getYear(expense.date);
      const expenseMonth = getMonth(expense.date);
      if (isYearlyView) {
        return expenseYear === parseInt(selectedYear);
      } else {
        return expenseYear === parseInt(selectedYear) && expenseMonth === parseInt(selectedMonth);
      }
    })
    .reduce((sum, expense) => sum + expense.amount, 0);

  // Helper function to identify if a deduction is income tax related
  const isIncomeTaxDeduction = (sourceName: string) => {
    const lowerName = sourceName.toLowerCase();
    return lowerName.includes('income tax') ||
      lowerName.includes('tax') ||
      lowerName.includes('tds') ||
      lowerName.includes('professional tax') ||
      lowerName.includes('advance tax');
  };

  // Calculate net income and income tax for the selected period
  let netIncomeForSelectedPeriod = 0;
  let incomeTaxForPeriod = 0;

  if (isYearlyView) {
    // For yearly view, sum up all months
    const summariesForYear = monthlyIncomeSummaries.filter(s => s.year === parseInt(selectedYear));
    summariesForYear.forEach(summary => {
      let grossIncome = 0;
      let totalAllDeductions = 0;
      let monthlyIncomeTax = 0;

      for (const sourceName in summary.lineItems) {
        const amount = summary.lineItems[sourceName] || 0;
        const source = incomeSources.find(s => s.name === sourceName);
        if (source) {
          if (source.type === 'income') {
            grossIncome += amount;
          } else if (source.type === 'deduction') {
            totalAllDeductions += amount;
            // Only count actual income tax deductions
            if (source.deductionCategory === 'tax_or_actual_deduction' && isIncomeTaxDeduction(source.name)) {
              monthlyIncomeTax += amount;
            }
          }
        }
      }
      netIncomeForSelectedPeriod += (grossIncome - totalAllDeductions);
      incomeTaxForPeriod += monthlyIncomeTax;
    });
  } else {
    // For monthly view, get only the selected month
    const incomeSummaryForSelectedPeriod = getMonthlyIncomeSummary(parseInt(selectedMonth), parseInt(selectedYear));
    if (incomeSummaryForSelectedPeriod) {
      let grossIncome = 0;
      let totalAllDeductions = 0;
      let monthlyIncomeTax = 0;

      for (const sourceName in incomeSummaryForSelectedPeriod.lineItems) {
        const amount = incomeSummaryForSelectedPeriod.lineItems[sourceName] || 0;
        const source = incomeSources.find(s => s.name === sourceName);
        if (source) {
          if (source.type === 'income') {
            grossIncome += amount;
          } else if (source.type === 'deduction') {
            totalAllDeductions += amount;
            // Only count actual income tax deductions
            if (source.deductionCategory === 'tax_or_actual_deduction' && isIncomeTaxDeduction(source.name)) {
              monthlyIncomeTax += amount;
            }
          }
        }
      }
      netIncomeForSelectedPeriod = grossIncome - totalAllDeductions;
      incomeTaxForPeriod = monthlyIncomeTax;
    }
  }

  // Calculate remaining budget based on net income and expenses for the selected period
  const remainingBudget = netIncomeForSelectedPeriod - expensesForSelectedPeriod;

  // Calculate total contributions (savings entries) for the selected period
  const savingsContributionsForSelectedPeriod = savingsEntries
    .filter(entry => {
      const entryYear = getYear(entry.date);
      const entryMonth = getMonth(entry.date);
      if (isYearlyView) {
        return entryYear === parseInt(selectedYear);
      } else {
        return entryYear === parseInt(selectedYear) && entryMonth === parseInt(selectedMonth);
      }
    });
  const totalContributions = savingsContributionsForSelectedPeriod.reduce((sum, entry) => sum + entry.amount, 0);

  // Calculate total current value of all savings instruments
  const totalCurrentValueOfInstruments = savingsInstruments.reduce((sum, instrument) => sum + instrument.currentValue, 0);

  // Calculate combined total savings and investments
  const totalSavingsAndInvestments = totalCurrentValueOfInstruments + totalContributions;

  // Get recent expenses for the selected period (e.g., last 3)
  const recentExpensesForPeriod = expenses
    .filter(expense => {
      const expenseYear = getYear(expense.date);
      const expenseMonth = getMonth(expense.date);
      if (isYearlyView) {
        return expenseYear === parseInt(selectedYear);
      } else {
        return expenseYear === parseInt(selectedYear) && expenseMonth === parseInt(selectedMonth);
      }
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 3);

  const currentFullYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => (currentFullYear - 5 + i).toString());

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

  return (
    <>
      <header className="sticky-header glass-strong border-b border-white/20 dark:border-white/10 shadow-premium animate-fade-in flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent text-premium">
            Dashboard
          </h1>
          <p className="text-[10px] sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
            Overview of your financial performance
          </p>
        </div>
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Select onValueChange={setSelectedMonth} defaultValue={selectedMonth}>
            <SelectTrigger className="flex-1 sm:w-[130px] h-9 sm:h-10 text-xs sm:text-sm">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {months.map(month => (
                <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select onValueChange={setSelectedYear} defaultValue={selectedYear}>
            <SelectTrigger className="w-[80px] sm:w-[100px] h-9 sm:h-10 text-xs sm:text-sm">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map(year => (
                <SelectItem key={year} value={year}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      <main className="flex-1 p-3 sm:p-6 overflow-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8">
          {/* Net Income Card */}
          <Card className="card-hover shadow-premium animate-slide-up" style={{ animationDelay: '0.05s' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Net Income</CardTitle>
              <div className="h-8 w-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-xl sm:text-2xl font-bold text-green-600">
                {selectedCurrency.symbol}{netIncomeForSelectedPeriod.toLocaleString()}
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                Take-home for {displayPeriod}
              </p>
            </CardContent>
          </Card>

          {/* Expenses Card */}
          <Card className="card-hover shadow-premium animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Expenses</CardTitle>
              <div className="h-8 w-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <Receipt className="h-4 w-4 text-red-600" />
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-xl sm:text-2xl font-bold text-red-600">
                {selectedCurrency.symbol}{expensesForSelectedPeriod.toLocaleString()}
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 flex items-center">
                <TrendingDown className="h-3 w-3 mr-1" />
                Total spent in {displayPeriod}
              </p>
            </CardContent>
          </Card>

          {/* Remaining Budget Card */}
          <Card className="card-hover shadow-premium animate-slide-up" style={{ animationDelay: '0.15s' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Cash Flow</CardTitle>
              <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center",
                remainingBudget >= 0 ? "bg-blue-100 dark:bg-blue-900/30" : "bg-orange-100 dark:bg-orange-900/30")}>
                {remainingBudget >= 0 ? (
                  <ArrowUpRight className="h-4 w-4 text-blue-600" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-orange-600" />
                )}
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className={cn("text-xl sm:text-2xl font-bold",
                remainingBudget >= 0 ? "text-blue-600" : "text-orange-600")}>
                {selectedCurrency.symbol}{Math.abs(remainingBudget).toLocaleString()}
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 flex items-center">
                <Target className="h-3 w-3 mr-1" />
                {remainingBudget >= 0 ? 'Surplus' : 'Deficit'} for the period
              </p>
            </CardContent>
          </Card>

          {/* Income Tax Card */}
          <Card className="card-hover shadow-premium animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Taxes Paid</CardTitle>
              <div className="h-8 w-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <Receipt className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-xl sm:text-2xl font-bold text-purple-600">
                {selectedCurrency.symbol}{incomeTaxForPeriod.toLocaleString()}
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 truncate">
                <Calendar className="h-3 w-3 mr-1 inline" />
                Total deductions identified as tax
              </p>
            </CardContent>
          </Card>

          {/* Total Contributions Card */}
          <Card className="card-hover shadow-premium animate-slide-up" style={{ animationDelay: '0.25s' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Savings Contrib.</CardTitle>
              <div className="h-8 w-8 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center">
                <PiggyBank className="h-4 w-4 text-teal-600" />
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-xl sm:text-2xl font-bold text-teal-600">
                {selectedCurrency.symbol}{totalContributions.toLocaleString()}
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                <TrendingUp className="h-3 w-3 mr-1 inline" />
                Added to savings this period
              </p>
            </CardContent>
          </Card>

          {/* Total Savings & Investments Card */}
          <Card className="card-hover shadow-premium animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Wealth Portfolio</CardTitle>
              <div className="h-8 w-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-indigo-600" />
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-xl sm:text-2xl font-bold text-indigo-600">
                {selectedCurrency.symbol}{totalSavingsAndInvestments.toLocaleString()}
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                Current value + contribs
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Card */}
        <Card className="shadow-premium animate-scale-in">
          <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
            <CardTitle className="text-lg sm:text-xl font-semibold flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-primary" />
              Recent Activity
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Latest transactions for {displayPeriod}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-2 sm:p-6 pt-0 sm:pt-0">
            {recentExpensesForPeriod.length === 0 ? (
              <div className="text-center py-10">
                <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                  <Receipt className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">No recent expenses found.</p>
              </div>
            ) : (
              <div className="space-y-1">
                {recentExpensesForPeriod.map((expense) => (
                  <div key={expense.id} className="flex justify-between items-center p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Receipt className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{expense.description || expense.category}</p>
                        <p className="text-[10px] text-muted-foreground">{format(expense.date, 'MMM dd, yyyy')}</p>
                      </div>
                    </div>
                    <span className="font-bold text-red-600 text-sm whitespace-nowrap ml-2">
                      -{selectedCurrency.symbol}{expense.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
};

export default Index;