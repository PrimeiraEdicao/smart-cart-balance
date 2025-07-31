// src/components/QuickPurchaseDialog.tsx

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
import { useAppContext } from "@/context/AppContext";
import { isPlatform } from "@capacitor/core";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface QuickPurchaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const QuickPurchaseDialog = ({ open, onOpenChange }: QuickPurchaseDialogProps) => {
  const { addItem } = useAppContext();

  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [detectedProduct, setDetectedProduct] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [price, setPrice] = useState("");
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [permissionError, setPermissionError] = useState("");

  const mockProducts = [
    "Coca-Cola 2L", "Biscoito Recheado", "Sabonete Dove", "Shampoo Clear",
    "Macarrão Barilla", "Molho de Tomate", "Queijo Mussarela", "Presunto Fatiado"
  ];

  const simulateBarcodeScan = () => {
    const mockBarcode = prompt("Simulação: Digite um código de barras");
    if (mockBarcode) {
      setScanning(true);
      setTimeout(() => {
        const randomProduct = mockProducts[Math.floor(Math.random() * mockProducts.length)];
        setDetectedProduct(randomProduct);
        setScanned(true);
        setScanning(false);
      }, 1500);
    } else {
      toast.info("Simulação cancelada.");
      setScanning(false);
    }
  };

  const startBarcodeScan = async () => {
    try {
      setScanning(true);

      const { BarcodeScanner } = await import("@capacitor/barcode-scanner");

      const checkPermission = await BarcodeScanner.checkPermission({ force: true });
      if (!checkPermission.granted) {
        setPermissionError("Permissão da câmera é necessária para escanear.");
        setShowPermissionDialog(true);
        return;
      }

      const result = await BarcodeScanner.startScan();
      if (result.hasContent) {
        const scannedBarcode = result.content;
        const foundProduct = `Produto: ${scannedBarcode}`;
        setDetectedProduct(foundProduct);
        setScanned(true);
      } else {
        toast.info("Escaneamento cancelado.");
        handleClose();
      }
    } catch (error) {
      console.error("Erro ao escanear:", error);
      toast.error("Erro ao iniciar o scanner.");
    } finally {
      setScanning(false);
    }
  };

  const handleStartScanClick = () => {
    if (isPlatform("android") || isPlatform("ios")) {
      startBarcodeScan();
    } else {
      simulateBarcodeScan();
    }
  };

  const handleComplete = () => {
    if (detectedProduct && quantity && price) {
      addItem({
        name: detectedProduct,
        quantity: parseInt(quantity),
        price: parseFloat(price),
        purchased: true,
        purchaseDate: new Date().toISOString(),
      });
      handleClose();
    }
  };

  const handleClose = async () => {
    if (scanning && (isPlatform("android") || isPlatform("ios"))) {
      try {
        const { BarcodeScanner } = await import("@capacitor/barcode-scanner");
        await BarcodeScanner.stopScan();
      } catch (err) {
        console.warn("Erro ao parar escaneamento:", err);
      }
    }

    onOpenChange(false);
    setScanning(false);
    setScanned(false);
    setDetectedProduct("");
    setQuantity("1");
    setPrice("");
  };

  useEffect(() => {
    if (!open && scanning && (isPlatform("android") || isPlatform("ios"))) {
      import("@capacitor/barcode-scanner").then(({ BarcodeScanner }) => {
        BarcodeScanner.stopScan().catch(() => {});
        setScanning(false);
      });
    }
  }, [open, scanning]);

  return (
    <>
      <AlertDialog open={showPermissionDialog} onOpenChange={setShowPermissionDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Permissão da Câmera Necessária</AlertDialogTitle>
            <AlertDialogDescription>{permissionError}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => window.open("app-settings:", "_system")}>
              Abrir Configurações
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle>Escaneamento Rápido</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {!scanned && !scanning && (
              <div className="text-center">
                <div className="bg-gray-100 rounded-lg p-8 mb-4">
                  <Camera className="h-12 w-12 text-gray-400 mx-auto" />
                  <p className="text-sm text-gray-600 mt-2">
                    Posicione o código de barras do produto
                  </p>
                </div>
                <Button onClick={handleStartScanClick} className="w-full bg-green-600 hover:bg-green-700">
                  <Camera className="h-4 w-4 mr-2" />
                  Escanear Produto
                </Button>
              </div>
            )}

            {scanning && (
              <div className="text-center">
                <div className="bg-gray-100 rounded-lg p-8 mb-4 flex flex-col items-center space-y-4">
                  <Camera className="h-12 w-12 text-green-600 animate-pulse" />
                  <div className="text-sm text-gray-600">Escaneando produto...</div>
                  <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              </div>
            )}

            {scanned && (
              <div className="space-y-4">
                <div className="text-center">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-1">Produto detectado:</p>
                  <p className="font-medium text-lg">{detectedProduct}</p>
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
    </>
  );
};
