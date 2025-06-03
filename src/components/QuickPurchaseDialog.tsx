
import { useState } from "react";
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

interface QuickPurchaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddItem: (name: string, quantity: number, price: number) => void;
}

export const QuickPurchaseDialog = ({ open, onOpenChange, onAddItem }: QuickPurchaseDialogProps) => {
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [detectedProduct, setDetectedProduct] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [price, setPrice] = useState("");

  const mockProducts = [
    "Coca-Cola 2L", "Biscoito Recheado", "Sabonete Dove", "Shampoo Clear",
    "Macarrão Barilla", "Molho de Tomate", "Queijo Mussarela", "Presunto Fatiado"
  ];

  const simulateBarcodeScan = () => {
    setScanning(true);
    
    setTimeout(() => {
      setScanning(false);
      setScanned(true);
      const randomProduct = mockProducts[Math.floor(Math.random() * mockProducts.length)];
      setDetectedProduct(randomProduct);
    }, 2000);
  };

  const handleComplete = () => {
    if (detectedProduct && quantity && price) {
      onAddItem(detectedProduct, parseInt(quantity), parseFloat(price));
      handleClose();
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset state
    setScanning(false);
    setScanned(false);
    setDetectedProduct("");
    setQuantity("1");
    setPrice("");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle>Escaneamento Rápido</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {!scanned && (
            <div className="text-center">
              <div className="bg-gray-100 rounded-lg p-8 mb-4">
                {scanning ? (
                  <div className="flex flex-col items-center space-y-3">
                    <div className="animate-pulse">
                      <Camera className="h-12 w-12 text-green-600" />
                    </div>
                    <div className="text-sm text-gray-600">Escaneando produto...</div>
                    <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-3">
                    <Camera className="h-12 w-12 text-gray-400" />
                    <div className="text-sm text-gray-600">
                      Posicione o código de barras do produto
                    </div>
                  </div>
                )}
              </div>
              
              {!scanning && (
                <Button onClick={simulateBarcodeScan} className="w-full bg-green-600 hover:bg-green-700">
                  <Camera className="h-4 w-4 mr-2" />
                  Escanear Produto
                </Button>
              )}
            </div>
          )}

          {scanned && (
            <div className="space-y-4">
              <div className="text-center">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
                <div className="text-sm text-gray-600 mb-1">Produto detectado:</div>
                <div className="font-medium text-lg">{detectedProduct}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
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
                  <Label htmlFor="price">Preço (R$)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button variant="outline" onClick={handleClose} className="flex-1">
                  Cancelar
                </Button>
                <Button 
                  onClick={handleComplete} 
                  className="flex-1 bg-green-600 hover:bg-green-700" 
                  disabled={!quantity || !price}
                >
                  Adicionar
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
