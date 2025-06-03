
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Users, UserPlus, Mail, Crown, Trash2, UserCheck } from "lucide-react";
import { ListMember } from "@/types/shopping";

interface AddMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddMemberDialog = ({ open, onOpenChange }: AddMemberDialogProps) => {
  const [email, setEmail] = useState("");
  const [inviteCode, setInviteCode] = useState("LISTA-2024-ABC123");
  
  // Mock members - em um app real, isso viria de uma API
  const [members, setMembers] = useState<ListMember[]>([
    { id: '1', name: 'Você', email: 'voce@email.com', role: 'owner', joinedAt: new Date() },
    { id: '2', name: 'João', email: 'joao@email.com', role: 'member', joinedAt: new Date('2024-04-01') },
    { id: '3', name: 'Maria', email: 'maria@email.com', role: 'member', joinedAt: new Date('2024-04-05') },
  ]);

  const [notifications] = useState([
    { id: '1', message: 'João adicionou "Leite" à lista', timestamp: new Date(), read: false },
    { id: '2', message: 'Maria comprou "Açúcar"', timestamp: new Date(Date.now() - 3600000), read: false },
    { id: '3', message: 'João comentou em "Arroz"', timestamp: new Date(Date.now() - 7200000), read: true },
  ]);

  const handleInviteMember = () => {
    if (!email.trim()) return;

    const newMember: ListMember = {
      id: Date.now().toString(),
      name: email.split('@')[0],
      email: email,
      role: 'member',
      joinedAt: new Date(),
    };

    setMembers([...members, newMember]);
    setEmail("");
    
    // Simula envio de convite
    alert(`Convite enviado para ${email}!`);
  };

  const handleRemoveMember = (memberId: string) => {
    setMembers(members.filter(m => m.id !== memberId));
  };

  const handleCopyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode);
    alert('Código de convite copiado!');
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-purple-600" />
            <span>Gerenciar Membros</span>
            {unreadNotifications > 0 && (
              <div className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadNotifications}
              </div>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 min-h-0">
          {/* Notifications */}
          {unreadNotifications > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="text-sm font-medium text-blue-800 mb-2">
                Atividades Recentes ({unreadNotifications})
              </div>
              <div className="space-y-2">
                {notifications.filter(n => !n.read).slice(0, 3).map((notification) => (
                  <div key={notification.id} className="text-xs text-blue-700">
                    • {notification.message}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Member */}
          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-700">Adicionar Membro</div>
            
            <div>
              <Label htmlFor="email">Email do membro</Label>
              <div className="flex space-x-2 mt-1">
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleInviteMember} disabled={!email.trim()}>
                  <UserPlus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="text-center text-sm text-gray-500">ou</div>

            <div>
              <Label>Código de convite</Label>
              <div className="flex space-x-2 mt-1">
                <Input
                  value={inviteCode}
                  readOnly
                  className="flex-1 bg-gray-50"
                />
                <Button variant="outline" onClick={handleCopyInviteCode}>
                  Copiar
                </Button>
              </div>
            </div>
          </div>

          {/* Members List */}
          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-700">
              Membros da Lista ({members.length})
            </div>
            
            {members.map((member) => (
              <Card key={member.id}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-purple-100 p-2 rounded-full">
                        {member.role === 'owner' ? (
                          <Crown className="h-4 w-4 text-purple-600" />
                        ) : (
                          <UserCheck className="h-4 w-4 text-purple-600" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-800 flex items-center space-x-2">
                          <span>{member.name}</span>
                          {member.role === 'owner' && (
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                              Dono
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">{member.email}</div>
                        <div className="text-xs text-gray-400">
                          Entrou em {formatDate(member.joinedAt)}
                        </div>
                      </div>
                    </div>
                    {member.role !== 'owner' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:bg-red-50"
                        onClick={() => handleRemoveMember(member.id)}
                      >
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
