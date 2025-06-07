// src/components/ListSwitcher.tsx

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
import { PlusCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const ListSwitcher = () => {
  const { 
    shoppingLists, 
    activeList, 
    switchActiveList, 
    createList,
    deleteList,
    user 
  } = useAppContext();

  const handleCreateList = () => {
    const name = prompt("Qual o nome da nova lista?");
    if (name) {
      createList(name);
    }
  };

  const handleDeleteList = (e: React.MouseEvent, listId: string) => {
    e.stopPropagation(); // Impede que o select seja aberto
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
    <Select value={activeList?.id} onValueChange={handleValueChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Selecione uma lista" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Minhas Listas</SelectLabel>
          {shoppingLists.map((list) => (
            <SelectItem key={list.id} value={list.id} className="flex items-center justify-between">
              <div className="flex-1">{list.name}</div>
              {list.owner_id === user?.id && list.id !== activeList?.id && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 ml-2 hover:bg-red-100"
                    onClick={(e) => handleDeleteList(e, list.id)}
                  >
                    <Trash2 className="h-3 w-3 text-red-500" />
                  </Button>
              )}
            </SelectItem>
          ))}
        </SelectGroup>
        <SelectSeparator />
        <SelectItem value="create-new" className="text-blue-600">
          <div className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Criar nova lista
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
};