import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BackButton } from "@/components/ui/back-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCurrency } from "@/context/CurrencyContext";
import { useIncomeSources } from "@/context/IncomeSourceContext";
import { useIncomeSummaries } from "@/context/IncomeSummaryContext";
import { MonthlyIncomeSummary, Income } from "@/types";
import { showSuccess, showLoading, dismissToast } from "@/utils/toast";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { IncomeForm } from "@/components/IncomeForm";
import { IncomeDocumentUpload } from "@/components/IncomeDocumentUpload";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect, useCallback } from "react";
import { getMonth, getYear, format } from "date-fns";
import { Save, Plus, Trash2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const IncomePage = () => {
  const isMobile = useIsMobile();
  const { selectedCurrency } = useCurrency();
  const { incomeSources } = useIncomeSources();
  const { saveMonthlyIncomeSummary, getMonthlyIncomeSummary, addDocumentToSummary, removeDocumentFromSummary } = useIncomeSummaries();

  const currentMonth = getMonth(new Date());
  const currentYear = getYear(new Date());

  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth.toString());
  const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString());
  const [lineItemAmounts, setLineItemAmounts] = useState<{ [key: string]: string }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [hasUserEdited, setHasUserEdited] = useState(false);
  const [isIncomeDialogOpen, setIsIncomeDialogOpen] = useState(false);

  // State for additional income entries
  const [additionalIncomes, setAdditionalIncomes] = useState<Income[]>([]);

  // Load data for the selected month/year
  useEffect(() => {
    const summaryForSelectedPeriod = getMonthlyIncomeSummary(parseInt(String(selectedMonth)), parseInt(String(selectedYear)));

    if (summaryForSelectedPeriod) {
      // Convert numbers back to strings for display in inputs
      const stringifiedLineItems: { [key: string]: string } = {};
      for (const key in summaryForSelectedPeriod.lineItems) {
        stringifiedLineItems[key] = summaryForSelectedPeriod.lineItems[key].toString();
      }
      setLineItemAmounts(stringifiedLineItems);

      // Load additional incomes if they exist in the summary
      if (summaryForSelectedPeriod.additionalIncomes) {
        setAdditionalIncomes(summaryForSelectedPeriod.additionalIncomes);
      } else {
        setAdditionalIncomes([]);
      }
    } else {
      // Initialize with empty strings for all income sources and deductions if no data exists
      const initialAmounts: { [key: string]: string } = {};
      incomeSources.forEach(source => {
        initialAmounts[source.name] = ""; // Initialize with empty string
      });
      setLineItemAmounts(initialAmounts);
      setAdditionalIncomes([]);
    }
    setHasUserEdited(false); // Reset hasUserEdited when new month/year data is loaded
  }, [selectedMonth, selectedYear, incomeSources, getMonthlyIncomeSummary]);

  const handleAmountChange = (sourceName: string, value: string) => {
    // Allow only numbers and a single decimal point
    const sanitizedValue = value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    setLineItemAmounts(prev => ({
      ...prev,
      [sourceName]: sanitizedValue,
    }));
    setHasUserEdited(true);
  };

  const handleSaveMonthlyIncome = useCallback(() => {
    setIsSaving(true);
    const loadingToastId = showLoading("Saving monthly income...");

    // Convert string values to numbers for saving
    const numericLineItems: { [key: string]: number } = {};
    for (const key in lineItemAmounts) {
      numericLineItems[key] = parseFloat(lineItemAmounts[key]) || 0;
    }

    const newSummaryData: Omit<MonthlyIncomeSummary, 'id'> = {
      month: parseInt(String(selectedMonth)),
      year: parseInt(String(selectedYear)),
      lineItems: numericLineItems,
      additionalIncomes: additionalIncomes,
    };
    saveMonthlyIncomeSummary(newSummaryData);

    dismissToast(loadingToastId);
    showSuccess("Monthly income saved!");
    setIsSaving(false);
    setHasUserEdited(false); // Reset after saving
  }, [lineItemAmounts, selectedMonth, selectedYear, additionalIncomes, saveMonthlyIncomeSummary]);

  const handleAddIncome = (incomeData: Omit<Income, 'id'>) => {
    const newIncome: Income = {
      id: crypto.randomUUID(),
      ...incomeData
    };

    setAdditionalIncomes(prev => [...prev, newIncome]);
    setHasUserEdited(true);
    setIsIncomeDialogOpen(false);
    showSuccess("Additional income added successfully!");
  };

  const handleRemoveIncome = (incomeId: string) => {
    setAdditionalIncomes(prev => prev.filter(income => income.id !== incomeId));
    setHasUserEdited(true);
    showSuccess("Additional income removed successfully!");
  };

  const calculateTotals = () => {
    let grossIncome = 0;
    let totalDeductions = 0;

    // Calculate from regular income sources
    incomeSources.forEach(source => {
      // Convert string to number for calculation
      const amount = parseFloat(lineItemAmounts[source.name] || "0") || 0;
      if (source.type === 'income') {
        grossIncome += amount;
      } else if (source.type === 'deduction') {
        totalDeductions += amount;
      }
    });

    // Add additional incomes
    const additionalIncomeTotal = additionalIncomes.reduce((sum, income) => sum + income.amount, 0);
    grossIncome += additionalIncomeTotal;

    const netIncome = grossIncome - totalDeductions;
    return { grossIncome, totalDeductions, netIncome, additionalIncomeTotal };
  };

  const { grossIncome, totalDeductions, netIncome, additionalIncomeTotal } = calculateTotals();

  const currentFullYear = new Date().getFullYear();
  const years = Array.from({ length: 101 }, (_, i) => (currentFullYear - 50 + i).toString());

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

  const incomeLineItems = incomeSources.filter(s => s.type === 'income');
  const employerContributions = incomeSources.filter(s => s.type === 'deduction' && s.deductionCategory === 'employer_contribution');
  const actualDeductionsAndTaxes = incomeSources.filter(s => s.type === 'deduction' && s.deductionCategory === 'tax_or_actual_deduction');

  return (
    <>
      <header className="p-3 sm:p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <BackButton />
          <h1 className="text-xl sm:text-2xl font-bold">Monthly Income</h1>
        </div>
        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <Select onValueChange={setSelectedMonth} defaultValue={selectedMonth}>
            <SelectTrigger className="w-[100px] sm:w-[130px] h-9 sm:h-10 text-xs sm:text-sm shrink-0">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {months.map(month => (
                <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select onValueChange={setSelectedYear} defaultValue={selectedYear}>
            <SelectTrigger className="w-[80px] sm:w-[100px] h-9 sm:h-10 text-xs sm:text-sm shrink-0">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map(year => (
                <SelectItem key={year} value={year}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleSaveMonthlyIncome} disabled={!hasUserEdited || isSaving} size="sm" className="h-9 sm:h-10 shrink-0">
            <Save className="h-4 w-4 mr-1 sm:mr-2" /> {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </header>
      <main className="flex-1 p-3 sm:p-6 overflow-auto">
        <Tabs defaultValue="regular-income" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-3 text-xs sm:text-sm">
            <TabsTrigger value="regular-income">Regular Income</TabsTrigger>
            <TabsTrigger value="additional-income">Additional Income</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="regular-income">
            <div className="bg-card p-3 sm:p-6 rounded-lg shadow-sm border border-border mb-4 sm:mb-8">
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 flex items-center justify-between">
                Income for {months[parseInt(String(selectedMonth))].label} {selectedYear}
              </h2>

              <div className="space-y-3 sm:space-y-4">
                {incomeSources.length === 0 ? (
                  <p className="text-muted-foreground text-center">
                    No income sources or deductions defined. Please add them in the Admin panel.
                  </p>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
                      {/* Income Sources Section (Left) */}
                      <div className="space-y-2 sm:space-y-3">
                        <h3 className="text-base sm:text-lg font-semibold">Income:</h3>
                        {incomeLineItems.length === 0 ? (
                          <p className="text-muted-foreground text-xs sm:text-sm">No income sources defined.</p>
                        ) : (
                          incomeLineItems.map((source) => (
                            <div key={source.id} className="flex items-center justify-between gap-2 sm:gap-4">
                              <Label htmlFor={`input-${source.name}`} className="flex-1 text-xs sm:text-sm">{source.name}</Label>
                              <div className="relative flex items-center">
                                <span className="absolute left-2 sm:left-3 text-muted-foreground text-xs sm:text-sm">{selectedCurrency.symbol}</span>
                                <Input
                                  id={`input-${source.name}`}
                                  type="number"
                                  placeholder="0.00"
                                  value={lineItemAmounts[source.name] || ""}
                                  onChange={(e) => handleAmountChange(source.name, e.target.value)}
                                  className="pl-6 sm:pl-8 w-24 sm:w-32 text-right text-xs sm:text-sm h-8 sm:h-10"
                                />
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Deductions Section (Right) */}
                      <div className="space-y-4 sm:space-y-6">
                        {/* Employer Contributions */}
                        <div className="space-y-2 sm:space-y-3">
                          <h3 className="text-base sm:text-lg font-semibold">Employer Contributions:</h3>
                          {employerContributions.length === 0 ? (
                            <p className="text-muted-foreground text-xs sm:text-sm">No employer contributions defined.</p>
                          ) : (
                            employerContributions.map((source) => (
                              <div key={source.id} className="flex items-center justify-between gap-2 sm:gap-4">
                                <Label htmlFor={`input-${source.name}`} className="flex-1 text-xs sm:text-sm">{source.name}</Label>
                                <div className="relative flex items-center">
                                  <span className="absolute left-2 sm:left-3 text-muted-foreground text-xs sm:text-sm">{selectedCurrency.symbol}</span>
                                  <Input
                                    id={`input-${source.name}`}
                                    type="number"
                                    placeholder="0.00"
                                    value={lineItemAmounts[source.name] || ""}
                                    onChange={(e) => handleAmountChange(source.name, e.target.value)}
                                    className="pl-6 sm:pl-8 w-24 sm:w-32 text-right text-xs sm:text-sm h-8 sm:h-10"
                                  />
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Actual Deductions & Taxes */}
                        <div className="space-y-2 sm:space-y-3">
                          <h3 className="text-base sm:text-lg font-semibold">Actual Deductions & Taxes:</h3>
                          {actualDeductionsAndTaxes.length === 0 ? (
                            <p className="text-muted-foreground text-xs sm:text-sm">No actual deductions or taxes defined.</p>
                          ) : (
                            actualDeductionsAndTaxes.map((source) => (
                              <div key={source.id} className="flex items-center justify-between gap-2 sm:gap-4">
                                <Label htmlFor={`input-${source.name}`} className="flex-1 text-xs sm:text-sm">{source.name}</Label>
                                <div className="relative flex items-center">
                                  <span className="absolute left-2 sm:left-3 text-muted-foreground text-xs sm:text-sm">{selectedCurrency.symbol}</span>
                                  <Input
                                    id={`input-${source.name}`}
                                    type="number"
                                    placeholder="0.00"
                                    value={lineItemAmounts[source.name] || ""}
                                    onChange={(e) => handleAmountChange(source.name, e.target.value)}
                                    className="pl-6 sm:pl-8 w-24 sm:w-32 text-right text-xs sm:text-sm h-8 sm:h-10"
                                  />
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Totals Section (Bottom) */}
                    <div className="pt-3 sm:pt-4 border-t border-border mt-4 sm:mt-6 space-y-1 sm:space-y-2">
                      <div className="flex justify-between font-semibold text-sm sm:text-base">
                        <span>Gross Income:</span>
                        <span>{selectedCurrency.symbol}{grossIncome.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-destructive text-sm sm:text-base">
                        <span>Total Deductions:</span>
                        <span>-{selectedCurrency.symbol}{totalDeductions.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-green-600 text-lg sm:text-xl">
                        <span>Net Income (Take Home):</span>
                        <span>{selectedCurrency.symbol}{netIncome.toFixed(2)}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="additional-income">
            <div className="bg-card p-3 sm:p-6 rounded-lg shadow-sm border border-border mb-4 sm:mb-8">
              <div className="flex justify-between items-center mb-3 sm:mb-4">
                <h2 className="text-lg sm:text-xl font-semibold">
                  Additional Income for {months[parseInt(String(selectedMonth))].label} {selectedYear}
                </h2>
                <Dialog open={isIncomeDialogOpen} onOpenChange={setIsIncomeDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size={isMobile ? "sm" : "default"}>
                      <Plus className="h-4 w-4 mr-1 sm:mr-2" /> {isMobile ? "Add" : "Add Income"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add Additional Income</DialogTitle>
                    </DialogHeader>
                    <IncomeForm onSubmit={handleAddIncome} />
                  </DialogContent>
                </Dialog>
              </div>

              {additionalIncomes.length === 0 ? (
                <div className="text-center py-6 sm:py-8 bg-muted/30 rounded-lg">
                  <p className="text-muted-foreground text-sm mb-2">No additional income recorded for this period.</p>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                    Add one-time or irregular income sources like bonuses, freelance work, or gifts.
                  </p>
                  <Button onClick={() => setIsIncomeDialogOpen(true)} variant="outline" size={isMobile ? "sm" : "default"}>
                    <Plus className="h-4 w-4 mr-1 sm:mr-2" /> Add Your First Additional Income
                  </Button>
                </div>
              ) : (
                <>
                  <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                    {additionalIncomes.map((income) => (
                      <Card key={income.id} className="overflow-hidden">
                        <CardContent className="p-0">
                          <div className="flex justify-between items-center p-3 sm:p-4">
                            <div>
                              <h3 className="font-medium text-sm sm:text-base">{income.source}</h3>
                              <p className="text-xs sm:text-sm text-muted-foreground">
                                {format(new Date(income.date), 'dd MMM yyyy')}
                                {income.description && ` - ${income.description}`}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2 sm:space-x-3">
                              <span className="font-bold text-green-600 text-sm sm:text-base">
                                {selectedCurrency.symbol}{income.amount.toFixed(2)}
                              </span>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Additional Income</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to remove this additional income entry? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleRemoveIncome(income.id)}>
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="pt-3 sm:pt-4 border-t border-border space-y-1 sm:space-y-2">
                    <div className="flex justify-between font-semibold text-sm sm:text-base">
                      <span>Total Additional Income:</span>
                      <span className="text-green-600">{selectedCurrency.symbol}{additionalIncomeTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
                      <span>Regular Monthly Income:</span>
                      <span>{selectedCurrency.symbol}{(grossIncome - additionalIncomeTotal).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
                      <span>Total Deductions:</span>
                      <span>-{selectedCurrency.symbol}{totalDeductions.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-green-600 text-lg sm:text-xl mt-1 sm:mt-2">
                      <span>Net Income (Take Home):</span>
                      <span>{selectedCurrency.symbol}{netIncome.toFixed(2)}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="documents">
            <div className="bg-card p-3 sm:p-6 rounded-lg shadow-sm border border-border">
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
                Documents for {months[parseInt(String(selectedMonth))].label} {selectedYear}
              </h2>
              <IncomeDocumentUpload
                documents={(() => {
                  const summary = getMonthlyIncomeSummary(parseInt(String(selectedMonth)), parseInt(String(selectedYear)));
                  return summary?.attachments || [];
                })()}
                onUpload={(doc) => addDocumentToSummary(parseInt(String(selectedMonth)), parseInt(String(selectedYear)), doc)}
                onRemove={(docId) => removeDocumentFromSummary(parseInt(String(selectedMonth)), parseInt(String(selectedYear)), docId)}
              />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
};

export default IncomePage;