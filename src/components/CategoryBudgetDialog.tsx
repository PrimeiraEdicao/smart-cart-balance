// src/components/CategoryBudgetDialog.tsx

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PiggyBank } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { toast } from "sonner";

interface CategoryBudgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CategoryBudgetDialog = ({ open, onOpenChange }: CategoryBudgetDialogProps) => {
  const { categories, updateCategory } = useAppContext();
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
    let updatedCount = 0;
    Object.entries(budgets).forEach(([id, budget]) => {
      const originalCategory = categories.find(c => c.id === id);
      const newBudget = parseFloat(budget) || 0;
      
      if (originalCategory && originalCategory.budget !== newBudget) {
        updateCategory({ id, budget: newBudget });
        updatedCount++;
      }
    });

    if (updatedCount > 0) {
      toast.success(`${updatedCount} orçamento(s) de categoria atualizado(s)!`);
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PiggyBank className="h-5 w-5 text-green-600" />
            Orçamento por Categoria
          </DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto space-y-4 p-1">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center gap-4">
              <Label htmlFor={`budget-${category.id}`} className="flex-1 flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${category.color}`} />
                {category.name}
              </Label>
              <Input
                id={`budget-${category.id}`}
                type="number"
                value={budgets[category.id] || ''}
                onChange={(e) => handleBudgetChange(category.id, e.target.value)}
                placeholder="R$ 0,00"
                className="w-32"
              />
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave}>Salvar Orçamentos</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};