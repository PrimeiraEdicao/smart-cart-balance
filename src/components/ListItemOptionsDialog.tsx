import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share2, Trash2, X } from "lucide-react";
import { HistoryList } from "@/hooks/useShoppingHistory";
import { toast } from "sonner";

interface ListItemOptionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  historyList: HistoryList | null;
  onDelete: (historyId: string) => void;
}

export const ListItemOptionsDialog = ({
  open,
  onOpenChange,
  historyList,
  onDelete,
}: ListItemOptionsDialogProps) => {

  if (!historyList) return null;

  const handleShare = () => {
    const dataToShare = {
      date: historyList.date,
      totalSpent: historyList.totalSpent,
      items: historyList.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
    };

    const jsonString = JSON.stringify(dataToShare, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    if (navigator.share) {
      navigator.share({
        title: `Compra de ${historyList.date}`,
        text: `Resumo da compra de ${historyList.date}. Total: R$ ${historyList.totalSpent.toFixed(2)}`,
        files: [new File([blob], `compra-${historyList.date}.json`, { type: 'application/json' })],
      }).catch(() => {
         // Fallback para download se o compartilhamento falhar ou for cancelado
         downloadFile(url);
      });
    } else {
      downloadFile(url);
    }
  };

  const downloadFile = (url: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = `compra-${historyList.date.replace(/\//g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.info("Arquivo JSON da compra baixado.");
  }

  const handleDeleteClick = () => {
    if (confirm("Tem certeza que deseja excluir este registro? Os itens voltarão para a sua lista como 'não comprados'. Esta ação não pode ser desfeita.")) {
      onDelete(historyList.id);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Opções para a compra de</DialogTitle>
          <DialogDescription>{historyList.date}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 py-4">
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" />
            Compartilhar (.json)
          </Button>
          <Button variant="destructive" onClick={handleDeleteClick}>
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir Registro
          </Button>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            <X className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};