import { useState } from "react";
import { useCurrency } from "@/context/CurrencyContext";
import { useTaxDeductions } from "@/context/TaxDeductionContext"; // Fixed context import
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Receipt,
  Calendar,
  DollarSign,
  PieChart,
  Edit,
  Trash2,
  FileText,
  Info
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { TaxDeductionForm } from "@/components/TaxDeductionForm";
import { TaxDeduction } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { DocumentUpload } from "@/components/DocumentUpload";
import { BackButton } from "@/components/ui/back-button";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';

const TaxDeductions = () => {
  const { selectedCurrency } = useCurrency();
  const {
    taxDeductions,
    addTaxDeduction,
    updateTaxDeduction,
    removeTaxDeduction,
    getTaxDeductionsByYear,
    getTaxDeductionsByType,
    getTotalDeductionsForYear,
    uploadAttachment,
    removeAttachment
  } = useTaxDeductions();

  const [isDeductionDialogOpen, setIsDeductionDialogOpen] = useState(false);
  const [editingDeduction, setEditingDeduction] = useState<TaxDeduction | null>(null);
  const [selectedDeductionForDocs, setSelectedDeductionForDocs] = useState<TaxDeduction | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const handleAddDeduction = (deductionData: Omit<TaxDeduction, 'id' | 'createdAt' | 'attachments'>) => {
    addTaxDeduction(deductionData);
    setIsDeductionDialogOpen(false);
  };

  const handleUpdateDeduction = (deductionData: Partial<TaxDeduction>) => {
    if (editingDeduction) {
      updateTaxDeduction(editingDeduction.id, deductionData);
      setEditingDeduction(null);
    }
  };

  // Get deductions for the selected year
  const deductionsForYear = getTaxDeductionsByYear(selectedYear);
  const totalDeductionsAmount = getTotalDeductionsForYear(selectedYear);

  // Generate years for dropdown (current year and 5 previous years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - i);

  // Generate data for pie chart
  const generateDeductionsByTypeData = () => {
    const deductionTypes = Array.from(new Set(deductionsForYear.map(d => d.deductionType)));

    return deductionTypes.map(type => {
      const deductions = getTaxDeductionsByType(selectedYear, type);
      const total = deductions.reduce((sum: number, d: TaxDeduction) => sum + d.amount, 0);

      return {
        name: type,
        value: total
      };
    }).sort((a, b) => b.value - a.value);
  };

  const deductionsByTypeData = generateDeductionsByTypeData();

  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

  return (
    <>
      <header className="p-3 sm:p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <BackButton />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Tax Deductions</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">Track and manage your tax savings</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Select
            value={selectedYear.toString()}
            onValueChange={(value) => setSelectedYear(parseInt(value))}
          >
            <SelectTrigger className="flex-1 sm:w-[120px] text-xs sm:text-sm h-9 sm:h-10">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={isDeductionDialogOpen} onOpenChange={setIsDeductionDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-9 sm:h-10 flex-1 sm:flex-initial">
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add Tax Deduction</DialogTitle>
              </DialogHeader>
              <TaxDeductionForm onSubmit={handleAddDeduction} />
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="flex-1 p-3 sm:p-6 overflow-auto">
        <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-3 text-xs sm:text-sm">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="deductions">List</TabsTrigger>
            <TabsTrigger value="documents">Docs</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Deductions</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">
                    {selectedCurrency.symbol}{totalDeductionsAmount.toLocaleString()}
                  </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    For tax year {selectedYear}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Categories</CardTitle>
                  <Receipt className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">
                    {deductionsByTypeData.length}
                  </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    Deduction types
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">
                    {deductionsForYear.length}
                  </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    Entries for {selectedYear}
                  </p>
                </CardContent>
              </Card>
            </div>

            {taxDeductions.length === 0 && (
              <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
                <CardHeader>
                  <CardTitle className="flex items-center text-blue-800 dark:text-blue-200 text-base sm:text-lg">
                    <Info className="h-5 w-5 mr-2" />
                    Getting Started
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    <p className="mb-3">Track your tax deductions to maximize your savings:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2 text-xs uppercase tracking-wider">📋 Common Deductions</h4>
                        <ul className="list-disc list-inside space-y-1 text-xs">
                          <li>Medical expenses</li>
                          <li>Charitable contributions</li>
                          <li>Retirement plans</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2 text-xs uppercase tracking-wider">💡 Benefits</h4>
                        <ul className="list-disc list-inside space-y-1 text-xs">
                          <li>Reduce taxable income</li>
                          <li>Store receipts safely</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <Button onClick={() => setIsDeductionDialogOpen(true)} size="sm" className="w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" /> Add Your First Deduction
                  </Button>
                </CardContent>
              </Card>
            )}

            {deductionsByTypeData.length > 0 && (
              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center text-base sm:text-lg text-primary">
                    <PieChart className="h-5 w-5 mr-2" />
                    Deductions Breakdown ({selectedYear})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 sm:p-4">
                  <div className="h-[250px] sm:h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={deductionsByTypeData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {deductionsByTypeData.map((_entry, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => `${selectedCurrency.symbol}${value.toLocaleString()}`} />
                        <Legend wrapperStyle={{ fontSize: '10px' }} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="deductions" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Deductions - {selectedYear}</h2>
              <Button onClick={() => setIsDeductionDialogOpen(true)} size="sm">
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>

            {deductionsForYear.length === 0 ? (
              <div className="text-center py-10 bg-muted/20 rounded-lg border-2 border-dashed border-muted">
                <Receipt className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-sm font-medium">No Deductions Recorded</h3>
                <p className="text-xs text-muted-foreground mb-4">Start tracking your tax deductions today</p>
                <Button onClick={() => setIsDeductionDialogOpen(true)} size="sm">
                  Add First Deduction
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {[...deductionsForYear]
                  .sort((a: TaxDeduction, b: TaxDeduction) => b.amount - a.amount)
                  .map((deduction: TaxDeduction) => (
                    <Card key={deduction.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <Receipt className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm sm:text-base leading-none mb-1">{deduction.deductionType}</h4>
                              <p className="text-[10px] sm:text-xs text-muted-foreground">
                                {format(new Date(deduction.createdAt), 'dd MMM yyyy')}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingDeduction(deduction)}>
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedDeductionForDocs(deduction)}>
                              <FileText className="h-3.5 w-3.5" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Deduction</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => removeTaxDeduction(deduction.id)}>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                        <div className="flex justify-between items-end">
                          <div>
                            <span className="text-lg font-bold text-primary">
                              {selectedCurrency.symbol}{deduction.amount.toLocaleString()}
                            </span>
                          </div>
                          <Badge variant="secondary" className="text-[10px]">
                            Year {deduction.year}
                          </Badge>
                        </div>
                        {deduction.description && (
                          <p className="text-xs text-muted-foreground mt-2 line-clamp-1 italic">
                            {deduction.description}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            {taxDeductions.length === 0 ? (
              <div className="text-center py-10 bg-muted/20 rounded-lg">
                <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-sm font-medium">No Documents</h3>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
                  {taxDeductions
                    .filter((deduction: TaxDeduction) => deduction.year === selectedYear)
                    .map((deduction: TaxDeduction) => (
                      <Card
                        key={deduction.id}
                        className={`cursor-pointer transition-all border-2 ${selectedDeductionForDocs?.id === deduction.id ? 'border-primary bg-primary/5' : 'border-transparent hover:border-muted'}`}
                        onClick={() => setSelectedDeductionForDocs(deduction)}
                      >
                        <CardHeader className="p-3">
                          <CardTitle className="text-xs sm:text-sm truncate">{deduction.deductionType}</CardTitle>
                          <CardDescription className="text-[10px]">{selectedCurrency.symbol}{deduction.amount.toLocaleString()}</CardDescription>
                        </CardHeader>
                        <CardContent className="p-3 pt-0 flex justify-between items-center text-[10px] text-muted-foreground">
                          <span>{deduction.attachments?.length || 0} docs</span>
                          <FileText className="h-3 w-3" />
                        </CardContent>
                      </Card>
                    ))}
                </div>

                {selectedDeductionForDocs && (
                  <Card className="border-primary/20">
                    <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
                      <CardTitle className="text-sm font-semibold truncate pr-4">
                        Docs for {selectedDeductionForDocs.deductionType}
                      </CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedDeductionForDocs(null)} className="h-8 w-8 p-0">
                        ✕
                      </Button>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <DocumentUpload
                        documents={selectedDeductionForDocs.attachments || []}
                        onUpload={(document) => uploadAttachment(selectedDeductionForDocs.id, document)}
                        onRemove={(documentId) => removeAttachment(selectedDeductionForDocs.id, documentId)}
                      />
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Edit Deduction Dialog */}
        <Dialog open={!!editingDeduction} onOpenChange={(open: boolean) => !open && setEditingDeduction(null)}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Tax Deduction</DialogTitle>
            </DialogHeader>
            {editingDeduction && (
              <TaxDeductionForm
                initialData={editingDeduction}
                isEditing={true}
                onSubmit={handleUpdateDeduction}
              />
            )}
          </DialogContent>
        </Dialog>
      </main>
    </>
  );
};

export default TaxDeductions;