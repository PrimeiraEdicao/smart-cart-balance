// src/components/ScanAddDialog.tsx

import { useAppContext } from "@/context/AppContext";
import { BarcodeSearchDialog } from "./BarcodeSearchDialog"; // Importe o novo componente

interface ScanAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ScanAddDialog = ({ open, onOpenChange }: ScanAddDialogProps) => {
  const { addItem } = useAppContext();

  const handleComplete = (details: { name: string; quantity: number }) => {
    addItem({
      name: details.name,
      quantity: details.quantity,
      purchased: false,
    });
  };

  return (
    <BarcodeSearchDialog
      open={open}
      onOpenChange={onOpenChange}
      onComplete={handleComplete}
      mode="add"
    />
  );
};