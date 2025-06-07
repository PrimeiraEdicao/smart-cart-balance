import { useAppContext } from "@/context/AppContext";
import { Notification } from "@/types/shopping"; // Importa o tipo correto
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CheckCheck } from "lucide-react";
import { Skeleton } from "./ui/skeleton";

export const NotificationsPopoverContent = () => {
  const { notifications, isLoadingNotifications, markNotificationsAsRead } = useAppContext();
  const unreadNotifications = notifications.filter(n => !n.read);

  const handleMarkAllAsRead = () => {
    if (unreadNotifications.length > 0) {
      markNotificationsAsRead(unreadNotifications.map(n => n.id));
    }
  };

  if (isLoadingNotifications) {
    return (
      <div className="p-4 space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <header className="flex items-center justify-between p-3 border-b">
        <h4 className="font-semibold">Notificações</h4>
        {unreadNotifications.length > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
                <CheckCheck className="h-4 w-4 mr-2" />
                Marcar como lidas
            </Button>
        )}
      </header>
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <p className="p-6 text-sm text-center text-gray-500">Nenhuma notificação por aqui.</p>
        ) : (
          notifications.map((notification) => (
            <div key={notification.id} className={`flex items-start gap-3 p-3 border-b ${
                !notification.read ? 'bg-blue-50 hover:bg-blue-100' : 'bg-white hover:bg-gray-50'
            }`}>
              <Avatar className="h-8 w-8">
                {notification.sender_avatar_url && <AvatarImage src={notification.sender_avatar_url} />}
                <AvatarFallback>{notification.sender_name?.charAt(0).toUpperCase() || 'S'}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm">{notification.message}</p>
                <time className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: ptBR })}
                </time>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};