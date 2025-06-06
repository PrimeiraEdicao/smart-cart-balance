import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Tag, Plus, GripVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AddItemDialog } from "@/components/AddItemDialog";
import { ItemActionDialog } from "@/components/ItemActionDialog";
import { CategoryManagerDialog } from "@/components/CategoryManagerDialog";
import { useShopping } from "@/context/AppContext";
import { useShoppingListInteractions } from "@/hooks/useShoppingListInteractions";
import { ListItem } from "@/types/shopping";

const LoadingSkeleton = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-md mx-auto space-y-4">
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
        </div>
    </div>
);

const Lista = () => {
    const navigate = useNavigate();

    const { items, isLoadingItems, updateItem, deleteItem } = useShopping();

    const {
        groupedItems,
        draggedItem,
        selectedItem,
        groupBy,
        setGroupBy,
        showAddDialog, setShowAddDialog,
        showActionDialog, setShowActionDialog,
        showCategoryManager, setShowCategoryManager,
        handleDragStart, handleDragOver, handleDrop,
        getCategoryName, getCategoryColor,
        handleMouseDown, handleMouseUp,
        handleItemClick, handleItemDoubleClick,
    } = useShoppingListInteractions(items);

    // As funções adaptadoras 'handleAddItem' e 'handleUpdateItem' foram REMOVIDAS
    
    if (isLoadingItems) {
        return <LoadingSkeleton />;
    }
    
    // ... (cálculos de totalSpent, remainingBalance)

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* ... Header ... */}

            <div className="max-w-md mx-auto px-4 py-6">
                {/* ... Restante do JSX ... */}
            </div>

            {/* Floating Add Button */}
            <Button className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg" onClick={() => setShowAddDialog(true)}>
                <Plus className="h-6 w-6" />
            </Button>

            {/* Dialogs */}
            <AddItemDialog open={showAddDialog} onOpenChange={setShowAddDialog} />

            {selectedItem && (
                <ItemActionDialog
                    open={showActionDialog}
                    onOpenChange={setShowActionDialog}
                    item={selectedItem}
                    onUpdateItem={updateItem} // Passamos a função 'updateItem' DIRETAMENTE
                    onDeleteItem={deleteItem}
                />
            )}
            
            <CategoryManagerDialog open={showCategoryManager} onOpenChange={setShowCategoryManager} />
        </div>
    );
};

export default Lista;