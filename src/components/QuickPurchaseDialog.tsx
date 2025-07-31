// src/components/QuickPurchaseDialog.tsx

import { useAppContext } from "@/context/AppContext";
import { BarcodeSearchDialog } from "./BarcodeSearchDialog"; // Importe o novo componente

interface QuickPurchaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const QuickPurchaseDialog = ({ open, onOpenChange }: QuickPurchaseDialogProps) => {
  const { addItem } = useAppContext();

  const handleComplete = (details: { name: string; quantity: number; price?: number }) => {
    addItem({
      name: details.name,
      quantity: details.quantity,
      price: details.price,
      purchased: true,
      purchaseDate: new Date().toISOString(),
    });
  };

  return (
    <BarcodeSearchDialog
      open={open}
      onOpenChange={onOpenChange}
      onComplete={handleComplete}
      mode="purchase"
    />
  );
};