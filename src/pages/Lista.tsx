import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Tag, Plus, GripVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AddItemDialog } from "@/components/AddItemDialog";
import { ItemActionDialog } from "@/components/ItemActionDialog";
import { CategoryManagerDialog } from "@/components/CategoryManagerDialog";
import { useAppContext } from "@/context/AppContext";
import { useShoppingListInteractions } from "@/hooks/useShoppingListInteractions";

const LoadingSkeleton = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-md mx-auto space-y-4">
            <Skeleton className="h-10 w-full" />
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
    
    // 1. Usar o hook renomeado e pegar os dados corretos
    const { items, isLoadingItems, updateItem, deleteItem } = useAppContext();
    
    // 2. O hook de interações agora só precisa dos itens para funcionar
    const {
        groupedItems,
        selectedItem,
        groupBy,
        setGroupBy,
        showAddDialog, setShowAddDialog,
        showActionDialog, setShowActionDialog,
        showCategoryManager, setShowCategoryManager,
        handleItemClick,
    } = useShoppingListInteractions(items);
    
    if (isLoadingItems) {
        return <LoadingSkeleton />;
    }
    
    const totalSpent = items.filter(item => item.purchased && item.price).reduce((sum, item) => sum + (item.price! * item.quantity), 0);
    const remainingBalance = 500 - totalSpent;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="bg-white shadow-sm border-b sticky top-0 z-10">
                <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <h1 className="text-xl font-bold text-gray-800">Lista de Compras</h1>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setShowCategoryManager(true)}>
                        <Tag className="h-4 w-4 mr-2"/>
                        Categorias
                    </Button>
                </div>
            </div>

            <div className="max-w-md mx-auto px-4 py-6">
                <Card className="mb-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white border-0">
                  <CardContent className="p-4">
                    <div className="text-sm text-green-100 mb-1">Você ainda tem</div>
                    <div className="text-2xl font-bold">R$ {remainingBalance.toFixed(2)}</div>
                    <div className="text-sm text-green-100">do seu orçamento</div>
                  </CardContent>
                </Card>

                <div className="flex space-x-2 mb-4">
                  <Button variant={groupBy === 'none' ? 'default' : 'outline'} size="sm" onClick={() => setGroupBy('none')}>
                    Lista
                  </Button>
                  <Button variant={groupBy === 'category' ? 'default' : 'outline'} size="sm" onClick={() => setGroupBy('category')}>
                    Por Categoria
                  </Button>
                </div>

                <div className="space-y-4">
                    {Object.entries(groupedItems).map(([groupKey, groupItems]) => (
                        <div key={groupKey}>
                            {/* ... Lógica de renderização dos grupos ... */}
                            <div className="space-y-3">
                                {groupItems.map((item) => (
                                    <Card key={item.id} onClick={() => handleItemClick(item)}>
                                        <CardContent className="p-4 flex items-center justify-between">
                                            <div>
                                                <p className={`${item.purchased ? 'line-through text-gray-500' : ''}`}>{item.name}</p>
                                                <p className="text-sm text-gray-500">Qtd: {item.quantity}</p>
                                            </div>
                                            {item.purchased && item.price && <p className="text-green-600">R$ {item.price.toFixed(2)}</p>}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {items.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-lg mb-2">Sua lista está vazia</div>
                        <div className="text-gray-500 text-sm">Use o botão + para adicionar itens.</div>
                    </div>
                )}
            </div>

            <Button className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg" onClick={() => setShowAddDialog(true)}>
                <Plus className="h-6 w-6" />
            </Button>

            <AddItemDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
            {selectedItem && (
                <ItemActionDialog open={showActionDialog} onOpenChange={setShowActionDialog} item={selectedItem} onUpdateItem={updateItem} onDeleteItem={deleteItem} />
            )}
            <CategoryManagerDialog open={showCategoryManager} onOpenChange={setShowCategoryManager} />
        </div>
    );
};

export default Lista;