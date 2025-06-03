
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
import { Camera, CheckCircle, Search } from "lucide-react";

interface ScanAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddItem: (name: string, quantity: number) => void;
}

export const ScanAddDialog = ({ open, onOpenChange, onAddItem }: ScanAddDialogProps) => {
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [productFound, setProductFound] = useState(false);
  const [quantity, setQuantity] = useState("1");
  const [productName, setProductName] = useState("");
  const [manualName, setManualName] = useState("");
  const [manualBrand, setManualBrand] = useState("");

  const simulateBarcodeScan = () => {
    setScanning(true);
    
    // Simula o processo de escaneamento
    setTimeout(() => {
      setScanning(false);
      setScanned(true);
      
      // Simula busca na base de dados (50% chance de encontrar)
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
      onAddItem(name, parseInt(quantity));
      handleClose();
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset state
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
      <DialogContent className="max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle>Escanear e Adicionar</DialogTitle>
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
              {productFound ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
                    <div className="text-sm text-gray-600 mb-1">Produto encontrado:</div>
                    <div className="font-medium text-lg">{productName}</div>
                  </div>
                  
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
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={handleClose} className="flex-1">
                      Cancelar
                    </Button>
                    <Button onClick={handleAddToList} className="flex-1" disabled={!quantity}>
                      Adicionar à Lista
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center">
                    <Search className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <div className="text-sm text-gray-600 mb-1">Produto não encontrado</div>
                    <div className="text-xs text-gray-500">Insira os dados manualmente</div>
                  </div>
                  
                  <div>
                    <Label htmlFor="manualName">Nome do Produto</Label>
                    <Input
                      id="manualName"
                      placeholder="Ex: Arroz"
                      value={manualName}
                      onChange={(e) => setManualName(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="manualBrand">Marca (opcional)</Label>
                    <Input
                      id="manualBrand"
                      placeholder="Ex: Uncle Ben's"
                      value={manualBrand}
                      onChange={(e) => setManualBrand(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
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
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={handleClose} className="flex-1">
                      Cancelar
                    </Button>
                    <Button onClick={handleAddToList} className="flex-1" disabled={!manualName || !quantity}>
                      Salvar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
