
import { Card, CardContent } from "@/components/ui/card";
import { ListItem } from "@/types/shopping";
import { defaultCategories } from "@/data/categories";

interface CategorySpendingCardProps {
  items: ListItem[];
  categoryBudgets: { categoryId: string; budget: number }[];
}

export const CategorySpendingCard = ({ items, categoryBudgets }: CategorySpendingCardProps) => {
  const getCategorySpending = (categoryId: string) => {
    return items
      .filter(item => item.categoryId === categoryId && item.purchased && item.price)
      .reduce((sum, item) => sum + (item.price! * item.quantity), 0);
  };

  const getCategoryBudget = (categoryId: string) => {
    const budget = categoryBudgets.find(cb => cb.categoryId === categoryId);
    return budget ? budget.budget : 0;
  };

  const categoriesWithSpending = defaultCategories
    .map(category => ({
      ...category,
      spent: getCategorySpending(category.id),
      budget: getCategoryBudget(category.id)
    }))
    .filter(category => category.spent > 0 || category.budget > 0);

  if (categoriesWithSpending.length === 0) {
    return null;
  }

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <h3 className="font-semibold text-gray-800 mb-3">Gastos por Categoria</h3>
        <div className="space-y-3">
          {categoriesWithSpending.map((category) => (
            <div key={category.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${category.color}`} />
                <span className="text-sm text-gray-700">{category.name}</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">
                  R$ {category.spent.toFixed(2)}
                </div>
                {category.budget > 0 && (
                  <div className="text-xs text-gray-500">
                    de R$ {category.budget.toFixed(2)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
