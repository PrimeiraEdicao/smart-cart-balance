import { useAppContext } from "@/context/AppContext";
import { Badge } from "@/components/ui/badge";

interface MemberBadgeProps {
  userId: string;
}

export const MemberBadge = ({ userId }: MemberBadgeProps) => {
  const { user, members } = useAppContext();

  if (userId === user?.id) {
    return <Badge variant="secondary">Você</Badge>;
  }

  const member = members.find(m => m.user_id === userId);
  
  // ✅ Com o tipo corrigido em shopping.ts, esta linha agora é válida.
  const memberName = member?.user_profile?.name || member?.user_profile?.email?.split('@')[0];

  if (memberName) {
    return <Badge variant="outline">{memberName}</Badge>;
  }

  return null;
};