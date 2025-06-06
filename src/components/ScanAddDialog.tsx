import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Camera, CheckCircle, Search } from "lucide-react";
import { useShopping } from "@/context/AppContext"; // Importar hook

interface ScanAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // onAddItem foi removido das props
}

export const ScanAddDialog = ({ open, onOpenChange }: ScanAddDialogProps) => {
  const { addItem } = useShopping(); // Obter addItem do contexto

  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [productFound, setProductFound] = useState(false);
  const [quantity, setQuantity] = useState("1");
  const [productName, setProductName] = useState("");
  const [manualName, setManualName] = useState("");
  const [manualBrand, setManualBrand] = useState("");

  const simulateBarcodeScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setScanned(true);
      const found = Math.random() > 0.5;
      setProductFound(found);
      if (found) {
        setProductName("Arroz Uncle Ben's 1kg");
      }
    }, 2000);
  };

  const handleAddToList = () => {
    const name = productFound ? productName : `${manualName} ${manualBrand}`.trim();
    if (name && quantity) {
      // Chamar addItem do contexto diretamente
      addItem({
          name: name,
          quantity: parseInt(quantity),
          purchased: false,
          addedBy: 'você'
      });
      handleClose();
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setScanning(false);
    setScanned(false);
    setProductFound(false);
    setQuantity("1");
    setProductName("");
    setManualName("");
    setManualBrand("");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
        {/* O JSX do componente permanece o mesmo */}
        {/* ... */}
    </Dialog>
  );
};