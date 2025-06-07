// src/components/AddMemberDialog.tsx

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Users, UserPlus, Crown, Trash2, UserCheck, Loader2 } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { toast } from "sonner";

interface AddMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddMemberDialog = ({ open, onOpenChange }: AddMemberDialogProps) => {
  const { user, activeList, members, isLoadingMembers, inviteMember, removeMember } = useAppContext();
  const [email, setEmail] = useState("");
  const [inviteCode] = useState(activeList ? `LISTA-${activeList.id.substring(0, 8).toUpperCase()}` : "CARREGANDO...");
  const [isInviting, setIsInviting] = useState(false);

  const handleInviteMember = async () => {
    if (!email.trim()) {
      toast.error("Por favor, insira um e-mail válido.");
      return;
    }
    setIsInviting(true);
    try {
      await inviteMember(email);
      setEmail("");
    } catch (error: any) {
      // O erro já é tratado no contexto, mas podemos fazer algo a mais se necessário
    } finally {
      setIsInviting(false);
    }
  };

  const handleCopyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode);
    toast.success('Código de convite copiado!');
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    }).format(date);
  };
  
  // O usuário logado é o dono?
  const isOwner = activeList?.owner_id === user?.id;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-purple-600" />
            <span>Gerenciar Membros da Lista</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 min-h-0 p-1">
          {isOwner && (
            <div className="space-y-3">
              <div className="text-sm font-medium text-gray-700">Adicionar Membro</div>
              <div>
                <Label htmlFor="email">Email do membro</Label>
                <div className="flex space-x-2 mt-1">
                  <Input
                    id="email" type="email" placeholder="usuario@email.com"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    className="flex-1" disabled={isInviting}
                  />
                  <Button onClick={handleInviteMember} disabled={!email.trim() || isInviting}>
                    {isInviting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-700">
              Membros ({members.length})
            </div>
            
            {isLoadingMembers ? <p>Carregando membros...</p> : members.map((member) => (
              <Card key={member.user_id}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-purple-100 p-2 rounded-full">
                        {member.role === 'owner' ? <Crown className="h-4 w-4 text-purple-600" /> : <UserCheck className="h-4 w-4 text-purple-600" />}
                      </div>
                      <div>
                        <div className="font-medium text-gray-800 flex items-center space-x-2">
                          <span>{member.user_profile?.raw_user_meta_data?.name || member.user_profile?.email || 'Convidado'}</span>
                          {member.role === 'owner' && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">Dono</span>}
                        </div>
                        <div className="text-sm text-gray-500">{member.user_profile?.email}</div>
                      </div>
                    </div>
                    {isOwner && member.role !== 'owner' && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50" onClick={() => removeMember(member.user_id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full">
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};