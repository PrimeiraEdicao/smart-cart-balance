
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Comment } from '@/types/shopping';
import { SupabaseService } from '@/services/supabaseService';

interface CommentsStore {
  comments: Record<string, Comment[]>; // itemId -> comments
  
  addComment: (itemId: string, text: string) => Promise<void>;
  updateComment: (itemId: string, commentId: string, text: string) => void;
  deleteComment: (itemId: string, commentId: string) => void;
  getItemComments: (itemId: string) => Comment[];
  loadItemComments: (itemId: string) => Promise<void>;
  handleRealtimeCommentUpdate: (payload: any) => void;
}

export const useCommentsStore = create<CommentsStore>()(
  persist(
    (set, get) => ({
      comments: {},

      addComment: async (itemId, text) => {
        try {
          await SupabaseService.addComment(itemId, text);
          // O comentário será adicionado via realtime update
        } catch (error) {
          console.error('Error adding comment:', error);
        }
      },

      loadItemComments: async (itemId) => {
        try {
          const comments = await SupabaseService.getItemComments(itemId);
          const formattedComments: Comment[] = comments.map(comment => ({
            id: comment.id,
            text: comment.text,
            author: comment.user_profiles?.name || 'Usuário',
            timestamp: new Date(comment.created_at),
          }));

          set((state) => ({
            comments: {
              ...state.comments,
              [itemId]: formattedComments,
            },
          }));
        } catch (error) {
          console.error('Error loading comments:', error);
        }
      },

      updateComment: (itemId, commentId, text) => {
        set((state) => ({
          comments: {
            ...state.comments,
            [itemId]: (state.comments[itemId] || []).map((comment) =>
              comment.id === commentId ? { ...comment, text } : comment
            ),
          },
        }));
      },

      deleteComment: (itemId, commentId) => {
        set((state) => ({
          comments: {
            ...state.comments,
            [itemId]: (state.comments[itemId] || []).filter(
              (comment) => comment.id !== commentId
            ),
          },
        }));
      },

      getItemComments: (itemId) => {
        return get().comments[itemId] || [];
      },

      handleRealtimeCommentUpdate: (payload) => {
        console.log('Comment realtime update:', payload);
        
        if (payload.eventType === 'INSERT') {
          const newComment: Comment = {
            id: payload.new.id,
            text: payload.new.text,
            author: 'Outro usuário',
            timestamp: new Date(payload.new.created_at),
          };

          set((state) => ({
            comments: {
              ...state.comments,
              [payload.new.item_id]: [...(state.comments[payload.new.item_id] || []), newComment],
            },
          }));
        }
      },
    }),
    {
      name: 'comments-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
