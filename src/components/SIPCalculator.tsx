import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/context/CurrencyContext";
import { Calculator, TrendingUp, Calendar, DollarSign, Percent } from "lucide-react";

export const SIPCalculator: React.FC = () => {
  const { selectedCurrency } = useCurrency();
  const [monthlyInvestment, setMonthlyInvestment] = useState<number>(5000);
  const [expectedReturn, setExpectedReturn] = useState<number>(12);
  const [timePeriod, setTimePeriod] = useState<number>(10);
  const [results, setResults] = useState({
    investedAmount: 0,
    estimatedReturns: 0,
    totalValue: 0,
    cagr: 0,
    xirr: 0,
  });

  const calculateSIP = () => {
    const P = monthlyInvestment;
    const n = timePeriod * 12; // Total number of payments
    const r = expectedReturn / 100 / 12; // Monthly interest rate
    
    // Calculate total invested amount
    const investedAmount = P * n;
    
    // SIP Future Value Formula
    const futureValue = P * (((Math.pow(1 + r, n) - 1) / r) * (1 + r));
    
    // Calculate estimated returns (gains)
    const estimatedReturns = futureValue - investedAmount;

    // CAGR calculation
    const cagr = (Math.pow(futureValue / investedAmount, 1 / timePeriod) - 1) * 100;
    
    // XIRR approximation
    const xirr = expectedReturn;

    setResults({
      investedAmount: Math.round(investedAmount),
      estimatedReturns: Math.round(estimatedReturns),
      totalValue: Math.round(futureValue),
      cagr: isNaN(cagr) ? 0 : cagr,
      xirr,
    });
  };

  useEffect(() => {
    calculateSIP();
  }, [monthlyInvestment, expectedReturn, timePeriod]);

  // Format numbers with Indian number system (lakhs, crores)
  const formatIndianNumber = (num: number) => {
    if (num >= 10000000) { // 1 crore
      return `${(num / 10000000).toFixed(2)} Cr`;
    } else if (num >= 100000) { // 1 lakh
      return `${(num / 100000).toFixed(2)} L`;
    } else if (num >= 1000) { // 1 thousand
      return `${(num / 1000).toFixed(1)} K`;
    }
    return num.toLocaleString('en-IN');
  };

  // Format numbers with commas for detailed view
  const formatNumber = (num: number) => {
    return num.toLocaleString('en-IN');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input Section */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calculator className="h-5 w-5 mr-2" />
            SIP Calculator
          </CardTitle>
          <CardDescription>
            Calculate the future value of your Systematic Investment Plan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="monthly-investment" className="text-base font-medium">Monthly investment</Label>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">{selectedCurrency.symbol}</span>
                <Input
                  id="monthly-investment"
                  type="number"
                  value={monthlyInvestment}
                  onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
                  className="w-24 text-right"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="expected-return" className="text-base font-medium">Expected return rate (p.a)</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="expected-return"
                  type="number"
                  step="0.1"
                  value={expectedReturn}
                  onChange={(e) => setExpectedReturn(Number(e.target.value))}
                  className="w-20 text-right"
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="time-period" className="text-base font-medium">Time period</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="time-period"
                  type="number"
                  value={timePeriod}
                  onChange={(e) => setTimePeriod(Number(e.target.value))}
                  className="w-20 text-right"
                />
                <span className="text-sm text-muted-foreground">Yr</span>
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="space-y-4 pt-6 border-t">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Invested amount</span>
              <span className="font-semibold">{selectedCurrency.symbol}{formatNumber(results.investedAmount)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Est. returns</span>
              <span className="font-semibold text-green-600">{selectedCurrency.symbol}{formatNumber(results.estimatedReturns)}</span>
            </div>
            <div className="flex justify-between items-center text-lg">
              <span className="font-semibold">Total value</span>
              <span className="font-bold text-primary">{selectedCurrency.symbol}{formatNumber(results.totalValue)}</span>
            </div>
          </div>

          <Button onClick={calculateSIP} className="w-full bg-green-600 hover:bg-green-700">
            CALCULATE
          </Button>
        </CardContent>
      </Card>

      {/* Results Section */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Investment Breakdown
          </CardTitle>
          <CardDescription>
            Visual representation of your {timePeriod}-year SIP investment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Simple Visual Breakdown */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-blue-600 mr-2" />
                <span className="font-medium">Total Invested</span>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-blue-600">
                  {selectedCurrency.symbol}{formatIndianNumber(results.investedAmount)}
                </div>
                <div className="text-xs text-blue-500">
                  {selectedCurrency.symbol}{formatNumber(results.investedAmount)}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="flex items-center">
                <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                <span className="font-medium">Returns Earned</span>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-green-600">
                  {selectedCurrency.symbol}{formatIndianNumber(results.estimatedReturns)}
                </div>
                <div className="text-xs text-green-500">
                  {selectedCurrency.symbol}{formatNumber(results.estimatedReturns)}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-950 rounded-lg border-2 border-purple-200 dark:border-purple-800">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-purple-600 mr-2" />
                <span className="font-bold">Final Value</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-600">
                  {selectedCurrency.symbol}{formatIndianNumber(results.totalValue)}
                </div>
                <div className="text-xs text-purple-500">
                  {selectedCurrency.symbol}{formatNumber(results.totalValue)}
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Percent className="h-4 w-4 text-blue-600 mr-2" />
                  <span className="text-sm font-medium">CAGR</span>
                </div>
                <span className="text-lg font-bold text-blue-600">
                  {results.cagr.toFixed(2)}%
                </span>
              </div>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Percent className="h-4 w-4 text-green-600 mr-2" />
                  <span className="text-sm font-medium">XIRR</span>
                </div>
                <span className="text-lg font-bold text-green-600">
                  {results.xirr.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          {/* Additional Insights */}
          <div className="pt-4 border-t space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Months:</span>
              <span className="font-medium">{timePeriod * 12} months</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Return Multiple:</span>
              <span className="font-medium">{(results.totalValue / results.investedAmount || 0).toFixed(2)}x</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Monthly Return Rate:</span>
              <span className="font-medium">{(expectedReturn / 12).toFixed(2)}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Wealth Multiplier:</span>
              <span className="font-medium text-green-600">
                {((results.estimatedReturns / results.investedAmount) * 100).toFixed(1)}% gain
              </span>
            </div>
          </div>

          {/* Progress Bar Visualization */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Investment vs Returns</div>
            <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700">
              <div 
                className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-1000 ease-out"
                style={{ 
                  width: `${(results.investedAmount / results.totalValue) * 100}%` 
                }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Invested: {((results.investedAmount / results.totalValue) * 100).toFixed(1)}%</span>
              <span>Returns: {((results.estimatedReturns / results.totalValue) * 100).toFixed(1)}%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};