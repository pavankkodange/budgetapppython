import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/context/CurrencyContext";
import { Calculator, TrendingDown, Calendar, DollarSign, AlertTriangle, Percent } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

export const SWPCalculator: React.FC = () => {
  const { selectedCurrency } = useCurrency();
  const [initialInvestment, setInitialInvestment] = useState<number>(1000000);
  const [monthlyWithdrawal, setMonthlyWithdrawal] = useState<number>(8000);
  const [expectedReturn, setExpectedReturn] = useState<number>(10);
  const [results, setResults] = useState({
    totalWithdrawals: 0,
    remainingValue: 0,
    monthsLasted: 0,
    yearsLasted: 0,
    isSustainable: true,
    cagr: 0,
    xirr: 0,
  });

  const calculateSWP = () => {
    const monthlyRate = expectedReturn / 100 / 12;
    let currentValue = initialInvestment;
    let months = 0;
    let totalWithdrawals = 0;
    const maxMonths = 50 * 12; // Cap at 50 years for calculation

    // Simulate month by month
    while (currentValue > 0 && months < maxMonths) {
      // Add monthly returns
      currentValue = currentValue * (1 + monthlyRate);
      
      // Subtract monthly withdrawal
      if (currentValue >= monthlyWithdrawal) {
        currentValue -= monthlyWithdrawal;
        totalWithdrawals += monthlyWithdrawal;
        months++;
      } else {
        // Final partial withdrawal
        totalWithdrawals += currentValue;
        currentValue = 0;
        months++;
        break;
      }
    }

    const isSustainable = months >= maxMonths;
    const yearsLasted = months / 12;

    // Calculate CAGR for the withdrawal period
    const finalValue = currentValue + totalWithdrawals;
    const cagr = isSustainable ? expectedReturn : 
      (Math.pow(finalValue / initialInvestment, 1 / yearsLasted) - 1) * 100;

    // XIRR approximation for SWP
    const xirr = isSustainable ? expectedReturn : 
      ((totalWithdrawals / initialInvestment - 1) / yearsLasted) * 100;

    setResults({
      totalWithdrawals,
      remainingValue: currentValue,
      monthsLasted: months,
      yearsLasted,
      isSustainable,
      cagr: isNaN(cagr) ? 0 : cagr,
      xirr: isNaN(xirr) ? 0 : xirr,
    });
  };

  useEffect(() => {
    calculateSWP();
  }, [initialInvestment, monthlyWithdrawal, expectedReturn]);

  // Calculate safe withdrawal rate (4% rule)
  const safeMonthlyWithdrawal = (initialInvestment * 0.04) / 12;

  // Data for pie chart
  const pieData = [
    {
      name: 'Total Withdrawals',
      value: results.totalWithdrawals,
      color: '#10b981',
    },
    {
      name: 'Remaining Value',
      value: results.remainingValue,
      color: '#3b82f6',
    },
  ];

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calculator className="h-5 w-5 mr-2" />
            SWP Calculator
          </CardTitle>
          <CardDescription>
            Calculate how long your investment will last with regular withdrawals
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="initial-investment">Initial Investment Amount</Label>
            <Input
              id="initial-investment"
              type="number"
              value={initialInvestment}
              onChange={(e) => setInitialInvestment(Number(e.target.value))}
              placeholder="1000000"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="monthly-withdrawal">Monthly Withdrawal Amount</Label>
            <Input
              id="monthly-withdrawal"
              type="number"
              value={monthlyWithdrawal}
              onChange={(e) => setMonthlyWithdrawal(Number(e.target.value))}
              placeholder="8000"
            />
            <div className="text-xs text-muted-foreground">
              Safe withdrawal: {selectedCurrency.symbol}{safeMonthlyWithdrawal.toFixed(0)}/month (4% rule)
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="expected-return-swp">Expected Annual Return (%)</Label>
            <Input
              id="expected-return-swp"
              type="number"
              step="0.1"
              value={expectedReturn}
              onChange={(e) => setExpectedReturn(Number(e.target.value))}
              placeholder="10"
            />
          </div>
          
          <Button onClick={calculateSWP} className="w-full">
            Calculate SWP Duration
          </Button>

          {monthlyWithdrawal > safeMonthlyWithdrawal && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Your withdrawal rate is higher than the recommended 4% annual rule. 
                Consider reducing monthly withdrawals for sustainability.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Results Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingDown className="h-5 w-5 mr-2" />
            SWP Results
          </CardTitle>
          <CardDescription>
            Your withdrawal plan projection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Duration
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-800 dark:text-blue-200">
                    {results.isSustainable ? "50+ years" : `${results.yearsLasted.toFixed(1)} years`}
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-400">
                    {results.monthsLasted} months
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-green-800 dark:text-green-200">
                    Total Withdrawals
                  </span>
                </div>
                <span className="text-lg font-bold text-green-800 dark:text-green-200">
                  {selectedCurrency.symbol}{results.totalWithdrawals.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <TrendingDown className="h-4 w-4 text-purple-600 mr-2" />
                  <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
                    Remaining Value
                  </span>
                </div>
                <span className="text-lg font-bold text-purple-800 dark:text-purple-200">
                  {selectedCurrency.symbol}{results.remainingValue.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Pie Chart */}
          {(results.totalWithdrawals > 0 || results.remainingValue > 0) && (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={800}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [
                      `${selectedCurrency.symbol}${value.toLocaleString()}`,
                      ''
                    ]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Additional Insights */}
          <div className="pt-4 border-t space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">CAGR (Effective Return Rate):</span>
              <span className="font-medium flex items-center">
                <Percent className="h-3 w-3 mr-1" />
                {results.cagr.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">XIRR (Withdrawal Return Rate):</span>
              <span className="font-medium flex items-center">
                <Percent className="h-3 w-3 mr-1" />
                {results.xirr.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Annual Withdrawal Rate:</span>
              <span className="font-medium">{((monthlyWithdrawal * 12 / initialInvestment) * 100).toFixed(2)}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Sustainability:</span>
              <span className={`font-medium ${results.isSustainable ? 'text-green-600' : 'text-orange-600'}`}>
                {results.isSustainable ? 'Sustainable' : 'Limited Duration'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};