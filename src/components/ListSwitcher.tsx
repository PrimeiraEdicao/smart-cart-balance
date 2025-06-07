import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
  SelectSeparator
} from "@/components/ui/select";
import { useAppContext } from "@/context/AppContext";
import { Button } from "./ui/button";
import { PlusCircle, Trash2, Edit } from "lucide-react";

export const ListSwitcher = () => {
  const { 
    shoppingLists, 
    activeList, 
    switchActiveList, 
    createList,
    updateList, // <-- Nova função
    deleteList,
    user 
  } = useAppContext();

  const handleCreateList = () => {
    const name = prompt("Qual o nome da nova lista?");
    if (name) {
      createList(name);
    }
  };

  const handleEditList = (e: React.MouseEvent, listId: string, currentName: string) => {
    e.stopPropagation(); // Impede que o select seja aberto/fechado
    const newName = prompt("Digite o novo nome para a lista:", currentName);
    if (newName && newName.trim() !== "") {
      updateList(listId, newName);
    }
  }

  const handleDeleteList = (e: React.MouseEvent, listId: string) => {
    e.stopPropagation(); 
    if (confirm("Tem certeza que deseja apagar esta lista? Esta ação não pode ser desfeita.")) {
      deleteList(listId);
    }
  };

  const handleValueChange = (listId: string) => {
    if (listId === 'create-new') {
      handleCreateList();
      return;
    }
    const listToSwitch = shoppingLists.find(l => l.id === listId);
    if (listToSwitch) {
      switchActiveList(listToSwitch);
    }
  };

  return (
    <Select value={activeList?.id || ""} onValueChange={handleValueChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Selecione ou crie uma lista" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Minhas Listas</SelectLabel>
          {shoppingLists.map((list) => (
            <SelectItem key={list.id} value={list.id}>
              <div className="flex items-center justify-between w-full">
                  <span className="flex-1 truncate">{list.name}</span>
                  {list.owner_id === user?.id && (
                      <div className="flex">
                           <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 hover:bg-yellow-100"
                              onClick={(e) => handleEditList(e, list.id, list.name)}
                          >
                              <Edit className="h-3 w-3 text-yellow-600" />
                          </Button>
                          <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 hover:bg-red-100"
                              onClick={(e) => handleDeleteList(e, list.id)}
                          >
                              <Trash2 className="h-3 w-3 text-red-500" />
                          </Button>
                      </div>
                  )}
              </div>
            </SelectItem>
          ))}
        </SelectGroup>
        <SelectSeparator />
        <SelectItem value="create-new" className="text-blue-600 font-medium">
          <div className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Criar nova lista
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
};