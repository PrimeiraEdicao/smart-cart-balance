
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Comment } from '@/types/shopping';
import { v4 as uuidv4 } from 'uuid';

interface CommentsStore {
  comments: Record<string, Comment[]>; // itemId -> comments
  
  addComment: (itemId: string, text: string) => void;
  updateComment: (itemId: string, commentId: string, text: string) => void;
  deleteComment: (itemId: string, commentId: string) => void;
  getItemComments: (itemId: string) => Comment[];
}

export const useCommentsStore = create<CommentsStore>()(
  persist(
    (set, get) => ({
      comments: {},

      addComment: (itemId, text) => {
        const newComment: Comment = {
          id: uuidv4(),
          text,
          author: 'você',
          timestamp: new Date(),
        };

        set((state) => ({
          comments: {
            ...state.comments,
            [itemId]: [...(state.comments[itemId] || []), newComment],
          },
        }));
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
    }),
    {
      name: 'comments-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
