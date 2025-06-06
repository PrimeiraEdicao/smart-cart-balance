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
  const { getComments, addComment, user } = useAppContext();
  const { data: comments = [], isLoading } = getComments(item.id);
  const [newComment, setNewComment] = useState("");

  const handleAddComment = () => {
    if (newComment.trim()) {
      addComment({ item_id: item.id, text: newComment.trim() });
      setNewComment("");
    }
  };

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleString('pt-BR');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5 text-blue-600" />
            <span>Comentários - {item.name}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-3 min-h-0">
          {isLoading && <p>Carregando comentários...</p>}
          {!isLoading && comments.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <div>Nenhum comentário ainda.</div>
            </div>
          )}
          {comments.map((comment) => (
            <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-700">{comment.text}</p>
              <p className="text-xs text-gray-500 mt-1 text-right">
                {/* Você pode querer buscar o nome do autor aqui no futuro */}
                em {formatDate(comment.created_at)}
              </p>
            </div>
          ))}
        </div>

        <div className="border-t pt-4 space-y-3">
          <Textarea
            placeholder="Adicione um comentário..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <Button onClick={handleAddComment} disabled={!newComment.trim()}>
            <Send className="h-4 w-4 mr-2" /> Comentar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};