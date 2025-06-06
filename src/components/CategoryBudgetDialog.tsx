// src/components/CategoryBudgetDialog.tsx

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PiggyBank, Wallet } from "lucide-react";
import { useAppContext } from "@/context/AppContext"; // CORREÇÃO: Usar useAppContext

interface CategoryBudgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CategoryBudgetDialog = ({ open, onOpenChange }: CategoryBudgetDialogProps) => {
  const { categories, updateCategory } = useAppContext(); // CORREÇÃO: Usar useAppContext
  const [budgets, setBudgets] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      const initialBudgets = categories.reduce((acc, cat) => {
        acc[cat.id] = cat.budget?.toString() || '';
        return acc;
      }, {} as Record<string, string>);
      setBudgets(initialBudgets);
    }
  }, [open, categories]);

  const handleBudgetChange = (categoryId: string, value: string) => {
    setBudgets(prev => ({ ...prev, [categoryId]: value }));
  };

  const handleSave = () => {
    Object.entries(budgets).forEach(([id, budget]) => {
      const originalCategory = categories.find(c => c.id === id);
      const newBudget = parseFloat(budget) || 0;
      if (originalCategory?.budget !== newBudget) {
        updateCategory({ id, budget: newBudget });
      }
    });
    onOpenChange(false);
  };
    // ... (o resto do código do componente permanece o mesmo)
};