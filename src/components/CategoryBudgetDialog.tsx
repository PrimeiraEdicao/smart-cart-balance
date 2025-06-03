
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PiggyBank, Wallet } from "lucide-react";
import { Category } from "@/types/shopping";
import { defaultCategories } from "@/data/categories";

interface CategoryBudgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryBudgets: { categoryId: string; budget: number }[];
  onUpdateBudgets: (budgets: { categoryId: string; budget: number }[]) => void;
}

export const CategoryBudgetDialog = ({ 
  open, 
  onOpenChange, 
  categoryBudgets, 
  onUpdateBudgets 
}: CategoryBudgetDialogProps) => {
  const [budgets, setBudgets] = useState<{ [key: string]: string }>(() => {
    const initialBudgets: { [key: string]: string } = {};
    categoryBudgets.forEach(cb => {
      initialBudgets[cb.categoryId] = cb.budget.toString();
    });
    return initialBudgets;
  });

  const handleBudgetChange = (categoryId: string, value: string) => {
    setBudgets(prev => ({ ...prev, [categoryId]: value }));
  };

  const handleSave = () => {
    const updatedBudgets = Object.entries(budgets)
      .filter(([_, budget]) => budget && parseFloat(budget) > 0)
      .map(([categoryId, budget]) => ({ categoryId, budget: parseFloat(budget) }));
    
    onUpdateBudgets(updatedBudgets);
    onOpenChange(false);
  };

  const getBudgetForCategory = (categoryId: string) => {
    return budgets[categoryId] || '';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <PiggyBank className="h-5 w-5 text-green-600" />
            <span>Orçamento por Categoria</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 min-h-0">
          {defaultCategories.map((category) => (
            <div key={category.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className={`w-4 h-4 rounded-full ${category.color}`} />
              <div className="flex-1">
                <Label className="text-sm font-medium">{category.name}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Wallet className="h-4 w-4 text-gray-500" />
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={getBudgetForCategory(category.id)}
                  onChange={(e) => handleBudgetChange(category.id, e.target.value)}
                  className="w-20 text-right"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Cancelar
          </Button>
          <Button onClick={handleSave} className="flex-1">
            Salvar Orçamentos
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
