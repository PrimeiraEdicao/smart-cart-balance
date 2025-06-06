import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAppContext } from "@/context/AppContext";

interface AddItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddItemDialog = ({ open, onOpenChange }: AddItemDialogProps) => {
  const { addItem, items, categories } = useAppContext();
  // ... (o restante do código está correto e não precisa de mudanças)
};