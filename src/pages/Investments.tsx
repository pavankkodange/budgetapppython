import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCurrency } from "@/context/CurrencyContext";
import { useInvestments } from "@/context/InvestmentContext";
import { MutualFundForm } from "@/components/MutualFundForm";
import { InvestmentAssetForm } from "@/components/InvestmentAssetForm";
import { InvestmentForm } from "@/components/InvestmentForm";
import { InvestmentGoalForm } from "@/components/InvestmentGoalForm";
import { InvestmentDocumentUpload } from "@/components/InvestmentDocumentUpload";
import { RealEstateForm } from "@/components/RealEstateForm";
import { InvestmentAsset } from "@/types";
import { format } from "date-fns";
import { BackButton } from "@/components/ui/back-button";
import {
  Plus,
  TrendingUp,
  BarChart,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  Info,
  Building,
  Home,
  Landmark,
  FileText,
  Edit,
  Trash2,
  Target,
} from "lucide-react";
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

import { useState } from "react";

const Investments = () => {
  const { selectedCurrency } = useCurrency();
  const {
    investmentAssets,
    removeInvestmentAsset,
    investmentGoals,
    removeInvestmentGoal,
    uploadDocument,
    removeDocument,
    calculatePortfolioValue,
    getInvestmentsByAsset,
    getAssetsByType
  } = useInvestments();

  const [isMutualFundDialogOpen, setIsMutualFundDialogOpen] = useState(false);
  const [isInvestmentDialogOpen, setIsInvestmentDialogOpen] = useState(false);
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const [isRealEstateDialogOpen, setIsRealEstateDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<InvestmentAsset | null>(null);
  const [selectedAssetForDocs, setSelectedAssetForDocs] = useState<InvestmentAsset | null>(null);

  const handleAddMutualFund = () => {
    setIsMutualFundDialogOpen(true);
  };

  const handleAddInvestment = () => {
    setIsInvestmentDialogOpen(true);
  };

  const handleAddGoal = () => {
    setIsGoalDialogOpen(true);
  };

  const handleAddRealEstate = () => {
    setIsRealEstateDialogOpen(true);
  };

  // Get statistics
  const mutualFunds = getAssetsByType('Mutual Fund');
  const stocks = getAssetsByType('Stocks');
  const realEstate = getAssetsByType('Real Estate');
  const { totalInvested, currentValue, returns, returnPercentage } = calculatePortfolioValue();

  return (
    <>
      <header className="p-3 sm:p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <BackButton />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Investments</h1>
            <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Manage your investment portfolio</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <Dialog open={isMutualFundDialogOpen} onOpenChange={setIsMutualFundDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAddMutualFund} size="sm" className="h-9 sm:h-10 shrink-0">
                <Plus className="h-4 w-4 mr-1 sm:mr-2" /> Add Mutual Fund
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Mutual Fund</DialogTitle>
              </DialogHeader>
              <MutualFundForm onSuccess={() => setIsMutualFundDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="flex-1 p-3 sm:p-6 overflow-auto">
        <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
          <TabsList className="flex w-full overflow-x-auto scrollbar-none bg-muted/50 p-1 h-auto min-h-10">
            <TabsTrigger value="overview" className="flex-1 min-w-[80px] text-xs sm:text-sm">Overview</TabsTrigger>
            <TabsTrigger value="mutual-funds" className="flex-1 min-w-[100px] text-xs sm:text-sm">Mutual Funds</TabsTrigger>
            <TabsTrigger value="stocks" className="flex-1 min-w-[80px] text-xs sm:text-sm">Stocks</TabsTrigger>
            <TabsTrigger value="real-estate" className="flex-1 min-w-[100px] text-xs sm:text-sm">Real Estate</TabsTrigger>
            <TabsTrigger value="goals" className="flex-1 min-w-[110px] text-xs sm:text-sm">Goals</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 sm:space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {selectedCurrency.symbol}{totalInvested.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total amount invested across all assets
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Current Value</CardTitle>
                  <BarChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {selectedCurrency.symbol}{currentValue.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Current market value of all investments
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Returns</CardTitle>
                  {returns >= 0 ? (
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-500" />
                  )}
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${returns >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {returns >= 0 ? '+' : ''}{selectedCurrency.symbol}{returns.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total profit/loss on investments
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Return Rate</CardTitle>
                  <Percent className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${returnPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {returnPercentage >= 0 ? '+' : ''}{returnPercentage.toFixed(2)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Overall return percentage
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Setup Guide for New Users */}
            {investmentAssets.length === 0 && (
              <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
                <CardHeader>
                  <CardTitle className="flex items-center text-blue-800 dark:text-blue-200">
                    <Info className="h-5 w-5 mr-2" />
                    Getting Started with Investments
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    <p className="mb-3">Track and manage your investment portfolio:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2">📈 Investment Types</h4>
                        <ul className="list-disc list-inside space-y-1 text-xs">
                          <li>Mutual Funds (SIP & Lumpsum)</li>
                          <li>Stocks & ETFs</li>
                          <li>Real Estate</li>
                          <li>Fixed Deposits</li>
                          <li>Gold & Other Assets</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">🎯 Key Features</h4>
                        <ul className="list-disc list-inside space-y-1 text-xs">
                          <li>Track performance & returns</li>
                          <li>Set investment goals</li>
                          <li>Monitor asset allocation</li>
                          <li>Store investment documents</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={handleAddMutualFund} size="sm">
                      <Plus className="h-4 w-4 mr-2" /> Add Mutual Fund
                    </Button>
                    <Button onClick={handleAddInvestment} size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-2" /> Add Investment
                    </Button>
                    <Button onClick={handleAddRealEstate} size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-2" /> Add Real Estate
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Asset Allocation */}
            {investmentAssets.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="h-5 w-5 mr-2" />
                    Asset Allocation
                  </CardTitle>
                  <CardDescription>
                    Distribution of your investments across different asset classes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">By Asset Type</h3>
                      <div className="space-y-2">
                        {['Mutual Fund', 'Stocks', 'Real Estate', 'Gold', 'Cryptocurrency', 'Savings Bank Deposit', 'Emergency Fund'].map(type => {
                          const assets = getAssetsByType(type as any);
                          const totalValue = assets.reduce((sum, asset) => {
                            const assetInvestments = getInvestmentsByAsset(asset.id);
                            const investedAmount = assetInvestments.reduce((sum, inv) => sum + inv.amount, 0);
                            return sum + investedAmount;
                          }, 0);

                          const percentage = totalInvested > 0 ? (totalValue / totalInvested) * 100 : 0;

                          if (assets.length === 0) return null;

                          return (
                            <div key={type} className="flex justify-between items-center">
                              <div className="flex items-center">
                                <div className="w-3 h-3 rounded-sm bg-primary mr-2"></div>
                                <span>{type}</span>
                              </div>
                              <div className="text-right">
                                <span className="font-medium">{selectedCurrency.symbol}{totalValue.toLocaleString()}</span>
                                <span className="text-xs text-muted-foreground ml-2">({percentage.toFixed(1)}%)</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">By Risk Level</h3>
                      <div className="space-y-2">
                        {['Low', 'Moderate', 'High', 'Very High'].map(risk => {
                          const assets = investmentAssets.filter(asset => asset.riskLevel === risk);
                          const totalValue = assets.reduce((sum, asset) => {
                            const assetInvestments = getInvestmentsByAsset(asset.id);
                            const investedAmount = assetInvestments.reduce((sum, inv) => sum + inv.amount, 0);
                            return sum + investedAmount;
                          }, 0);

                          const percentage = totalInvested > 0 ? (totalValue / totalInvested) * 100 : 0;

                          if (assets.length === 0) return null;

                          return (
                            <div key={risk} className="flex justify-between items-center">
                              <div className="flex items-center">
                                <div className={`w-3 h-3 rounded-sm mr-2 ${risk === 'Low' ? 'bg-green-500' :
                                  risk === 'Moderate' ? 'bg-blue-500' :
                                    risk === 'High' ? 'bg-orange-500' :
                                      'bg-red-500'
                                  }`}></div>
                                <span>{risk} Risk</span>
                              </div>
                              <div className="text-right">
                                <span className="font-medium">{selectedCurrency.symbol}{totalValue.toLocaleString()}</span>
                                <span className="text-xs text-muted-foreground ml-2">({percentage.toFixed(1)}%)</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="mutual-funds" className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Mutual Funds</h2>
              <Button onClick={handleAddMutualFund}>
                <Plus className="h-4 w-4 mr-2" /> Add Mutual Fund
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mutualFunds.map((fund) => (
                <Card key={fund.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{fund.name}</CardTitle>
                        <CardDescription>{fund.fundHouse}</CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingAsset(fund)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedAssetForDocs(fund)}
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
                              <AlertDialogTitle>Delete Mutual Fund</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this mutual fund? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => removeInvestmentAsset(fund.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Category:</span>
                      <span className="font-medium">{fund.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">NAV:</span>
                      <span className="font-medium">{selectedCurrency.symbol}{fund.currentPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Risk Level:</span>
                      <Badge className={
                        fund.riskLevel === 'Low' ? 'bg-green-100 text-green-800' :
                          fund.riskLevel === 'Moderate' ? 'bg-blue-100 text-blue-800' :
                            fund.riskLevel === 'High' ? 'bg-orange-100 text-orange-800' :
                              'bg-red-100 text-red-800'
                      }>
                        {fund.riskLevel}
                      </Badge>
                    </div>

                    {/* Investments in this fund */}
                    {getInvestmentsByAsset(fund.id).length > 0 ? (
                      <div className="pt-2 border-t">
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">Your Investments</span>
                          <span className="text-sm text-muted-foreground">
                            {getInvestmentsByAsset(fund.id).length} entries
                          </span>
                        </div>
                        <div className="space-y-2">
                          {getInvestmentsByAsset(fund.id).map(investment => (
                            <div key={investment.id} className="text-xs p-2 bg-muted rounded-md">
                              <div className="flex justify-between">
                                <span className="font-medium">{investment.investmentType}</span>
                                <span>{selectedCurrency.symbol}{investment.amount.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between text-muted-foreground mt-1">
                                <span>{format(investment.purchaseDate, 'dd MMM yyyy')}</span>
                                <span>{investment.units.toFixed(3)} units</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="pt-2 border-t">
                        <p className="text-sm text-muted-foreground">No investments yet</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-2"
                          onClick={handleAddInvestment}
                        >
                          <Plus className="h-3 w-3 mr-1" /> Add Investment
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {mutualFunds.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Mutual Funds Added</h3>
                  <p className="text-muted-foreground mb-4">
                    Start tracking your mutual fund investments
                  </p>
                  <Button onClick={handleAddMutualFund}>
                    <Plus className="h-4 w-4 mr-2" /> Add Mutual Fund
                  </Button>
                </div>
              )}
            </div>

            {/* Add Investment Dialog */}
            <Dialog open={isInvestmentDialogOpen} onOpenChange={setIsInvestmentDialogOpen}>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add Investment</DialogTitle>
                </DialogHeader>
                <InvestmentForm onSuccess={() => setIsInvestmentDialogOpen(false)} />
              </DialogContent>
            </Dialog>

            {/* Edit Asset Dialog */}
            <Dialog open={!!editingAsset} onOpenChange={() => setEditingAsset(null)}>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit {editingAsset?.type}</DialogTitle>
                </DialogHeader>
                {editingAsset?.type === 'Mutual Fund' && (
                  <MutualFundForm
                    initialData={editingAsset}
                    isEditing={true}
                    onSuccess={() => setEditingAsset(null)}
                  />
                )}
                {editingAsset?.type === 'Real Estate' && (
                  <RealEstateForm
                    initialData={editingAsset}
                    isEditing={true}
                    onSuccess={() => setEditingAsset(null)}
                  />
                )}
                {editingAsset && !['Mutual Fund', 'Real Estate'].includes(editingAsset.type) && (
                  <InvestmentAssetForm
                    initialData={editingAsset}
                    isEditing={true}
                    onSuccess={() => setEditingAsset(null)}
                  />
                )}
              </DialogContent>
            </Dialog>

            {/* Asset Documents Dialog */}
            {selectedAssetForDocs && (
              <Dialog open={!!selectedAssetForDocs} onOpenChange={() => setSelectedAssetForDocs(null)}>
                <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      Documents for {selectedAssetForDocs.name}
                    </DialogTitle>
                  </DialogHeader>
                  <InvestmentDocumentUpload
                    documents={selectedAssetForDocs.documents || []}
                    onUpload={(document) => uploadDocument(selectedAssetForDocs.id, document)}
                    onRemove={(documentId) => removeDocument(selectedAssetForDocs.id, documentId)}
                  />
                </DialogContent>
              </Dialog>
            )}
          </TabsContent>

          <TabsContent value="stocks" className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Stocks & ETFs</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" /> Add Stock
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add Stock or ETF</DialogTitle>
                  </DialogHeader>
                  <InvestmentAssetForm onSuccess={() => { }} />
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stocks.map((stock) => (
                <Card key={stock.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{stock.name}</CardTitle>
                        <CardDescription>{stock.symbol} • {stock.exchange}</CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingAsset(stock)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedAssetForDocs(stock)}
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
                              <AlertDialogTitle>Delete Stock</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this stock? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => removeInvestmentAsset(stock.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Current Price:</span>
                      <span className="font-medium">{selectedCurrency.symbol}{stock.currentPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Category:</span>
                      <span className="font-medium">{stock.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Risk Level:</span>
                      <Badge className={
                        stock.riskLevel === 'Low' ? 'bg-green-100 text-green-800' :
                          stock.riskLevel === 'Moderate' ? 'bg-blue-100 text-blue-800' :
                            stock.riskLevel === 'High' ? 'bg-orange-100 text-orange-800' :
                              'bg-red-100 text-red-800'
                      }>
                        {stock.riskLevel}
                      </Badge>
                    </div>

                    {/* Investments in this stock */}
                    {getInvestmentsByAsset(stock.id).length > 0 ? (
                      <div className="pt-2 border-t">
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">Your Investments</span>
                          <span className="text-sm text-muted-foreground">
                            {getInvestmentsByAsset(stock.id).length} entries
                          </span>
                        </div>
                        <div className="space-y-2">
                          {getInvestmentsByAsset(stock.id).map(investment => (
                            <div key={investment.id} className="text-xs p-2 bg-muted rounded-md">
                              <div className="flex justify-between">
                                <span className="font-medium">{investment.investmentType}</span>
                                <span>{selectedCurrency.symbol}{investment.amount.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between text-muted-foreground mt-1">
                                <span>{format(investment.purchaseDate, 'dd MMM yyyy')}</span>
                                <span>{investment.units.toFixed(3)} shares</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="pt-2 border-t">
                        <p className="text-sm text-muted-foreground">No investments yet</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-2"
                          onClick={handleAddInvestment}
                        >
                          <Plus className="h-3 w-3 mr-1" /> Add Investment
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {stocks.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <Landmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Stocks Added</h3>
                  <p className="text-muted-foreground mb-4">
                    Start tracking your stock and ETF investments
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" /> Add Stock
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="real-estate" className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Real Estate</h2>
              <Dialog open={isRealEstateDialogOpen} onOpenChange={setIsRealEstateDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={handleAddRealEstate}>
                    <Plus className="h-4 w-4 mr-2" /> Add Property
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add Real Estate Property</DialogTitle>
                  </DialogHeader>
                  <RealEstateForm onSuccess={() => setIsRealEstateDialogOpen(false)} />
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {realEstate.map((property) => (
                <Card key={property.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{property.name}</CardTitle>
                        <CardDescription>{property.propertyType} • {property.location}</CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingAsset(property)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedAssetForDocs(property)}
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
                              <AlertDialogTitle>Delete Property</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this property? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => removeInvestmentAsset(property.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Current Value:</span>
                      <span className="font-medium">{selectedCurrency.symbol}{property.currentPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Area:</span>
                      <span className="font-medium">{property.area} {property.areaUnit}</span>
                    </div>
                    {property.rentalIncome !== undefined && property.rentalIncome > 0 && (
                      <div className="flex justify-between">
                        <span>{selectedCurrency.symbol}{(property.rentalIncome ?? 0).toLocaleString()} / month</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Purchased:</span>
                      <span className="font-medium">{property.purchaseYear}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {realEstate.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <Home className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Properties Added</h3>
                  <p className="text-muted-foreground mb-4">
                    Start tracking your real estate investments
                  </p>
                  <Button onClick={handleAddRealEstate}>
                    <Plus className="h-4 w-4 mr-2" /> Add Property
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="goals" className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Investment Goals</h2>
              <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={handleAddGoal}>
                    <Plus className="h-4 w-4 mr-2" /> Add Goal
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add Investment Goal</DialogTitle>
                  </DialogHeader>
                  <InvestmentGoalForm onSuccess={() => setIsGoalDialogOpen(false)} />
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {investmentGoals.map((goal) => (
                <Card key={goal.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{goal.name}</CardTitle>
                        <CardDescription>
                          Target: {selectedCurrency.symbol}{goal.targetAmount.toLocaleString()} by {format(goal.targetDate, 'MMM yyyy')}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => { }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Goal</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this investment goal? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => removeInvestmentGoal(goal.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Current Amount:</span>
                      <span className="font-medium">{selectedCurrency.symbol}{goal.currentAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Monthly Contribution:</span>
                      <span className="font-medium">{selectedCurrency.symbol}{(goal.monthlyContribution ?? 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Progress:</span>
                      <span className="font-medium">{((goal.currentAmount / goal.targetAmount) * 100).toFixed(1)}%</span>
                    </div>

                    <div className="w-full bg-muted rounded-full h-2.5 mt-2">
                      <div
                        className="bg-primary h-2.5 rounded-full"
                        style={{ width: `${Math.min(100, (goal.currentAmount / goal.targetAmount) * 100)}%` }}
                      ></div>
                    </div>

                    {goal.description && (
                      <p className="text-sm text-muted-foreground mt-2">{goal.description}</p>
                    )}
                  </CardContent>
                </Card>
              ))}

              {investmentGoals.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Investment Goals</h3>
                  <p className="text-muted-foreground mb-4">
                    Set financial goals to track your investment progress
                  </p>
                  <Button onClick={handleAddGoal}>
                    <Plus className="h-4 w-4 mr-2" /> Add Investment Goal
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
};

export default Investments;
