import { useState } from "react";
import { useCategories } from "@/context/CategoryContext";
import { useIncomeSources } from "@/context/IncomeSourceContext";
import { useSavingsInstruments } from "@/context/SavingsInstrumentContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";
import { BackButton } from "@/components/ui/back-button";
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
import { CurrencySelector } from "@/components/CurrencySelector";
import { DeductionCategory } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GoogleDriveConnect } from "@/components/GoogleDriveConnect";

const Admin = () => {
  const { categories, addCategory, removeCategory } = useCategories();
  const { incomeSources, addIncomeSource, removeIncomeSource } = useIncomeSources();
  const { savingsInstruments, addSavingsInstrument, removeSavingsInstrument } = useSavingsInstruments();

  const [newCategoryName, setNewCategoryName] = useState("");
  const [newIncomeSourceName, setNewIncomeSourceName] = useState("");
  const [newDeductionName, setNewDeductionName] = useState("");
  const [newDeductionCategory, setNewDeductionCategory] = useState<DeductionCategory>('tax_or_actual_deduction');
  const [newInstrumentName, setNewInstrumentName] = useState("");

  const handleAddCategory = () => {
    addCategory(newCategoryName);
    setNewCategoryName("");
  };

  const handleAddIncomeSource = () => {
    addIncomeSource(newIncomeSourceName, 'income');
    setNewIncomeSourceName("");
  };

  const handleAddDeduction = () => {
    addIncomeSource(newDeductionName, 'deduction', newDeductionCategory);
    setNewDeductionName("");
  };

  const handleAddSavingsInstrument = () => {
    addSavingsInstrument(newInstrumentName);
    setNewInstrumentName("");
  };

  const employerContributions = incomeSources.filter(s => s.type === 'deduction' && s.deductionCategory === 'employer_contribution');
  const actualDeductionsAndTaxes = incomeSources.filter(s => s.type === 'deduction' && s.deductionCategory === 'tax_or_actual_deduction');

  return (
    <>
      <header className="p-3 sm:p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BackButton />
          <h1 className="text-xl sm:text-2xl font-bold">Admin Panel</h1>
        </div>
        <CurrencySelector />
      </header>
      <main className="flex-1 p-3 sm:p-6 overflow-auto">
        {/* Google Drive Settings */}
        <div className="mb-6 sm:mb-8">
          <GoogleDriveConnect />
        </div>

        <div className="bg-card p-4 sm:p-6 rounded-lg shadow-sm border border-border mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-primary">Manage Expenses</h2>

          <div className="flex flex-col sm:flex-row gap-2 mb-6">
            <Input
              placeholder="New category name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddCategory();
                }
              }}
              className="flex-1"
            />
            <Button onClick={handleAddCategory} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" /> Add
            </Button>
          </div>

          <div className="space-y-2">
            {categories.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No categories defined. Add some above!</p>
            ) : (
              categories.map((category) => (
                <div
                  key={category}
                  className="flex justify-between items-center py-2 px-3 border border-border rounded-md bg-muted/50"
                >
                  <span className="font-medium text-sm sm:text-base">{category}</span>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="icon" className="h-8 w-8">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently remove the
                          <span className="font-bold text-foreground"> "{category}" </span>
                          category.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => removeCategory(category)}>
                          Continue
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-card p-4 sm:p-6 rounded-lg shadow-sm border border-border mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-primary">Manage Income Sources</h2>

          <div className="flex flex-col sm:flex-row gap-2 mb-6">
            <Input
              placeholder="New income source name"
              value={newIncomeSourceName}
              onChange={(e) => setNewIncomeSourceName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddIncomeSource();
                }
              }}
              className="flex-1"
            />
            <Button onClick={handleAddIncomeSource} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" /> Add Income
            </Button>
          </div>

          <div className="space-y-2">
            {incomeSources.filter(s => s.type === 'income').length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No income sources defined. Add some above!</p>
            ) : (
              incomeSources.filter(s => s.type === 'income').map((source) => (
                <div
                  key={source.id}
                  className="flex justify-between items-center py-2 px-3 border border-border rounded-md bg-muted/50"
                >
                  <span className="font-medium text-sm sm:text-base">{source.name}</span>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="icon" className="h-8 w-8">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently remove the
                          <span className="font-bold text-foreground"> "{source.name}" </span>
                          income source.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => removeIncomeSource(source.id)}>
                          Continue
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-card p-4 sm:p-6 rounded-lg shadow-sm border border-border mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-primary">Manage Deductions</h2>

          <div className="flex flex-col gap-3 mb-6">
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                placeholder="New deduction name"
                value={newDeductionName}
                onChange={(e) => setNewDeductionName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddDeduction();
                  }
                }}
                className="flex-1"
              />
              <Select onValueChange={(value: DeductionCategory) => setNewDeductionCategory(value)} defaultValue={newDeductionCategory}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tax_or_actual_deduction">Actual Deduction / Tax</SelectItem>
                  <SelectItem value="employer_contribution">Employer Contribution</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAddDeduction} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" /> Add Deduction
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-base sm:text-lg font-semibold mb-2">Employer Contributions</h3>
              {employerContributions.length === 0 ? (
                <p className="text-muted-foreground text-xs sm:text-sm italic">No employer contributions defined.</p>
              ) : (
                employerContributions.map((source) => (
                  <div
                    key={source.id}
                    className="flex justify-between items-center py-2 px-3 border border-border rounded-md bg-muted/50"
                  >
                    <span className="font-medium text-sm sm:text-base">{source.name}</span>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon" className="h-8 w-8">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently remove the
                            <span className="font-bold text-foreground"> "{source.name}" </span>
                            employer contribution.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => removeIncomeSource(source.id)}>
                            Continue
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))
              )}
            </div>

            <div className="space-y-3">
              <h3 className="text-base sm:text-lg font-semibold mb-2">Actual Deductions & Taxes</h3>
              {actualDeductionsAndTaxes.length === 0 ? (
                <p className="text-muted-foreground text-xs sm:text-sm italic">No actual deductions or taxes defined.</p>
              ) : (
                actualDeductionsAndTaxes.map((source) => (
                  <div
                    key={source.id}
                    className="flex justify-between items-center py-2 px-3 border border-border rounded-md bg-muted/50"
                  >
                    <span className="font-medium text-sm sm:text-base">{source.name}</span>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon" className="h-8 w-8">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently remove the
                            <span className="font-bold text-foreground"> "{source.name}" </span>
                            deduction.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => removeIncomeSource(source.id)}>
                            Continue
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="bg-card p-4 sm:p-6 rounded-lg shadow-sm border border-border mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-primary">Manage Savings Instruments</h2>

          <div className="flex flex-col sm:flex-row gap-2 mb-6">
            <Input
              placeholder="New instrument name"
              value={newInstrumentName}
              onChange={(e) => setNewInstrumentName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddSavingsInstrument();
                }
              }}
              className="flex-1"
            />
            <Button onClick={handleAddSavingsInstrument} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" /> Add Instrument
            </Button>
          </div>

          <div className="space-y-2">
            {savingsInstruments.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No savings instruments defined. Add some above!</p>
            ) : (
              savingsInstruments.map((instrument) => (
                <div
                  key={instrument.id}
                  className="flex justify-between items-center py-2 px-3 border border-border rounded-md bg-muted/50"
                >
                  <span className="font-medium text-sm sm:text-base">{instrument.name}</span>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="icon" className="h-8 w-8">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently remove the
                          <span className="font-bold text-foreground"> "{instrument.name}" </span>
                          savings instrument.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => removeSavingsInstrument(instrument.id)}>
                          Continue
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default Admin;