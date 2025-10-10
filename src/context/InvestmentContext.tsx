import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { InvestmentAsset, Investment, InvestmentTransaction, Portfolio, InvestmentGoal, PolicyDocument } from '@/types';
import { showSuccess, showError } from '@/utils/toast';

interface InvestmentContextType {
  // Investment Assets (replaces MutualFunds and expands to all asset types)
  investmentAssets: InvestmentAsset[];
  addInvestmentAsset: (asset: Omit<InvestmentAsset, 'id' | 'lastUpdated'>) => void;
  updateInvestmentAsset: (id: string, updates: Partial<InvestmentAsset>) => void;
  removeInvestmentAsset: (id: string) => void;
  
  // Investments
  investments: Investment[];
  addInvestment: (investment: Omit<Investment, 'id'>) => void;
  updateInvestment: (id: string, updates: Partial<Investment>) => void;
  removeInvestment: (id: string) => void;
  
  // Transactions
  transactions: InvestmentTransaction[];
  addTransaction: (transaction: Omit<InvestmentTransaction, 'id'>) => void;
  removeTransaction: (id: string) => void;
  
  // Portfolio
  portfolios: Portfolio[];
  createPortfolio: (portfolio: Omit<Portfolio, 'id' | 'lastUpdated'>) => void;
  updatePortfolio: (id: string, updates: Partial<Portfolio>) => void;
  removePortfolio: (id: string) => void;
  
  // Goals
  investmentGoals: InvestmentGoal[];
  addInvestmentGoal: (goal: Omit<InvestmentGoal, 'id'>) => void;
  updateInvestmentGoal: (id: string, updates: Partial<InvestmentGoal>) => void;
  removeInvestmentGoal: (id: string) => void;
  
  // Documents
  uploadDocument: (assetId: string, document: Omit<PolicyDocument, 'id' | 'uploadDate'>) => void;
  removeDocument: (assetId: string, documentId: string) => void;
  
  // Calculations
  calculatePortfolioValue: (portfolioId?: string) => { totalInvested: number; currentValue: number; returns: number; returnPercentage: number };
  getInvestmentsByAsset: (assetId: string) => Investment[];
  getTransactionsByInvestment: (investmentId: string) => InvestmentTransaction[];
  getAssetsByType: (type: InvestmentAsset['type']) => InvestmentAsset[];
}

const INVESTMENT_ASSETS_KEY = 'investmentAssets';
const INVESTMENTS_KEY = 'investments';
const TRANSACTIONS_KEY = 'investmentTransactions';
const PORTFOLIOS_KEY = 'portfolios';
const INVESTMENT_GOALS_KEY = 'investmentGoals';

const InvestmentContext = createContext<InvestmentContextType | undefined>(undefined);

export const InvestmentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [investmentAssets, setInvestmentAssets] = useState<InvestmentAsset[]>(() => {
    try {
      const saved = localStorage.getItem(INVESTMENT_ASSETS_KEY);
      return saved ? JSON.parse(saved).map((asset: any) => ({
        ...asset,
        lastUpdated: new Date(asset.lastUpdated),
        maturityDate: asset.maturityDate ? new Date(asset.maturityDate) : undefined,
        documents: asset.documents?.map((doc: any) => ({
          ...doc,
          uploadDate: new Date(doc.uploadDate),
        })) || [],
      })) : [];
    } catch (e) {
      console.error("Failed to parse investment assets from localStorage:", e);
      return [];
    }
  });

  const [investments, setInvestments] = useState<Investment[]>(() => {
    try {
      const saved = localStorage.getItem(INVESTMENTS_KEY);
      return saved ? JSON.parse(saved).map((inv: any) => ({
        ...inv,
        purchaseDate: new Date(inv.purchaseDate),
        maturityDate: inv.maturityDate ? new Date(inv.maturityDate) : undefined,
      })) : [];
    } catch (e) {
      console.error("Failed to parse investments from localStorage:", e);
      return [];
    }
  });

  const [transactions, setTransactions] = useState<InvestmentTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(TRANSACTIONS_KEY);
      return saved ? JSON.parse(saved).map((txn: any) => ({
        ...txn,
        date: new Date(txn.date),
      })) : [];
    } catch (e) {
      console.error("Failed to parse transactions from localStorage:", e);
      return [];
    }
  });

  const [portfolios, setPortfolios] = useState<Portfolio[]>(() => {
    try {
      const saved = localStorage.getItem(PORTFOLIOS_KEY);
      return saved ? JSON.parse(saved).map((portfolio: any) => ({
        ...portfolio,
        lastUpdated: new Date(portfolio.lastUpdated),
        investments: portfolio.investments.map((inv: any) => ({
          ...inv,
          purchaseDate: new Date(inv.purchaseDate),
          maturityDate: inv.maturityDate ? new Date(inv.maturityDate) : undefined,
        })),
      })) : [];
    } catch (e) {
      console.error("Failed to parse portfolios from localStorage:", e);
      return [];
    }
  });

  const [investmentGoals, setInvestmentGoals] = useState<InvestmentGoal[]>(() => {
    try {
      const saved = localStorage.getItem(INVESTMENT_GOALS_KEY);
      return saved ? JSON.parse(saved).map((goal: any) => ({
        ...goal,
        targetDate: new Date(goal.targetDate),
      })) : [];
    } catch (e) {
      console.error("Failed to parse investment goals from localStorage:", e);
      return [];
    }
  });

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem(INVESTMENT_ASSETS_KEY, JSON.stringify(investmentAssets));
  }, [investmentAssets]);

  useEffect(() => {
    localStorage.setItem(INVESTMENTS_KEY, JSON.stringify(investments));
  }, [investments]);

  useEffect(() => {
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(PORTFOLIOS_KEY, JSON.stringify(portfolios));
  }, [portfolios]);

  useEffect(() => {
    localStorage.setItem(INVESTMENT_GOALS_KEY, JSON.stringify(investmentGoals));
  }, [investmentGoals]);

  // Investment Asset functions
  const addInvestmentAsset = (assetData: Omit<InvestmentAsset, 'id' | 'lastUpdated'>) => {
    const newAsset: InvestmentAsset = {
      id: crypto.randomUUID(),
      ...assetData,
      lastUpdated: new Date(),
      documents: [],
    };
    setInvestmentAssets(prev => [...prev, newAsset]);
    showSuccess(`${assetData.type} "${assetData.name}" added successfully!`);
  };

  const updateInvestmentAsset = (id: string, updates: Partial<InvestmentAsset>) => {
    setInvestmentAssets(prev => prev.map(asset => 
      asset.id === id ? { ...asset, ...updates, lastUpdated: new Date() } : asset
    ));
    showSuccess('Investment asset updated successfully!');
  };

  const removeInvestmentAsset = (id: string) => {
    const asset = investmentAssets.find(a => a.id === id);
    if (!asset) {
      showError('Investment asset not found.');
      return;
    }
    setInvestmentAssets(prev => prev.filter(a => a.id !== id));
    showSuccess(`${asset.type} "${asset.name}" removed.`);
  };

  // Investment functions
  const addInvestment = (investmentData: Omit<Investment, 'id'>) => {
    const newInvestment: Investment = {
      id: crypto.randomUUID(),
      ...investmentData,
    };
    setInvestments(prev => [...prev, newInvestment]);
    
    // Also add a transaction for this investment
    const asset = investmentAssets.find(a => a.id === investmentData.assetId);
    const transactionType = investmentData.investmentType === 'SIP' ? 'SIP' : 
                           investmentData.investmentType === 'Recurring Deposit' ? 'Deposit' : 'Buy';
    
    const transaction: InvestmentTransaction = {
      id: crypto.randomUUID(),
      investmentId: newInvestment.id,
      type: transactionType as any,
      amount: investmentData.amount,
      units: investmentData.units,
      price: investmentData.purchasePrice,
      date: investmentData.purchaseDate,
    };
    setTransactions(prev => [...prev, transaction]);
    
    showSuccess('Investment added successfully!');
  };

  const updateInvestment = (id: string, updates: Partial<Investment>) => {
    setInvestments(prev => prev.map(inv => 
      inv.id === id ? { ...inv, ...updates } : inv
    ));
    showSuccess('Investment updated successfully!');
  };

  const removeInvestment = (id: string) => {
    const investment = investments.find(i => i.id === id);
    if (!investment) {
      showError('Investment not found.');
      return;
    }
    setInvestments(prev => prev.filter(i => i.id !== id));
    // Also remove related transactions
    setTransactions(prev => prev.filter(t => t.investmentId !== id));
    showSuccess('Investment and related transactions removed.');
  };

  // Transaction functions
  const addTransaction = (transactionData: Omit<InvestmentTransaction, 'id'>) => {
    const newTransaction: InvestmentTransaction = {
      id: crypto.randomUUID(),
      ...transactionData,
    };
    setTransactions(prev => [...prev, newTransaction]);
    
    // Update investment units and amount if it's a buy/sell transaction
    if (transactionData.type === 'Buy' || transactionData.type === 'SIP' || transactionData.type === 'Deposit') {
      setInvestments(prev => prev.map(inv => {
        if (inv.id === transactionData.investmentId) {
          return {
            ...inv,
            units: inv.units + transactionData.units,
            amount: inv.amount + transactionData.amount,
          };
        }
        return inv;
      }));
    } else if (transactionData.type === 'Sell' || transactionData.type === 'Withdrawal') {
      setInvestments(prev => prev.map(inv => {
        if (inv.id === transactionData.investmentId) {
          return {
            ...inv,
            units: inv.units - transactionData.units,
            amount: inv.amount - transactionData.amount,
          };
        }
        return inv;
      }));
    }
    
    showSuccess('Transaction added successfully!');
  };

  const removeTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    showSuccess('Transaction removed.');
  };

  // Portfolio functions
  const createPortfolio = (portfolioData: Omit<Portfolio, 'id' | 'lastUpdated'>) => {
    const newPortfolio: Portfolio = {
      id: crypto.randomUUID(),
      ...portfolioData,
      lastUpdated: new Date(),
    };
    setPortfolios(prev => [...prev, newPortfolio]);
    showSuccess(`Portfolio "${portfolioData.name}" created successfully!`);
  };

  const updatePortfolio = (id: string, updates: Partial<Portfolio>) => {
    setPortfolios(prev => prev.map(portfolio => 
      portfolio.id === id ? { ...portfolio, ...updates, lastUpdated: new Date() } : portfolio
    ));
    showSuccess('Portfolio updated successfully!');
  };

  const removePortfolio = (id: string) => {
    const portfolio = portfolios.find(p => p.id === id);
    if (!portfolio) {
      showError('Portfolio not found.');
      return;
    }
    setPortfolios(prev => prev.filter(p => p.id !== id));
    showSuccess(`Portfolio "${portfolio.name}" removed.`);
  };

  // Investment Goal functions
  const addInvestmentGoal = (goalData: Omit<InvestmentGoal, 'id'>) => {
    const newGoal: InvestmentGoal = {
      id: crypto.randomUUID(),
      ...goalData,
    };
    setInvestmentGoals(prev => [...prev, newGoal]);
    showSuccess(`Investment goal "${goalData.name}" added successfully!`);
  };

  const updateInvestmentGoal = (id: string, updates: Partial<InvestmentGoal>) => {
    setInvestmentGoals(prev => prev.map(goal => 
      goal.id === id ? { ...goal, ...updates } : goal
    ));
    showSuccess('Investment goal updated successfully!');
  };

  const removeInvestmentGoal = (id: string) => {
    const goal = investmentGoals.find(g => g.id === id);
    if (!goal) {
      showError('Investment goal not found.');
      return;
    }
    setInvestmentGoals(prev => prev.filter(g => g.id !== id));
    showSuccess(`Investment goal "${goal.name}" removed.`);
  };

  // Document functions
  const uploadDocument = (assetId: string, documentData: Omit<PolicyDocument, 'id' | 'uploadDate'>) => {
    const newDocument: PolicyDocument = {
      id: crypto.randomUUID(),
      ...documentData,
      uploadDate: new Date(),
    };
    
    setInvestmentAssets(prev => prev.map(asset => {
      if (asset.id === assetId) {
        return {
          ...asset,
          documents: [...(asset.documents || []), newDocument],
          lastUpdated: new Date(),
        };
      }
      return asset;
    }));
    
    showSuccess('Document uploaded successfully!');
  };

  const removeDocument = (assetId: string, documentId: string) => {
    setInvestmentAssets(prev => prev.map(asset => {
      if (asset.id === assetId) {
        return {
          ...asset,
          documents: asset.documents?.filter(doc => doc.id !== documentId) || [],
          lastUpdated: new Date(),
        };
      }
      return asset;
    }));
    showSuccess('Document removed successfully!');
  };

  // Calculation functions
  const calculatePortfolioValue = (portfolioId?: string) => {
    let relevantInvestments = investments;
    
    if (portfolioId) {
      const portfolio = portfolios.find(p => p.id === portfolioId);
      relevantInvestments = portfolio?.investments || [];
    }

    const totalInvested = relevantInvestments.reduce((sum, inv) => sum + inv.amount, 0);
    
    // Calculate current value based on current price
    const currentValue = relevantInvestments.reduce((sum, inv) => {
      const asset = investmentAssets.find(a => a.id === inv.assetId);
      if (asset && inv.units > 0) {
        return sum + (inv.units * asset.currentPrice);
      }
      return sum + inv.amount; // Fallback if asset not found
    }, 0);

    const returns = currentValue - totalInvested;
    const returnPercentage = totalInvested > 0 ? (returns / totalInvested) * 100 : 0;

    return { totalInvested, currentValue, returns, returnPercentage };
  };

  const getInvestmentsByAsset = (assetId: string) => {
    return investments.filter(inv => inv.assetId === assetId);
  };

  const getTransactionsByInvestment = (investmentId: string) => {
    return transactions.filter(txn => txn.investmentId === investmentId);
  };

  const getAssetsByType = (type: InvestmentAsset['type']) => {
    return investmentAssets.filter(asset => asset.type === type);
  };

  return (
    <InvestmentContext.Provider value={{
      investmentAssets,
      addInvestmentAsset,
      updateInvestmentAsset,
      removeInvestmentAsset,
      investments,
      addInvestment,
      updateInvestment,
      removeInvestment,
      transactions,
      addTransaction,
      removeTransaction,
      portfolios,
      createPortfolio,
      updatePortfolio,
      removePortfolio,
      investmentGoals,
      addInvestmentGoal,
      updateInvestmentGoal,
      removeInvestmentGoal,
      uploadDocument,
      removeDocument,
      calculatePortfolioValue,
      getInvestmentsByAsset,
      getTransactionsByInvestment,
      getAssetsByType,
    }}>
      {children}
    </InvestmentContext.Provider>
  );
};

export const useInvestments = () => {
  const context = useContext(InvestmentContext);
  if (context === undefined) {
    throw new Error('useInvestments must be used within an InvestmentProvider');
  }
  return context;
};