import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Tag, Plus, GripVertical, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AddItemDialog } from "@/components/AddItemDialog";
import { ItemActionDialog } from "@/components/ItemActionDialog";
import { CategoryManagerDialog } from "@/components/CategoryManagerDialog";
import { ItemCommentsDialog } from "@/components/ItemCommentsDialog";
import { useAppContext } from "@/context/AppContext";
import { useShoppingListInteractions } from "@/hooks/useShoppingListInteractions";

const LoadingSkeleton = () => (
    <div className="p-4"><div className="max-w-md mx-auto space-y-4"><Skeleton className="h-10 w-full" /><Skeleton className="h-24 w-full" /><Skeleton className="h-10 w-40" /><Skeleton className="h-28 w-full" /><Skeleton className="h-28 w-full" /></div></div>
);

const Lista = () => {
    const navigate = useNavigate();
    const { items, isLoadingItems, updateItem, deleteItem, updateItemsOrder } = useAppContext();
    
    const {
        groupedItems, draggedItem, selectedItem, groupBy, setGroupBy,
        showAddDialog, setShowAddDialog,
        showActionDialog, setShowActionDialog,
        showCategoryManager, setShowCategoryManager,
        showCommentsDialog, setShowCommentsDialog,
        getCategoryName, getCategoryColor, handleItemClick, handleCommentClick,
        handleDragStart, handleDragOver, handleDrop
    } = useShoppingListInteractions(items, updateItemsOrder);
    
    if (isLoadingItems) return <LoadingSkeleton />;
    
    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm border-b sticky top-0 z-10">
                <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5" /></Button>
                    <h1 className="text-lg font-bold">Lista de Compras</h1>
                    <Button variant="outline" size="sm" onClick={() => setShowCategoryManager(true)}><Tag className="h-4 w-4 mr-2"/>Categorias</Button>
                </div>
            </header>

            <main className="max-w-md mx-auto px-4 py-6">
                <div className="space-y-4">
                    {Object.entries(groupedItems).map(([groupKey, groupItems]) => (
                        <div key={groupKey}>
                            {groupBy === 'category' && <h2 className="font-semibold text-gray-700 mb-2 flex items-center gap-2"><div className={`w-3 h-3 rounded-full ${getCategoryColor(groupKey)}`} />{getCategoryName(groupKey) || 'Outros'}</h2>}
                            {groupItems.map((item) => (
                                <Card key={item.id} onClick={() => handleItemClick(item)} className="mb-2" draggable onDragStart={(e) => handleDragStart(e, item)} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, item)} style={{ opacity: draggedItem?.id === item.id ? 0.5 : 1 }}>
                                    <CardContent className="p-3 flex items-center gap-3">
                                        <GripVertical className="h-5 w-5 text-gray-400 cursor-grab" />
                                        <div className="flex-1">
                                            <p className={`${item.purchased ? 'line-through text-gray-500' : ''}`}>{item.name}</p>
                                            <p className="text-sm text-gray-500">Qtd: {item.quantity}</p>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleCommentClick(item); }}>
                                            <MessageSquare className="h-5 w-5 text-gray-600"/>
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ))}
                </div>
                 {items.length === 0 && <p className="text-center text-gray-500 py-10">Sua lista está vazia.</p>}
            </main>

            <Button className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-blue-600 text-white shadow-lg" onClick={() => setShowAddDialog(true)}><Plus className="h-6 w-6" /></Button>

            <AddItemDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
            {selectedItem && <ItemActionDialog open={showActionDialog} onOpenChange={setShowActionDialog} item={selectedItem} onUpdateItem={updateItem} onDeleteItem={deleteItem} />}
            {selectedItem && <ItemCommentsDialog open={showCommentsDialog} onOpenChange={setShowCommentsDialog} item={selectedItem} />}
            <CategoryManagerDialog open={showCategoryManager} onOpenChange={setShowCategoryManager} />
        </div>
    );
};
export default Lista;