import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { InsurancePolicy, PolicyDocument, InsuranceClaim } from '@/types';
import { showSuccess, showError } from '@/utils/toast';
import { addMonths, isBefore, isAfter } from 'date-fns';

interface InsuranceContextType {
  // Policies
  policies: InsurancePolicy[];
  addPolicy: (policy: Omit<InsurancePolicy, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePolicy: (id: string, updates: Partial<InsurancePolicy>) => void;
  removePolicy: (id: string) => void;

  // Documents
  uploadDocument: (policyId: string, document: Omit<PolicyDocument, 'id' | 'uploadDate'>) => void;
  removeDocument: (policyId: string, documentId: string) => void;

  // Claims
  claims: InsuranceClaim[];
  addClaim: (claim: Omit<InsuranceClaim, 'id'>) => void;
  updateClaim: (id: string, updates: Partial<InsuranceClaim>) => void;
  removeClaim: (id: string) => void;

  // Utilities
  getPoliciesByType: (type: InsurancePolicy['policyType']) => InsurancePolicy[];
  getExpiringPolicies: (withinDays: number) => InsurancePolicy[];
  getUpcomingPremiums: (withinDays: number) => InsurancePolicy[];
  getTotalPremiumAmount: (frequency?: InsurancePolicy['premiumFrequency']) => number;
}

const POLICIES_KEY = 'insurancePolicies';
const CLAIMS_KEY = 'insuranceClaims';

const InsuranceContext = createContext<InsuranceContextType | undefined>(undefined);

export const InsuranceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [policies, setPolicies] = useState<InsurancePolicy[]>(() => {
    try {
      const saved = localStorage.getItem(POLICIES_KEY);
      return saved ? JSON.parse(saved).map((policy: any) => ({
        ...policy,
        policyStartDate: new Date(policy.policyStartDate),
        policyEndDate: new Date(policy.policyEndDate),
        nextPremiumDueDate: new Date(policy.nextPremiumDueDate),
        createdAt: new Date(policy.createdAt),
        updatedAt: new Date(policy.updatedAt),
        policyDocuments: policy.policyDocuments?.map((doc: any) => ({
          ...doc,
          uploadDate: new Date(doc.uploadDate),
        })) || [],
      })) : [];
    } catch (e) {
      console.error("Failed to parse insurance policies from localStorage:", e);
      return [];
    }
  });

  const [claims, setClaims] = useState<InsuranceClaim[]>(() => {
    try {
      const saved = localStorage.getItem(CLAIMS_KEY);
      return saved ? JSON.parse(saved).map((claim: any) => ({
        ...claim,
        claimDate: new Date(claim.claimDate),
        settlementDate: claim.settlementDate ? new Date(claim.settlementDate) : undefined,
        documents: claim.documents?.map((doc: any) => ({
          ...doc,
          uploadDate: new Date(doc.uploadDate),
        })) || [],
      })) : [];
    } catch (e) {
      console.error("Failed to parse insurance claims from localStorage:", e);
      return [];
    }
  });

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem(POLICIES_KEY, JSON.stringify(policies));
  }, [policies]);

  useEffect(() => {
    localStorage.setItem(CLAIMS_KEY, JSON.stringify(claims));
  }, [claims]);

  const addPolicy = (policyData: Omit<InsurancePolicy, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newPolicy: InsurancePolicy = {
      id: crypto.randomUUID(),
      ...policyData,
      policyDocuments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setPolicies(prev => [...prev, newPolicy]);
    showSuccess(`${policyData.policyType} policy added successfully!`);
  };

  const updatePolicy = (id: string, updates: Partial<InsurancePolicy>) => {
    setPolicies(prev => prev.map(policy =>
      policy.id === id ? { ...policy, ...updates, updatedAt: new Date() } : policy
    ));
    showSuccess('Policy updated successfully!');
  };

  const removePolicy = (id: string) => {
    const policy = policies.find(p => p.id === id);
    if (!policy) {
      showError('Policy not found.');
      return;
    }
    setPolicies(prev => prev.filter(p => p.id !== id));
    // Also remove related claims
    setClaims(prev => prev.filter(c => c.policyId !== id));
    showSuccess(`${policy.policyType} policy removed.`);
  };

  const uploadDocument = (policyId: string, documentData: Omit<PolicyDocument, 'id' | 'uploadDate'>) => {
    const newDocument: PolicyDocument = {
      id: crypto.randomUUID(),
      ...documentData,
      uploadDate: new Date(),
    };

    setPolicies(prev => prev.map(policy => {
      if (policy.id === policyId) {
        return {
          ...policy,
          policyDocuments: [...(policy.policyDocuments || []), newDocument],
          updatedAt: new Date(),
        };
      }
      return policy;
    }));

    showSuccess('Document uploaded successfully!');
  };

  const removeDocument = (policyId: string, documentId: string) => {
    setPolicies(prev => prev.map(policy => {
      if (policy.id === policyId) {
        return {
          ...policy,
          policyDocuments: policy.policyDocuments?.filter(doc => doc.id !== documentId) || [],
          updatedAt: new Date(),
        };
      }
      return policy;
    }));
    showSuccess('Document removed successfully!');
  };

  const addClaim = (claimData: Omit<InsuranceClaim, 'id'>) => {
    const newClaim: InsuranceClaim = {
      id: crypto.randomUUID(),
      ...claimData,
    };
    setClaims(prev => [...prev, newClaim]);
    showSuccess('Insurance claim added successfully!');
  };

  const updateClaim = (id: string, updates: Partial<InsuranceClaim>) => {
    setClaims(prev => prev.map(claim =>
      claim.id === id ? { ...claim, ...updates } : claim
    ));
    showSuccess('Claim updated successfully!');
  };

  const removeClaim = (id: string) => {
    setClaims(prev => prev.filter(c => c.id !== id));
    showSuccess('Claim removed successfully!');
  };

  const getPoliciesByType = (type: InsurancePolicy['policyType']) => {
    return policies.filter(policy => policy.policyType === type && policy.isActive);
  };

  const getExpiringPolicies = (withinDays: number) => {
    const cutoffDate = addMonths(new Date(), Math.floor(withinDays / 30));
    return policies.filter(policy =>
      policy.isActive &&
      isBefore(policy.policyEndDate, cutoffDate) &&
      isAfter(policy.policyEndDate, new Date())
    );
  };

  const getUpcomingPremiums = (withinDays: number) => {
    const cutoffDate = addMonths(new Date(), Math.floor(withinDays / 30));
    return policies.filter(policy =>
      policy.isActive &&
      isBefore(policy.nextPremiumDueDate, cutoffDate) &&
      isAfter(policy.nextPremiumDueDate, new Date())
    );
  };

  const getTotalPremiumAmount = (frequency?: InsurancePolicy['premiumFrequency']) => {
    const filteredPolicies = frequency
      ? policies.filter(p => p.isActive && p.premiumFrequency === frequency)
      : policies.filter(p => p.isActive);

    return filteredPolicies.reduce((total, policy) => {
      // Convert all premiums to yearly amount for comparison
      let yearlyPremium = policy.premiumAmount;
      switch (policy.premiumFrequency) {
        case 'Monthly':
          yearlyPremium *= 12;
          break;
        case 'Quarterly':
          yearlyPremium *= 4;
          break;
        case 'Half-Yearly':
          yearlyPremium *= 2;
          break;
        case 'Yearly':
          // Already yearly
          break;
      }
      return total + yearlyPremium;
    }, 0);
  };

  return (
    <InsuranceContext.Provider value={{
      policies,
      addPolicy,
      updatePolicy,
      removePolicy,
      uploadDocument,
      removeDocument,
      claims,
      addClaim,
      updateClaim,
      removeClaim,
      getPoliciesByType,
      getExpiringPolicies,
      getUpcomingPremiums,
      getTotalPremiumAmount,
    }}>
      {children}
    </InsuranceContext.Provider>
  );
};

export const useInsurance = () => {
  const context = useContext(InsuranceContext);
  if (context === undefined) {
    throw new Error('useInsurance must be used within an InsuranceProvider');
  }
  return context;
};