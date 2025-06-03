
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { defaultCategories } from "@/data/categories";

interface AddItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddItem: (name: string, quantity: number, categoryId?: string) => void;
}

const commonItems = [
  "Arroz", "Feijão", "Açúcar", "Sal", "Óleo", "Leite", "Ovos", "Pão",
  "Banana", "Maçã", "Tomate", "Cebola", "Alho", "Batata", "Carne", "Frango"
];

export const AddItemDialog = ({ open, onOpenChange, onAddItem }: AddItemDialogProps) => {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleNameChange = (value: string) => {
    setName(value);
    if (value.length > 0) {
      const filtered = commonItems.filter(item => 
        item.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  };

  const handleSubmit = () => {
    if (name && quantity) {
      onAddItem(name, parseInt(quantity), categoryId || undefined);
      setName("");
      setQuantity("");
      setCategoryId("");
      setSuggestions([]);
      onOpenChange(false);
    }
  };

  const selectSuggestion = (suggestion: string) => {
    setName(suggestion);
    setSuggestions([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Item</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Nome do Item</Label>
            <Input
              id="name"
              placeholder="Ex: Arroz, Feijão..."
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="mt-1"
            />
            {suggestions.length > 0 && (
              <div className="mt-2 bg-white border border-gray-200 rounded-md shadow-sm max-h-32 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                    onClick={() => selectSuggestion(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="category">Categoria</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {defaultCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${category.color}`} />
                      <span>{category.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="quantity">Quantidade</Label>
            <Input
              id="quantity"
              type="number"
              placeholder="1"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="mt-1"
            />
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleSubmit} className="flex-1" disabled={!name || !quantity}>
              Salvar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
