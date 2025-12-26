import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, BarChart, Sparkles, Download, Copy, Share2 } from "lucide-react";
import { useCurrency } from '@/context/CurrencyContext';
import { useExpenses } from '@/context/ExpenseContext';
import { useIncomeSummaries } from '@/context/IncomeSummaryContext';
import { useSavingsEntries } from '@/context/SavingsEntryContext';
import { useInvestments } from '@/context/InvestmentContext';
import { useAssets } from '@/context/AssetContext';
import { useInsurance } from '@/context/InsuranceContext';
import {
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  LineChart as RechartsLineChart,
  Line,
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { showSuccess, showError } from '@/utils/toast';
import { format, getMonth, getYear, subMonths, eachMonthOfInterval, startOfYear } from 'date-fns';

// Define chart types
type ChartType = 'bar' | 'pie' | 'line' | 'area' | 'radar' | 'scatter' | 'composed';
type DataType = 'expenses' | 'income' | 'savings' | 'investments' | 'assets' | 'insurance' | 'custom';
type TimeFrame = 'last3months' | 'last6months' | 'ytd' | 'last12months' | 'custom';

interface ChartConfig {
  title: string;
  description?: string;
  type: ChartType;
  dataType: DataType;
  timeFrame: TimeFrame;
  customPrompt?: string;
  customStartDate?: Date;
  customEndDate?: Date;
  groupBy?: 'category' | 'month' | 'year';
  compareWith?: 'previousPeriod' | 'none';
}

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8',
  '#82CA9D', '#8DD1E1', '#A4DE6C', '#D0ED57', '#FAAAA3',
  '#F472B6', '#8B5CF6', '#3B82F6', '#10B981', '#F59E0B'
];

const AIChartGenerator: React.FC = () => {
  const { selectedCurrency } = useCurrency();
  const { expenses } = useExpenses();
  const { monthlyIncomeSummaries } = useIncomeSummaries();
  const { savingsEntries } = useSavingsEntries();
  const { investments, investmentAssets } = useInvestments();
  const { assets } = useAssets();
  const { policies } = useInsurance();

  const [isGenerating, setIsGenerating] = useState(false);
  const [chartConfig, setChartConfig] = useState<ChartConfig>({
    title: '',
    description: '',
    type: 'bar',
    dataType: 'expenses',
    timeFrame: 'last3months',
    groupBy: 'category',
    compareWith: 'none'
  });
  const [generatedChart, setGeneratedChart] = useState<any>(null);
  const [generatedData, setGeneratedData] = useState<any[]>([]);
  const [aiSuggestion, setAiSuggestion] = useState<string>('');

  // Helper function to get data based on timeframe
  const getTimeFrameDates = (timeFrame: TimeFrame): { startDate: Date, endDate: Date } => {
    const now = new Date();
    let startDate: Date;
    const endDate = now;

    switch (timeFrame) {
      case 'last3months':
        startDate = subMonths(now, 3);
        break;
      case 'last6months':
        startDate = subMonths(now, 6);
        break;
      case 'ytd':
        startDate = startOfYear(now);
        break;
      case 'last12months':
        startDate = subMonths(now, 12);
        break;
      case 'custom':
        startDate = chartConfig.customStartDate || subMonths(now, 3);
        return {
          startDate,
          endDate: chartConfig.customEndDate || now
        };
      default:
        startDate = subMonths(now, 3);
    }

    return { startDate, endDate };
  };

  // Generate expense data by category
  const generateExpensesByCategoryData = () => {
    const { startDate, endDate } = getTimeFrameDates(chartConfig.timeFrame);

    // Filter expenses within the timeframe
    const filteredExpenses = expenses.filter(expense =>
      expense.date >= startDate && expense.date <= endDate
    );

    // Group by category
    const categoryMap: Record<string, number> = {};
    filteredExpenses.forEach(expense => {
      if (!categoryMap[expense.category]) {
        categoryMap[expense.category] = 0;
      }
      categoryMap[expense.category] += expense.amount;
    });

    // Convert to array format for charts
    const data = Object.entries(categoryMap).map(([name, value]) => ({
      name,
      value
    }));

    // Sort by value descending
    return data.sort((a, b) => b.value - a.value);
  };

  // Generate expense data by month
  const generateExpensesByMonthData = () => {
    const { startDate, endDate } = getTimeFrameDates(chartConfig.timeFrame);

    // Generate all months in the range
    const months = eachMonthOfInterval({ start: startDate, end: endDate });

    // Initialize data with all months
    const data = months.map(month => ({
      name: format(month, 'MMM yyyy'),
      value: 0,
      month: getMonth(month),
      year: getYear(month)
    }));

    // Add expense amounts to corresponding months
    expenses.forEach(expense => {
      if (expense.date >= startDate && expense.date <= endDate) {
        const expenseMonth = getMonth(expense.date);
        const expenseYear = getYear(expense.date);

        const monthIndex = data.findIndex(
          item => item.month === expenseMonth && item.year === expenseYear
        );

        if (monthIndex !== -1) {
          data[monthIndex].value += expense.amount;
        }
      }
    });

    // Remove unnecessary properties and return
    return data.map(({ name, value }) => ({ name, value }));
  };

  // Generate income vs expenses data
  const generateIncomeVsExpensesData = () => {
    const { startDate, endDate } = getTimeFrameDates(chartConfig.timeFrame);

    // Generate all months in the range
    const months = eachMonthOfInterval({ start: startDate, end: endDate });

    // Initialize data with all months
    const data = months.map(month => {
      const monthIndex = getMonth(month);
      const year = getYear(month);

      return {
        name: format(month, 'MMM yyyy'),
        month: monthIndex,
        year,
        income: 0,
        expenses: 0
      };
    });

    // Add income data
    monthlyIncomeSummaries.forEach(summary => {
      const summaryDate = new Date(summary.year, summary.month);
      if (summaryDate >= startDate && summaryDate <= endDate) {
        const monthIndex = data.findIndex(
          item => item.month === summary.month && item.year === summary.year
        );

        if (monthIndex !== -1) {
          // Calculate total income (sum of all income line items)
          let totalIncome = 0;
          let totalDeductions = 0;

          for (const [_, amount] of Object.entries(summary.lineItems)) {
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
      if (expense.date >= startDate && expense.date <= endDate) {
        const expenseMonth = getMonth(expense.date);
        const expenseYear = getYear(expense.date);

        const monthIndex = data.findIndex(
          item => item.month === expenseMonth && item.year === expenseYear
        );

        if (monthIndex !== -1) {
          data[monthIndex].expenses += expense.amount;
        }
      }
    });

    // Remove unnecessary properties and return
    return data.map(({ name, income, expenses }) => ({ name, income, expenses }));
  };

  // Generate savings data
  const generateSavingsData = () => {
    const { startDate, endDate } = getTimeFrameDates(chartConfig.timeFrame);

    // Generate all months in the range
    const months = eachMonthOfInterval({ start: startDate, end: endDate });

    // Initialize data with all months
    const data = months.map(month => ({
      name: format(month, 'MMM yyyy'),
      month: getMonth(month),
      year: getYear(month),
      contributions: 0
    }));

    // Add savings data
    savingsEntries.forEach(entry => {
      if (entry.date >= startDate && entry.date <= endDate) {
        const entryMonth = getMonth(entry.date);
        const entryYear = getYear(entry.date);

        const monthIndex = data.findIndex(
          item => item.month === entryMonth && item.year === entryYear
        );

        if (monthIndex !== -1) {
          data[monthIndex].contributions += entry.amount;
        }
      }
    });

    // Remove unnecessary properties and return
    return data.map(({ name, contributions }) => ({ name, value: contributions }));
  };

  // Generate asset allocation data
  const generateAssetAllocationData = () => {
    // Group assets by category
    const categoryMap: Record<string, number> = {};

    assets.forEach(asset => {
      if (asset.isActive) {
        if (!categoryMap[asset.category]) {
          categoryMap[asset.category] = 0;
        }
        categoryMap[asset.category] += asset.currentValue;
      }
    });

    // Convert to array format for charts
    const data = Object.entries(categoryMap).map(([name, value]) => ({
      name,
      value
    }));

    // Sort by value descending
    return data.sort((a, b) => b.value - a.value);
  };

  // Generate investment allocation data
  const generateInvestmentAllocationData = () => {
    // Group investments by asset type
    const typeMap: Record<string, number> = {};

    investmentAssets.forEach(asset => {
      if (asset.isActive) {
        if (!typeMap[asset.type]) {
          typeMap[asset.type] = 0;
        }

        // Find all investments for this asset
        const assetInvestments = investments.filter(inv => inv.assetId === asset.id);
        const totalInvested = assetInvestments.reduce((sum, inv) => sum + inv.amount, 0);

        typeMap[asset.type] += totalInvested;
      }
    });

    // Convert to array format for charts
    const data = Object.entries(typeMap).map(([name, value]) => ({
      name,
      value
    }));

    // Sort by value descending
    return data.sort((a, b) => b.value - a.value);
  };

  // Generate insurance premium data
  const generateInsurancePremiumData = () => {
    // Group policies by type
    const typeMap: Record<string, number> = {};

    policies.forEach(policy => {
      if (policy.isActive) {
        if (!typeMap[policy.policyType]) {
          typeMap[policy.policyType] = 0;
        }

        // Convert all premiums to yearly amount for comparison
        let yearlyPremium = policy.premiumAmount;
        switch (policy.premiumFrequency) {
          case 'Monthly':
            yearlyPremium *= 12;
            break;
          case 'Quarterly':
            yearlyPremium *= 4;
            break;
          case 'Half-Yearly':
            yearlyPremium *= 2;
            break;
          case 'Yearly':
            // Already yearly
            break;
        }

        typeMap[policy.policyType] += yearlyPremium;
      }
    });

    // Convert to array format for charts
    const data = Object.entries(typeMap).map(([name, value]) => ({
      name,
      value
    }));

    // Sort by value descending
    return data.sort((a, b) => b.value - a.value);
  };

  // Generate custom data based on AI suggestion
  const generateCustomData = () => {
    // This would normally call an AI service, but for now we'll generate some sample data
    const sampleData = [
      { name: 'Category A', value: 400 },
      { name: 'Category B', value: 300 },
      { name: 'Category C', value: 200 },
      { name: 'Category D', value: 100 },
      { name: 'Category E', value: 50 }
    ];

    return sampleData;
  };

  // Generate chart data based on configuration
  const generateChartData = () => {
    switch (chartConfig.dataType) {
      case 'expenses':
        return chartConfig.groupBy === 'category'
          ? generateExpensesByCategoryData()
          : generateExpensesByMonthData();
      case 'income':
        return generateIncomeVsExpensesData();
      case 'savings':
        return generateSavingsData();
      case 'investments':
        return generateInvestmentAllocationData();
      case 'assets':
        return generateAssetAllocationData();
      case 'insurance':
        return generateInsurancePremiumData();
      case 'custom':
        return generateCustomData();
      default:
        return [];
    }
  };

  // Generate AI suggestion for chart insights
  const generateAiSuggestion = (data: any[]) => {
    // This would normally call an AI service, but for now we'll generate a simple insight
    let insight = '';

    if (data.length === 0) {
      insight = "There's not enough data to generate meaningful insights.";
      return insight;
    }

    switch (chartConfig.dataType) {
      case 'expenses':
        if (chartConfig.groupBy === 'category') {
          const topCategory = data[0];
          const totalSpend = data.reduce((sum, item) => sum + item.value, 0);
          const percentage = ((topCategory.value / totalSpend) * 100).toFixed(1);

          insight = `Your highest spending category is ${topCategory.name} at ${selectedCurrency.symbol}${topCategory.value.toLocaleString()}, which represents ${percentage}% of your total expenses. Consider setting a budget for this category to manage your spending better.`;
        } else {
          // months and values were unused
          const maxMonth = data.reduce((max, item) => item.value > max.value ? item : max, { value: 0 });
          const minMonth = data.reduce((min, item) => (item.value < min.value && item.value > 0) ? item : min, { value: Number.MAX_VALUE });

          insight = `Your highest spending month was ${maxMonth.name} at ${selectedCurrency.symbol}${maxMonth.value.toLocaleString()}. Your lowest spending month was ${minMonth.name} at ${selectedCurrency.symbol}${minMonth.value.toLocaleString()}.`;
        }
        break;
      case 'income':
        const incomeValues = data.map(item => item.income);
        const expenseValues = data.map(item => item.expenses);

        const totalIncome = incomeValues.reduce((sum, val) => sum + val, 0);
        const totalExpenses = expenseValues.reduce((sum, val) => sum + val, 0);
        const savingsRate = ((totalIncome - totalExpenses) / totalIncome * 100).toFixed(1);

        insight = `Your overall savings rate is ${savingsRate}%. Financial experts recommend a savings rate of at least 20%. ${Number(savingsRate) >= 20 ? 'Great job!' : 'Consider finding ways to increase your savings rate.'}`;
        break;
      case 'investments':
        const topInvestment = data[0];
        insight = `Your largest investment allocation is in ${topInvestment.name} at ${selectedCurrency.symbol}${topInvestment.value.toLocaleString()}. Diversification is key to managing investment risk.`;
        break;
      default:
        insight = "Analyze this chart to identify patterns and make informed financial decisions.";
    }

    return insight;
  };

  const handleGenerateChart = async () => {
    try {
      setIsGenerating(true);

      // Validate inputs
      if (!chartConfig.title) {
        showError("Please provide a chart title");
        setIsGenerating(false);
        return;
      }

      // Generate data based on configuration
      const data = generateChartData();
      setGeneratedData(data);

      // Generate AI suggestion
      const suggestion = generateAiSuggestion(data);
      setAiSuggestion(suggestion);

      // Set the chart type
      setGeneratedChart(chartConfig.type);

      showSuccess("Chart generated successfully!");
    } catch (error) {
      console.error("Error generating chart:", error);
      showError("Failed to generate chart. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const renderChart = () => {
    if (!generatedChart || generatedData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 bg-muted/30 rounded-lg">
          <BarChart className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Configure and generate a chart to see it here</p>
        </div>
      );
    }

    switch (generatedChart) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <RechartsBarChart data={generatedData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
              <YAxis />
              <Tooltip formatter={(value) => `${selectedCurrency.symbol}${value.toLocaleString()}`} />
              <Legend />
              {chartConfig.dataType === 'income' ? (
                <>
                  <Bar dataKey="income" fill="#4ade80" name="Income" />
                  <Bar dataKey="expenses" fill="#f87171" name="Expenses" />
                </>
              ) : (
                <Bar dataKey="value" fill="#3b82f6" name={chartConfig.title} />
              )}
            </RechartsBarChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <RechartsPieChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <Pie
                data={generatedData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={150}
                fill="#8884d8"
                dataKey="value"
              >
                {generatedData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${selectedCurrency.symbol}${value.toLocaleString()}`} />
              <Legend />
            </RechartsPieChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <RechartsLineChart data={generatedData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
              <YAxis />
              <Tooltip formatter={(value) => `${selectedCurrency.symbol}${value.toLocaleString()}`} />
              <Legend />
              {chartConfig.dataType === 'income' ? (
                <>
                  <Line type="monotone" dataKey="income" stroke="#4ade80" name="Income" />
                  <Line type="monotone" dataKey="expenses" stroke="#f87171" name="Expenses" />
                </>
              ) : (
                <Line type="monotone" dataKey="value" stroke="#3b82f6" name={chartConfig.title} />
              )}
            </RechartsLineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <RechartsAreaChart data={generatedData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
              <YAxis />
              <Tooltip formatter={(value) => `${selectedCurrency.symbol}${value.toLocaleString()}`} />
              <Legend />
              {chartConfig.dataType === 'income' ? (
                <>
                  <Area type="monotone" dataKey="income" stackId="1" stroke="#4ade80" fill="#4ade80" name="Income" />
                  <Area type="monotone" dataKey="expenses" stackId="2" stroke="#f87171" fill="#f87171" name="Expenses" />
                </>
              ) : (
                <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="#3b82f6" name={chartConfig.title} />
              )}
            </RechartsAreaChart>
          </ResponsiveContainer>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center h-64 bg-muted/30 rounded-lg">
            <p className="text-muted-foreground">Unsupported chart type</p>
          </div>
        );
    }
  };

  const handleDownloadChart = () => {
    showSuccess("Chart download started");
    // In a real app, this would download the chart as an image
  };

  const handleCopyChart = () => {
    showSuccess("Chart copied to clipboard");
    // In a real app, this would copy the chart to clipboard
  };

  const handleShareChart = () => {
    showSuccess("Chart sharing dialog opened");
    // In a real app, this would open a sharing dialog
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Sparkles className="h-5 w-5 mr-2 text-primary" />
            AI Chart Generator
          </CardTitle>
          <CardDescription>
            Generate insightful charts from your financial data with AI assistance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="basic" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Basic Configuration</TabsTrigger>
              <TabsTrigger value="advanced">Advanced Options</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="chart-title">Chart Title</Label>
                  <Input
                    id="chart-title"
                    placeholder="Enter chart title"
                    value={chartConfig.title}
                    onChange={(e) => setChartConfig({ ...chartConfig, title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="chart-type">Chart Type</Label>
                  <Select
                    value={chartConfig.type}
                    onValueChange={(value: ChartType) => setChartConfig({ ...chartConfig, type: value })}
                  >
                    <SelectTrigger id="chart-type">
                      <SelectValue placeholder="Select chart type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bar">Bar Chart</SelectItem>
                      <SelectItem value="pie">Pie Chart</SelectItem>
                      <SelectItem value="line">Line Chart</SelectItem>
                      <SelectItem value="area">Area Chart</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="data-type">Data Type</Label>
                  <Select
                    value={chartConfig.dataType}
                    onValueChange={(value: DataType) => setChartConfig({ ...chartConfig, dataType: value })}
                  >
                    <SelectTrigger id="data-type">
                      <SelectValue placeholder="Select data type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="expenses">Expenses</SelectItem>
                      <SelectItem value="income">Income vs Expenses</SelectItem>
                      <SelectItem value="savings">Savings</SelectItem>
                      <SelectItem value="investments">Investments</SelectItem>
                      <SelectItem value="assets">Assets</SelectItem>
                      <SelectItem value="insurance">Insurance</SelectItem>
                      <SelectItem value="custom">Custom (AI Generated)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time-frame">Time Frame</Label>
                  <Select
                    value={chartConfig.timeFrame}
                    onValueChange={(value: TimeFrame) => setChartConfig({ ...chartConfig, timeFrame: value })}
                  >
                    <SelectTrigger id="time-frame">
                      <SelectValue placeholder="Select time frame" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="last3months">Last 3 Months</SelectItem>
                      <SelectItem value="last6months">Last 6 Months</SelectItem>
                      <SelectItem value="ytd">Year to Date</SelectItem>
                      <SelectItem value="last12months">Last 12 Months</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {chartConfig.dataType === 'expenses' && (
                <div className="space-y-2">
                  <Label htmlFor="group-by">Group By</Label>
                  <Select
                    value={chartConfig.groupBy}
                    onValueChange={(value) => setChartConfig({ ...chartConfig, groupBy: value as 'category' | 'month' })}
                  >
                    <SelectTrigger id="group-by">
                      <SelectValue placeholder="Select grouping" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="category">Category</SelectItem>
                      <SelectItem value="month">Month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {chartConfig.timeFrame === 'custom' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={chartConfig.customStartDate?.toISOString().split('T')[0] || ''}
                      onChange={(e) => setChartConfig({
                        ...chartConfig,
                        customStartDate: e.target.value ? new Date(e.target.value) : undefined
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-date">End Date</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={chartConfig.customEndDate?.toISOString().split('T')[0] || ''}
                      onChange={(e) => setChartConfig({
                        ...chartConfig,
                        customEndDate: e.target.value ? new Date(e.target.value) : undefined
                      })}
                    />
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="chart-description">Chart Description</Label>
                <Textarea
                  id="chart-description"
                  placeholder="Enter a description for your chart"
                  value={chartConfig.description || ''}
                  onChange={(e) => setChartConfig({ ...chartConfig, description: e.target.value })}
                />
              </div>

              {chartConfig.dataType === 'custom' && (
                <div className="space-y-2">
                  <Label htmlFor="custom-prompt">
                    Custom AI Prompt
                    <span className="text-xs text-muted-foreground ml-2">
                      Describe the chart you want to generate
                    </span>
                  </Label>
                  <Textarea
                    id="custom-prompt"
                    placeholder="E.g., Show me my spending trends compared to my income over the last 6 months"
                    value={chartConfig.customPrompt || ''}
                    onChange={(e) => setChartConfig({ ...chartConfig, customPrompt: e.target.value })}
                    className="min-h-[100px]"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="compare-with">Compare With</Label>
                <Select
                  value={chartConfig.compareWith}
                  onValueChange={(value) => setChartConfig({ ...chartConfig, compareWith: value as 'previousPeriod' | 'none' })}
                >
                  <SelectTrigger id="compare-with">
                    <SelectValue placeholder="Select comparison" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Comparison</SelectItem>
                    <SelectItem value="previousPeriod">Previous Period</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
          </Tabs>

          <Button
            className="w-full mt-6"
            onClick={handleGenerateChart}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Chart...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Chart
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Chart Display */}
      {(generatedChart || aiSuggestion) && (
        <Card>
          <CardHeader>
            <CardTitle>{chartConfig.title}</CardTitle>
            {chartConfig.description && (
              <CardDescription>{chartConfig.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border rounded-lg p-4 bg-card">
              {renderChart()}
            </div>

            {aiSuggestion && (
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium text-primary mb-1">AI Insight</h4>
                    <p className="text-sm">{aiSuggestion}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={handleDownloadChart}>
                <Download className="h-4 w-4 mr-2" />
                Download Chart
              </Button>
              <Button variant="outline" size="sm" onClick={handleCopyChart}>
                <Copy className="h-4 w-4 mr-2" />
                Copy as Image
              </Button>
              <Button variant="outline" size="sm" onClick={handleShareChart}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIChartGenerator;