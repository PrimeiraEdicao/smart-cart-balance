
import { useEffect, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuthStore } from '@/store/useAuthStore'
import { RealtimeChannel } from '@supabase/supabase-js'

interface UseRealtimeSyncProps {
  listId?: string
  onListUpdate?: (payload: any) => void
  onItemUpdate?: (payload: any) => void
  onCommentUpdate?: (payload: any) => void
  onMemberUpdate?: (payload: any) => void
}

export const useRealtimeSync = ({
  listId,
  onListUpdate,
  onItemUpdate,
  onCommentUpdate,
  onMemberUpdate
}: UseRealtimeSyncProps) => {
  const { user } = useAuthStore()

  const setupRealtimeSubscriptions = useCallback(() => {
    if (!user || !listId) return null

    const channel = supabase
      .channel(`list_${listId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'shopping_lists',
          filter: `id=eq.${listId}`
        },
        (payload) => {
          console.log('List update:', payload)
          onListUpdate?.(payload)
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'list_items',
          filter: `list_id=eq.${listId}`
        },
        (payload) => {
          console.log('Item update:', payload)
          onItemUpdate?.(payload)
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'item_comments'
        },
        (payload) => {
          console.log('Comment update:', payload)
          onCommentUpdate?.(payload)
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'list_members',
          filter: `list_id=eq.${listId}`
        },
        (payload) => {
          console.log('Member update:', payload)
          onMemberUpdate?.(payload)
        }
      )
      .subscribe()

    return channel
  }, [user, listId, onListUpdate, onItemUpdate, onCommentUpdate, onMemberUpdate])

  useEffect(() => {
    const channel = setupRealtimeSubscriptions()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [setupRealtimeSubscriptions])
}
