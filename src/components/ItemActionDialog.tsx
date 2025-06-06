import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Edit, Camera, Trash2 } from "lucide-react";
import { ListItem } from "@/types/shopping";
import { BarcodeDialog } from "./BarcodeDialog";
import { supabase } from "@/lib/supabase";

interface ItemActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: ListItem;
  onUpdateItem: (variables: { id: string } & Partial<ListItem>) => void;
  onDeleteItem: (id: string) => void;
}

export const ItemActionDialog = ({ open, onOpenChange, item, onUpdateItem, onDeleteItem }: ItemActionDialogProps) => {
  const [mode, setMode] = useState<'actions' | 'edit'>('actions');
  const [editQuantity, setEditQuantity] = useState(item.quantity.toString());
  const [showBarcodeDialog, setShowBarcodeDialog] = useState(false);

  const handleEdit = () => {
    setMode('edit');
  };

  const handleScanBarcode = () => {
    setShowBarcodeDialog(true);
    onOpenChange(false);
  };
  
  const handleSaveEdit = () => {
    onUpdateItem({ id: item.id, quantity: parseInt(editQuantity) });
    onOpenChange(false);
    setMode('actions');
  };

  const handleDelete = () => {
    onDeleteItem(item.id);
    onOpenChange(false);
    setMode('actions');
  };

  const handleBarcodeComplete = (price: number) => {
    // ATUALIZADO: Inclui a quantidade na chamada de atualização
    onUpdateItem({ 
      id: item.id, 
      purchased: true, 
      price, 
      purchaseDate: new Date().toISOString(),
      quantity: item.quantity,
    });

    supabase.from('price_history').insert({
      item_id: item.id,
      price: price,
    }).then();

    setShowBarcodeDialog(false);
  };

  if (mode === 'edit') {
    return (
      <Dialog open={open} onOpenChange={(isOpen) => { onOpenChange(isOpen); if (!isOpen) setMode('actions'); }}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle>Editar Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome do Item</Label>
              <div className="mt-1 p-2 bg-gray-50 rounded border text-sm text-gray-700">{item.name}</div>
            </div>
            <div>
              <Label htmlFor="quantity">Quantidade</Label>
              <Input id="quantity" type="number" min="1" value={editQuantity} onChange={(e) => setEditQuantity(e.target.value)} className="mt-1" />
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setMode('actions')} className="flex-1">Voltar</Button>
              <Button onClick={handleSaveEdit} className="flex-1">Salvar</Button>
            </div>
            <Button variant="destructive" onClick={handleDelete} className="w-full">
              <Trash2 className="h-4 w-4 mr-2" />
              Remover Item
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle>{item.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="text-sm text-gray-600 mb-4">
              Quantidade: {item.quantity}
              {item.purchased && item.price && (
                <div className="text-green-600 font-medium mt-1">
                  Comprado por R$ {(item.price * item.quantity).toFixed(2)}
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={handleEdit} className="h-20 flex flex-col items-center justify-center space-y-2">
                <Edit className="h-6 w-6" />
                <span className="text-sm">Editar</span>
              </Button>
              <Button variant="outline" onClick={handleScanBarcode} disabled={item.purchased} className="h-20 flex flex-col items-center justify-center space-y-2">
                <Camera className="h-6 w-6" />
                <span className="text-sm">{item.purchased ? 'Comprado' : 'Registrar Compra'}</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <BarcodeDialog
        open={showBarcodeDialog}
        onOpenChange={setShowBarcodeDialog}
        productName={item.name}
        onComplete={handleBarcodeComplete}
      />
    </>
  );
};