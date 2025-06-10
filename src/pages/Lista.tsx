import React, { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Tag, Plus, GripVertical, MessageSquare, Users, Camera, Loader2, PiggyBank, Edit } from "lucide-react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { AddItemDialog } from "@/components/AddItemDialog";
import { ScanAddDialog } from "@/components/ScanAddDialog";
import { ItemActionDialog } from "@/components/ItemActionDialog";
import { CategoryManagerDialog } from "@/components/CategoryManagerDialog";
import { ItemCommentsDialog } from "@/components/ItemCommentsDialog";
import { AddMemberDialog } from "@/components/AddMemberDialog";
import { useAppContext } from "@/context/AppContext";
import { useShoppingListInteractions } from "@/hooks/useShoppingListInteractions";
import { ListItem, ShoppingList } from "@/types/shopping";
import { MemberBadge } from "@/components/MemberBadge";
import { AssignmentBadge } from "@/components/AssignmentBadge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

// Componente do Card de Orçamento (sem alterações)
const BudgetCard = ({ list, items, onUpdateBudget }: { list: ShoppingList, items: ListItem[], onUpdateBudget: (vars: {listId: string, budget: number}) => void }) => {
    const totalSpent = useMemo(() => {
        return items
            .filter(item => item.purchased && item.price)
            .reduce((sum, item) => sum + (item.price! * item.quantity), 0);
    }, [items]);

    const budget = list.budget || 0;
    const remainingBalance = budget - totalSpent;
    const progress = budget > 0 ? (totalSpent / budget) * 100 : 0;

    const handleSetBudget = () => {
        const newBudgetStr = prompt("Defina o orçamento para esta lista:", budget.toString());
        if (newBudgetStr) {
            const newBudget = parseFloat(newBudgetStr);
            if (!isNaN(newBudget) && newBudget >= 0) {
                onUpdateBudget({ listId: list.id, budget: newBudget });
            } else {
                toast.error("Por favor, insira um valor numérico válido.");
            }
        }
    };

    return (
        <Card className="mb-4">
            <CardContent className="p-4">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                        <PiggyBank className="h-5 w-5 text-green-600" />
                        Orçamento da Lista
                    </h3>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleSetBudget}>
                        <Edit className="h-4 w-4 text-gray-500" />
                    </Button>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                        <p className="text-xs text-gray-500">Total Gasto</p>
                        <p className="text-lg font-bold text-red-600">R$ {totalSpent.toFixed(2)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Saldo Restante</p>
                        <p className={`text-lg font-bold ${remainingBalance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                            R$ {remainingBalance.toFixed(2)}
                        </p>
                    </div>
                </div>
                {budget > 0 && (
                    <div className="mt-3">
                        <Progress value={progress} className="h-2" />
                        <div className="text-xs text-gray-500 text-right mt-1">
                            {Math.min(100, progress).toFixed(0)}% de R$ {budget.toFixed(2)}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

// Componente do Card de Item (sem alterações)
interface ListItemCardProps {
    item: ListItem;
    isDragged: boolean;
    onItemClick: (item: ListItem) => void;
    onCommentClick: (item: ListItem) => void;
    onDragStart: React.DragEventHandler<HTMLDivElement>;
    onDragOver: React.DragEventHandler<HTMLDivElement>;
    onDrop: React.DragEventHandler<HTMLDivElement>;
}

const ListItemCard = React.memo(({ item, isDragged, onItemClick, onCommentClick, onDragStart, onDragOver, onDrop }: ListItemCardProps) => {
    const { members } = useAppContext();
    const handleCommentButtonClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onCommentClick(item);
    };
    return (
        <Card
            onClick={() => onItemClick(item)}
            className="mb-2 cursor-pointer"
            draggable
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDrop={onDrop}
            style={{ opacity: isDragged ? 0.5 : 1 }}
        >
            <CardContent className="p-3 flex items-center gap-3">
                <GripVertical className="h-5 w-5 text-gray-400 cursor-grab" />
                <div className="flex-1">
                    <p className={`${item.purchased ? 'line-through text-gray-500' : ''}`}>{item.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm text-gray-500">Qtd: {item.quantity}</p>
                        {item.user_id && members.length > 1 && <MemberBadge userId={item.user_id} />}
                    </div>
                </div>
                {item.assigned_to_user_id && <AssignmentBadge userId={item.assigned_to_user_id} />}
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCommentButtonClick}>
                    <MessageSquare className="h-5 w-5 text-gray-600" />
                </Button>
            </CardContent>
        </Card>
    );
});
ListItemCard.displayName = 'ListItemCard';

// Componente de Skeleton (sem alterações)
const LoadingSkeleton = () => (
    <div className="p-4 max-w-md mx-auto space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
    </div>
);

// Componente Principal da Página
const Lista = () => {
    const navigate = useNavigate();
    const { listId } = useParams<{ listId: string }>();

    const {
        shoppingLists,
        isLoadingLists,
        items,
        isLoadingItems,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        updateItem,
        deleteItem,
        updateItemsOrder,
        members,
        switchActiveList,
        updateListBudget,
    } = useAppContext();

    const [showAddDialog, setShowAddDialog] = useState(false);
    const [showScanAddDialog, setShowScanAddDialog] = useState(false);
    const [showActionDialog, setShowActionDialog] = useState(false);
    const [showCategoryManager, setShowCategoryManager] = useState(false);
    const [showCommentsDialog, setShowCommentsDialog] = useState(false);
    const [showMemberDialog, setShowMemberDialog] = useState(false);
    const [selectedItem, setSelectedItem] = useState<ListItem | null>(null);

    const observerRef = useRef<HTMLDivElement | null>(null);
    const activeList = shoppingLists.find(list => list.id === listId);

    const {
        groupedItems, draggedItem, groupBy, setGroupBy,
        getCategoryName, getCategoryColor,
        handleDragStart, handleDragOver, handleDrop
    } = useShoppingListInteractions(items, updateItemsOrder);

    // ✅ CORREÇÃO: MOVIDO OS HOOKS PARA O TOPO, ANTES DOS RETORNOS ANTECIPADOS
    const handleItemClick = useCallback((item: ListItem) => {
        setSelectedItem(item);
        setShowActionDialog(true);
    }, []);

    const handleCommentClick = useCallback((item: ListItem) => {
        setSelectedItem(item);
        setShowCommentsDialog(true);
    }, []);

    useEffect(() => {
        if (activeList) {
            switchActiveList(activeList);
        }
        return () => {
            switchActiveList(null);
        };
    }, [activeList, switchActiveList]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const firstEntry = entries[0];
                if (firstEntry.isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            },
            { threshold: 1.0 }
        );

        if (observerRef.current) {
            observer.observe(observerRef.current);
        }

        return () => {
            if (observerRef.current) {
                observer.unobserve(observerRef.current);
            }
        };
    }, [hasNextPage, fetchNextPage, isFetchingNextPage]);

    // Lógica de Retorno Antecipado (agora segura)
    if (isLoadingLists || !listId) {
        return <LoadingSkeleton />;
    }

    if (!activeList) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 text-center">
                <div>
                    <h2 className="text-xl font-semibold text-gray-700">Lista não encontrada</h2>
                    <p className="text-gray-500 mt-2">A lista que você está procurando não existe ou foi removida.</p>
                    <Button asChild className="mt-4">
                        <Link to="/listas">Voltar para minhas listas</Link>
                    </Button>
                </div>
            </div>
        );
    }
    
    if (isLoadingItems && items.length === 0) {
        return <LoadingSkeleton />;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm border-b sticky top-0 z-10">
                <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/listas')}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-lg font-bold truncate" title={activeList.name}>{activeList.name}</h1>
                    <div className="flex items-center gap-1">
                        <Button variant="outline" size="icon" onClick={() => setShowScanAddDialog(true)}>
                            <Camera className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setShowMemberDialog(true)}>
                            <Users className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">{members.length}</span>
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setShowCategoryManager(true)}>
                            <Tag className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">Categorias</span>
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-md mx-auto px-4 py-6">
                <BudgetCard list={activeList} items={items} onUpdateBudget={updateListBudget} />

                <div className="flex space-x-2 mb-4">
                    <Button variant={groupBy === 'none' ? 'default' : 'outline'} size="sm" onClick={() => setGroupBy('none')}>Lista</Button>
                    <Button variant={groupBy === 'category' ? 'default' : 'outline'} size="sm" onClick={() => setGroupBy('category')}>Por Categoria</Button>
                </div>

                <div className="space-y-4">
                    {Object.entries(groupedItems).map(([groupKey, groupItems]) => (
                        <div key={groupKey}>
                            {groupBy === 'category' && groupKey !== 'all' && <h2 className="font-semibold text-gray-700 mb-2 flex items-center gap-2"><div className={`w-3 h-3 rounded-full ${getCategoryColor(groupKey)}`} />{getCategoryName(groupKey)}</h2>}
                            
                            {Array.isArray(groupItems) && groupItems.map((item: ListItem) => (
                                <ListItemCard
                                    key={item.id}
                                    item={item}
                                    isDragged={draggedItem?.id === item.id}
                                    onItemClick={handleItemClick}
                                    onCommentClick={handleCommentClick}
                                    onDragStart={(e) => handleDragStart(e, item)}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, item)}
                                />
                            ))}
                        </div>
                    ))}
                </div>

                <div ref={observerRef} className="h-1" />
                {isFetchingNextPage && (
                    <div className="flex justify-center items-center p-4">
                        <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                        <span className="ml-2 text-gray-500">Carregando mais...</span>
                    </div>
                )}


                {items.length === 0 && !isLoadingItems && <p className="text-center text-gray-500 py-10">Sua lista está vazia.</p>}
            </main>

            <Button className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-blue-600 text-white shadow-lg" onClick={() => setShowAddDialog(true)}><Plus className="h-6 w-6" /></Button>

            <AddItemDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
            <ScanAddDialog open={showScanAddDialog} onOpenChange={setShowScanAddDialog} />
            {selectedItem && <ItemActionDialog open={showActionDialog} onOpenChange={setShowActionDialog} item={selectedItem} onUpdateItem={updateItem} onDeleteItem={deleteItem} />}
            {selectedItem && <ItemCommentsDialog open={showCommentsDialog} onOpenChange={setShowCommentsDialog} item={selectedItem} />}
            <CategoryManagerDialog open={showCategoryManager} onOpenChange={setShowCategoryManager} />
            <AddMemberDialog open={showMemberDialog} onOpenChange={setShowMemberDialog} />
        </div>
    );
};
export default Lista;