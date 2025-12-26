import { useCurrency } from "@/context/CurrencyContext";
import { useRecurringExpenseNotifications } from "@/hooks/useRecurringExpenseNotifications";
import React, { useState } from "react";
import { useExpenses } from "@/context/ExpenseContext";
import { useIncomeSummaries } from "@/context/IncomeSummaryContext";
import { useIncomeSources } from "@/context/IncomeSourceContext";
import { useSavingsEntries } from "@/context/SavingsEntryContext";
import { useSavingsInstruments } from "@/context/SavingsInstrumentContext";
import { getMonth, getYear, isSameMonth, isSameYear, format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, PiggyBank, Receipt, Target, Calendar, ArrowUpRight, ArrowDownRight } from "lucide-react";

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
  const years = Array.from({ length: 101 }, (_, i) => (currentFullYear - 50 + i).toString());

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
      <header className="p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-30">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">Welcome back! Here's your financial overview.</p>
          </div>
          <div className="flex items-center space-x-3">
            <Select onValueChange={setSelectedMonth} defaultValue={selectedMonth}>
              <SelectTrigger className="w-[140px] bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-border/50">
                <SelectValue placeholder="Select Month" />
              </SelectTrigger>
              <SelectContent>
                {months.map(month => (
                  <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={setSelectedYear} defaultValue={selectedYear}>
              <SelectTrigger className="w-[100px] bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-border/50">
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map(year => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 overflow-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Net Income Card */}
          <Card className="card-elevated hover-lift group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Net Income for {displayPeriod}</CardTitle>
              <div className="h-8 w-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <DollarSign className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {selectedCurrency.symbol}{netIncomeForSelectedPeriod.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                Take-home pay for the selected period
              </p>
            </CardContent>
          </Card>

          {/* Expenses Card */}
          <Card className="card-elevated hover-lift group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Expenses for {displayPeriod}</CardTitle>
              <div className="h-8 w-8 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Receipt className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {selectedCurrency.symbol}{expensesForSelectedPeriod.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center">
                <TrendingDown className="h-3 w-3 mr-1" />
                Total expenses for the selected period
              </p>
            </CardContent>
          </Card>

          {/* Remaining Budget Card */}
          <Card className="card-elevated hover-lift group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Remaining Budget</CardTitle>
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform ${remainingBudget >= 0
                ? 'bg-gradient-to-br from-blue-500 to-cyan-600'
                : 'bg-gradient-to-br from-orange-500 to-red-600'
                }`}>
                {remainingBudget >= 0 ? (
                  <ArrowUpRight className="h-4 w-4 text-white" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-white" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${remainingBudget >= 0 ? "text-blue-600 dark:text-blue-400" : "text-orange-600 dark:text-orange-400"}`}>
                {selectedCurrency.symbol}{Math.abs(remainingBudget).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center">
                <Target className="h-3 w-3 mr-1" />
                {remainingBudget >= 0 ? 'Available funds' : 'Over budget'} for {displayPeriod}
              </p>
            </CardContent>
          </Card>

          {/* Income Tax Card */}
          <Card className="card-elevated hover-lift group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Income Tax for {displayPeriod}</CardTitle>
              <div className="h-8 w-8 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Receipt className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {selectedCurrency.symbol}{incomeTaxForPeriod.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {isYearlyView ? 'Total income tax paid for the year' : 'Income tax deducted for the month'}
              </p>
            </CardContent>
          </Card>

          {/* Total Contributions Card */}
          <Card className="card-elevated hover-lift group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Contributions for {displayPeriod}</CardTitle>
              <div className="h-8 w-8 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <PiggyBank className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                {selectedCurrency.symbol}{totalContributions.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                Total contributions made in the selected period
              </p>
            </CardContent>
          </Card>

          {/* Total Savings & Investments Card */}
          <Card className="card-elevated hover-lift group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Savings & Investments</CardTitle>
              <div className="h-8 w-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {selectedCurrency.symbol}{totalSavingsAndInvestments.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center">
                <PiggyBank className="h-3 w-3 mr-1" />
                Current value of all instruments + contributions for {displayPeriod}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Card */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="text-xl font-semibold flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-primary" />
              Recent Activity ({displayPeriod})
            </CardTitle>
            <CardDescription>
              Your latest financial transactions and activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentExpensesForPeriod.length === 0 ? (
              <div className="text-center py-8">
                <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                  <Receipt className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">No recent expenses recorded for this period.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentExpensesForPeriod.map((expense) => (
                  <div key={expense.id} className={`flex justify-between items-center py-3 px-4 rounded-lg bg-gradient-to-r from-muted/50 to-transparent border border-border/50 hover-lift stagger-item`}>
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Receipt className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <span className="font-medium">{expense.description || expense.category}</span>
                        <p className="text-xs text-muted-foreground">{format(expense.date, 'MMM dd, yyyy')}</p>
                      </div>
                    </div>
                    <span className="font-bold text-red-600 dark:text-red-400">
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