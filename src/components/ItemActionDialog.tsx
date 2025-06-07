import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Edit, Camera, Trash2, UserPlus } from "lucide-react";
import { ListItem } from "@/types/shopping";
import { BarcodeDialog } from "./BarcodeDialog";
import { supabase } from "@/lib/supabase";
import { useAppContext } from "@/context/AppContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ItemActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: ListItem;
  onUpdateItem: (variables: { id: string } & Partial<ListItem>) => void;
  onDeleteItem: (id: string) => void;
}

export const ItemActionDialog = ({ open, onOpenChange, item, onUpdateItem, onDeleteItem }: ItemActionDialogProps) => {
  const { members } = useAppContext(); // Pegar membros da lista
  const [mode, setMode] = useState<'actions' | 'edit'>('actions');
  const [editQuantity, setEditQuantity] = useState(item.quantity.toString());
  const [assignedTo, setAssignedTo] = useState(item.assigned_to_user_id || "none");
  const [showBarcodeDialog, setShowBarcodeDialog] = useState(false);

  const handleAssignmentChange = (userId: string) => {
    const newAssignedId = userId === "none" ? undefined : userId;
    setAssignedTo(userId);
    onUpdateItem({ id: item.id, assigned_to_user_id: newAssignedId });
  };
  
  const handleEdit = () => {
    setMode('edit');
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

  const handleScanBarcode = () => {
    setShowBarcodeDialog(true);
    onOpenChange(false);
  };
  
  const handleBarcodeComplete = (price: number) => {
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
    // ... (o modo de edição continua o mesmo, sem alterações)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle>{item.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              Quantidade: {item.quantity}
              {item.purchased && item.price && (
                <div className="text-green-600 font-medium mt-1">
                  Comprado por R$ {(item.price * item.quantity).toFixed(2)}
                </div>
              )}
            </div>

            {/* ✅ NOVO CAMPO DE ATRIBUIÇÃO */}
            {members.length > 1 && (
              <div>
                <Label htmlFor="assign" className="flex items-center gap-2 mb-1">
                  <UserPlus className="h-4 w-4" /> Atribuir a
                </Label>
                <Select value={assignedTo} onValueChange={handleAssignmentChange}>
                  <SelectTrigger id="assign">
                    <SelectValue placeholder="Atribuir a um membro..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Ninguém (Geral)</SelectItem>
                    {members.map(member => (
                      <SelectItem key={member.user_id} value={member.user_id}>
                        {member.user_profile?.raw_user_meta_data?.name || member.user_profile?.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-3 pt-2">
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