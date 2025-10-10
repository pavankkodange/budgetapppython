import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/context/CurrencyContext";
import { Calculator, TrendingUp, Calendar, DollarSign, ArrowUp, Percent } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

export const StepUpSIPCalculator: React.FC = () => {
  const { selectedCurrency } = useCurrency();
  const [initialMonthlyInvestment, setInitialMonthlyInvestment] = useState<number>(5000);
  const [stepUpPercentage, setStepUpPercentage] = useState<number>(10);
  const [expectedReturn, setExpectedReturn] = useState<number>(12);
  const [timePeriod, setTimePeriod] = useState<number>(10);
  const [results, setResults] = useState({
    totalInvestment: 0,
    estimatedReturns: 0,
    maturityValue: 0,
    regularSIPValue: 0,
    additionalGain: 0,
    cagr: 0,
    xirr: 0,
  });

  const calculateStepUpSIP = () => {
    const monthlyRate = expectedReturn / 100 / 12;
    const totalMonths = timePeriod * 12;
    
    let stepUpMaturityValue = 0;
    let totalStepUpInvestment = 0;
    let currentMonthlyAmount = initialMonthlyInvestment;
    
    // Calculate step-up SIP
    for (let month = 1; month <= totalMonths; month++) {
      // Increase amount annually
      if (month > 1 && (month - 1) % 12 === 0) {
        currentMonthlyAmount = currentMonthlyAmount * (1 + stepUpPercentage / 100);
      }
      
      totalStepUpInvestment += currentMonthlyAmount;
      
      // Calculate future value of this investment
      const remainingMonths = totalMonths - month + 1;
      const futureValue = currentMonthlyAmount * Math.pow(1 + monthlyRate, remainingMonths);
      stepUpMaturityValue += futureValue;
    }
    
    // Calculate regular SIP for comparison
    const regularSIPValue = initialMonthlyInvestment * 
      (((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * (1 + monthlyRate));
    
    const regularSIPInvestment = initialMonthlyInvestment * totalMonths;
    
    const estimatedReturns = stepUpMaturityValue - totalStepUpInvestment;
    const additionalGain = stepUpMaturityValue - regularSIPValue;

    // Calculate CAGR for step-up SIP
    const cagr = (Math.pow(stepUpMaturityValue / totalStepUpInvestment, 1 / timePeriod) - 1) * 100;

    // XIRR approximation for step-up SIP (considering increasing investments)
    const xirr = expectedReturn * (1 + stepUpPercentage / 200); // Rough approximation

    setResults({
      totalInvestment: totalStepUpInvestment,
      estimatedReturns,
      maturityValue: stepUpMaturityValue,
      regularSIPValue,
      additionalGain,
      cagr: isNaN(cagr) ? 0 : cagr,
      xirr: isNaN(xirr) ? 0 : xirr,
    });
  };

  useEffect(() => {
    calculateStepUpSIP();
  }, [initialMonthlyInvestment, stepUpPercentage, expectedReturn, timePeriod]);

  // Data for pie chart
  const pieData = [
    {
      name: 'Total Investment',
      value: results.totalInvestment,
      color: '#3b82f6',
    },
    {
      name: 'Estimated Returns',
      value: results.estimatedReturns,
      color: '#10b981',
    },
  ];

  // Data for comparison bar chart
  const comparisonData = [
    {
      name: 'Regular SIP',
      value: results.regularSIPValue,
      color: '#f59e0b',
    },
    {
      name: 'Step-up SIP',
      value: results.maturityValue,
      color: '#8b5cf6',
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
            Step-up SIP Calculator
          </CardTitle>
          <CardDescription>
            Calculate returns with annual increase in SIP amount
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="initial-monthly">Initial Monthly Investment</Label>
            <Input
              id="initial-monthly"
              type="number"
              value={initialMonthlyInvestment}
              onChange={(e) => setInitialMonthlyInvestment(Number(e.target.value))}
              placeholder="5000"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="step-up-percentage">Annual Step-up Percentage (%)</Label>
            <Input
              id="step-up-percentage"
              type="number"
              step="0.1"
              value={stepUpPercentage}
              onChange={(e) => setStepUpPercentage(Number(e.target.value))}
              placeholder="10"
            />
            <div className="text-xs text-muted-foreground">
              Recommended: 5-15% to beat inflation
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="expected-return-stepup">Expected Annual Return (%)</Label>
            <Input
              id="expected-return-stepup"
              type="number"
              step="0.1"
              value={expectedReturn}
              onChange={(e) => setExpectedReturn(Number(e.target.value))}
              placeholder="12"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="time-period-stepup">Time Period (Years)</Label>
            <Input
              id="time-period-stepup"
              type="number"
              value={timePeriod}
              onChange={(e) => setTimePeriod(Number(e.target.value))}
              placeholder="10"
            />
          </div>
          
          <Button onClick={calculateStepUpSIP} className="w-full">
            Calculate Step-up SIP
          </Button>
        </CardContent>
      </Card>

      {/* Results Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Step-up SIP Results
          </CardTitle>
          <CardDescription>
            Comparison with regular SIP over {timePeriod} years
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Total Investment
                  </span>
                </div>
                <span className="text-lg font-bold text-blue-800 dark:text-blue-200">
                  {selectedCurrency.symbol}{results.totalInvestment.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-green-800 dark:text-green-200">
                    Step-up SIP Value
                  </span>
                </div>
                <span className="text-xl font-bold text-green-800 dark:text-green-200">
                  {selectedCurrency.symbol}{results.maturityValue.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <ArrowUp className="h-4 w-4 text-purple-600 mr-2" />
                  <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
                    Additional Gain
                  </span>
                </div>
                <span className="text-lg font-bold text-purple-800 dark:text-purple-200">
                  {selectedCurrency.symbol}{results.additionalGain.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Pie Chart */}
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

          {/* Additional Insights */}
          <div className="pt-4 border-t space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">CAGR (Step-up SIP):</span>
              <span className="font-medium flex items-center">
                <Percent className="h-3 w-3 mr-1" />
                {results.cagr.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">XIRR (Effective Return):</span>
              <span className="font-medium flex items-center">
                <Percent className="h-3 w-3 mr-1" />
                {results.xirr.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Starting Amount:</span>
              <span className="font-medium">{selectedCurrency.symbol}{initialMonthlyInvestment.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Final Monthly Amount:</span>
              <span className="font-medium">
                {selectedCurrency.symbol}{(initialMonthlyInvestment * Math.pow(1 + stepUpPercentage / 100, timePeriod - 1)).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Advantage over Regular SIP:</span>
              <span className="font-medium text-green-600">
                +{((results.additionalGain / results.regularSIPValue) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};