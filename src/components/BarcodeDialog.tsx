
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Camera, CheckCircle } from "lucide-react";

interface BarcodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName: string;
  onComplete: (price: number) => void;
}

export const BarcodeDialog = ({ open, onOpenChange, productName, onComplete }: BarcodeDialogProps) => {
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [price, setPrice] = useState("");
  const [detectedProduct, setDetectedProduct] = useState("");

  const simulateBarcodeScan = () => {
    setScanning(true);
    
    // Simula o processo de escaneamento
    setTimeout(() => {
      setScanning(false);
      setScanned(true);
      setDetectedProduct(productName); // Em um app real, isso viria da API
    }, 2000);
  };

  const handleComplete = () => {
    if (price) {
      onComplete(parseFloat(price));
      onOpenChange(false);
      // Reset state
      setScanning(false);
      setScanned(false);
      setPrice("");
      setDetectedProduct("");
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset state
    setScanning(false);
    setScanned(false);
    setPrice("");
    setDetectedProduct("");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle>Escanear Código de Barras</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {!scanned && (
            <div className="text-center">
              <div className="bg-gray-100 rounded-lg p-8 mb-4">
                {scanning ? (
                  <div className="flex flex-col items-center space-y-3">
                    <div className="animate-pulse">
                      <Camera className="h-12 w-12 text-blue-600" />
                    </div>
                    <div className="text-sm text-gray-600">Escaneando...</div>
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-3">
                    <Camera className="h-12 w-12 text-gray-400" />
                    <div className="text-sm text-gray-600">
                      Posicione o código de barras na câmera
                    </div>
                  </div>
                )}
              </div>
              
              {!scanning && (
                <Button onClick={simulateBarcodeScan} className="w-full">
                  <Camera className="h-4 w-4 mr-2" />
                  Iniciar Escaneamento
                </Button>
              )}
            </div>
          )}

          {scanned && (
            <div className="space-y-4">
              <div className="text-center">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
                <div className="text-sm text-gray-600 mb-1">Produto identificado:</div>
                <div className="font-medium text-lg">{detectedProduct}</div>
              </div>
              
              <div>
                <Label htmlFor="price">Preço Pago (R$)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="mt-1"
                  autoFocus
                />
              </div>
              
              <div className="flex space-x-2">
                <Button variant="outline" onClick={handleClose} className="flex-1">
                  Cancelar
                </Button>
                <Button onClick={handleComplete} className="flex-1" disabled={!price}>
                  Confirmar
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
