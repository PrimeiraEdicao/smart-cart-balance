import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Send } from "lucide-react";
import { ListItem } from "@/types/shopping";
import { useAppContext } from "@/context/AppContext";

interface ItemCommentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: ListItem;
}

export const ItemCommentsDialog = ({ open, onOpenChange, item }: ItemCommentsDialogProps) => {
  const { getComments, addComment } = useAppContext();
  // ... (o restante do código está correto e não precisa de mudanças)
};