import { useAppContext } from "@/context/AppContext";
import { Badge } from "@/components/ui/badge";

interface MemberBadgeProps {
  userId: string;
}

export const MemberBadge = ({ userId }: MemberBadgeProps) => {
  const { user, members } = useAppContext();

  // Se o ID for do usuário atual, mostra "Você"
  if (userId === user?.id) {
    return <Badge variant="secondary">Você</Badge>;
  }

  // Procura o nome do membro na lista de membros da lista
  const member = members.find(m => m.user_id === userId);
  const memberName = member?.user_profile?.raw_user_meta_data?.name || member?.user_profile?.email?.split('@')[0];

  if (memberName) {
    return <Badge variant="outline">{memberName}</Badge>;
  }

  return null;
};