
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Send, Trash2 } from "lucide-react";
import { ListItem, Comment } from "@/types/shopping";
import { useCommentsStore } from "@/store/useCommentsStore";

interface ItemCommentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: ListItem;
  onAddComment: (itemId: string, text: string) => void;
}

export const ItemCommentsDialog = ({ open, onOpenChange, item, onAddComment }: ItemCommentsDialogProps) => {
  const [newComment, setNewComment] = useState("");
  const { getItemComments, loadItemComments } = useCommentsStore();

  // Load comments when dialog opens
  useEffect(() => {
    if (open && item.id) {
      loadItemComments(item.id);
    }
  }, [open, item.id, loadItemComments]);

  const comments = getItemComments(item.id);

  const handleAddComment = () => {
    if (newComment.trim()) {
      onAddComment(item.id, newComment.trim());
      setNewComment("");
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

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
          {comments && comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-sm font-medium text-gray-800">
                    {comment.author}
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-xs text-gray-500">
                      {formatDate(comment.timestamp)}
                    </div>
                    {comment.author === "você" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
                <div className="text-sm text-gray-700">
                  {comment.text}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <div>Nenhum comentário ainda</div>
              <div className="text-sm">Seja o primeiro a comentar!</div>
            </div>
          )}
        </div>

        <div className="border-t pt-4 space-y-3">
          <Textarea
            placeholder="Adicione um comentário... (máximo 200 caracteres)"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value.slice(0, 200))}
            className="min-h-[80px] resize-none"
          />
          <div className="flex justify-between items-center">
            <div className="text-xs text-gray-500">
              {newComment.length}/200 caracteres
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Fechar
              </Button>
              <Button 
                onClick={handleAddComment}
                disabled={!newComment.trim()}
              >
                <Send className="h-4 w-4 mr-2" />
                Comentar
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
