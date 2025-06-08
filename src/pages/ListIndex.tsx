import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, PlusCircle, Star, Trash2, Edit } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const LoadingSkeleton = () => (
    <div className="space-y-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
    </div>
);

export const ListIndex = () => {
    const navigate = useNavigate();
    const { 
        shoppingLists, 
        isLoadingLists, 
        createList, 
        deleteList, 
        updateList,
        toggleFavoriteList 
    } = useAppContext();

    const handleCreateList = () => {
        const today = new Date().toLocaleDateString('pt-BR', {
            day: '2-digit', month: 'long', year: 'numeric'
        });
        const defaultName = `Lista de ${today}`;
        createList(defaultName);
    };

    const handleEditName = (e: React.MouseEvent, list: {id: string, name: string}) => {
        e.stopPropagation();
        const newName = prompt("Digite o novo nome para a lista:", list.name);
        if (newName && newName.trim() !== "") {
            updateList(list.id, newName.trim());
        }
    };
    
    const handleDeleteList = (e: React.MouseEvent, listId: string) => {
        e.stopPropagation();
        if (confirm("Tem certeza que deseja apagar esta lista? Esta ação não pode ser desfeita.")) {
            deleteList(listId);
            toast.success("Lista removida com sucesso.");
        }
    };

    const handleToggleFavorite = (e: React.MouseEvent, listId: string, isFavorited: boolean) => {
        e.stopPropagation();
        toggleFavoriteList(listId, isFavorited);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm border-b sticky top-0 z-10">
                <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
                    <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-lg font-bold">Minhas Listas</h1>
                    <Button variant="ghost" size="icon" onClick={handleCreateList}>
                        <PlusCircle className="h-6 w-6 text-blue-600" />
                    </Button>
                </div>
            </header>

            <main className="max-w-md mx-auto px-4 py-6 space-y-4">
                {isLoadingLists ? (
                    <LoadingSkeleton />
                ) : (
                    <>
                        {shoppingLists.map(list => (
                            <Card key={list.id} onClick={() => navigate(`/lista/${list.id}`)} className="cursor-pointer hover:bg-gray-100 transition-colors">
                                <CardContent className="p-4 flex items-center gap-4">
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-800">{list.name}</p>
                                        <p className="text-sm text-gray-500">
                                            Criada em: {new Date(list.created_at).toLocaleDateString('pt-BR')}
                                        </p>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={(e) => handleToggleFavorite(e, list.id, list.is_favorited)}>
                                        <Star className={`h-5 w-5 ${list.is_favorited ? 'text-yellow-400 fill-current' : 'text-gray-400'}`} />
                                    </Button>
                                     <Button variant="ghost" size="icon" onClick={(e) => handleEditName(e, list)}>
                                        <Edit className="h-4 w-4 text-gray-500" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={(e) => handleDeleteList(e, list.id)}>
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </>
                )}
                 { !isLoadingLists && shoppingLists.length === 0 && (
                    <div className="text-center py-16 text-gray-500">
                        <h3 className="text-lg font-semibold">Nenhuma lista encontrada</h3>
                        <p className="text-sm mt-2">Clique no ícone de '+' acima para criar sua primeira lista de compras.</p>
                    </div>
                )}
            </main>
        </div>
    );
};