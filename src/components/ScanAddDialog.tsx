// src/components/ScanAddDialog.tsx

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Camera, CheckCircle, Search } from "lucide-react";
import { useAppContext } from "@/context/AppContext";

interface ScanAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ScanAddDialog = ({ open, onOpenChange }: ScanAddDialogProps) => {
  const { addItem } = useAppContext();

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
        {/* CORREÇÃO: Adicionar o conteúdo do Dialog que estava faltando */}
        <DialogContent className="max-w-sm mx-auto">
            <DialogHeader>
                <DialogTitle>Escanear para Adicionar</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
                {!scanned && (
                    <div className="text-center">
                        <div className="bg-gray-100 rounded-lg p-8 mb-4">
                            {scanning ? (
                                <div className="flex flex-col items-center space-y-3">
                                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                    <div className="text-sm text-gray-600">Procurando produto...</div>
                                </div>
                            ) : (
                                <Camera className="h-12 w-12 text-gray-400 mx-auto" />
                            )}
                        </div>
                        <Button onClick={simulateBarcodeScan} className="w-full">
                            <Camera className="h-4 w-4 mr-2" />
                            Escanear Código de Barras
                        </Button>
                    </div>
                )}

                {scanned && (
                    <div className="space-y-4">
                        {productFound ? (
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <CheckCircle className="h-10 w-10 text-green-600 mx-auto mb-2" />
                                <div className="text-sm text-gray-600">Produto encontrado:</div>
                                <div className="font-medium text-lg">{productName}</div>
                            </div>
                        ) : (
                            <div className="text-center p-4 bg-yellow-50 rounded-lg">
                                <Search className="h-10 w-10 text-yellow-600 mx-auto mb-2" />
                                <div className="text-sm text-gray-600">Produto não encontrado.</div>
                                <div className="font-medium text-lg">Insira os dados manualmente:</div>
                            </div>
                        )}

                        {!productFound && (
                             <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label htmlFor="manualName">Nome do Produto</Label>
                                    <Input id="manualName" value={manualName} onChange={(e) => setManualName(e.target.value)} className="mt-1" />
                                </div>
                                <div>
                                    <Label htmlFor="manualBrand">Marca</Label>
                                    <Input id="manualBrand" value={manualBrand} onChange={(e) => setManualBrand(e.target.value)} className="mt-1" />
                                </div>
                            </div>
                        )}
                        
                        <div>
                            <Label htmlFor="quantity">Quantidade</Label>
                            <Input id="quantity" type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="mt-1"/>
                        </div>

                        <div className="flex space-x-2">
                            <Button variant="outline" onClick={handleClose} className="flex-1">Cancelar</Button>
                            <Button onClick={handleAddToList} className="flex-1">Adicionar</Button>
                        </div>
                    </div>
                )}
            </div>
        </DialogContent>
    </Dialog>
  );
};