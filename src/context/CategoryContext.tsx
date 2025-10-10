import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { showSuccess, showError } from '@/utils/toast';

interface CategoryContextType {
  categories: string[];
  addCategory: (category: string) => void;
  removeCategory: (category: string) => void;
}

const defaultCategories = ["Travel", "Office Supplies", "Software", "Marketing", "Utilities", "Other"];
const LOCAL_STORAGE_KEY = 'expenseCategories';

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export const CategoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<string[]>(() => {
    try {
      const savedCategories = localStorage.getItem(LOCAL_STORAGE_KEY);
      return savedCategories ? JSON.parse(savedCategories) : defaultCategories;
    } catch (e) {
      console.error("Failed to parse categories from localStorage:", e);
      return defaultCategories;
    }
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(categories));
  }, [categories]);

  const addCategory = (category: string) => {
    const trimmedCategory = category.trim();
    if (!trimmedCategory) {
      showError("Category name cannot be empty.");
      return;
    }
    if (categories.includes(trimmedCategory)) {
      showError(`Category "${trimmedCategory}" already exists.`);
      return;
    }
    setCategories((prev) => [...prev, trimmedCategory]);
    showSuccess(`Category "${trimmedCategory}" added.`);
  };

  const removeCategory = (category: string) => {
    if (!categories.includes(category)) {
      showError(`Category "${category}" not found.`);
      return;
    }
    setCategories((prev) => prev.filter((c) => c !== category));
    showSuccess(`Category "${category}" removed.`);
  };

  return (
    <CategoryContext.Provider value={{ categories, addCategory, removeCategory }}>
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategories = () => {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoryProvider');
  }
  return context;
};