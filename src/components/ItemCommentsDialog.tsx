import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { ListItem, Comment } from "@/types/shopping";
import { useAppContext } from "@/context/AppContext";
import { Skeleton } from "@/components/ui/skeleton";

interface ItemCommentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: ListItem;
}

export const ItemCommentsDialog = ({
  open,
  onOpenChange,
  item,
}: ItemCommentsDialogProps) => {
  const { getComments, addComment, user } = useAppContext();
  const { data: comments = [], isLoading } = getComments(item.id);
  const [newComment, setNewComment] = useState("");

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    addComment({
      item_id: item.id,
      text: newComment.trim(),
    });
    setNewComment("");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit', minute: '2-digit'
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[70vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Comentários sobre "{item.name}"</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto space-y-4 p-1">
          {isLoading ? (
            <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
          ) : comments.length > 0 ? (
            comments.map((comment: Comment) => (
              <div key={comment.id} className="flex flex-col">
                <div className={`p-3 rounded-lg max-w-xs ${comment.user_id === user?.id ? 'bg-blue-100 self-end' : 'bg-gray-100 self-start'}`}>
                  <p className="text-sm">{comment.text}</p>
                </div>
                <span className={`text-xs text-gray-500 mt-1 ${comment.user_id === user?.id ? 'self-end' : 'self-start'}`}>
                  {formatDate(comment.created_at)}
                </span>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-4">Nenhum comentário ainda.</p>
          )}
        </div>
        <div className="flex items-center gap-2 pt-2 border-t">
          <Textarea
            placeholder="Adicione um comentário..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="flex-1"
            rows={1}
          />
          <Button onClick={handleAddComment} disabled={!newComment.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};