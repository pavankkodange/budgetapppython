import React, { useState } from "react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Sidebar } from "@/components/Sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { format, isSameMonth, isSameYear } from "date-fns";
import { useCurrency } from "@/context/CurrencyContext";
import { useSavingsEntries } from "@/context/SavingsEntryContext";
import { useSavingsInstruments } from "@/context/SavingsInstrumentContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SavingsForm } from "@/components/SavingsForm";
import { Plus, Trash2 } from "lucide-react";
import { SavingsEntry } from "@/types";
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
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";

const SavingsPage = () => {
  const isMobile = useIsMobile();
  const { selectedCurrency } = useCurrency();
  const { savingsEntries, addSavingsEntry, removeSavingsEntry } = useSavingsEntries();
  const { savingsInstruments, updateSavingsInstrumentValue, updateSavingsInstrumentTotalInvested } = useSavingsInstruments();
  const [isAddContributionDialogOpen, setIsAddContributionDialogOpen] = useState(false);

  const currentMonth = new Date().getMonth().toString();
  const currentYear = new Date().getFullYear().toString();

  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth);
  const [selectedYear, setSelectedYear] = useState<string>(currentYear);

  const filteredSavingsEntries = savingsEntries.filter(entry =>
    isSameMonth(entry.date, new Date(parseInt(selectedYear), parseInt(selectedMonth))) &&
    isSameYear(entry.date, new Date(parseInt(selectedYear), parseInt(selectedMonth)))
  );

  const totalSavingsForPeriod = filteredSavingsEntries.reduce((sum, entry) => sum + entry.amount, 0);

  // Helper function to format numbers for display in inputs (empty string for 0)
  const formatNumberForInput = (num: number) => (num === 0 ? "" : num.toFixed(2));

  // State to hold temporary input values for total invested
  const [tempTotalInvestedValues, setTempTotalInvestedValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    savingsInstruments.forEach(instrument => {
      initial[instrument.id] = formatNumberForInput(instrument.totalInvested);
    });
    return initial;
  });

  // State to hold temporary input values for current values
  const [tempCurrentValues, setTempCurrentValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    savingsInstruments.forEach(instrument => {
      initial[instrument.id] = formatNumberForInput(instrument.currentValue);
    });
    return initial;
  });

  // Update tempTotalInvestedValues and tempCurrentValues when savingsInstruments change
  React.useEffect(() => {
    const newTempTotalInvestedValues: Record<string, string> = {};
    const newTempCurrentValues: Record<string, string> = {};
    savingsInstruments.forEach(instrument => {
      newTempTotalInvestedValues[instrument.id] = formatNumberForInput(instrument.totalInvested);
      newTempCurrentValues[instrument.id] = formatNumberForInput(instrument.currentValue);
    });
    setTempTotalInvestedValues(newTempTotalInvestedValues);
    setTempCurrentValues(newTempCurrentValues);
  }, [savingsInstruments]);

  // Debounce the update for total invested
  const debouncedTempTotalInvestedValues = useDebounce(tempTotalInvestedValues, 500);
  React.useEffect(() => {
    savingsInstruments.forEach(instrument => {
      const debouncedValue = parseFloat(debouncedTempTotalInvestedValues[instrument.id]);
      // Only update if it's a valid number and different from the current context value
      if (!isNaN(debouncedValue) && debouncedValue !== instrument.totalInvested) {
        updateSavingsInstrumentTotalInvested(instrument.id, debouncedValue);
      }
    });
  }, [debouncedTempTotalInvestedValues, savingsInstruments, updateSavingsInstrumentTotalInvested]);

  // Debounce the update for current value
  const debouncedTempCurrentValues = useDebounce(tempCurrentValues, 500);
  React.useEffect(() => {
    savingsInstruments.forEach(instrument => {
      const debouncedValue = parseFloat(debouncedTempCurrentValues[instrument.id]);
      // Only update if it's a valid number and different from the current context value
      if (!isNaN(debouncedValue) && debouncedValue !== instrument.currentValue) {
        updateSavingsInstrumentValue(instrument.id, debouncedValue);
      }
    });
  }, [debouncedTempCurrentValues, savingsInstruments, updateSavingsInstrumentValue]);

  const handleTotalInvestedChange = (instrumentId: string, value: string) => {
    const sanitizedValue = value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    setTempTotalInvestedValues(prev => ({
      ...prev,
      [instrumentId]: sanitizedValue,
    }));
  };

  const handleCurrentValueChange = (instrumentId: string, value: string) => {
    const sanitizedValue = value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    setTempCurrentValues(prev => ({
      ...prev,
      [instrumentId]: sanitizedValue,
    }));
  };

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

  const handleAddContribution = (newEntryData: Omit<SavingsEntry, 'id'>) => {
    addSavingsEntry(newEntryData);
    setIsAddContributionDialogOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className={`flex-1 flex flex-col ${isMobile ? "pt-16" : "ml-64"}`}>
        <header className="p-4 border-b border-border flex items-center justify-between">
          <h1 className="text-2xl font-bold">Savings</h1>
          <div className="flex items-center space-x-2">
            <Select onValueChange={setSelectedMonth} defaultValue={selectedMonth}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Select Month" />
              </SelectTrigger>
              <SelectContent>
                {months.map(month => (
                  <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={setSelectedYear} defaultValue={selectedYear}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map(year => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Dialog open={isAddContributionDialogOpen} onOpenChange={setIsAddContributionDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" /> Add Savings
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Savings Contribution</DialogTitle>
                </DialogHeader>
                <SavingsForm onSubmit={handleAddContribution} />
              </DialogContent>
            </Dialog>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          <div className="bg-card p-6 rounded-lg shadow-sm border border-border mb-8">
            <h2 className="text-xl font-semibold mb-2">Total Contributions for {months[parseInt(selectedMonth)].label} {selectedYear}</h2>
            <p className="text-3xl font-bold text-green-600">
              {selectedCurrency.symbol}{totalSavingsForPeriod.toFixed(2)}
            </p>
            <p className="text-muted-foreground text-sm mt-2">Total contributions made in the selected period</p>
          </div>

          {/* Section to display Savings Instruments with their current balances */}
          <div className="bg-card p-6 rounded-lg shadow-sm border border-border mb-8">
            <h2 className="text-xl font-semibold mb-4">Your Savings Instruments</h2>
            {savingsInstruments.length === 0 ? (
              <p className="text-muted-foreground text-center">
                No savings instruments defined. Go to the Admin panel to add some!
              </p>
            ) : (
              <div className="space-y-2">
                {/* Table Header */}
                <div className="grid grid-cols-3 gap-4 py-2 px-3 font-semibold text-muted-foreground border-b border-border">
                  <span>Instrument</span>
                  <span className="text-right">Amount Invested</span>
                  <span className="text-right">Current Value</span>
                </div>
                {/* Instrument List */}
                {savingsInstruments.map((instrument) => (
                  <div key={instrument.id} className="grid grid-cols-3 gap-4 items-center py-2 px-3 border border-border rounded-md bg-muted/50">
                    <span className="font-medium">{instrument.name}</span>
                    <div className="relative flex items-center justify-end">
                      <span className="absolute left-3 text-muted-foreground">{selectedCurrency.symbol}</span>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder=""
                        value={tempTotalInvestedValues[instrument.id] || ""}
                        onChange={(e) => handleTotalInvestedChange(instrument.id, e.target.value)}
                        className="pl-8 w-32 text-right"
                      />
                    </div>
                    <div className="relative flex items-center justify-end">
                      <span className="absolute left-3 text-muted-foreground">{selectedCurrency.symbol}</span>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder=""
                        value={tempCurrentValues[instrument.id] || ""}
                        onChange={(e) => handleCurrentValueChange(instrument.id, e.target.value)}
                        className="pl-8 w-32 text-right"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
            <h2 className="text-xl font-semibold mb-4">Recent Savings Contributions ({months[parseInt(selectedMonth)].label} {selectedYear})</h2>
            {filteredSavingsEntries.length === 0 ? (
              <p className="text-muted-foreground text-center">
                No savings contributions recorded for the selected period. Click "Add Savings" to get started!
              </p>
            ) : (
              <div className="space-y-4">
                {filteredSavingsEntries
                  .sort((a, b) => b.date.getTime() - a.date.getTime())
                  .map((entry) => (
                    <div key={entry.id} className="flex justify-between items-center py-2 border-b border-border last:border-b-0">
                      <div>
                        <p className="font-medium">{entry.instrument}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(entry.date, "PPP")} {entry.description && `- ${entry.description}`}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-green-600">
                          +{selectedCurrency.symbol}{entry.amount.toFixed(2)}
                        </span>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="icon" className="h-7 w-7">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently remove this savings contribution.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => removeSavingsEntry(entry.id)}>
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
        <MadeWithDyad />
      </div>
    </div>
  );
};

export default SavingsPage;