import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Asset, AssetDocument, MaintenanceRecord } from '@/types';
import { showSuccess, showError } from '@/utils/toast';
import { addMonths, isBefore, isAfter } from 'date-fns';

interface AssetContextType {
  // Assets
  assets: Asset[];
  addAsset: (asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt' | 'documents'>) => void;
  updateAsset: (id: string, updates: Partial<Asset>) => void;
  removeAsset: (id: string) => void;

  // Documents
  uploadDocument: (assetId: string, document: Omit<AssetDocument, 'id' | 'uploadDate'>) => void;
  removeDocument: (assetId: string, documentId: string) => void;

  // Maintenance Records
  maintenanceRecords: MaintenanceRecord[];
  addMaintenanceRecord: (record: Omit<MaintenanceRecord, 'id' | 'documents'>) => void;
  updateMaintenanceRecord: (id: string, updates: Partial<MaintenanceRecord>) => void;
  removeMaintenanceRecord: (id: string) => void;

  // Utilities
  getAssetsByCategory: (category: Asset['category']) => Asset[];
  getExpiringWarranties: (withinDays: number) => Asset[];
  getTotalAssetValue: () => { purchaseValue: number; currentValue: number; };
  getMaintenanceRecordsByAsset: (assetId: string) => MaintenanceRecord[];
}

const ASSETS_KEY = 'assets';
const MAINTENANCE_RECORDS_KEY = 'maintenanceRecords';

const AssetContext = createContext<AssetContextType | undefined>(undefined);

export const AssetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [assets, setAssets] = useState<Asset[]>(() => {
    try {
      const saved = localStorage.getItem(ASSETS_KEY);
      return saved ? JSON.parse(saved).map((asset: any) => ({
        ...asset,
        purchaseDate: new Date(asset.purchaseDate),
        warrantyEndDate: asset.warrantyEndDate ? new Date(asset.warrantyEndDate) : undefined,
        createdAt: new Date(asset.createdAt),
        updatedAt: new Date(asset.updatedAt),
        documents: asset.documents?.map((doc: any) => ({
          ...doc,
          uploadDate: new Date(doc.uploadDate),
        })) || [],
      })) : [];
    } catch (e) {
      console.error("Failed to parse assets from localStorage:", e);
      return [];
    }
  });

  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>(() => {
    try {
      const saved = localStorage.getItem(MAINTENANCE_RECORDS_KEY);
      return saved ? JSON.parse(saved).map((record: any) => ({
        ...record,
        date: new Date(record.date),
        documents: record.documents?.map((doc: any) => ({
          ...doc,
          uploadDate: new Date(doc.uploadDate),
        })) || [],
      })) : [];
    } catch (e) {
      console.error("Failed to parse maintenance records from localStorage:", e);
      return [];
    }
  });

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem(ASSETS_KEY, JSON.stringify(assets));
  }, [assets]);

  useEffect(() => {
    localStorage.setItem(MAINTENANCE_RECORDS_KEY, JSON.stringify(maintenanceRecords));
  }, [maintenanceRecords]);

  const addAsset = (assetData: Omit<Asset, 'id' | 'createdAt' | 'updatedAt' | 'documents'>) => {
    const newAsset: Asset = {
      id: crypto.randomUUID(),
      ...assetData,
      documents: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setAssets(prev => [...prev, newAsset]);
    showSuccess(`${assetData.name} added successfully!`);
  };

  const updateAsset = (id: string, updates: Partial<Asset>) => {
    setAssets(prev => prev.map(asset =>
      asset.id === id ? { ...asset, ...updates, updatedAt: new Date() } : asset
    ));
    showSuccess('Asset updated successfully!');
  };

  const removeAsset = (id: string) => {
    const asset = assets.find(a => a.id === id);
    if (!asset) {
      showError('Asset not found.');
      return;
    }
    setAssets(prev => prev.filter(a => a.id !== id));
    // Also remove related maintenance records
    setMaintenanceRecords(prev => prev.filter(r => r.assetId !== id));
    showSuccess(`${asset.name} removed.`);
  };

  const uploadDocument = (assetId: string, documentData: Omit<AssetDocument, 'id' | 'uploadDate'>) => {
    const newDocument: AssetDocument = {
      id: crypto.randomUUID(),
      ...documentData,
      uploadDate: new Date(),
    };

    setAssets(prev => prev.map(asset => {
      if (asset.id === assetId) {
        return {
          ...asset,
          documents: [...(asset.documents || []), newDocument],
          updatedAt: new Date(),
        };
      }
      return asset;
    }));

    showSuccess('Document uploaded successfully!');
  };

  const removeDocument = (assetId: string, documentId: string) => {
    setAssets(prev => prev.map(asset => {
      if (asset.id === assetId) {
        return {
          ...asset,
          documents: asset.documents?.filter(doc => doc.id !== documentId) || [],
          updatedAt: new Date(),
        };
      }
      return asset;
    }));
    showSuccess('Document removed successfully!');
  };

  const addMaintenanceRecord = (recordData: Omit<MaintenanceRecord, 'id' | 'documents'>) => {
    const newRecord: MaintenanceRecord = {
      id: crypto.randomUUID(),
      ...recordData,
      documents: [],
    };
    setMaintenanceRecords(prev => [...prev, newRecord]);
    showSuccess('Maintenance record added successfully!');
  };

  const updateMaintenanceRecord = (id: string, updates: Partial<MaintenanceRecord>) => {
    setMaintenanceRecords(prev => prev.map(record =>
      record.id === id ? { ...record, ...updates } : record
    ));
    showSuccess('Maintenance record updated successfully!');
  };

  const removeMaintenanceRecord = (id: string) => {
    setMaintenanceRecords(prev => prev.filter(r => r.id !== id));
    showSuccess('Maintenance record removed successfully!');
  };

  const getAssetsByCategory = (category: Asset['category']) => {
    return assets.filter(asset => asset.category === category && asset.isActive);
  };

  const getExpiringWarranties = (withinDays: number) => {
    const cutoffDate = addMonths(new Date(), Math.floor(withinDays / 30));
    return assets.filter(asset =>
      asset.isActive &&
      asset.warrantyEndDate &&
      isBefore(asset.warrantyEndDate, cutoffDate) &&
      isAfter(asset.warrantyEndDate, new Date())
    );
  };

  const getTotalAssetValue = () => {
    const purchaseValue = assets
      .filter(asset => asset.isActive)
      .reduce((sum, asset) => sum + asset.purchasePrice, 0);

    const currentValue = assets
      .filter(asset => asset.isActive)
      .reduce((sum, asset) => sum + asset.currentValue, 0);

    return { purchaseValue, currentValue };
  };

  const getMaintenanceRecordsByAsset = (assetId: string) => {
    return maintenanceRecords.filter(record => record.assetId === assetId);
  };

  return (
    <AssetContext.Provider value={{
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
      getMaintenanceRecordsByAsset,
    }}>
      {children}
    </AssetContext.Provider>
  );
};

export const useAssets = () => {
  const context = useContext(AssetContext);
  if (context === undefined) {
    throw new Error('useAssets must be used within an AssetProvider');
  }
  return context;
};