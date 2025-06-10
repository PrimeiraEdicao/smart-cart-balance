import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Camera, CheckCircle, Search, Loader2 } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { toast } from "sonner";

// Função para buscar dados do produto pelo código de barras
async function fetchProductByBarcode(barcode: string) {
  try {
    const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`);
    if (!response.ok) {
      throw new Error('Produto não encontrado na base de dados.');
    }
    const data = await response.json();
    if (data.status === 0) {
      throw new Error(data.status_verbose || 'Produto não encontrado.');
    }
    return data.product;
  } catch (error) {
    console.error("Erro ao buscar produto:", error);
    return null;
  }
}

interface ScanAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ScanAddDialog = ({ open, onOpenChange }: ScanAddDialogProps) => {
  const { addItem } = useAppContext();

  // Estados do componente
  const [step, setStep] = useState<'initial' | 'scanning' | 'scanned'>('initial');
  const [barcode, setBarcode] = useState("");
  const [product, setProduct] = useState<{ name: string; brand: string } | null>(null);
  const [quantity, setQuantity] = useState("1");
  
  const handleScan = async () => {
    if (!barcode.trim()) {
        toast.error("Por favor, insira um código de barras.");
        return;
    }
    setStep('scanning');
    const foundProduct = await fetchProductByBarcode(barcode);
    if (foundProduct) {
      setProduct({
        name: foundProduct.product_name || 'Nome desconhecido',
        brand: foundProduct.brands || '',
      });
    } else {
      setProduct(null); // Nenhum produto encontrado
    }
    setStep('scanned');
  };

  const handleAddToList = () => {
    const name = product ? `${product.name} ${product.brand}`.trim() : `Produto ${barcode}`;
    if (name && quantity) {
      addItem({
          name: name,
          quantity: parseInt(quantity),
          purchased: false,
      });
      toast.success(`"${name}" adicionado à lista.`);
      handleClose();
    } else {
      toast.error("O nome do produto não pode estar vazio.")
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reseta o estado ao fechar
    setTimeout(() => {
      setStep('initial');
      setProduct(null);
      setBarcode("");
      setQuantity("1");
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-sm mx-auto">
            <DialogHeader>
                <DialogTitle>Adicionar por Código de Barras</DialogTitle>
                <DialogDescription>
                  Digite um código de barras para buscar um produto. Para teste, use: 7891000053508 (Coca-Cola).
                </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-4">
                {step === 'initial' && (
                    <div className="space-y-4">
                        <Label htmlFor="barcode">Código de Barras</Label>
                        <Input 
                            id="barcode" 
                            value={barcode} 
                            onChange={(e) => setBarcode(e.target.value)} 
                            placeholder="Digite o código de barras"
                        />
                        <Button onClick={handleScan} className="w-full">
                            <Search className="h-4 w-4 mr-2" />
                            Buscar Produto
                        </Button>
                    </div>
                )}
                
                {step === 'scanning' && (
                    <div className="flex flex-col items-center justify-center h-40 space-y-3">
                        <Loader2 className="h-8 w-8 text-primary animate-spin" />
                        <p className="text-sm text-gray-600">Buscando produto na API...</p>
                    </div>
                )}

                {step === 'scanned' && (
                    <div className="space-y-4">
                        {product ? (
                            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                                <CheckCircle className="h-10 w-10 text-green-600 mx-auto mb-2" />
                                <div className="text-sm text-gray-600">Produto encontrado:</div>
                                <div className="font-medium text-lg">{product.name}</div>
                                <div className="text-sm text-gray-500">{product.brand}</div>
                            </div>
                        ) : (
                            <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                                <Search className="h-10 w-10 text-yellow-600 mx-auto mb-2" />
                                <div className="text-sm text-gray-600">Produto não encontrado.</div>
                                <div className="font-medium">O item será adicionado com o código.</div>
                            </div>
                        )}
                        
                        <div>
                            <Label htmlFor="quantity">Quantidade</Label>
                            <Input id="quantity" type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="mt-1"/>
                        </div>

                        <div className="flex space-x-2 pt-2">
                             <Button variant="outline" onClick={() => setStep('initial')} className="flex-1">Buscar Outro</Button>
                            <Button onClick={handleAddToList} className="flex-1">Adicionar à Lista</Button>
                        </div>
                    </div>
                )}
            </div>
        </DialogContent>
    </Dialog>
  );
};