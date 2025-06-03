
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Mail, Link, Send } from "lucide-react";

interface AddMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddMemberDialog = ({ open, onOpenChange }: AddMemberDialogProps) => {
  const [email, setEmail] = useState("");
  const [inviteMethod, setInviteMethod] = useState<"email" | "link">("email");

  const handleSendInvite = () => {
    if (inviteMethod === "email" && email.trim()) {
      // Simula envio de convite por email
      alert(`Convite enviado para: ${email}`);
      setEmail("");
      onOpenChange(false);
    } else if (inviteMethod === "link") {
      // Simula geração de link de convite
      const inviteLink = `https://app.compras.com/invite/abc123`;
      navigator.clipboard.writeText(inviteLink);
      alert("Link de convite copiado para a área de transferência!");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-purple-600" />
            <span>Adicionar Membro</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            Convide familiares ou amigos para colaborar nesta lista de compras.
          </div>

          <div className="space-y-3">
            <div className="flex space-x-2">
              <Button
                variant={inviteMethod === "email" ? "default" : "outline"}
                size="sm"
                onClick={() => setInviteMethod("email")}
                className="flex-1"
              >
                <Mail className="h-4 w-4 mr-2" />
                Por Email
              </Button>
              <Button
                variant={inviteMethod === "link" ? "default" : "outline"}
                size="sm"
                onClick={() => setInviteMethod("link")}
                className="flex-1"
              >
                <Link className="h-4 w-4 mr-2" />
                Link de Convite
              </Button>
            </div>

            {inviteMethod === "email" && (
              <div className="space-y-2">
                <Label htmlFor="email">Email do convidado</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="exemplo@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            )}

            {inviteMethod === "link" && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-700 mb-2">
                  Um link de convite será gerado e copiado para sua área de transferência.
                </div>
                <div className="text-xs text-gray-500">
                  Você pode compartilhar este link via WhatsApp, SMS ou qualquer outro meio.
                </div>
              </div>
            )}
          </div>

          <div className="flex space-x-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancelar
            </Button>
            <Button 
              onClick={handleSendInvite}
              className="flex-1"
              disabled={inviteMethod === "email" && !email.trim()}
            >
              <Send className="h-4 w-4 mr-2" />
              {inviteMethod === "email" ? "Enviar Convite" : "Gerar Link"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
