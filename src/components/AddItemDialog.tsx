import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { toast } from "sonner";
import { ListItem } from "@/types/shopping";
import { cn } from "@/lib/utils";


interface AddItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddItemDialog = ({ open, onOpenChange }: AddItemDialogProps) => {
  const { addItem, categories, getHistoricItemNames } = useAppContext();
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [popoverOpen, setPopoverOpen] = useState(false);

  // Busca os nomes dos itens do histórico
  const { data: historicNames = [] } = getHistoricItemNames();

  useEffect(() => {
    // Reseta o estado quando o diálogo é fechado
    if (!open) {
      setName("");
      setQuantity("1");
      setCategoryId(undefined);
    }
  }, [open]);

  const handleAddItem = () => {
    if (!name.trim()) {
      toast.error("O nome do item não pode estar vazio.");
      return;
    }

    const newItem: Partial<ListItem> = {
      name: name.trim(),
      quantity: parseInt(quantity, 10) || 1,
      purchased: false,
      categoryId: categoryId === "none" ? undefined : categoryId,
    };

    addItem(newItem);
    onOpenChange(false); // Fecha o diálogo
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Item</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label htmlFor="name">Nome do Item</Label>
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={popoverOpen}
                        className="w-full justify-between mt-1 font-normal"
                    >
                        {name || "Selecione ou digite um item..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command>
                        <CommandInput 
                          placeholder="Buscar ou criar item..."
                          value={name}
                          onValueChange={setName}
                        />
                        <CommandList>
                            <CommandEmpty>Nenhum item encontrado. Pressione Enter para criar.</CommandEmpty>
                            <CommandGroup>
                                {historicNames.map((historicName) => (
                                    <CommandItem
                                        key={historicName}
                                        value={historicName}
                                        onSelect={(currentValue) => {
                                            setName(currentValue === name ? "" : currentValue);
                                            setPopoverOpen(false);
                                        }}
                                    >
                                        <Check className={cn("mr-2 h-4 w-4", name === historicName ? "opacity-100" : "opacity-0")} />
                                        {historicName}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantity">Quantidade</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="category">Categoria</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem Categoria</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex space-x-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleAddItem} className="flex-1">
              Adicionar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};