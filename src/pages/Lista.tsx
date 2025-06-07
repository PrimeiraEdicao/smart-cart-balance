import React, { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Tag, Plus, GripVertical, MessageSquare, Users, Camera, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AddItemDialog } from "@/components/AddItemDialog";
import { ScanAddDialog } from "@/components/ScanAddDialog";
import { ItemActionDialog } from "@/components/ItemActionDialog";
import { CategoryManagerDialog } from "@/components/CategoryManagerDialog";
import { ItemCommentsDialog } from "@/components/ItemCommentsDialog";
import { AddMemberDialog } from "@/components/AddMemberDialog";
import { useAppContext } from "@/context/AppContext";
import { useShoppingListInteractions } from "@/hooks/useShoppingListInteractions";
import { ListItem } from "@/types/shopping";
import { MemberBadge } from "@/components/MemberBadge";
import { AssignmentBadge } from "@/components/AssignmentBadge";

// ... (Componente ListItemCard memorizado - sem alterações)
interface ListItemCardProps {
    item: ListItem;
    isDragged: boolean;
    onItemClick: (item: ListItem) => void;
    onCommentClick: (item: ListItem) => void;
    onDragStart: React.DragEventHandler<HTMLDivElement>;
    onDragOver: React.DragEventHandler<HTMLDivElement>;
    onDrop: React.DragEventHandler<HTMLDivElement>;
}

const ListItemCard = React.memo(({ 
    item, 
    isDragged, 
    onItemClick, 
    onCommentClick, 
    onDragStart, 
    onDragOver, 
    onDrop 
}: ListItemCardProps) => {
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
                
                {/* ✅ Lógica para exibir o avatar de atribuição */}
                {item.assigned_to_user_id && <AssignmentBadge userId={item.assigned_to_user_id} />}

                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCommentButtonClick}>
                    <MessageSquare className="h-5 w-5 text-gray-600"/>
                </Button>
            </CardContent>
        </Card>
    );
});
ListItemCard.displayName = 'ListItemCard';


const LoadingSkeleton = () => (
    <div className="p-4"><div className="max-w-md mx-auto space-y-4"><Skeleton className="h-10 w-full" /><Skeleton className="h-24 w-full" /><Skeleton className="h-10 w-40" /><Skeleton className="h-28 w-full" /><Skeleton className="h-28 w-full" /></div></div>
);

const Lista = () => {
    const navigate = useNavigate();
    // ✅ 1. Obter as novas propriedades do contexto
    const { 
        items, 
        isLoadingItems, 
        fetchNextPage, 
        hasNextPage, 
        isFetchingNextPage,
        updateItem, 
        deleteItem, 
        updateItemsOrder, 
        activeList, 
        members 
    } = useAppContext();
    
    // ... (states e hooks sem alterações)
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [showScanAddDialog, setShowScanAddDialog] = useState(false);
    const [showActionDialog, setShowActionDialog] = useState(false);
    const [showCategoryManager, setShowCategoryManager] = useState(false);
    const [showCommentsDialog, setShowCommentsDialog] = useState(false);
    const [showMemberDialog, setShowMemberDialog] = useState(false); 
    const [selectedItem, setSelectedItem] = useState<ListItem | null>(null);
    
    const {
        groupedItems, draggedItem, groupBy, setGroupBy,
        getCategoryName, getCategoryColor,
        handleDragStart, handleDragOver, handleDrop
    } = useShoppingListInteractions(items, updateItemsOrder);

    // ✅ 2. Criar uma referência para o observador de interseção
    const observerRef = useRef<HTMLDivElement | null>(null);

    // ✅ 3. Configurar o efeito para o observador
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
    
    if (isLoadingItems && items.length === 0) return <LoadingSkeleton />;
    if (!activeList) return <div className="p-4 text-center">Selecione uma lista para começar.</div>;

    const handleItemClick = useCallback((item: ListItem) => {
        setSelectedItem(item);
        setShowActionDialog(true);
    }, []);

    const handleCommentClick = useCallback((item: ListItem) => {
        setSelectedItem(item);
        setShowCommentsDialog(true);
    }, []);


    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header (sem alterações) */}
            <header className="bg-white shadow-sm border-b sticky top-0 z-10">
                <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5" /></Button>
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
                            <Tag className="h-4 w-4 sm:mr-2"/>
                            <span className="hidden sm:inline">Categorias</span>
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-md mx-auto px-4 py-6">
                <div className="flex space-x-2 mb-4">
                  <Button variant={groupBy === 'none' ? 'default' : 'outline'} size="sm" onClick={() => setGroupBy('none')}>Lista</Button>
                  <Button variant={groupBy === 'category' ? 'default' : 'outline'} size="sm" onClick={() => setGroupBy('category')}>Por Categoria</Button>
                </div>

                <div className="space-y-4">
                    {Object.entries(groupedItems).map(([groupKey, groupItems]) => (
                        <div key={groupKey}>
                            {groupBy === 'category' && groupKey !== 'all' && <h2 className="font-semibold text-gray-700 mb-2 flex items-center gap-2"><div className={`w-3 h-3 rounded-full ${getCategoryColor(groupKey)}`} />{getCategoryName(groupKey)}</h2>}
                            {groupItems.map((item: ListItem) => (
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

                 {/* ✅ 4. Adicionar o gatilho e o indicador de carregamento */}
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

            {/* Dialogs (sem alterações) */}
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