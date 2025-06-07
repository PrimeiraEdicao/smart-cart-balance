import { useAppContext } from "@/context/AppContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { User } from "lucide-react";

interface AssignmentBadgeProps {
  userId: string;
}

export const AssignmentBadge = ({ userId }: AssignmentBadgeProps) => {
  const { members } = useAppContext();
  const member = members.find(m => m.user_id === userId);

  if (!member) return null;

  // ✅ CORREÇÃO AQUI: Usando a nova estrutura de dados
  const memberName = member.user_profile?.name || member.user_profile?.email || 'Membro';
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Avatar className="h-6 w-6 border-2 border-white">
            {/* Como não temos avatar_url, usamos sempre o Fallback com a inicial do nome */}
            <AvatarFallback className="text-xs bg-gray-200">
              {memberName ? memberName.charAt(0).toUpperCase() : <User className="h-3 w-3" />}
            </AvatarFallback>
          </Avatar>
        </TooltipTrigger>
        <TooltipContent>
          <p>Atribuído a {memberName}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};