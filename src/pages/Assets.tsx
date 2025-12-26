import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCurrency } from "@/context/CurrencyContext";
import { useAssets } from "@/context/AssetContext";
import { Asset, MaintenanceRecord } from "@/types";
import { AssetForm } from "@/components/AssetForm";
import { AssetDocumentUpload } from "@/components/AssetDocumentUpload";
import { MaintenanceRecordForm } from "@/components/MaintenanceRecordForm";
import { format, differenceInDays } from "date-fns";
import { BackButton } from "@/components/ui/back-button";
import { Plus, Package, Smartphone, Tv, Sofa, Car, Gem, FileText, Edit, Trash2, Wrench, Info, AlertTriangle, Calendar, DollarSign, Tag, PenTool as Tool } from "lucide-react";
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

const Assets = () => {
  const { selectedCurrency } = useCurrency();
  const {
    assets,
    addAsset,
    updateAsset,
    removeAsset,
    uploadDocument,
    removeDocument,
    maintenanceRecords,
    addMaintenanceRecord,
    updateMaintenanceRecord,
    removeMaintenanceRecord,
    getAssetsByCategory,
    getExpiringWarranties,
    getTotalAssetValue,
    getMaintenanceRecordsByAsset
  } = useAssets();

  const [isAssetDialogOpen, setIsAssetDialogOpen] = useState(false);
  const [isMaintenanceDialogOpen, setIsMaintenanceDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [editingMaintenanceRecord, setEditingMaintenanceRecord] = useState<MaintenanceRecord | null>(null);
  const [selectedAssetForDocs, setSelectedAssetForDocs] = useState<Asset | null>(null);
  const [selectedAssetForMaintenance, setSelectedAssetForMaintenance] = useState<Asset | null>(null);

  const handleAddAsset = (assetData: any) => {
    addAsset(assetData);
    setIsAssetDialogOpen(false);
  };

  const handleUpdateAsset = (assetData: any) => {
    if (editingAsset) {
      updateAsset(editingAsset.id, assetData);
      setEditingAsset(null);
    }
  };

  const handleAddMaintenanceRecord = (recordData: any) => {
    addMaintenanceRecord(recordData);
    setIsMaintenanceDialogOpen(false);
  };

  const handleUpdateMaintenanceRecord = (recordData: any) => {
    if (editingMaintenanceRecord) {
      updateMaintenanceRecord(editingMaintenanceRecord.id, recordData);
      setEditingMaintenanceRecord(null);
    }
  };

  const getAssetIcon = (category: string) => {
    switch (category) {
      case 'Electronics': return <Smartphone className="h-5 w-5" />;
      case 'Appliances': return <Tv className="h-5 w-5" />;
      case 'Furniture': return <Sofa className="h-5 w-5" />;
      case 'Vehicles': return <Car className="h-5 w-5" />;
      case 'Jewelry': return <Gem className="h-5 w-5" />;
      case 'Collectibles': return <Tag className="h-5 w-5" />;
      default: return <Package className="h-5 w-5" />;
    }
  };

  const getWarrantyStatusColor = (asset: any) => {
    if (!asset.warrantyEndDate) return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';

    const daysUntilExpiry = differenceInDays(asset.warrantyEndDate, new Date());

    if (daysUntilExpiry < 0) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    if (daysUntilExpiry <= 30) return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    if (daysUntilExpiry <= 90) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  };

  const getWarrantyStatusText = (asset: any) => {
    if (!asset.warrantyEndDate) return 'No Warranty';

    const daysUntilExpiry = differenceInDays(asset.warrantyEndDate, new Date());

    if (daysUntilExpiry < 0) return 'Warranty Expired';
    if (daysUntilExpiry === 0) return 'Warranty Expires Today';
    if (daysUntilExpiry === 1) return 'Warranty Expires Tomorrow';
    if (daysUntilExpiry <= 30) return `Warranty: ${daysUntilExpiry} days left`;
    if (daysUntilExpiry <= 90) return `Warranty: ${Math.floor(daysUntilExpiry / 30)} months left`;
    return `Warranty until ${format(asset.warrantyEndDate, 'dd MMM yyyy')}`;
  };

  // Get statistics
  const electronicAssets = getAssetsByCategory('Electronics');
  const vehicleAssets = getAssetsByCategory('Vehicles');
  const expiringWarranties = getExpiringWarranties(30); // Within 30 days
  const { purchaseValue, currentValue } = getTotalAssetValue();
  const depreciation = purchaseValue - currentValue;
  const depreciationPercentage = purchaseValue > 0 ? (depreciation / purchaseValue) * 100 : 0;

  return (
    <>
      <header className="p-3 sm:p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <BackButton />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Assets & Warranties</h1>
            <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Manage your valuable possessions and documents</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <Dialog open={isAssetDialogOpen} onOpenChange={setIsAssetDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-9 sm:h-10 shrink-0">
                <Plus className="h-4 w-4 mr-1 sm:mr-2" /> Add Asset
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Asset</DialogTitle>
              </DialogHeader>
              <AssetForm onSubmit={handleAddAsset} />
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="flex-1 p-3 sm:p-6 overflow-auto">
        <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
          <TabsList className="flex w-full overflow-x-auto scrollbar-none bg-muted/50 p-1 h-auto min-h-10">
            <TabsTrigger value="overview" className="flex-1 min-w-[80px] text-xs sm:text-sm">Overview</TabsTrigger>
            <TabsTrigger value="electronics" className="flex-1 min-w-[100px] text-xs sm:text-sm">Electronics</TabsTrigger>
            <TabsTrigger value="vehicles" className="flex-1 min-w-[100px] text-xs sm:text-sm">Vehicles</TabsTrigger>
            <TabsTrigger value="other-assets" className="flex-1 min-w-[110px] text-xs sm:text-sm">Other</TabsTrigger>
            <TabsTrigger value="maintenance" className="flex-1 min-w-[110px] text-xs sm:text-sm">Service</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 sm:space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {assets.filter(a => a.isActive).length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Active assets being tracked
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {selectedCurrency.symbol}{currentValue.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Current estimated value
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Depreciation</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {depreciationPercentage.toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {selectedCurrency.symbol}{depreciation.toLocaleString()} total depreciation
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Expiring Warranties</CardTitle>
                  <Calendar className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {expiringWarranties.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Warranties expiring in 30 days
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Setup Guide for New Users */}
            {assets.length === 0 && (
              <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
                <CardHeader>
                  <CardTitle className="flex items-center text-blue-800 dark:text-blue-200">
                    <Info className="h-5 w-5 mr-2" />
                    Getting Started with Asset Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    <p className="mb-3">Track all your valuable possessions in one place:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2">📱 What to Track</h4>
                        <ul className="list-disc list-inside space-y-1 text-xs">
                          <li>Electronics (phones, laptops, TVs)</li>
                          <li>Appliances (refrigerator, washing machine)</li>
                          <li>Vehicles (car, motorcycle, bicycle)</li>
                          <li>Valuable items (jewelry, collectibles)</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">📋 Key Benefits</h4>
                        <ul className="list-disc list-inside space-y-1 text-xs">
                          <li>Warranty tracking and reminders</li>
                          <li>Store purchase receipts and manuals</li>
                          <li>Track maintenance history</li>
                          <li>Insurance documentation</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <Button onClick={() => setIsAssetDialogOpen(true)} size="sm">
                    <Plus className="h-4 w-4 mr-2" /> Add Your First Asset
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Alerts Section */}
            {expiringWarranties.length > 0 && (
              <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800">
                <CardHeader>
                  <CardTitle className="flex items-center text-orange-800 dark:text-orange-200">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Warranty Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                    <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                      Warranties Expiring Soon ({expiringWarranties.length})
                    </h4>
                    <div className="space-y-1">
                      {expiringWarranties.map((asset) => (
                        <div key={asset.id} className="text-sm text-red-700 dark:text-red-300">
                          {asset.name} ({asset.brand} {asset.model}) - Warranty expires on {format(asset.warrantyEndDate!, 'dd MMM yyyy')}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* All Assets Overview */}
            {assets.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    All Assets ({assets.filter(a => a.isActive).length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {assets
                      .filter(a => a.isActive)
                      .sort((a, b) => b.purchaseDate.getTime() - a.purchaseDate.getTime())
                      .map((asset) => (
                        <div key={asset.id} className="flex justify-between items-center p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="p-2 bg-muted rounded-lg">
                              {getAssetIcon(asset.category)}
                            </div>
                            <div>
                              <h4 className="font-medium">{asset.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {asset.brand} {asset.model}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Purchased: {format(asset.purchaseDate, 'dd MMM yyyy')}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={getWarrantyStatusColor(asset)}>
                              {getWarrantyStatusText(asset)}
                            </Badge>
                            <p className="text-sm font-medium mt-1">
                              {selectedCurrency.symbol}{asset.currentValue.toLocaleString()}
                            </p>
                            <div className="flex space-x-2 mt-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedAssetForDocs(asset)}
                              >
                                Documents
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedAssetForMaintenance(asset);
                                  setIsMaintenanceDialogOpen(true);
                                }}
                              >
                                <Wrench className="h-3 w-3 mr-1" /> Add Service
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="electronics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {electronicAssets.map((asset) => (
                <Card key={asset.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-2">
                        <Smartphone className="h-5 w-5 text-blue-500" />
                        <div>
                          <CardTitle className="text-lg">{asset.name}</CardTitle>
                          <CardDescription>{asset.brand} {asset.model}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingAsset(asset)}
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
                              <AlertDialogTitle>Delete Asset</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this asset? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => removeAsset(asset.id)}>
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
                      <span className="text-sm text-muted-foreground">Purchase Price:</span>
                      <span className="font-medium">{selectedCurrency.symbol}{asset.purchasePrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Current Value:</span>
                      <span className="font-medium">{selectedCurrency.symbol}{asset.currentValue.toLocaleString()}</span>
                    </div>
                    {asset.serialNumber && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Serial Number:</span>
                        <span className="font-medium">{asset.serialNumber}</span>
                      </div>
                    )}
                    {asset.location && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Location:</span>
                        <span className="font-medium">{asset.location}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Purchased:</span>
                      <span className="font-medium">{format(asset.purchaseDate, 'dd MMM yyyy')}</span>
                    </div>
                    <Badge className={getWarrantyStatusColor(asset)}>
                      {getWarrantyStatusText(asset)}
                    </Badge>
                    <div className="flex space-x-2 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => setSelectedAssetForDocs(asset)}
                      >
                        <FileText className="h-3 w-3 mr-1" /> Documents
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          setSelectedAssetForMaintenance(asset);
                          setIsMaintenanceDialogOpen(true);
                        }}
                      >
                        <Wrench className="h-3 w-3 mr-1" /> Service
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {electronicAssets.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <Smartphone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Electronics Added</h3>
                  <p className="text-muted-foreground mb-4">
                    Add your electronic devices to track warranties and service history
                  </p>
                  <Button onClick={() => setIsAssetDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" /> Add Electronic Device
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="vehicles" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {vehicleAssets.map((asset) => (
                <Card key={asset.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-2">
                        <Car className="h-5 w-5 text-green-500" />
                        <div>
                          <CardTitle className="text-lg">{asset.name}</CardTitle>
                          <CardDescription>{asset.brand} {asset.model}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingAsset(asset)}
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
                              <AlertDialogTitle>Delete Asset</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this asset? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => removeAsset(asset.id)}>
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
                      <span className="text-sm text-muted-foreground">Purchase Price:</span>
                      <span className="font-medium">{selectedCurrency.symbol}{asset.purchasePrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Current Value:</span>
                      <span className="font-medium">{selectedCurrency.symbol}{asset.currentValue.toLocaleString()}</span>
                    </div>
                    {asset.serialNumber && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">VIN/Serial Number:</span>
                        <span className="font-medium">{asset.serialNumber}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Purchased:</span>
                      <span className="font-medium">{format(asset.purchaseDate, 'dd MMM yyyy')}</span>
                    </div>

                    {/* Maintenance Records Summary */}
                    <div className="pt-2 border-t">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Maintenance History</span>
                        <span className="text-sm text-muted-foreground">
                          {getMaintenanceRecordsByAsset(asset.id).length} records
                        </span>
                      </div>
                      {getMaintenanceRecordsByAsset(asset.id).length > 0 ? (
                        <div className="space-y-2">
                          {getMaintenanceRecordsByAsset(asset.id)
                            .sort((a, b) => b.date.getTime() - a.date.getTime())
                            .slice(0, 2)
                            .map(record => (
                              <div key={record.id} className="text-xs p-2 bg-muted rounded-md">
                                <div className="flex justify-between">
                                  <span className="font-medium">{record.type}</span>
                                  <span>{format(record.date, 'dd MMM yyyy')}</span>
                                </div>
                                <p className="text-muted-foreground mt-1 truncate">{record.description}</p>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">No maintenance records yet</p>
                      )}
                    </div>

                    <div className="flex space-x-2 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => setSelectedAssetForDocs(asset)}
                      >
                        <FileText className="h-3 w-3 mr-1" /> Documents
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          setSelectedAssetForMaintenance(asset);
                          setIsMaintenanceDialogOpen(true);
                        }}
                      >
                        <Wrench className="h-3 w-3 mr-1" /> Service
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {vehicleAssets.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Vehicles Added</h3>
                  <p className="text-muted-foreground mb-4">
                    Add your vehicles to track maintenance history and documents
                  </p>
                  <Button onClick={() => setIsAssetDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" /> Add Vehicle
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="other-assets" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assets
                .filter(a => a.isActive && !['Electronics', 'Vehicles'].includes(a.category))
                .map((asset) => (
                  <Card key={asset.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-2">
                          {getAssetIcon(asset.category)}
                          <div>
                            <CardTitle className="text-lg">{asset.name}</CardTitle>
                            <CardDescription>{asset.category}</CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingAsset(asset)}
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
                                <AlertDialogTitle>Delete Asset</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this asset? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => removeAsset(asset.id)}>
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
                        <span className="text-sm text-muted-foreground">Purchase Price:</span>
                        <span className="font-medium">{selectedCurrency.symbol}{asset.purchasePrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Current Value:</span>
                        <span className="font-medium">{selectedCurrency.symbol}{asset.currentValue.toLocaleString()}</span>
                      </div>
                      {asset.brand && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Brand/Make:</span>
                          <span className="font-medium">{asset.brand}</span>
                        </div>
                      )}
                      {asset.location && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Location:</span>
                          <span className="font-medium">{asset.location}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Purchased:</span>
                        <span className="font-medium">{format(asset.purchaseDate, 'dd MMM yyyy')}</span>
                      </div>
                      {asset.warrantyEndDate && (
                        <Badge className={getWarrantyStatusColor(asset)}>
                          {getWarrantyStatusText(asset)}
                        </Badge>
                      )}
                      <div className="flex space-x-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => setSelectedAssetForDocs(asset)}
                        >
                          <FileText className="h-3 w-3 mr-1" /> Documents
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

              {assets.filter(a => a.isActive && !['Electronics', 'Vehicles'].includes(a.category)).length === 0 && (
                <div className="col-span-full text-center py-12">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Other Assets Added</h3>
                  <p className="text-muted-foreground mb-4">
                    Add furniture, appliances, jewelry, and other valuable possessions
                  </p>
                  <Button onClick={() => setIsAssetDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" /> Add Asset
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-6">
            {assets.length === 0 ? (
              <div className="text-center py-12">
                <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Assets Added</h3>
                <p className="text-muted-foreground mb-4">
                  Add assets first to track maintenance and service records
                </p>
                <Button onClick={() => setIsAssetDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" /> Add Your First Asset
                </Button>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Maintenance & Service Records</h2>
                  <Button onClick={() => {
                    setSelectedAssetForMaintenance(null);
                    setIsMaintenanceDialogOpen(true);
                  }}>
                    <Plus className="h-4 w-4 mr-2" /> Add Record
                  </Button>
                </div>

                {maintenanceRecords.length === 0 ? (
                  <div className="text-center py-8 bg-muted/50 rounded-lg">
                    <Tool className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No maintenance records yet</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Keep track of repairs, services, and upgrades for your assets
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {maintenanceRecords
                      .sort((a, b) => b.date.getTime() - a.date.getTime())
                      .map((record) => {
                        const asset = assets.find(a => a.id === record.assetId);
                        if (!asset) return null;

                        return (
                          <Card key={record.id}>
                            <CardHeader className="pb-2">
                              <div className="flex justify-between items-start">
                                <div className="flex items-center space-x-2">
                                  {getAssetIcon(asset.category)}
                                  <div>
                                    <CardTitle className="text-base">{asset.name}</CardTitle>
                                    <CardDescription>{asset.brand} {asset.model}</CardDescription>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setEditingMaintenanceRecord(record)}
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
                                        <AlertDialogTitle>Delete Record</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to delete this maintenance record? This action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => removeMaintenanceRecord(record.id)}>
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <div className="flex justify-between items-center mb-2">
                                <Badge variant="outline">{record.type}</Badge>
                                <span className="text-sm text-muted-foreground">
                                  {format(record.date, 'dd MMM yyyy')}
                                </span>
                              </div>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-sm text-muted-foreground">Provider:</span>
                                  <span className="text-sm font-medium">{record.provider}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-muted-foreground">Cost:</span>
                                  <span className="text-sm font-medium">{selectedCurrency.symbol}{record.cost.toLocaleString()}</span>
                                </div>
                                <div>
                                  <span className="text-sm text-muted-foreground">Description:</span>
                                  <p className="text-sm mt-1">{record.description}</p>
                                </div>
                                {record.notes && (
                                  <div>
                                    <span className="text-sm text-muted-foreground">Notes:</span>
                                    <p className="text-sm text-muted-foreground mt-1">{record.notes}</p>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>

        {/* Edit Asset Dialog */}
        <Dialog open={!!editingAsset} onOpenChange={() => setEditingAsset(null)}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Asset</DialogTitle>
            </DialogHeader>
            {editingAsset && (
              <AssetForm
                initialData={editingAsset}
                isEditing={true}
                onSubmit={handleUpdateAsset}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Maintenance Record Dialog */}
        <Dialog open={!!editingMaintenanceRecord} onOpenChange={() => setEditingMaintenanceRecord(null)}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Maintenance Record</DialogTitle>
            </DialogHeader>
            {editingMaintenanceRecord && (
              <MaintenanceRecordForm
                initialData={editingMaintenanceRecord}
                isEditing={true}
                assets={assets.filter(a => a.isActive)}
                onSubmit={handleUpdateMaintenanceRecord}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Add Maintenance Record Dialog */}
        <Dialog open={isMaintenanceDialogOpen} onOpenChange={setIsMaintenanceDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedAssetForMaintenance
                  ? `Add Maintenance Record for ${selectedAssetForMaintenance.name}`
                  : 'Add Maintenance Record'}
              </DialogTitle>
            </DialogHeader>
            <MaintenanceRecordForm
              assets={assets.filter(a => a.isActive)}
              preselectedAssetId={selectedAssetForMaintenance?.id}
              onSubmit={handleAddMaintenanceRecord}
            />
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
              <AssetDocumentUpload
                documents={selectedAssetForDocs.documents || []}
                onUpload={(document) => uploadDocument(selectedAssetForDocs.id, document)}
                onRemove={(documentId) => removeDocument(selectedAssetForDocs.id, documentId)}
              />
            </DialogContent>
          </Dialog>
        )}
      </main>
    </>
  );
};

export default Assets;