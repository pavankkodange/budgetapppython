import React, { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useCurrency } from "@/context/CurrencyContext";
import { useInsurance } from "@/context/InsuranceContext";
import { InsurancePolicyForm } from "@/components/InsurancePolicyForm";
import { DocumentUpload } from "@/components/DocumentUpload";
import { format, differenceInDays, isBefore } from "date-fns";
import { BackButton } from "@/components/ui/back-button";
import { 
  Plus, 
  Shield, 
  Heart, 
  Car, 
  Home, 
  Plane, 
  AlertTriangle,
  Calendar,
  DollarSign,
  FileText,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  Users,
  TrendingUp,
  Bell,
  Info
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

const Insurance = () => {
  const isMobile = useIsMobile();
  const { selectedCurrency } = useCurrency();
  const { 
    policies, 
    addPolicy, 
    updatePolicy, 
    removePolicy,
    uploadDocument,
    removeDocument,
    getPoliciesByType,
    getExpiringPolicies,
    getUpcomingPremiums,
    getTotalPremiumAmount
  } = useInsurance();

  const [isPolicyDialogOpen, setIsPolicyDialogOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<any>(null);
  const [selectedPolicyForDocs, setSelectedPolicyForDocs] = useState<any>(null);

  const handleAddPolicy = (policyData: any) => {
    addPolicy(policyData);
    setIsPolicyDialogOpen(false);
  };

  const handleUpdatePolicy = (policyData: any) => {
    if (editingPolicy) {
      updatePolicy(editingPolicy.id, policyData);
      setEditingPolicy(null);
    }
  };

  const getPolicyIcon = (type: string) => {
    switch (type) {
      case 'Term Life': return <Heart className="h-5 w-5" />;
      case 'Health': return <Shield className="h-5 w-5" />;
      case 'Motor': return <Car className="h-5 w-5" />;
      case 'Home': return <Home className="h-5 w-5" />;
      case 'Travel': return <Plane className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const getPolicyStatusColor = (policy: any) => {
    const daysUntilExpiry = differenceInDays(policy.policyEndDate, new Date());
    const daysUntilPremium = differenceInDays(policy.nextPremiumDueDate, new Date());
    
    if (daysUntilExpiry <= 30) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    if (daysUntilPremium <= 7) return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  };

  const getStatusText = (policy: any) => {
    const daysUntilExpiry = differenceInDays(policy.policyEndDate, new Date());
    const daysUntilPremium = differenceInDays(policy.nextPremiumDueDate, new Date());
    
    if (daysUntilExpiry <= 0) return 'Expired';
    if (daysUntilExpiry <= 30) return `Expires in ${daysUntilExpiry} days`;
    if (daysUntilPremium <= 0) return 'Premium Overdue';
    if (daysUntilPremium <= 7) return `Premium due in ${daysUntilPremium} days`;
    return 'Active';
  };

  // Get statistics
  const termLifePolicies = getPoliciesByType('Term Life');
  const healthPolicies = getPoliciesByType('Health');
  const expiringPolicies = getExpiringPolicies(90); // Within 90 days
  const upcomingPremiums = getUpcomingPremiums(30); // Within 30 days
  const totalYearlyPremium = getTotalPremiumAmount();

  // Calculate total coverage
  const totalCoverage = policies
    .filter(p => p.isActive)
    .reduce((sum, policy) => sum + policy.sumInsured, 0);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className={`flex-1 flex flex-col ${isMobile ? "pt-16" : "ml-64"}`}>
        <header className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BackButton />
            <div>
              <h1 className="text-2xl font-bold">Insurance</h1>
              <p className="text-sm text-muted-foreground">Manage your insurance policies and coverage</p>
            </div>
          </div>
          <Dialog open={isPolicyDialogOpen} onOpenChange={setIsPolicyDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" /> Add Policy
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Insurance Policy</DialogTitle>
              </DialogHeader>
              <InsurancePolicyForm onSubmit={handleAddPolicy} />
            </DialogContent>
          </Dialog>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="term-life">Term Life</TabsTrigger>
              <TabsTrigger value="health">Health</TabsTrigger>
              <TabsTrigger value="other">Other Policies</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Coverage</CardTitle>
                    <Shield className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {selectedCurrency.symbol}{totalCoverage.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Across {policies.filter(p => p.isActive).length} active policies
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Annual Premium</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {selectedCurrency.symbol}{totalYearlyPremium.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Total yearly premium cost
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">
                      {expiringPolicies.length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Policies expiring in 90 days
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Premium Due</CardTitle>
                    <Calendar className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {upcomingPremiums.length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Premiums due in 30 days
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Setup Guide for New Users */}
              {policies.length === 0 && (
                <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
                  <CardHeader>
                    <CardTitle className="flex items-center text-blue-800 dark:text-blue-200">
                      <Info className="h-5 w-5 mr-2" />
                      Getting Started with Insurance Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                      <p className="mb-3">Track all your insurance policies in one place:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold mb-2">🛡️ Essential Coverage</h4>
                          <ul className="list-disc list-inside space-y-1 text-xs">
                            <li>Term Life Insurance</li>
                            <li>Health Insurance</li>
                            <li>Motor Insurance</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">📋 Features</h4>
                          <ul className="list-disc list-inside space-y-1 text-xs">
                            <li>Premium reminders</li>
                            <li>Document storage</li>
                            <li>Coverage tracking</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <Button onClick={() => setIsPolicyDialogOpen(true)} size="sm">
                      <Plus className="h-4 w-4 mr-2" /> Add Your First Policy
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Alerts Section */}
              {(expiringPolicies.length > 0 || upcomingPremiums.length > 0) && (
                <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800">
                  <CardHeader>
                    <CardTitle className="flex items-center text-orange-800 dark:text-orange-200">
                      <Bell className="h-5 w-5 mr-2" />
                      Action Required
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {expiringPolicies.length > 0 && (
                      <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                        <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                          Policies Expiring Soon ({expiringPolicies.length})
                        </h4>
                        <div className="space-y-1">
                          {expiringPolicies.slice(0, 3).map((policy) => (
                            <div key={policy.id} className="text-sm text-red-700 dark:text-red-300">
                              {policy.policyType} - {policy.insurerName} expires on {format(policy.policyEndDate, 'dd MMM yyyy')}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {upcomingPremiums.length > 0 && (
                      <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                          Upcoming Premium Payments ({upcomingPremiums.length})
                        </h4>
                        <div className="space-y-1">
                          {upcomingPremiums.slice(0, 3).map((policy) => (
                            <div key={policy.id} className="text-sm text-blue-700 dark:text-blue-300">
                              {policy.policyType} - {selectedCurrency.symbol}{policy.premiumAmount} due on {format(policy.nextPremiumDueDate, 'dd MMM yyyy')}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* All Policies Overview */}
              {policies.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      All Policies ({policies.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {policies.map((policy) => (
                        <div key={policy.id} className="flex justify-between items-center p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="p-2 bg-muted rounded-lg">
                              {getPolicyIcon(policy.policyType)}
                            </div>
                            <div>
                              <h4 className="font-medium">{policy.policyType}</h4>
                              <p className="text-sm text-muted-foreground">{policy.insurerName}</p>
                              <p className="text-xs text-muted-foreground">Policy: {policy.policyNumber}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={getPolicyStatusColor(policy)}>
                              {getStatusText(policy)}
                            </Badge>
                            <p className="text-sm font-medium mt-1">
                              {selectedCurrency.symbol}{policy.sumInsured.toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Premium: {selectedCurrency.symbol}{policy.premiumAmount} {policy.premiumFrequency.toLowerCase()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="term-life" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {termLifePolicies.map((policy) => (
                  <Card key={policy.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-2">
                          <Heart className="h-5 w-5 text-red-500" />
                          <div>
                            <CardTitle className="text-lg">{policy.insurerName}</CardTitle>
                            <CardDescription>{policy.policyNumber}</CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingPolicy(policy)}
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
                                <AlertDialogTitle>Delete Policy</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this policy? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => removePolicy(policy.id)}>
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
                        <span className="text-sm text-muted-foreground">Coverage:</span>
                        <span className="font-medium">{selectedCurrency.symbol}{policy.sumInsured.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Premium:</span>
                        <span className="font-medium">{selectedCurrency.symbol}{policy.premiumAmount} {policy.premiumFrequency.toLowerCase()}</span>
                      </div>
                      {policy.beneficiaryName && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Beneficiary:</span>
                          <span className="font-medium">{policy.beneficiaryName}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Expires:</span>
                        <span className="font-medium">{format(policy.policyEndDate, 'dd MMM yyyy')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Next Premium:</span>
                        <span className="font-medium">{format(policy.nextPremiumDueDate, 'dd MMM yyyy')}</span>
                      </div>
                      <Badge className={getPolicyStatusColor(policy)}>
                        {getStatusText(policy)}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
                
                {termLifePolicies.length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Term Life Policies</h3>
                    <p className="text-muted-foreground mb-4">
                      Protect your family's financial future with term life insurance
                    </p>
                    <Button onClick={() => setIsPolicyDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" /> Add Term Life Policy
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="health" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {healthPolicies.map((policy) => (
                  <Card key={policy.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-2">
                          <Shield className="h-5 w-5 text-green-500" />
                          <div>
                            <CardTitle className="text-lg">{policy.insurerName}</CardTitle>
                            <CardDescription>{policy.policyNumber}</CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingPolicy(policy)}
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
                                <AlertDialogTitle>Delete Policy</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this policy? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => removePolicy(policy.id)}>
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
                        <span className="text-sm text-muted-foreground">Coverage:</span>
                        <span className="font-medium">{selectedCurrency.symbol}{policy.sumInsured.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Premium:</span>
                        <span className="font-medium">{selectedCurrency.symbol}{policy.premiumAmount} {policy.premiumFrequency.toLowerCase()}</span>
                      </div>
                      {policy.familyMembers && policy.familyMembers.length > 0 && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Members:</span>
                          <span className="font-medium">{policy.familyMembers.length} covered</span>
                        </div>
                      )}
                      {policy.roomRentLimit && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Room Rent:</span>
                          <span className="font-medium">{selectedCurrency.symbol}{policy.roomRentLimit}/day</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Expires:</span>
                        <span className="font-medium">{format(policy.policyEndDate, 'dd MMM yyyy')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Next Premium:</span>
                        <span className="font-medium">{format(policy.nextPremiumDueDate, 'dd MMM yyyy')}</span>
                      </div>
                      <Badge className={getPolicyStatusColor(policy)}>
                        {getStatusText(policy)}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
                
                {healthPolicies.length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Health Policies</h3>
                    <p className="text-muted-foreground mb-4">
                      Secure your health with comprehensive medical insurance
                    </p>
                    <Button onClick={() => setIsPolicyDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" /> Add Health Policy
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="other" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {policies.filter(p => !['Term Life', 'Health'].includes(p.policyType)).map((policy) => (
                  <Card key={policy.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-2">
                          {getPolicyIcon(policy.policyType)}
                          <div>
                            <CardTitle className="text-lg">{policy.policyType}</CardTitle>
                            <CardDescription>{policy.insurerName}</CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingPolicy(policy)}
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
                                <AlertDialogTitle>Delete Policy</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this policy? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => removePolicy(policy.id)}>
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
                        <span className="text-sm text-muted-foreground">Policy Number:</span>
                        <span className="font-medium">{policy.policyNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Coverage:</span>
                        <span className="font-medium">{selectedCurrency.symbol}{policy.sumInsured.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Premium:</span>
                        <span className="font-medium">{selectedCurrency.symbol}{policy.premiumAmount} {policy.premiumFrequency.toLowerCase()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Expires:</span>
                        <span className="font-medium">{format(policy.policyEndDate, 'dd MMM yyyy')}</span>
                      </div>
                      <Badge className={getPolicyStatusColor(policy)}>
                        {getStatusText(policy)}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
                
                {policies.filter(p => !['Term Life', 'Health'].includes(p.policyType)).length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Other Policies</h3>
                    <p className="text-muted-foreground mb-4">
                      Add motor, home, travel, or other insurance policies
                    </p>
                    <Button onClick={() => setIsPolicyDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" /> Add Policy
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="documents" className="space-y-6">
              {policies.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Policies Added</h3>
                  <p className="text-muted-foreground mb-4">
                    Add insurance policies first to upload documents
                  </p>
                  <Button onClick={() => setIsPolicyDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" /> Add Your First Policy
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {policies.map((policy) => (
                      <Card key={policy.id} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardHeader>
                          <div className="flex items-center space-x-2">
                            {getPolicyIcon(policy.policyType)}
                            <div>
                              <CardTitle className="text-lg">{policy.policyType}</CardTitle>
                              <CardDescription>{policy.insurerName}</CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">
                              {policy.policyDocuments?.length || 0} documents
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedPolicyForDocs(policy)}
                            >
                              Manage Documents
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {selectedPolicyForDocs && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <FileText className="h-5 w-5 mr-2" />
                          Documents for {selectedPolicyForDocs.policyType} - {selectedPolicyForDocs.insurerName}
                        </CardTitle>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedPolicyForDocs(null)}
                          className="w-fit"
                        >
                          Close
                        </Button>
                      </CardHeader>
                      <CardContent>
                        <DocumentUpload
                          documents={selectedPolicyForDocs.policyDocuments || []}
                          onUpload={(document) => uploadDocument(selectedPolicyForDocs.id, document)}
                          onRemove={(documentId) => removeDocument(selectedPolicyForDocs.id, documentId)}
                        />
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Edit Policy Dialog */}
          <Dialog open={!!editingPolicy} onOpenChange={() => setEditingPolicy(null)}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Insurance Policy</DialogTitle>
              </DialogHeader>
              {editingPolicy && (
                <InsurancePolicyForm 
                  initialData={editingPolicy}
                  isEditing={true}
                  onSubmit={handleUpdatePolicy} 
                />
              )}
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
};

export default Insurance;