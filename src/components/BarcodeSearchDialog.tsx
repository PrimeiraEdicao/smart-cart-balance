// src/components/BarcodeSearchDialog.tsx

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Camera, CheckCircle, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";

// Função para buscar dados do produto na API
async function fetchProductByBarcode(barcode: string) {
  try {
    const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`);
    if (!response.ok) throw new Error('Produto não encontrado');
    const data = await response.json();
    if (data.status === 0) throw new Error(data.status_verbose || 'Produto não encontrado.');
    return data.product;
  } catch (error) {
    console.error("Erro ao buscar produto:", error);
    return null;
  }
}

interface BarcodeSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (details: { name: string; quantity: number; price?: number }) => void;
  mode: 'add' | 'purchase';
}

export const BarcodeSearchDialog = ({ open, onOpenChange, onComplete, mode }: BarcodeSearchDialogProps) => {
  const [step, setStep] = useState<'initial' | 'scanning' | 'scanned'>('initial');
  const [barcode, setBarcode] = useState("");
  const [product, setProduct] = useState<{ name: string; brand: string } | null>(null);
  const [quantity, setQuantity] = useState("1");
  const [price, setPrice] = useState("");

  const handleSearch = async (code: string) => {
    if (!code.trim()) {
      toast.error("Por favor, insira um código de barras válido.");
      return;
    }
    setStep('scanning');
    const foundProduct = await fetchProductByBarcode(code);
    setProduct(foundProduct ? {
      name: foundProduct.product_name || 'Nome desconhecido',
      brand: foundProduct.brands || '',
    } : null);
    setStep('scanned');
  };

  const handleFinalAction = () => {
    const name = product ? `${product.name} ${product.brand}`.trim() : `Produto ${barcode}`;
    const numQuantity = parseInt(quantity) || 1;
    const numPrice = price ? parseFloat(price) : undefined;

    if (mode === 'purchase' && (!numPrice || numPrice <= 0)) {
        toast.error("Por favor, insira um preço válido para a compra.");
        return;
    }

    onComplete({ name, quantity: numQuantity, price: numPrice });
    handleClose();
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setStep('initial');
      setProduct(null);
      setBarcode("");
      setQuantity("1");
      setPrice("");
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Produto</DialogTitle>
          <DialogDescription>
            {mode === 'add' 
              ? 'Digite o código de barras ou use o scanner simulado.'
              : 'Registre um item comprado buscando pelo código de barras.'
            }
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          {step === 'initial' && (
            <div className="space-y-3">
              <div>
                <Label htmlFor="barcode-main-input">Código de Barras</Label>
                <div className="flex gap-2 mt-1">
                  <Input id="barcode-main-input" value={barcode} onChange={(e) => setBarcode(e.target.value)} placeholder="Digite o código" />
                  <Button onClick={() => handleSearch(barcode)} size="icon"><Search className="h-4 w-4"/></Button>
                </div>
              </div>
              <div className="relative flex items-center">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink mx-4 text-xs text-gray-400">OU</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>
              <Button onClick={() => handleSearch('7891000053508')} className="w-full" variant="secondary">
                <Camera className="h-4 w-4 mr-2" />
                Escanear com a Câmera (Simulado)
              </Button>
            </div>
          )}
          {step === 'scanning' && (
            <div className="flex flex-col items-center justify-center h-40 space-y-3">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Buscando na API...</p>
            </div>
          )}
          {step === 'scanned' && (
            <div className="space-y-4">
              {product ? (
                <div className="p-3 bg-green-50 rounded-lg text-center">
                  <p className="text-sm text-gray-600">Produto encontrado:</p>
                  <p className="font-medium">{product.name} ({product.brand})</p>
                </div>
              ) : (
                <div className="p-3 bg-yellow-50 rounded-lg text-center">
                  <p className="text-sm">Produto não encontrado. O item será adicionado com o código informado.</p>
                </div>
              )}
              <div className={`grid ${mode === 'purchase' ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>
                <div>
                  <Label htmlFor="quantity-final">Quantidade</Label>
                  <Input id="quantity-final" type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="mt-1"/>
                </div>
                {mode === 'purchase' && (
                  <div>
                    <Label htmlFor="price-final">Preço (R$)</Label>
                    <Input id="price-final" type="number" step="0.01" min="0" placeholder="0,00" value={price} onChange={(e) => setPrice(e.target.value)} className="mt-1" autoFocus/>
                  </div>
                )}
              </div>
              <div className="flex space-x-2 pt-2">
                <Button variant="outline" onClick={() => setStep('initial')} className="flex-1">Buscar Outro</Button>
                <Button onClick={handleFinalAction} className="flex-1">
                  {mode === 'add' ? 'Adicionar à Lista' : 'Registrar Compra'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};