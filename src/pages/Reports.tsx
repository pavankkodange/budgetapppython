import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, PieChart, LineChart, Sparkles, TrendingUp, DollarSign, Calendar, Download, Printer, FileText, Filter } from "lucide-react";
import AIChartGenerator from "@/components/AIChartGenerator";
import { useCurrency } from "@/context/CurrencyContext";
import { useExpenses } from "@/context/ExpenseContext";
import { useIncomeSummaries } from "@/context/IncomeSummaryContext";
import { useTaxDeductions } from "@/context/TaxDeductionContext";
import { getMonth, getYear, format, startOfYear, endOfYear, eachMonthOfInterval } from "date-fns";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/ui/back-button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { showSuccess } from "@/utils/toast";

const Reports = () => {
  const { selectedCurrency } = useCurrency();
  const { expenses } = useExpenses();
  const { monthlyIncomeSummaries } = useIncomeSummaries();
  const { taxDeductions, getTotalDeductionsForYear } = useTaxDeductions();

  // State for standard reports
  const [selectedReport, setSelectedReport] = useState<string>("monthly-budget");
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().getMonth().toString());

  // Calculate some basic statistics for the dashboard
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  // Total expenses for current year
  const yearlyExpenses = expenses
    .filter(expense => getYear(expense.date) === currentYear)
    .reduce((sum, expense) => sum + expense.amount, 0);

  // Total expenses for current month
  const monthlyExpenses = expenses
    .filter(expense => getYear(expense.date) === currentYear && getMonth(expense.date) === currentMonth)
    .reduce((sum, expense) => sum + expense.amount, 0);

  // Calculate total income for the year
  let yearlyIncome = 0;
  monthlyIncomeSummaries
    .filter(summary => summary.year === currentYear)
    .forEach(summary => {
      // Calculate net income for each month
      let monthlyGrossIncome = 0;
      let monthlyDeductions = 0;

      for (const [source, amount] of Object.entries(summary.lineItems)) {
        // Determine if this is income or deduction based on positive/negative value
        if (amount > 0) {
          monthlyGrossIncome += amount;
        } else {
          monthlyDeductions += Math.abs(amount);
        }
      }

      yearlyIncome += (monthlyGrossIncome - monthlyDeductions);
    });

  // Calculate monthly expense data for the current year
  const generateMonthlyExpenseData = () => {
    const startDate = startOfYear(new Date());
    const endDate = endOfYear(new Date());

    // Generate all months in the year
    const months = eachMonthOfInterval({ start: startDate, end: endDate });

    // Initialize data with all months
    const data = months.map(month => ({
      name: format(month, 'MMM'),
      month: getMonth(month),
      year: getYear(month),
      value: 0
    }));

    // Add expense amounts to corresponding months
    expenses.forEach(expense => {
      if (getYear(expense.date) === currentYear) {
        const expenseMonth = getMonth(expense.date);

        const monthIndex = data.findIndex(
          item => item.month === expenseMonth
        );

        if (monthIndex !== -1) {
          data[monthIndex].value += expense.amount;
        }
      }
    });

    return data;
  };

  // Calculate expense by category data for the current year
  const generateExpenseByCategoryData = () => {
    // Filter expenses for current year
    const yearExpenses = expenses.filter(expense => getYear(expense.date) === currentYear);

    // Group by category
    const categoryMap: Record<string, number> = {};
    yearExpenses.forEach(expense => {
      if (!categoryMap[expense.category]) {
        categoryMap[expense.category] = 0;
      }
      categoryMap[expense.category] += expense.amount;
    });

    // Convert to array format for charts
    return Object.entries(categoryMap).map(([name, value]) => ({
      name,
      value
    }));
  };

  // Generate income vs expenses data for the year
  const generateIncomeVsExpensesData = () => {
    const startDate = startOfYear(new Date(parseInt(selectedYear)));
    const endDate = endOfYear(new Date(parseInt(selectedYear)));

    // Generate all months in the year
    const months = eachMonthOfInterval({ start: startDate, end: endDate });

    // Initialize data with all months
    const data = months.map(month => {
      const monthIndex = getMonth(month);
      const year = getYear(month);

      return {
        name: format(month, 'MMM'),
        month: monthIndex,
        year,
        income: 0,
        expenses: 0
      };
    });

    // Add income data
    monthlyIncomeSummaries.forEach(summary => {
      if (summary.year === parseInt(selectedYear)) {
        const monthIndex = data.findIndex(
          item => item.month === summary.month
        );

        if (monthIndex !== -1) {
          // Calculate total income (sum of all income line items)
          let totalIncome = 0;
          let totalDeductions = 0;

          for (const [source, amount] of Object.entries(summary.lineItems)) {
            // Determine if this is income or deduction based on positive/negative value
            if (amount > 0) {
              totalIncome += amount;
            } else {
              totalDeductions += Math.abs(amount);
            }
          }

          data[monthIndex].income = totalIncome - totalDeductions;
        }
      }
    });

    // Add expense data
    expenses.forEach(expense => {
      if (getYear(expense.date) === parseInt(selectedYear)) {
        const expenseMonth = getMonth(expense.date);

        const monthIndex = data.findIndex(
          item => item.month === expenseMonth
        );

        if (monthIndex !== -1) {
          data[monthIndex].expenses += expense.amount;
        }
      }
    });

    return data;
  };

  // Generate monthly budget report data
  const generateMonthlyBudgetData = () => {
    // For a real app, this would compare against budget categories
    // For now, we'll just show expenses by category for the selected month

    // Filter expenses for selected month and year
    const monthExpenses = expenses.filter(expense =>
      getYear(expense.date) === parseInt(selectedYear) &&
      getMonth(expense.date) === parseInt(selectedMonth)
    );

    // Group by category
    const categoryMap: Record<string, number> = {};
    monthExpenses.forEach(expense => {
      if (!categoryMap[expense.category]) {
        categoryMap[expense.category] = 0;
      }
      categoryMap[expense.category] += expense.amount;
    });

    // Convert to array format for charts
    return Object.entries(categoryMap).map(([name, value]) => ({
      name,
      actual: value,
      budget: value * 1.2, // Simulated budget (20% higher than actual)
    }));
  };

  // Generate tax summary data
  const generateTaxSummaryData = () => {
    const year = parseInt(selectedYear);

    // Get actual tax deductions from the tax deductions context
    const totalDeductions = getTotalDeductionsForYear(year);

    // Get income data for the selected year
    let totalIncome = 0;
    let totalTaxes = 0;

    // Calculate total income and taxes paid from monthly summaries
    monthlyIncomeSummaries
      .filter(summary => summary.year === year)
      .forEach(summary => {
        for (const [source, amount] of Object.entries(summary.lineItems)) {
          // Add up all positive values as income
          if (amount > 0) {
            totalIncome += amount;
          }

          // Look for tax-related deductions
          const sourceLower = source.toLowerCase();
          if (amount < 0 && (
            sourceLower.includes('tax') ||
            sourceLower.includes('tds') ||
            sourceLower.includes('income tax')
          )) {
            totalTaxes += Math.abs(amount);
          }
        }
      });

    // Calculate investment income (simplified)
    const investmentIncome = totalIncome * 0.05; // Assume 5% of total income is from investments

    // Calculate tax credits (simplified)
    const taxCredits = totalDeductions * 0.2; // Assume 20% of deductions translate to credits

    // Calculate estimated tax (simplified)
    const estimatedTax = Math.max(0, totalTaxes - taxCredits);

    return [
      { name: 'Salary Income', value: totalIncome - investmentIncome },
      { name: 'Investment Income', value: investmentIncome },
      { name: 'Tax Deductions', value: totalDeductions },
      { name: 'Tax Credits', value: taxCredits },
      { name: 'Estimated Tax', value: estimatedTax }
    ];
  };

  const monthlyExpenseData = generateMonthlyExpenseData();
  const expenseByCategoryData = generateExpenseByCategoryData();
  const incomeVsExpensesData = generateIncomeVsExpensesData();
  const monthlyBudgetData = generateMonthlyBudgetData();
  const taxSummaryData = generateTaxSummaryData();

  // Generate years for select dropdown
  const currentFullYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => (currentFullYear - 5 + i).toString());

  // Generate months for select dropdown
  const months = [
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

  // Colors for charts
  const COLORS = [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8',
    '#82CA9D', '#8DD1E1', '#A4DE6C', '#D0ED57', '#FAAAA3'
  ];

  // Handle report actions
  const handleDownloadReport = () => {
    showSuccess("Report download started");
    // In a real app, this would generate and download a PDF or Excel file
  };

  const handlePrintReport = () => {
    window.print();
    showSuccess("Sending report to printer");
  };

  const handleExportReport = (format: string) => {
    showSuccess(`Exporting report as ${format}`);
    // In a real app, this would export the report in the specified format
  };

  // Render the appropriate report based on selection
  const renderReport = () => {
    switch (selectedReport) {
      case 'monthly-budget':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart className="h-5 w-5 mr-2" />
                Monthly Budget Report - {months.find(m => m.value === selectedMonth)?.label} {selectedYear}
              </CardTitle>
              <CardDescription>
                Compare your actual spending against budget categories
              </CardDescription>
              <div className="flex items-center space-x-2 mt-2">
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map(month => (
                      <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map(year => (
                      <SelectItem key={year} value={year}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                {monthlyBudgetData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                      data={monthlyBudgetData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                      <YAxis />
                      <Tooltip formatter={(value) => `${selectedCurrency.symbol}${value.toLocaleString()}`} />
                      <Legend />
                      <Bar dataKey="actual" name="Actual Spending" fill="#f87171" />
                      <Bar dataKey="budget" name="Budget" fill="#60a5fa" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No data available for the selected period</p>
                  </div>
                )}
              </div>
              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-semibold">Budget Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Total Budget: {selectedCurrency.symbol}{monthlyBudgetData.reduce((sum, item) => sum + item.budget, 0).toLocaleString()}</p>
                    <p className="text-sm font-medium">Total Spent: {selectedCurrency.symbol}{monthlyBudgetData.reduce((sum, item) => sum + item.actual, 0).toLocaleString()}</p>
                    <p className="text-sm font-medium">Remaining: {selectedCurrency.symbol}{(monthlyBudgetData.reduce((sum, item) => sum + item.budget - item.actual, 0)).toLocaleString()}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm">Categories over budget: {monthlyBudgetData.filter(item => item.actual > item.budget).length}</p>
                    <p className="text-sm">Categories under budget: {monthlyBudgetData.filter(item => item.actual <= item.budget).length}</p>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" size="sm" onClick={handleDownloadReport}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Report
                  </Button>
                  <Button variant="outline" size="sm" onClick={handlePrintReport}>
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'income-trend':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <LineChart className="h-5 w-5 mr-2" />
                Income Trend Analysis - {selectedYear}
              </CardTitle>
              <CardDescription>
                Track your income growth and patterns over time
              </CardDescription>
              <div className="flex items-center space-x-2 mt-2">
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map(year => (
                      <SelectItem key={year} value={year}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                {incomeVsExpensesData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart
                      data={incomeVsExpensesData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                      <YAxis />
                      <Tooltip formatter={(value) => `${selectedCurrency.symbol}${value.toLocaleString()}`} />
                      <Legend />
                      <Line type="monotone" dataKey="income" name="Income" stroke="#4ade80" activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="expenses" name="Expenses" stroke="#f87171" />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No data available for the selected period</p>
                  </div>
                )}
              </div>
              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-semibold">Income Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Total Income: {selectedCurrency.symbol}{incomeVsExpensesData.reduce((sum, item) => sum + item.income, 0).toLocaleString()}</p>
                    <p className="text-sm font-medium">Total Expenses: {selectedCurrency.symbol}{incomeVsExpensesData.reduce((sum, item) => sum + item.expenses, 0).toLocaleString()}</p>
                    <p className="text-sm font-medium">Net Savings: {selectedCurrency.symbol}{incomeVsExpensesData.reduce((sum, item) => sum + item.income - item.expenses, 0).toLocaleString()}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm">Highest Income Month: {incomeVsExpensesData.reduce((max, item) => item.income > max.income ? item : max, { income: 0, name: 'None' }).name}</p>
                    <p className="text-sm">Lowest Income Month: {incomeVsExpensesData.filter(item => item.income > 0).reduce((min, item) => item.income < min.income ? item : min, { income: Number.MAX_VALUE, name: 'None' }).name}</p>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" size="sm" onClick={handleDownloadReport}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Report
                  </Button>
                  <Button variant="outline" size="sm" onClick={handlePrintReport}>
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'expense-breakdown':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="h-5 w-5 mr-2" />
                Expense Breakdown - {selectedYear}
              </CardTitle>
              <CardDescription>
                Detailed analysis of your spending by categories
              </CardDescription>
              <div className="flex items-center space-x-2 mt-2">
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map(year => (
                      <SelectItem key={year} value={year}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                {expenseByCategoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={expenseByCategoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={150}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {expenseByCategoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${selectedCurrency.symbol}${value.toLocaleString()}`} />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No data available for the selected period</p>
                  </div>
                )}
              </div>
              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-semibold">Category Analysis</h3>
                <div className="space-y-2">
                  {expenseByCategoryData.slice(0, 5).map((category, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-sm mr-2"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></div>
                        <span className="text-sm">{category.name}</span>
                      </div>
                      <div className="text-sm font-medium">
                        {selectedCurrency.symbol}{category.value.toLocaleString()}
                        <span className="text-xs text-muted-foreground ml-2">
                          ({((category.value / expenseByCategoryData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" size="sm" onClick={handleDownloadReport}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Report
                  </Button>
                  <Button variant="outline" size="sm" onClick={handlePrintReport}>
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'tax-summary':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Tax Summary - {selectedYear}
              </CardTitle>
              <CardDescription>
                Summary of tax-related income and deductions
              </CardDescription>
              <div className="flex items-center space-x-2 mt-2">
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map(year => (
                      <SelectItem key={year} value={year}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart
                    data={taxSummaryData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                    <YAxis />
                    <Tooltip formatter={(value) => `${selectedCurrency.symbol}${value.toLocaleString()}`} />
                    <Legend />
                    <Bar dataKey="value" name="Amount" fill="#8884d8">
                      {taxSummaryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-semibold">Tax Summary</h3>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Total Taxable Income: {selectedCurrency.symbol}{(taxSummaryData[0].value + taxSummaryData[1].value).toLocaleString()}</p>
                  <p className="text-sm font-medium">Total Deductions: {selectedCurrency.symbol}{taxSummaryData[2].value.toLocaleString()}</p>
                  <p className="text-sm font-medium">Tax Credits: {selectedCurrency.symbol}{taxSummaryData[3].value.toLocaleString()}</p>
                  <p className="text-sm font-medium">Estimated Tax Liability: {selectedCurrency.symbol}{taxSummaryData[4].value.toLocaleString()}</p>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" size="sm" onClick={handleDownloadReport}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Report
                  </Button>
                  <Button variant="outline" size="sm" onClick={handlePrintReport}>
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleExportReport('tax')}>
                    <FileText className="h-4 w-4 mr-2" />
                    Export for Tax Filing
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'custom-report':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sparkles className="h-5 w-5 mr-2" />
                Custom Report Builder
              </CardTitle>
              <CardDescription>
                Build your own custom financial reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center h-64 bg-muted/30 rounded-lg">
                <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-2">Custom report builder coming soon!</p>
                <p className="text-sm text-muted-foreground mb-4">
                  This feature will allow you to create fully customized reports with your own metrics and visualizations.
                </p>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return (
          <div className="flex items-center justify-center h-64 bg-muted/30 rounded-lg">
            <p className="text-muted-foreground">Select a report to view</p>
          </div>
        );
    }
  };

  return (
    <>
      <header className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <BackButton />
          <div>
            <h1 className="text-2xl font-bold">Reports & Analytics</h1>
            <p className="text-sm text-muted-foreground">Visualize your financial data with AI-powered insights</p>
          </div>
        </div>
      </header>
      <main className="flex-1 p-6 overflow-auto">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="standard-reports">Standard Reports</TabsTrigger>
            <TabsTrigger value="ai-charts">AI Chart Generator</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Yearly Expenses</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {selectedCurrency.symbol}{yearlyExpenses.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total expenses for {currentYear}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {selectedCurrency.symbol}{monthlyExpenses.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Expenses for {format(new Date(currentYear, currentMonth), 'MMMM yyyy')}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Yearly Income</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {selectedCurrency.symbol}{yearlyIncome.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total income for {currentYear}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart className="h-5 w-5 mr-2" />
                    Monthly Expenses ({currentYear})
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  {monthlyExpenseData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart data={monthlyExpenseData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => `${selectedCurrency.symbol}${value.toLocaleString()}`} />
                        <Legend />
                        <Bar dataKey="value" fill="#3b82f6" name="Expenses" />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">No expense data available for {currentYear}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="h-5 w-5 mr-2" />
                    Expenses by Category ({currentYear})
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  {expenseByCategoryData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={expenseByCategoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {expenseByCategoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${selectedCurrency.symbol}${value.toLocaleString()}`} />
                        <Legend />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">No category data available for {currentYear}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="standard-reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
              {/* Report Selection Sidebar */}
              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Standard Reports</CardTitle>
                    <CardDescription>
                      Select a report to view
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="space-y-1 p-2">
                      <Button
                        variant={selectedReport === 'monthly-budget' ? 'default' : 'ghost'}
                        className="w-full justify-start"
                        onClick={() => setSelectedReport('monthly-budget')}
                      >
                        <BarChart className="h-4 w-4 mr-2" />
                        Monthly Budget Report
                      </Button>
                      <Button
                        variant={selectedReport === 'income-trend' ? 'default' : 'ghost'}
                        className="w-full justify-start"
                        onClick={() => setSelectedReport('income-trend')}
                      >
                        <LineChart className="h-4 w-4 mr-2" />
                        Income Trend Analysis
                      </Button>
                      <Button
                        variant={selectedReport === 'expense-breakdown' ? 'default' : 'ghost'}
                        className="w-full justify-start"
                        onClick={() => setSelectedReport('expense-breakdown')}
                      >
                        <PieChart className="h-4 w-4 mr-2" />
                        Expense Breakdown
                      </Button>
                      <Button
                        variant={selectedReport === 'tax-summary' ? 'default' : 'ghost'}
                        className="w-full justify-start"
                        onClick={() => setSelectedReport('tax-summary')}
                      >
                        <DollarSign className="h-4 w-4 mr-2" />
                        Tax Summary
                      </Button>
                      <Button
                        variant={selectedReport === 'custom-report' ? 'default' : 'ghost'}
                        className="w-full justify-start"
                        onClick={() => setSelectedReport('custom-report')}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Custom Report Builder
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle>Report Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start" onClick={handleDownloadReport}>
                        <Download className="h-4 w-4 mr-2" />
                        Download Report
                      </Button>
                      <Button variant="outline" className="w-full justify-start" onClick={handlePrintReport}>
                        <Printer className="h-4 w-4 mr-2" />
                        Print Report
                      </Button>
                      <Button variant="outline" className="w-full justify-start" onClick={() => handleExportReport('PDF')}>
                        <FileText className="h-4 w-4 mr-2" />
                        Export as PDF
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Report Display Area */}
              <div className="md:col-span-4">
                {renderReport()}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ai-charts">
            <AIChartGenerator />
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
};

export default Reports;