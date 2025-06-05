
import { supabase } from '@/integrations/supabase/client'
import { ListItem, ShoppingList, Comment } from '@/types/shopping'

export class SupabaseService {
  // Lista operations
  static async createList(name: string, budget: number) {
    const { data, error } = await supabase
      .from('shopping_lists')
      .insert({
        name,
        budget,
        owner_id: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single()

    if (error) throw error

    // Adicionar o criador como membro
    await supabase
      .from('list_members')
      .insert({
        list_id: data.id,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        role: 'owner'
      })

    return data
  }

  static async getUserLists() {
    const { data, error } = await supabase
      .from('shopping_lists')
      .select(`
        *,
        list_members!inner(*)
      `)

    if (error) throw error
    return data
  }

  static async getListItems(listId: string) {
    const { data, error } = await supabase
      .from('list_items')
      .select(`
        *,
        added_by:added_by_id(name),
        assigned_to:assigned_to_id(name),
        claimed_by:claimed_by_id(name)
      `)
      .eq('list_id', listId)
      .order('item_order', { ascending: true })

    if (error) throw error
    return data
  }

  // Item operations
  static async addItem(listId: string, name: string, quantity: number, categoryId?: string) {
    const user = (await supabase.auth.getUser()).data.user
    
    const { data, error } = await supabase
      .from('list_items')
      .insert({
        list_id: listId,
        name,
        quantity,
        category_id: categoryId,
        added_by_id: user?.id,
        item_order: Date.now()
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async updateItem(itemId: string, updates: Partial<ListItem>) {
    const { data, error } = await supabase
      .from('list_items')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', itemId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async deleteItem(itemId: string) {
    const { error } = await supabase
      .from('list_items')
      .delete()
      .eq('id', itemId)

    if (error) throw error
  }

  // Comment operations
  static async addComment(itemId: string, text: string) {
    const user = (await supabase.auth.getUser()).data.user
    
    const { data, error } = await supabase
      .from('item_comments')
      .insert({
        item_id: itemId,
        user_id: user?.id,
        text
      })
      .select(`
        *,
        user_profiles(name)
      `)
      .single()

    if (error) throw error
    return data
  }

  static async getItemComments(itemId: string) {
    const { data, error } = await supabase
      .from('item_comments')
      .select(`
        *,
        user_profiles(name)
      `)
      .eq('item_id', itemId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data
  }

  // Member operations
  static async addMember(listId: string, email: string) {
    // Primeiro, procurar o usuário pelo email
    const { data: userProfile, error: userError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('email', email)
      .single()

    if (userError || !userProfile) {
      throw new Error('Usuário não encontrado')
    }

    const { data, error } = await supabase
      .from('list_members')
      .insert({
        list_id: listId,
        user_id: userProfile.id,
        role: 'member'
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async getListMembers(listId: string) {
    const { data, error } = await supabase
      .from('list_members')
      .select(`
        *,
        user_profiles(name, email)
      `)
      .eq('list_id', listId)

    if (error) throw error
    return data
  }
}
