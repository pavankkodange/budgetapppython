import React, { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCurrency } from "@/context/CurrencyContext";
import { TaxDeductionForm } from "@/components/TaxDeductionForm";
import { format } from "date-fns";
import { 
  Plus, 
  Receipt, 
  FileText, 
  Edit, 
  Trash2, 
  Download,
  Upload,
  Calculator,
  PieChart,
  Calendar,
  DollarSign,
  Info
} from "lucide-react";
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
import { useTaxDeductions } from "@/context/TaxDeductionContext";
import { DocumentUpload } from "@/components/DocumentUpload";
import { TaxDeduction, DocumentAttachment } from "@/types";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const TaxDeductions = () => {
  const isMobile = useIsMobile();
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
      const total = deductions.reduce((sum, d) => sum + d.amount, 0);
      
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
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className={`flex-1 flex flex-col ${isMobile ? "pt-14" : "ml-64"}`}>
        <header className="p-3 sm:p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BackButton className="h-8 w-8" />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Tax Deductions</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Track and manage your tax deductions</p>
            </div>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Select 
              value={selectedYear.toString()} 
              onValueChange={(value) => setSelectedYear(parseInt(value))}
            >
              <SelectTrigger className="w-[80px] sm:w-[120px] text-xs sm:text-sm h-8 sm:h-10">
                <SelectValue placeholder="Select Year" />
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
                <Button size={isMobile ? "sm" : "default"}>
                  <Plus className="h-4 w-4 mr-1 sm:mr-2" /> {isMobile ? "Add" : "Add Deduction"}
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
              <TabsTrigger value="deductions">Deductions</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 sm:space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Deductions</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {selectedCurrency.symbol}{totalDeductionsAmount.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      For tax year {selectedYear}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Deduction Categories</CardTitle>
                    <Receipt className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {deductionsByTypeData.length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Different types of deductions
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {deductionsForYear.length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Deduction entries for {selectedYear}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Setup Guide for New Users */}
              {taxDeductions.length === 0 && (
                <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800 text-sm sm:text-base">
                  <CardHeader>
                    <CardTitle className="flex items-center text-blue-800 dark:text-blue-200">
                      <Info className="h-5 w-5 mr-2" />
                      Getting Started with Tax Deductions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                      <p className="mb-3">Track your tax deductions to maximize your tax savings:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <h4 className="font-semibold mb-2">📋 Common Deductions</h4>
                          <ul className="list-disc list-inside space-y-1 text-xs">
                            <li>Medical expenses</li>
                            <li>Charitable contributions</li>
                            <li>Mortgage interest</li>
                            <li>Education expenses</li>
                            <li>Retirement contributions</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">💡 Benefits</h4>
                          <ul className="list-disc list-inside space-y-1 text-xs">
                            <li>Reduce your taxable income</li>
                            <li>Store receipts and documentation</li>
                            <li>Prepare for tax filing</li>
                            <li>Track year-over-year deductions</li>
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

              {/* Deductions Breakdown Chart */}
              {deductionsByTypeData.length > 0 && (
                <Card className="overflow-hidden">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <PieChart className="h-5 w-5 mr-2" />
                      Deductions Breakdown for {selectedYear}
                    </CardTitle>
                    <CardDescription>
                      Distribution of tax deductions by category
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0 sm:p-4">
                    <div className="h-[300px] sm:h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={deductionsByTypeData}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={150}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {deductionsByTypeData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => `${selectedCurrency.symbol}${value.toLocaleString()}`} />
                          <Legend />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="deductions" className="space-y-6">
              <div className="flex justify-between items-center mb-3 sm:mb-4">
                <h2 className="text-lg sm:text-xl font-semibold">Tax Deductions for {selectedYear}</h2>
                <Button onClick={() => setIsDeductionDialogOpen(true)} size={isMobile ? "sm" : "default"}>
                  <Plus className="h-4 w-4 mr-1 sm:mr-2" /> {isMobile ? "Add" : "Add Deduction"}
                </Button>
              </div>
              
              {deductionsForYear.length === 0 ? (
                <div className="text-center py-8 sm:py-12 bg-muted/30 rounded-lg">
                  <Receipt className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-medium mb-1 sm:mb-2">No Deductions Recorded</h3>
                  <p className="text-muted-foreground text-xs sm:text-sm mb-3 sm:mb-4">
                    Start tracking your tax deductions to maximize your tax savings
                  </p>
                  <Button onClick={() => setIsDeductionDialogOpen(true)} size={isMobile ? "sm" : "default"}>
                    <Plus className="h-4 w-4 mr-2" /> Add Your First Deduction
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {deductionsForYear
                    .sort((a, b) => b.amount - a.amount)
                    .map((deduction) => (
                      <Card key={deduction.id}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center space-x-2">
                              <Receipt className="h-5 w-5 text-primary" />
                              <div>
                                <CardTitle className="text-lg">{deduction.deductionType}</CardTitle>
                                <CardDescription className="text-xs sm:text-sm">
                                  Added on {format(deduction.createdAt, 'dd MMM yyyy')}
                                </CardDescription>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setEditingDeduction(deduction)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSelectedDeductionForDocs(deduction)}
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Deduction</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this tax deduction? This action cannot be undone.
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
                        </CardHeader>
                        <CardContent>
                          <div className="flex justify-between items-center mb-1 sm:mb-2">
                            <span className="text-base sm:text-lg font-bold">
                              {selectedCurrency.symbol}{deduction.amount.toLocaleString()}
                            </span>
                            <Badge className="text-xs">
                              Tax Year {deduction.year}
                            </Badge>
                          </div>
                          {deduction.description && (
                            <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">
                              {deduction.description}
                            </p>
                          )}
                          {deduction.attachments && deduction.attachments.length > 0 && (
                            <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t">
                              <div className="flex items-center justify-between">
                                <span className="text-xs sm:text-sm font-medium">Attached Documents</span>
                                <span className="text-[10px] sm:text-xs text-muted-foreground">
                                  {deduction.attachments.length} document{deduction.attachments.length !== 1 ? 's' : ''}
                                </span>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="documents" className="space-y-6">
              {taxDeductions.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <FileText className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-medium mb-1 sm:mb-2">No Tax Deductions</h3>
                  <p className="text-muted-foreground text-xs sm:text-sm mb-3 sm:mb-4">
                    Add tax deductions first to upload supporting documents
                  </p>
                  <Button onClick={() => setIsDeductionDialogOpen(true)} size={isMobile ? "sm" : "default"}>
                    <Plus className="h-4 w-4 mr-2" /> Add Your First Deduction
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {taxDeductions
                      .filter(deduction => deduction.year === selectedYear)
                      .map((deduction) => (
                        <Card key={deduction.id} className="cursor-pointer hover:shadow-md transition-shadow">
                          <CardHeader>
                            <div className="flex items-center space-x-2">
                              <Receipt className="h-5 w-5 text-primary" />
                              <div>
                                <CardTitle className="text-lg">{deduction.deductionType}</CardTitle>
                                <CardDescription className="text-xs sm:text-sm">{selectedCurrency.symbol}{deduction.amount.toLocaleString()}</CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="flex justify-between items-center">
                              <span className="text-xs sm:text-sm text-muted-foreground">
                                {deduction.attachments?.length || 0} documents
                              </span>
                              <Button
                                variant="outline"
                                size="sm" 
                                onClick={() => setSelectedDeductionForDocs(deduction)}
                              >
                                {isMobile ? "Docs" : "Manage Documents"}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>

                  {selectedDeductionForDocs && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <FileText className="h-5 w-5 mr-2" />
                          Documents for {selectedDeductionForDocs.deductionType} ({selectedCurrency.symbol}{selectedDeductionForDocs.amount.toLocaleString()})
                        </CardTitle>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedDeductionForDocs(null)} 
                          className="w-fit text-xs sm:text-sm"
                        >
                          Close
                        </Button>
                      </CardHeader>
                      <CardContent>
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
          <Dialog open={!!editingDeduction} onOpenChange={() => setEditingDeduction(null)}>
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
      </div>
    </div>
  );
};

export default TaxDeductions;